# Club Raider Atlántico

Plataforma web del club: landing pública, CMS administrativo, portal del piloto.

**Stack:** React 18 + Vite + TypeScript estricto + React Router v6 + Supabase + react-hook-form + zod. CSS plano con tokens (sin Tailwind). Deploy Vercel.

---

## Quick start

```bash
npm install
cp .env.example .env.local
# editar .env.local con las 3 keys de tu proyecto Supabase
npm run dev
```

Abre http://localhost:5173.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite, HMR) |
| `npm run build` | Build de producción (`tsc --noEmit` + `vite build`) |
| `npm run preview` | Sirve el build en local |
| `npm run typecheck` | TypeScript estricto sin emitir |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — solo para scripts locales/Edge Functions (no entra al frontend)

## Migrations Supabase

Tres archivos en orden, en `supabase/migrations/`:

1. `0001_init.sql` — schema (7 tablas + 6 enums + índices)
2. `0002_rls.sql` — Row Level Security por tabla
3. `0003_seed_admin.sql` — 1 admin único (`admin@clubraideratlantico.com`) + settings singleton

Aplicar con `npx supabase db push` o pegando manualmente en el SQL Editor.

**Storage buckets necesarios (crear manual desde el dashboard):**
- `gallery/` — público read, escritura editores+
- `members/` — privado, solo el dueño + admin (en hito 8 v2 cuando suba foto carnet)

## Estructura

```
src/
├── lib/                supabase, auth, theme, sidebar, constants, useTable
├── pages/
│   ├── public/         Home, Nosotros, Reglamento, Eventos, Galería, Noticias, Únete, Login
│   ├── admin/          AdminLayout, Dashboard, Miembros (+ Solicitudes), Eventos, Galería, Noticias, Configuración
│   └── portal/         Portal (Carnet · Rodadas · Datos)
├── components/
│   ├── chrome/         Sidebar plegable, Topbar, Logo, ThemePill
│   ├── public/         PublicLayout, PublicNav, Hero, SocialLinks, TricolorStrip, Footer
│   ├── forms/          Field, FormSolicitud, FormEvento, FormNoticia, FormGaleria
│   ├── admin/          PageHeader, AdminTable, Drawer, Buttons
│   ├── auth/           RequireRole
│   ├── ui/             EmptyState, PageStub
│   └── icons.tsx       Catálogo SVG 24×24 stroke 1.6
├── data/               reglamento.ts (canon)
├── styles/             tokens.css (copy verbatim del prototipo), globals.css
└── types/              Member, Solicitud, Event, News, Gallery, Activity, ChartPoint
```

## Rutas

| Path | Acceso | Hito |
|---|---|---|
| `/` | público | 9 |
| `/nosotros`, `/reglamento`, `/eventos`, `/galeria`, `/noticias` | público | 9 |
| `/unete` | público | 6 |
| `/login` | público | 4 |
| `/admin/*` | rol `LIDER`/`ADMINISTRADOR`/`EDITOR` | 7 |
| `/admin/configuracion` | rol `LIDER`/`ADMINISTRADOR` | 7 |
| `/portal` | autenticado con fila en `members` | 8 |

## Reglas no negociables

- Cero filler. Sin Lorem, sin "Feature One", sin stats inventadas.
- Sin imágenes de stock. Si falta asset → placeholder gris con label.
- Cero datos quemados del prototipo (`data.jsx` original). Tablas arrancan vacías, empty states siempre.
- Tokens del prototipo (`src/styles/tokens.css`) son canon. No reinventar.
- Logo siempre `/logo.png`. Nunca el SVG triangular inspirado.
- TypeScript estricto. Sin `any`.
- Persistencia: Supabase. NO `localStorage` como fallback de datos de negocio.

## Deploy

Vercel: `vercel.json` ya configurado con rewrites SPA y headers de cache.

## Documentación de diseño

- `CLAUDE.md` — instrucciones permanentes
- Mantener canon de tokens y animaciones del prototipo original (carpeta `clubraideratlanticov2.0/`)
