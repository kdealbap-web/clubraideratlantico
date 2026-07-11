-- ============================================================
-- 0012 — Foto de perfil de miembros
-- Las fotos viven en Storage (bucket público `gallery`, prefijo `members/`).
-- Aquí solo guardamos la URL pública y el path para poder reemplazar/eliminar.
-- ============================================================

alter table public.members
  add column if not exists foto_url  text,
  add column if not exists foto_path text;

comment on column public.members.foto_url  is 'URL pública de la foto (Storage: gallery/members/). Null = mostrar iniciales.';
comment on column public.members.foto_path is 'Path del objeto en Storage, para reemplazar/eliminar la foto.';
