# Club Raider Atlántico — instrucciones permanentes

## Stack
React 18 + Vite + TypeScript estricto + React Router v6 + Supabase + react-hook-form + zod.
CSS plano con variables (sin Tailwind). Deploy en Vercel. Package manager: **npm**.

## Reglas
- Cero filler. Sin Lorem, sin "Feature One", sin stats inventadas, sin avatares random.
- Sin imágenes de stock. Si falta asset → placeholder gris con label.
- **Cero datos quemados** del prototipo (`data.jsx` original). Tablas arrancan vacías, empty states siempre.
- Tokens y animaciones del prototipo (`src/styles/tokens.css`, copiado verbatim) son canon. No reinventar.
- Logo siempre `/logo.png`. Nunca el SVG triangular inspirado.
- TypeScript: `strict`, `noUncheckedIndexedAccess`. Sin `any`.
- Forms con react-hook-form + zod. DOB ≥ 18 obligatorio.
- Persistencia: Supabase. NO `localStorage` como fallback de datos de negocio (sí para tema/UI prefs).
- Hito por hito. Probar antes de cerrar.

## Estructura
```
src/
├── lib/            supabase, constants, auth, theme
├── pages/
│   ├── public/     Home, Nosotros, Reglamento, Eventos, Galería, Noticias, Únete, Login
│   ├── admin/      AdminLayout, Dashboard, Miembros, Eventos, Galería, Noticias, Configuración
│   └── portal/     Carnet, Mis rodadas, Mis datos
├── components/
│   ├── chrome/     Sidebar, Topbar, Logo, ThemePill
│   ├── public/     Hero, PublicNav, SocialLinks, TricolorStrip
│   ├── forms/      FormSolicitud (zod), FormGeneral
│   ├── loader/     SplashLoader
│   └── ui/         EmptyState, PageStub, Card, Button, Field, Badge, Drawer, Modal
├── styles/         tokens.css (canon), globals.css
└── types/          Member, Solicitud, EventItem, News, GalleryItem, Activity, ChartPoint
```

## Datos canon
- Tablas: `members`, `solicitudes`, `events`, `news`, `gallery`, `settings`, `activity_log` (ver `supabase/migrations/`).
- RLS habilitado en todas las tablas.
- Seed único: 1 admin (`admin@clubraideratlantico.com`).

## Email del club
- `info@clubraideratlantico.com` (genérico, contacto público)
- `admin@clubraideratlantico.com` (admin, recibe solicitudes)
- Redes: `@clubraideratlantico` (IG, TikTok, FB)
- WhatsApp: grupo oficial (URL en `src/lib/constants.ts`)

## Antes de cualquier PR
- `npm run typecheck` limpio
- `npm run lint` limpio
- `npm run build` exitoso
- Lighthouse ≥ 90 en las páginas tocadas

## Hitos
1. Bootstrap Vite + TS + Router + Supabase client + ESLint/Prettier ← **(hito 1 ampliado: incluye scaffold + tokens + admin shell con empty states + migrations)**
2. Tokens y chrome (ThemeProvider, Sidebar plegable, Topbar)
3. SplashLoader (moto PNG + asfalto + LED, CSS-only)
4. Auth (Supabase magic link, RequireAuth, RequireRole)
5. Schema Supabase + migrations + RLS + admin seed
6. Form `/unete` (zod + 6 secciones + Edge Function notify-admin Lark)
7. CMS Admin completo (CRUD + solicitudes aprobar/rechazar)
8. Portal piloto (carnet QR + mis rodadas + mis datos)
9. Landing pública (Inicio + Nosotros + Reglamento + Eventos + Galería + Noticias)
10. Pulido + deploy (a11y, Lighthouse, Vercel, E2E Playwright)

## Cero copia de valores
`data.jsx` del prototipo original es **shape, no valor**. Prohibido copiar:
- Nombres, cédulas, placas, teléfonos, emails de miembros ficticios
- Títulos de eventos / rodadas inventados
- Noticias ficticias
- Labels de galería inventados

El único seed permitido es 1 admin real creado por migration.

## Gate cierre hito 1
Los siguientes 7 greps deben devolver **vacío** antes de pasar a hito 2:

```bash
grep -rE "Andrés Mendoza|Carolina Pérez|Diego Ramírez" src/
grep -rE "ABC123|DEF456|GHI789" src/
grep -rE "1.234.567.890|987.654.321" src/
grep -r "from '../data'" src/
grep -rE "MEMBERS\s*=" src/
grep -rE "EVENTS\s*=" src/
grep -rE "NEWS\s*=" src/
```
