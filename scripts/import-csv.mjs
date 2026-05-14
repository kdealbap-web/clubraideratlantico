#!/usr/bin/env node
/**
 * scripts/import-csv.mjs
 *
 * Importa miembros desde docs/base_datos_borrador_miembrosclub.csv hacia Supabase.
 *
 * Reglas:
 *   - Dedupe por cédula (mantiene primera aparición no-vacía)
 *   - Preserva los 6 emails ya sembrados (kdealbap, ramirezjulio0925, …) — no toca esas filas
 *   - Normaliza nombres a MAYÚSCULAS, divide en nombre + apellido inteligentemente
 *   - Mapea "ROLL EN EL CLUB" al enum rol_miembro
 *   - Parsea fechas DD/MM/YYYY → ISO YYYY-MM-DD
 *   - Limpia teléfonos, emails, ciudades
 *   - Saltea filas sin email (no se puede vincular auth.users)
 *   - Inserta con ON CONFLICT DO NOTHING (idempotente)
 *
 * Genera reporte en docs/.import-report-{timestamp}.md
 *
 * Uso:
 *   1. SUPABASE_SERVICE_ROLE_KEY debe estar en .env.local
 *   2. CSV en docs/base_datos_borrador_miembrosclub.csv
 *   3. npm run import:csv [-- --dry-run]
 *   4. Revisa el reporte
 *   5. Quita SUPABASE_SERVICE_ROLE_KEY de .env.local
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

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

// --- constantes -----------------------------------------------------
const SEEDED_EMAILS = new Set([
  'kdealbap@gmail.com',
  'ramirezjulio0925@gmail.com',
  'bmolinares94@gmail.com',
  'larrartecarlos0@gmail.com',
  'alejandro.villanuevaorozco@gmail.com',
  'dainisgomez2006@gmail.com',
  'admin@clubraideratlantico.com',
]);

const PARTICULAS = new Set(['DE', 'DEL', 'LA', 'LOS', 'LAS', 'Y', 'DA', 'DI', 'VAN', 'VON']);

const COLORES = new Set([
  'NEGRA', 'NEGRO', 'BLANCA', 'BLANCO', 'ROJA', 'ROJO', 'AZUL', 'GRIS',
  'VERDE', 'AMARILLA', 'AMARILLO', 'MORADA', 'MORADO', 'ANARANJADA', 'NARANJA',
  'CAFÉ', 'MARRÓN', 'PLATEADO', 'PLATA', 'DORADO', 'BEIGE', 'ROSA', 'FUCSIA',
]);

const ROL_MAP = {
  'PILOTO OFICIAL': 'PILOTO_OFICIAL',
  'PILOTO_OFICIAL': 'PILOTO_OFICIAL',
  'PILOTO': 'PILOTO_OFICIAL',
  'ASPIRANTE': 'ASPIRANTE',
  'GENERAL': 'GENERAL',
  'MIEMBRO': 'GENERAL',
  'COPILOTO': 'CO_PILOTO',
  'CO-PILOTO': 'CO_PILOTO',
  'CO_PILOTO': 'CO_PILOTO',
  'PARRILLERO': 'CO_PILOTO',
  'ADMINISTRADOR': 'ADMINISTRADOR',
  'ADMIN': 'ADMINISTRADOR',
  'LIDER': 'LIDER',
  'LÍDER': 'LIDER',
  'EDITOR': 'EDITOR',
};

// --- CSV parser robusto (RFC 4180 simplificado) --------------------
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

// --- normalizadores --------------------------------------------------
function clean(s) {
  return (s ?? '').toString().trim().replace(/\s+/g, ' ');
}

function toUpper(s) {
  return clean(s).toUpperCase();
}

function cleanCedula(s) {
  const c = clean(s).replace(/[.\s-]/g, '');
  return /^\d{5,12}$/.test(c) ? c : null;
}

function cleanEmail(s) {
  const e = clean(s).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

function cleanPhone(s) {
  const p = clean(s).replace(/[.\s-]/g, '');
  if (!p) return null;
  // Convierte 3xxx... a +57 3xx xxx xxxx si parece colombiano
  if (/^3\d{9}$/.test(p)) return `+57 ${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6)}`;
  if (/^\+?57\d{10}$/.test(p)) {
    const n = p.replace(/^\+?57/, '');
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return clean(s); // devolver tal cual si formato raro
}

function parseDate(s) {
  const t = clean(s);
  if (!t) return null;
  // DD/MM/YYYY o D/M/YYYY o DD-MM-YYYY
  const m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = (parseInt(y) > 30 ? '19' : '20') + y;
    const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const date = new Date(iso);
    if (!isNaN(date.getTime())) return iso;
  }
  // YYYY-MM-DD ya OK
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
}

function splitName(full) {
  const parts = toUpper(full).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombre: '', apellido: '' };
  if (parts.length === 1) return { nombre: parts[0], apellido: '' };
  if (parts.length === 2) return { nombre: parts[0], apellido: parts[1] };

  // 3+ palabras: heurística con partículas
  // Si la tercera-desde-el-final es partícula, apellido = últimas 3
  // Si la segunda-desde-el-final es partícula, apellido = últimas 3
  let apellidoStart;
  if (parts.length >= 3 && PARTICULAS.has(parts[parts.length - 3])) {
    apellidoStart = parts.length - 3;
  } else if (parts.length >= 4 && PARTICULAS.has(parts[parts.length - 2])) {
    apellidoStart = parts.length - 3;
  } else if (parts.length === 3) {
    apellidoStart = 1; // 1 nombre + 2 apellidos
  } else {
    apellidoStart = 2; // 2 nombres + 2+ apellidos
  }
  if (apellidoStart < 1) apellidoStart = 1;
  return {
    nombre: parts.slice(0, apellidoStart).join(' '),
    apellido: parts.slice(apellidoStart).join(' '),
  };
}

function aliasFrom(nombre, apellido) {
  const n = nombre.split(' ')[0] ?? '';
  const a = apellido.split(' ')[0] ?? '';
  return ((n[0] ?? '') + (a[0] ?? '')).toUpperCase() || null;
}

function parseMotoRefColor(raw) {
  const t = toUpper(raw);
  if (!t) return { modelo: null, color: null };
  // Si tiene coma: "Pulsar NS200, ROJA"
  if (t.includes(',')) {
    const [modelo, color] = t.split(',').map((s) => s.trim());
    return { modelo: modelo || null, color: color || null };
  }
  // Si es solo un color conocido
  if (COLORES.has(t)) return { modelo: null, color: t };
  // Si tiene 1 palabra desconocida → asume modelo
  if (!t.includes(' ')) return { modelo: t, color: null };
  // Múltiples palabras: última palabra suele ser color si es conocido
  const words = t.split(' ');
  const last = words[words.length - 1];
  if (COLORES.has(last)) {
    return {
      modelo: words.slice(0, -1).join(' '),
      color: last,
    };
  }
  return { modelo: t, color: null };
}

function parsePlaca(s) {
  const p = clean(s).toUpperCase().replace(/[\s-]/g, '');
  if (/^[A-Z]{3}\d{2}[A-Z]$/.test(p) || /^[A-Z]{3}\d{3}$/.test(p)) return p;
  return p || null;
}

function parseRol(raw) {
  const t = clean(raw).toUpperCase();
  if (!t) return 'GENERAL';
  for (const [k, v] of Object.entries(ROL_MAP)) {
    if (t === k || t.includes(k)) return v;
  }
  return 'GENERAL';
}

// --- API helper -----------------------------------------------------
async function api(path, init = {}) {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SR,
      Authorization: `Bearer ${SR}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
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
    const msg = typeof data === 'object' && data ? data.message || data.error || JSON.stringify(data) : String(data || res.status);
    throw new Error(msg);
  }
  return data;
}

// --- main -----------------------------------------------------------
console.log(`\n→ Leyendo CSV…`);
const csvPath = join(ROOT, 'docs', 'base_datos_borrador_miembrosclub.csv');
let csvText;
try {
  csvText = readFileSync(csvPath, 'utf8');
} catch (e) {
  console.error(`✗ No encontré ${csvPath}: ${e.message}`);
  process.exit(1);
}

const rows = parseCSV(csvText);
const header = rows.shift();
console.log(`  ${rows.length} filas (sin contar header)`);

// Mapa de columnas por nombre
const colIdx = (name) => header.findIndex((h) => clean(h).toUpperCase() === name);
const COL = {
  nombre: colIdx('NOMBRE COMPLETO'),
  rol: colIdx('ROLL EN EL CLUB'),
  cedula: colIdx('C.C.'),
  grupo: colIdx('GRUPO SANGUINEO'),
  placa: colIdx('PLACA MOTO'),
  direccion: colIdx('DIRECCION DE RESIDENCIA'),
  ciudad: colIdx('CIUDAD DE RESIDENCIA'),
  fechaNac: colIdx('FECHA NACIMIENTO'),
  tel: colIdx('NUMERO DE CONTACTO'),
  emerTel: colIdx('NUMERO DE CONTACTO DE EMERGENCIA'),
  emerNombre: colIdx('NOMBRE CONTACTO DE EMERGENCIA'),
  motoRef: colIdx('REFERENCIA DE MOTO Y COLOR'),
  soat: colIdx('VIGENCIA DE SOAT'),
  bio: colIdx('CUENTANOS DE TI'),
  eps: colIdx('EPS'),
  trabajo: colIdx('LUGAR DE TRABAJO'),
  trabajoContacto: colIdx('CONTACTO TRABAJO'),
  correo: colIdx('CORREO'),
};

const missing = Object.entries(COL).filter(([, i]) => i < 0);
if (missing.length) {
  console.warn('⚠ Columnas no encontradas:', missing.map(([k]) => k).join(', '));
}

// --- transformar ----------------------------------------------------
const stats = {
  total: rows.length,
  sin_email: 0,
  seeded_skipped: 0,
  dup_cedula: 0,
  dup_email: 0,
  invalid_email: 0,
  to_insert: 0,
};
const dups = [];
const skipped = [];
const toInsert = [];

const seenCedulas = new Set();
const seenEmails = new Set();

for (const r of rows) {
  const rawCorreo = r[COL.correo] ?? '';
  const email = cleanEmail(rawCorreo);

  if (!email) {
    if (rawCorreo.trim()) stats.invalid_email++;
    else stats.sin_email++;
    skipped.push({
      reason: rawCorreo.trim() ? 'email_invalido' : 'sin_email',
      raw_email: rawCorreo,
      raw_nombre: r[COL.nombre] ?? '',
    });
    continue;
  }

  // Salta seeded
  if (SEEDED_EMAILS.has(email)) {
    stats.seeded_skipped++;
    skipped.push({ reason: 'seed_preserved', email, raw_nombre: r[COL.nombre] ?? '' });
    continue;
  }

  // Dedupe email
  if (seenEmails.has(email)) {
    stats.dup_email++;
    dups.push({ tipo: 'email', valor: email, raw_nombre: r[COL.nombre] ?? '' });
    continue;
  }

  const cedula = cleanCedula(r[COL.cedula] ?? '');
  if (cedula && seenCedulas.has(cedula)) {
    stats.dup_cedula++;
    dups.push({ tipo: 'cedula', valor: cedula, raw_nombre: r[COL.nombre] ?? '', email });
    continue;
  }

  const { nombre, apellido } = splitName(r[COL.nombre] ?? '');
  if (!nombre) {
    skipped.push({ reason: 'sin_nombre', email });
    continue;
  }

  const { modelo, color } = parseMotoRefColor(r[COL.motoRef] ?? '');
  const placa = parsePlaca(r[COL.placa] ?? '');
  const emerNombre = toUpper(r[COL.emerNombre] ?? '') || null;
  const emerTel = cleanPhone(r[COL.emerTel] ?? '');
  const emergencia = emerNombre || emerTel ? { nombre: emerNombre ?? '', tel: emerTel ?? '', relacion: '' } : null;

  toInsert.push({
    email,
    nombre,
    apellido,
    cedula: cedula ?? null,
    fecha_nac: parseDate(r[COL.fechaNac] ?? ''),
    tel: cleanPhone(r[COL.tel] ?? ''),
    ciudad: toUpper(r[COL.ciudad] ?? '') || null,
    alias: aliasFrom(nombre, apellido),
    rol: parseRol(r[COL.rol] ?? ''),
    estado: 'activo',
    ingreso: new Date().toISOString().slice(0, 10),
    rodadas: 0,
    moto_marca: null,
    moto_modelo: modelo,
    moto_year: null,
    moto_placa: placa,
    moto_color: color,
    moto_soat: parseDate(r[COL.soat] ?? ''),
    direccion: toUpper(r[COL.direccion] ?? '') || null,
    eps: toUpper(r[COL.eps] ?? '') || null,
    grupo_sanguineo: toUpper(r[COL.grupo] ?? '') || null,
    lugar_trabajo: toUpper(r[COL.trabajo] ?? '') || null,
    contacto_trabajo: clean(r[COL.trabajoContacto] ?? '') || null,
    bio: clean(r[COL.bio] ?? '') || null,
    emergencia,
  });

  seenEmails.add(email);
  if (cedula) seenCedulas.add(cedula);
}

stats.to_insert = toInsert.length;

console.log(`\n→ Resumen pre-inserción:`);
console.log(`  Total filas leídas:        ${stats.total}`);
console.log(`  Sin email:                 ${stats.sin_email}`);
console.log(`  Email inválido:            ${stats.invalid_email}`);
console.log(`  Preserved (seed/admin):    ${stats.seeded_skipped}`);
console.log(`  Duplicados por email:      ${stats.dup_email}`);
console.log(`  Duplicados por cédula:     ${stats.dup_cedula}`);
console.log(`  Para insertar:             ${stats.to_insert}`);

// --- insertar -------------------------------------------------------
const insertResults = { ok: 0, conflict: 0, error: [] };

if (DRY_RUN) {
  console.log(`\n→ DRY RUN — no se inserta nada. Muestro 3 ejemplos:\n`);
  for (const m of toInsert.slice(0, 3)) console.log(m);
} else {
  console.log(`\n→ Insertando en lotes de 50…`);
  const CHUNK = 50;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const batch = toInsert.slice(i, i + CHUNK);
    try {
      await api('/rest/v1/members?on_conflict=email', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(batch),
      });
      insertResults.ok += batch.length;
      process.stdout.write(`\r  ${insertResults.ok}/${toInsert.length} insertados…`);
    } catch (e) {
      // Si el lote falla, probar uno por uno
      for (const m of batch) {
        try {
          await api('/rest/v1/members?on_conflict=email', {
            method: 'POST',
            headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
            body: JSON.stringify([m]),
          });
          insertResults.ok++;
        } catch (err) {
          const msg = err.message || '';
          if (msg.includes('duplicate key') || msg.includes('conflict')) {
            insertResults.conflict++;
          } else {
            insertResults.error.push({ email: m.email, nombre: `${m.nombre} ${m.apellido}`, error: msg });
          }
        }
      }
      process.stdout.write(`\r  ${insertResults.ok}/${toInsert.length} insertados (con ${insertResults.error.length} errores)…`);
    }
  }
  console.log('');
}

console.log(`\n→ Resultados de inserción:`);
console.log(`  Insertados:     ${insertResults.ok}`);
console.log(`  Ya existían:    ${insertResults.conflict}`);
console.log(`  Errores:        ${insertResults.error.length}`);

// --- reporte --------------------------------------------------------
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const reportPath = join(ROOT, 'docs', `.import-report-${ts}.md`);

const report = `# Reporte importación CSV — ${new Date().toLocaleString('es-CO')}

## Resumen

| Métrica | Valor |
|---|---|
| Filas leídas en CSV | ${stats.total} |
| Sin email | ${stats.sin_email} |
| Email inválido | ${stats.invalid_email} |
| Preserved (seed o admin) | ${stats.seeded_skipped} |
| Duplicados por email | ${stats.dup_email} |
| Duplicados por cédula | ${stats.dup_cedula} |
| Candidatos a insertar | ${stats.to_insert} |
| Insertados OK | ${insertResults.ok} |
| Ya existían (conflict) | ${insertResults.conflict} |
| Errores de inserción | ${insertResults.error.length} |

## Duplicados eliminados (${dups.length})

| Tipo | Valor | Nombre raw | Email |
|---|---|---|---|
${dups.slice(0, 200).map((d) => `| ${d.tipo} | ${d.valor} | ${d.raw_nombre} | ${d.email ?? '—'} |`).join('\n')}
${dups.length > 200 ? `\n_… y ${dups.length - 200} más_` : ''}

## Saltados (${skipped.length})

| Razón | Email | Nombre raw |
|---|---|---|
${skipped.slice(0, 200).map((s) => `| ${s.reason} | ${s.email ?? s.raw_email ?? '—'} | ${s.raw_nombre ?? '—'} |`).join('\n')}
${skipped.length > 200 ? `\n_… y ${skipped.length - 200} más_` : ''}

## Errores de inserción (${insertResults.error.length})

${insertResults.error.length === 0 ? '_ninguno_' : insertResults.error.slice(0, 100).map((e) => `- **${e.nombre}** (${e.email}): ${e.error}`).join('\n')}

---
_Reporte generado por scripts/import-csv.mjs_
`;

try {
  writeFileSync(reportPath, report, 'utf8');
  console.log(`\n→ Reporte guardado en ${reportPath}`);
} catch (e) {
  console.error(`⚠ No pude guardar reporte: ${e.message}`);
}

process.exit(insertResults.error.length > 0 ? 1 : 0);
