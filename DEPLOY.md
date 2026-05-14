# Deploy a Vercel + dominio del club

## Pre-requisitos

- Cuenta Vercel (free tier OK)
- Repo del proyecto en GitHub/GitLab (o usa Vercel CLI desde local)
- Acceso al DNS del dominio `clubraideratlantico.com`
- Proyecto Supabase ya activo con migrations aplicadas

## Paso 1 — Push del código a Git

```bash
# Si aún no hay remoto:
git remote add origin <URL-de-tu-repo>
git branch -M main
git push -u origin main
```

## Paso 2 — Importar en Vercel

1. https://vercel.com/new
2. Selecciona tu repo `club-raider-atlantico-app`
3. **Framework Preset:** Vite (auto-detecta por `vite.config.ts`)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Install Command:** `npm install`
7. Aún no hagas Deploy — primero configura env vars (paso 3)

## Paso 3 — Variables de entorno

En **Settings → Environment Variables** agrega:

| Name | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://niimxoyelodtnycdsien.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_45_HICVzAOOmkf-LX-TPOg_YKQPe8yH` | Production, Preview, Development |
| `VITE_APP_URL` | `https://clubraideratlantico.com` | Production |
| `VITE_APP_ENV` | `production` | Production |

**NUNCA** subas `SUPABASE_SERVICE_ROLE_KEY` a Vercel — solo es para scripts locales como `seed-passwords`.

## Paso 4 — Custom domain

1. Vercel → tu proyecto → **Settings → Domains**
2. Agrega `clubraideratlantico.com` y `www.clubraideratlantico.com`
3. Vercel te muestra los registros DNS a configurar:
   - Apex (`clubraideratlantico.com`): `A` record → `76.76.21.21` (IP Vercel)
   - Subdomain (`www`): `CNAME` → `cname.vercel-dns.com`
4. En tu proveedor DNS (Cloudflare, GoDaddy, Namecheap…) crea esos dos registros
5. Espera 1–60 min para propagación. Vercel emite SSL gratis automáticamente.

## Paso 5 — Configurar Supabase Auth para el dominio real

**Supabase Dashboard → Authentication → URL Configuration:**

- **Site URL:** `https://clubraideratlantico.com`
- **Redirect URLs:** agrega los 3:
  - `https://clubraideratlantico.com/**`
  - `https://www.clubraideratlantico.com/**`
  - `http://localhost:5173/**` (para desarrollo)

Sin esto, los magic links redirigen a localhost en producción.

## Paso 6 — Generar y compartir contraseñas

**En local (no en Vercel):**

1. Edita `.env.local` y agrega temporalmente:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_<el-secreto-rotado>
   ```
   (Sácalo de Supabase → Settings → API → service_role → Reveal)
2. Corre:
   ```bash
   npm run seed:passwords
   ```
3. La terminal imprime una tabla con email + contraseña para cada uno de los 6 usuarios.
4. **Comparte por canal seguro** (WhatsApp directo, NO grupo): cada miembro recibe **solo su** email + contraseña.
5. **Borra** la línea `SUPABASE_SERVICE_ROLE_KEY` de `.env.local`. El frontend no la necesita y dejarla en disco es riesgo.

## Paso 7 — Verificación post-deploy

Una vez Vercel termina el deploy y el dominio resuelve:

1. Abre `https://clubraideratlantico.com` → splash + landing OK
2. `/reglamento` → 7 títulos romanos, TOC sticky funciona
3. `/unete` → form de aspirante con copy de Carlos David
4. `/login` → con tu contraseña (kdealbap + la que generó el script) → entras al CMS
5. Lighthouse en DevTools → Performance/Accessibility/SEO ≥ 90

## Paso 8 — Comunicar a los 6

Tus 6 miembros pueden ingresar de 2 formas:

- **Contraseña** (recomendado para uso diario): la que generaste con `npm run seed:passwords`
- **Magic link** (backup si olvidan): pone su email en `/login → Magic link → Enviar magic link`. Recibe email de Supabase con link de 1 clic.

Promueve a los 5 que quieras como **Líder** o **Administrador** desde `/admin/miembros` (click en su fila → cambia rol → Guardar). Al instante tienen acceso al CMS.

## Diagnóstico de errores comunes

| Problema | Causa | Solución |
|---|---|---|
| Magic link redirige a localhost | Redirect URLs no incluyen el dominio prod | Paso 5 |
| 401/403 al cargar admin | RLS bloquea porque auth_user_id está null | Corre el update SQL del seed_admin.sql |
| "Invalid login credentials" con contraseña | Contraseña no fue seteada o usuario no confirmado | Re-corre `npm run seed:passwords` |
| Build falla en Vercel | Falta env var | Settings → Environment Variables |
| Galería: 403 al subir foto | Bucket `gallery` no tiene policies | Mira `supabase/README.md` paso 4 |
