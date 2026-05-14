#!/usr/bin/env node
/**
 * scripts/seed-passwords.mjs
 *
 * Genera contraseñas aleatorias fuertes para todos los usuarios en auth.users
 * y las setea vía Supabase Admin REST API (con fetch nativo — sin cliente
 * Supabase, sin WebSocket, compatible con Node 18/20/22).
 *
 * Uso:
 *   1. Pon SUPABASE_SERVICE_ROLE_KEY en .env.local (el secret rotado)
 *   2. npm run seed:passwords
 *   3. Copia la tabla del output y compártela por canales privados
 *   4. BORRA SUPABASE_SERVICE_ROLE_KEY de .env.local
 */

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Cargar .env.local ----------------------------------------------
const envPath = join(__dirname, '..', '.env.local');
const env = {};
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[m[1]] = v;
  }
} catch (e) {
  console.error(`✗ No pude leer ${envPath}: ${e.message}`);
  process.exit(1);
}

const URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || URL.includes('YOUR_')) {
  console.error('✗ Falta VITE_SUPABASE_URL en .env.local');
  process.exit(1);
}
if (!SERVICE_ROLE || SERVICE_ROLE.includes('YOUR_')) {
  console.error(
    '\n✗ Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.\n' +
      '  Ve a Supabase → Settings → API → "service_role" → Reveal → Copy.\n' +
      '  Pégalo como SUPABASE_SERVICE_ROLE_KEY=sb_secret_... y corre de nuevo.\n' +
      '  Después de correr, BORRA esa línea.\n',
  );
  process.exit(1);
}

// --- Generador de contraseñas robusto -------------------------------
const UP = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I/O
const LO = 'abcdefghijkmnpqrstuvwxyz'; // sin l/o
const DI = '23456789';                  // sin 0/1
const ALL = UP + LO + DI;

function pickN(charset, n) {
  let out = '';
  const buf = randomBytes(n);
  for (let i = 0; i < n; i++) out += charset[buf[i] % charset.length];
  return out;
}

function shuffle(s) {
  const arr = [...s];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function genPassword() {
  return shuffle(pickN(UP, 3) + pickN(LO, 3) + pickN(DI, 3) + pickN(ALL, 5));
}

// --- Helpers HTTP ---------------------------------------------------
async function api(path, init = {}) {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
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
    const msg = typeof data === 'object' && data && (data.msg || data.message || data.error)
      ? (data.msg || data.message || data.error)
      : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

// --- 1. Listar usuarios ---------------------------------------------
let users;
try {
  const list = await api('/auth/v1/admin/users?per_page=200');
  users = list.users || list; // formato puede variar
  if (!Array.isArray(users)) {
    console.error('✗ Respuesta inesperada de /admin/users:', JSON.stringify(list).slice(0, 400));
    process.exit(1);
  }
} catch (e) {
  console.error(`✗ Error listando auth.users: ${e.message}`);
  console.error('  ¿La service_role key es correcta y vigente?');
  process.exit(1);
}

if (users.length === 0) {
  console.error('✗ No hay usuarios en auth.users.');
  process.exit(1);
}

// --- 2. Cargar nombres desde members --------------------------------
let memberByEmail = new Map();
try {
  const emailsList = users.map((u) => `"${u.email}"`).join(',');
  const members = await api(
    `/rest/v1/members?select=email,nombre,apellido,rol&email=in.(${emailsList})`,
  );
  memberByEmail = new Map(members.map((m) => [m.email, m]));
} catch (e) {
  console.warn(`⚠ No pude leer members (sigo sin nombres): ${e.message}`);
}

// --- 3. Setear contraseñas ------------------------------------------
const results = [];
for (const u of users) {
  const password = genPassword();
  try {
    await api(`/auth/v1/admin/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify({ password, email_confirm: true }),
    });
    const member = memberByEmail.get(u.email);
    results.push({
      email: u.email,
      nombre: member ? `${member.nombre} ${member.apellido}` : '—',
      rol: member?.rol ?? '—',
      password,
      error: null,
    });
  } catch (e) {
    results.push({
      email: u.email,
      nombre: memberByEmail.get(u.email)
        ? `${memberByEmail.get(u.email).nombre} ${memberByEmail.get(u.email).apellido}`
        : '—',
      rol: memberByEmail.get(u.email)?.rol ?? '—',
      password: null,
      error: e.message,
    });
  }
}

// --- 4. Output ------------------------------------------------------
const sep = '─'.repeat(96);
console.log('\n' + sep);
console.log('CONTRASEÑAS GENERADAS — Club Raider Atlántico');
console.log('Comparte solo por canales privados (WhatsApp directo, no grupo).');
console.log('Después de compartir, quita SUPABASE_SERVICE_ROLE_KEY de .env.local.');
console.log(sep);

for (const r of results) {
  console.log(`\n  ${r.nombre}  ·  ${r.rol}`);
  console.log(`  Email     :  ${r.email}`);
  if (r.password) {
    console.log(`  Contraseña:  ${r.password}`);
  } else {
    console.log(`  ⚠ ERROR  :  ${r.error}`);
  }
}

const ok = results.filter((r) => !r.error).length;
const fail = results.length - ok;
console.log('\n' + sep);
console.log(`Total: ${results.length} usuarios · ${ok} OK · ${fail} con error`);
console.log('Cada usuario puede:');
console.log('  · Login con contraseña en /login → tab "Contraseña"');
console.log('  · Reset vía magic link si la olvida (/login → tab "Magic link")');
console.log(sep + '\n');

process.exit(fail > 0 ? 1 : 0);
