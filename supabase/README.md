# Supabase — wipe + migrations

## Orden de ejecución (SQL Editor)

### 1. Wipe del schema actual

```bash
supabase/wipe.sql
```

- Borra las 8 tablas legacy + función `es_lider_o_admin` + `set_updated_at` + `rls_auto_enable` + sus event triggers.
- **Preserva**: las 6 cuentas en `auth.users`, el bucket `clubraiderbucket` (vacío), y sus policies.
- Verificación al final del script (RAISE EXCEPTION si quedan tablas en public).

### 2. Migrations en orden

```
supabase/migrations/0001_init.sql       schema (members + solicitudes + events + news + gallery + settings + activity_log)
supabase/migrations/0002_rls.sql        RLS policies con helpers is_admin() / is_editor()
supabase/migrations/0003_seed_admin.sql siembra Kevin admin + 5 pilotos oficiales + buzón genérico
```

Aplicar todo de un golpe vía CLI:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

O pegar manual cada archivo en SQL Editor → Run.

### 3. Crear bucket público para galería

Tu bucket actual `clubraiderbucket` es privado (para fotos de carnet, etc.). Para la galería pública del club hace falta un bucket aparte.

**Storage → New bucket:**
- Name: `gallery`
- Public: **sí**
- File size limit: 10 MB (suficiente para fotos web)
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Luego policy de Storage (SQL Editor):

```sql
-- read público en gallery/
create policy "gallery read public"
  on storage.objects for select
  using (bucket_id = 'gallery');

-- write solo editores+ en gallery/
create policy "gallery write editor+"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_editor(auth.uid()));

create policy "gallery delete editor+"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_editor(auth.uid()));
```

## Verificación post-aplicación

```sql
select rol, estado, email, auth_user_id is not null as vinculado
from public.members
order by rol, email;

-- Esperado: 7 filas
-- 2 ADMINISTRADOR (kdealbap@gmail.com vinculado + admin@clubraideratlantico.com sin vincular)
-- 5 PILOTO_OFICIAL (los 5 emails preregistrados, vinculados)

select count(*) from public.solicitudes;  -- 0
select count(*) from public.events;       -- 0
select count(*) from public.news;         -- 0
select count(*) from public.gallery;      -- 0
select count(*) from public.activity_log; -- 0
select id from public.settings;           -- 1
```

## Acción inmediata después de aplicar

1. **Logueate** en `/login` con `kdealbap@gmail.com` → entra al CMS como ADMINISTRADOR.
2. **Avisa a los 5 pilotos** que pueden ingresar con su email vía magic link. Cuando hagan login, su fila ya está y los datos personales los pueden completar desde `/portal` → "Mis datos".
3. **Desde el CMS** (`/admin/miembros`) puedes pre-cargar sus datos antes de que se conecten — cédula, ciudad, datos de moto, etc.

## Scripts auxiliares

```
supabase/inspect-schema.sql           snapshot completo del schema (read-only, para auditar)
supabase/inspect-users-storage.sql    listar auth.users + objetos en bucket (read-only)
supabase/wipe.sql                     wipe quirúrgico (destructivo, idempotente)
```
