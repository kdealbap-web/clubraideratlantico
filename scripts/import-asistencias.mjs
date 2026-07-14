#!/usr/bin/env node
/**
 * scripts/import-asistencias.mjs
 *
 * Importa el histórico de asistencias desde el CSV exportado de Google Sheets
 * ("Asistencia QR - ASISTENCIA.csv") hacia la tabla public.asistencias.
 *
 * El CSV tiene columnas: IdAsistencia, Fecha (DD/MM/YYYY), Hora, Codigo (= cédula),
 * Nombre, Apellido. Se mapea Codigo→cédula→members.id. Filas #N/A se ignoran.
 * Dedup por (member_id, fecha) vía on_conflict (una asistencia por persona/día).
 *
 * Uso:
 *   1. SUPABASE_SERVICE_ROLE_KEY debe estar en .env.local
 *   2. Coloca el CSV en docs/  (o pásalo con --file="C:\\ruta\\al.csv")
 *   3. npm run import:asistencias:dry   (previsualiza)
 *   4. npm run import:asistencias        (inserta)
 *   5. Quita SUPABASE_SERVICE_ROLE_KEY de .env.local
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const fileArg = process.argv.find((a) => a.startsWith('--file='));
const CSV_PATH = fileArg
  ? fileArg.slice('--file='.length)
  : join(ROOT, 'docs', 'Asistencia QR - ASISTENCIA.csv');

// --- env ------------------------------------------------------------
const env = {};
try {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[m[1]] = v;
  }
} catch (e) {
  console.error(`✗ No pude leer .env.local: ${e.message}`);
  process.exit(1);
}

const URL = env.VITE_SUPABASE_URL;
const SR = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || URL.includes('YOUR_') || !SR || SR.includes('YOUR_')) {
  console.error('✗ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

// --- CSV parser (RFC 4180 simplificado) -----------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }
    if (c === '\n' || c === '\r') {
      if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      }
      if (c === '\r' && text[i + 1] === '\n') i += 2;
      else i++;
      continue;
    }
    cell += c;
    i++;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const clean = (s) => (s ?? '').toString().trim();
const onlyDigits = (s) => clean(s).replace(/\D/g, '');

function parseDate(s) {
  const t = clean(s);
  const m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = '20' + y;
    const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (!Number.isNaN(new Date(iso).getTime())) return iso;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
}

// --- API helper -----------------------------------------------------
async function api(path, init = {}) {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SR,
      Authorization: `Bearer ${SR}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data
        ? data.message || data.error || JSON.stringify(data)
        : String(data || res.status);
    throw new Error(msg);
  }
  return data;
}

// --- main -----------------------------------------------------------
console.log(`\n→ Leyendo CSV: ${CSV_PATH}`);
let csvText;
try {
  csvText = readFileSync(CSV_PATH, 'utf8');
} catch (e) {
  console.error(`✗ No encontré el CSV: ${e.message}`);
  console.error('  Coloca "Asistencia QR - ASISTENCIA.csv" en docs/ o usa --file="ruta".');
  process.exit(1);
}

const rows = parseCSV(csvText);
const header = rows.shift() ?? [];
const idx = (name) => header.findIndex((h) => clean(h).toUpperCase() === name);
const COL = {
  fecha: idx('FECHA'),
  hora: idx('HORA'),
  codigo: idx('CODIGO'),
  nombre: idx('NOMBRE'),
  apellido: idx('APELLIDO'),
};

console.log(`  ${rows.length} filas leídas`);

// --- traer miembros y armar mapa cédula→id --------------------------
console.log(`→ Cargando miembros…`);
const members = await api('/rest/v1/members?select=id,cedula,nombre,apellido');
const byCedula = new Map();
for (const m of members) {
  const c = onlyDigits(m.cedula ?? '');
  if (c) byCedula.set(c, m);
}
console.log(`  ${byCedula.size} miembros con cédula`);

// --- transformar ----------------------------------------------------
const stats = { total: rows.length, vacias: 0, sin_match: 0, dup_local: 0, to_insert: 0 };
const sinMatch = new Map(); // cedula → nombre raw
const toInsert = [];
const seen = new Set(); // member_id|fecha (dedup local)

for (const r of rows) {
  const codigo = onlyDigits(r[COL.codigo] ?? '');
  const nombreRaw = clean(r[COL.nombre] ?? '');
  if (!codigo || nombreRaw === '#N/A' || !nombreRaw) {
    stats.vacias++;
    continue;
  }
  const fecha = parseDate(r[COL.fecha] ?? '');
  if (!fecha) {
    stats.vacias++;
    continue;
  }
  const member = byCedula.get(codigo);
  if (!member) {
    stats.sin_match++;
    sinMatch.set(codigo, `${nombreRaw} ${clean(r[COL.apellido] ?? '')}`.trim());
    continue;
  }
  const key = `${member.id}|${fecha}`;
  if (seen.has(key)) {
    stats.dup_local++;
    continue;
  }
  seen.add(key);
  toInsert.push({
    member_id: member.id,
    event_id: null,
    fecha,
    hora: clean(r[COL.hora] ?? '') || null,
    codigo,
    origen: 'import',
    registrado_por: null,
  });
}
stats.to_insert = toInsert.length;

console.log(`\n→ Resumen:`);
console.log(`  Filas leídas:              ${stats.total}`);
console.log(`  Vacías / #N/A:             ${stats.vacias}`);
console.log(`  Cédula sin miembro:        ${stats.sin_match}`);
console.log(`  Duplicados (mismo día):    ${stats.dup_local}`);
console.log(`  Para insertar:             ${stats.to_insert}`);

if (sinMatch.size > 0) {
  console.log(`\n⚠ Cédulas sin miembro en la BD (no se importan):`);
  for (const [c, n] of sinMatch) console.log(`   ${c}  ${n}`);
}

// --- insertar -------------------------------------------------------
const result = { ok: 0, conflict: 0, error: [] };

if (DRY_RUN) {
  console.log(`\n→ DRY RUN — no se inserta nada. Ejemplos:\n`);
  for (const a of toInsert.slice(0, 3)) console.log(a);
} else {
  console.log(`\n→ Insertando en lotes de 50…`);
  const CHUNK = 50;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const batch = toInsert.slice(i, i + CHUNK);
    try {
      await api('/rest/v1/asistencias?on_conflict=member_id,fecha', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(batch),
      });
      result.ok += batch.length;
      process.stdout.write(`\r  ${result.ok}/${toInsert.length}…`);
    } catch (e) {
      for (const a of batch) {
        try {
          await api('/rest/v1/asistencias?on_conflict=member_id,fecha', {
            method: 'POST',
            headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
            body: JSON.stringify([a]),
          });
          result.ok++;
        } catch (err) {
          const msg = err.message || '';
          if (msg.includes('duplicate') || msg.includes('conflict')) result.conflict++;
          else result.error.push({ codigo: a.codigo, fecha: a.fecha, error: msg });
        }
      }
    }
  }
  console.log('');
}

console.log(`\n→ Resultado:`);
console.log(`  Insertados:  ${result.ok}`);
console.log(`  Conflictos:  ${result.conflict}`);
console.log(`  Errores:     ${result.error.length}`);
for (const e of result.error.slice(0, 20)) console.log(`   ✗ ${e.codigo} ${e.fecha}: ${e.error}`);

process.exit(result.error.length > 0 ? 1 : 0);
