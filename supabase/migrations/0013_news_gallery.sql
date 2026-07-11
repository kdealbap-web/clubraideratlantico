-- ============================================================
-- 0013 — Imágenes en noticias
-- cover_path: path en Storage de la portada subida (para reemplazar/eliminar).
-- galeria:    array JSON de imágenes de la nota → [{ "url": "...", "path": "...", "caption": "..." }]
-- Las imágenes viven en el bucket público `gallery`, prefijo `news/`.
-- ============================================================

alter table public.news
  add column if not exists cover_path text,
  add column if not exists galeria   jsonb not null default '[]'::jsonb;

comment on column public.news.cover_path is 'Path en Storage de la portada subida (gallery/news/). Null si es URL externa.';
comment on column public.news.galeria    is 'Galería de la nota: array de { url, path, caption? }.';
