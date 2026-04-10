# 🏍️ Club Raider Atlántico — Plataforma Digital

> Comunidad de pilotos TVS Raider en el Caribe Colombiano.  
> Stack: React + Vite · MUI · Framer Motion · Supabase · Vercel

---

## 🗂️ Arquitectura de Directorios

```
club-raider-atlantico/
├── public/
│   ├── logo.png                  # Logo principal (fondo transparente)
│   ├── favicon.svg
│   └── og-image.png              # Open Graph preview (1200x630)
│
├── src/
│   ├── components/               # Folder-by-feature
│   │   ├── Hero/
│   │   │   ├── Hero.jsx
│   │   │   └── index.js
│   │   ├── ComingSoon/
│   │   │   ├── ComingSoon.jsx    # Moto animada + roadmap de fases
│   │   │   └── index.js
│   │   ├── SocialLinks/
│   │   │   ├── SocialLinks.jsx   # Links premium estilo Linktree
│   │   │   └── index.js
│   │   └── Layout/
│   │       ├── Layout.jsx
│   │       └── index.js
│   │
│   ├── hooks/                    # Custom hooks (Fase 1+)
│   │   └── useWaitlist.js        # Hook para lista de espera Supabase
│   │
│   ├── lib/
│   │   ├── supabase.js           # Cliente Supabase + schema docs
│   │   └── links.js              # Links sociales centralizados
│   │
│   ├── styles/
│   │   └── theme.js              # MUI theme + tokens de diseño
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore
├── vercel.json                   # Config de despliegue + headers
├── vite.config.js                # Aliases, chunks, optimizaciones
├── LARK_EMAIL_SETUP.md           # Guía correos corporativos
└── README.md
```

---

## 🚀 Inicio Rápido

### 1. Clona e instala

```bash
git clone https://github.com/TU_USUARIO/club-raider-atlantico.git
cd club-raider-atlantico
npm install
```

### 2. Configura variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
```

### 3. Añade el logo

Copia tu logo (fondo transparente) a:
```
public/logo.png
```

### 4. Corre en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

### 5. Build de producción

```bash
npm run build
npm run preview  # Verifica el build localmente
```

---

## ☁️ Despliegue en Vercel

### Opción A — CLI (recomendado)

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Opción B — GitHub Integration

1. Push al repo en GitHub
2. Entra a [vercel.com/new](https://vercel.com/new)
3. Importa el repo → Framework: **Vite** → Deploy
4. En **Settings → Environment Variables**, añade:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Dominio personalizado

```
Vercel Dashboard → Project → Settings → Domains
→ Add: clubraideratlantico.com
→ Add: www.clubraideratlantico.com
```

Vercel genera los registros DNS automáticamente.

---

## 🌿 Flujo de Ramas Git

```
main          ← Producción (auto-deploy a Vercel)
  └── develop ← Integración y staging
        ├── feature/registro-socios
        ├── feature/portal-piloto
        └── fix/hero-mobile
```

```bash
# Crear rama de feature
git checkout develop
git checkout -b feature/mi-feature

# PR a develop → review → merge
# develop → main solo con release tag
git tag v0.1.0
git push origin main --tags
```

---

## 🗃️ Supabase — Schema Fase 0 → Fase 2

```sql
-- FASE 1: Lista de espera
CREATE TABLE waitlist (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text UNIQUE NOT NULL,
  name        text,
  whatsapp    text,
  created_at  timestamptz DEFAULT now()
);

-- FASE 1: Socios registrados
CREATE TABLE pilotos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users ON DELETE CASCADE,
  nombre        text NOT NULL,
  cedula        text UNIQUE,
  whatsapp      text,
  ciudad        text,
  moto_placa    text,
  moto_modelo   text,
  moto_ano      int,
  contacto_emergencia_nombre text,
  contacto_emergencia_tel    text,
  estado        text DEFAULT 'pendiente', -- pendiente | activo | inactivo
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- FASE 2: Eventos / rodadas
CREATE TABLE eventos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      text NOT NULL,
  descripcion text,
  fecha       timestamptz NOT NULL,
  ubicacion   text,
  max_cupos   int,
  creado_por  uuid REFERENCES pilotos(id),
  created_at  timestamptz DEFAULT now()
);

-- RLS policies base
ALTER TABLE waitlist  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilotos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Piloto ve su propio perfil" ON pilotos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Piloto actualiza su perfil"  ON pilotos FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🗺️ Roadmap del Proyecto

| Fase | Nombre | Estado | Descripción |
|------|--------|--------|-------------|
| **0** | Landing & Identidad | ✅ En curso | Coming soon, links sociales, identidad de marca |
| **1** | Registro de Socios | 🔜 Siguiente | Formulario piloto, Supabase auth, lista de espera |
| **2** | Portal del Piloto | 📋 Planificado | Dashboard personal, carnet digital, historial |
| **3** | App Móvil | 📋 Planificado | React Native / Expo, alertas de emergencia push |

---

## 🎨 Tokens de Diseño

| Token | Valor | Uso |
|-------|-------|-----|
| `red` | `#CC2222` | Acento primario, CTAs |
| `yellow` | `#E8B800` | Acento secundario (Colombia) |
| `blue` | `#003DA5` | Acento terciario (Colombia) |
| `black` | `#0A0A0A` | Fondo base |
| `white` | `#F0EDE8` | Texto primario |
| Font display | `Bebas Neue` | Títulos hero |
| Font UI | `Barlow Condensed` | Labels, botones, nav |
| Font body | `Barlow` | Texto corrido |

---

## 📧 Correos Corporativos

Ver guía completa en [`LARK_EMAIL_SETUP.md`](./LARK_EMAIL_SETUP.md)

Cuentas recomendadas:
- `presidente@clubraideratlantico.com`
- `contacto@clubraideratlantico.com`
- `registro@clubraideratlantico.com`
- `eventos@clubraideratlantico.com`
- `noreply@clubraideratlantico.com` ← conectar a Supabase SMTP

---

## 🔗 Links del Club

| Canal | URL |
|-------|-----|
| Instagram | [@clubraideratl](https://instagram.com/clubraideratl) |
| TikTok | [@club.raider.atl](https://www.tiktok.com/@club.raider.atl) |
| Facebook | [Club Raider Atlántico](https://www.facebook.com/share/1PXLn8kZVq/) |
| WhatsApp | [Grupo oficial](https://chat.whatsapp.com/IBTjlbhHJXSAgSovkokvr0) |
| Formulario | [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLSdd-B4Vl3ADs4Gz2lKGhuyCiQEe_DEsM0CoQmUqkOubuUK7rg/viewform) |

---

*Club Raider Atlántico · Caribe Colombiano · TVS Raider*
