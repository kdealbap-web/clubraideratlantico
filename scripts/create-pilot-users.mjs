#!/usr/bin/env node
/**
 * scripts/create-pilot-users.mjs
 *
 * Crea usuarios de auth (email + contraseña) para todos los miembros con
 * rol PILOTO_OFICIAL que aún NO tengan usuario, vía Supabase Admin API.
 * Vincula members.auth_user_id y muestra la tabla email+contraseña para
 * compartir con cada piloto. Idempotente: salta a los que ya tienen usuario.
 *
 * Uso:
 *   1. Pon SUPABASE_SERVICE_ROLE_KEY en .env.local
 *   2. npm run create:pilots           (o :dry para previsualizar)
 *   3. Copia la tabla del output y compártela por canal privado
 *   4. BORRA SUPABASE_SERVICE_ROLE_KEY de .env.local
 */

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

// --- env ------------------------------------------------------------
const env = {};
try {
  const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
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
  console.error(
    '\n✗ Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n' +
      '  Supabase → Settings → API → service_role → Reveal → copia como\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=... y vuelve a correr. Bórralo al terminar.\n',
  );
  process.exit(1);
}

// --- generador de contraseñas (sin caracteres ambiguos) -------------
const UP = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LO = 'abcdefghijkmnpqrstuvwxyz';
const DI = '23456789';
const ALL = UP + LO + DI;
const pickN = (cs, n) => {
  const b = randomBytes(n);
  let o = '';
  for (let i = 0; i < n; i++) o += cs[b[i] % cs.length];
  return o;
};
const shuffle = (s) => {
  const a = [...s];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join('');
};
const genPassword = () => shuffle(pickN(UP, 3) + pickN(LO, 3) + pickN(DI, 3) + pickN(ALL, 5));

// --- API ------------------------------------------------------------
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
        ? data.msg || data.message || data.error || JSON.stringify(data)
        : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

// --- 1. pilotos en members ------------------------------------------
console.log('\n→ Cargando pilotos (rol PILOTO_OFICIAL)…');
const pilots = await api(
  '/rest/v1/members?select=id,nombre,apellido,email,auth_user_id&rol=eq.PILOTO_OFICIAL&order=apellido',
);
console.log(`  ${pilots.length} pilotos`);

// --- 2. usuarios de auth existentes ---------------------------------
const list = await api('/auth/v1/admin/users?per_page=1000');
const authUsers = Array.isArray(list) ? list : list.users || [];
const existingEmails = new Set(authUsers.map((u) => (u.email || '').toLowerCase()));

// --- 3. crear los que faltan ----------------------------------------
const created = [];
const skipped = [];
const errors = [];

for (const p of pilots) {
  const email = (p.email || '').trim().toLowerCase();
  if (!email) {
    skipped.push({ nombre: `${p.nombre} ${p.apellido}`, reason: 'sin email' });
    continue;
  }
  if (existingEmails.has(email) || p.auth_user_id) {
    skipped.push({ nombre: `${p.nombre} ${p.apellido}`, email, reason: 'ya tiene usuario' });
    continue;
  }
  const password = genPassword();
  if (DRY_RUN) {
    created.push({ nombre: `${p.nombre} ${p.apellido}`, email, password: '(dry-run)' });
    continue;
  }
  try {
    const user = await api('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombre: p.nombre, apellido: p.apellido },
      }),
    });
    // vincular members.auth_user_id
    if (user?.id) {
      try {
        await api(`/rest/v1/members?id=eq.${p.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ auth_user_id: user.id }),
        });
      } catch {
        /* el trigger tambien vincula al primer login */
      }
    }
    created.push({ nombre: `${p.nombre} ${p.apellido}`, email, password });
  } catch (e) {
    errors.push({ nombre: `${p.nombre} ${p.apellido}`, email, error: e.message });
  }
}

// --- 4. output ------------------------------------------------------
const sep = '─'.repeat(92);
console.log('\n' + sep);
console.log(`CONTRASEÑAS DE PILOTOS ${DRY_RUN ? '(DRY RUN)' : ''} — Club Raider Atlántico`);
console.log('Comparte por canal privado (WhatsApp directo). Ingresan en /login (Portal piloto).');
console.log(sep);
for (const c of created) {
  console.log(`\n  ${c.nombre}`);
  console.log(`  Email     :  ${c.email}`);
  console.log(`  Contraseña:  ${c.password}`);
}
console.log('\n' + sep);
console.log(`Creados: ${created.length} · Saltados: ${skipped.length} · Errores: ${errors.length}`);
if (skipped.length) {
  console.log('\nSaltados:');
  for (const s of skipped) console.log(`  · ${s.nombre} ${s.email ?? ''} — ${s.reason}`);
}
if (errors.length) {
  console.log('\nErrores:');
  for (const e of errors) console.log(`  ✗ ${e.nombre} ${e.email} — ${e.error}`);
}
console.log(sep);
console.log('Recuerda BORRAR SUPABASE_SERVICE_ROLE_KEY de .env.local.\n');

process.exit(errors.length > 0 ? 1 : 0);
