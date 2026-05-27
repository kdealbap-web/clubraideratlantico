-- ============================================================
-- 0011 — Galería: videos + portada + vínculo a rodada + álbumes.
--
--  type        'imagen' | 'video'
--  event_id    rodada/evento al que pertenece (opcional) → se muestra
--              en el detalle de esa rodada
--  poster_url  miniatura/portada del video (opcional)
--  poster_path ruta en Storage de la portada (para borrarla al eliminar)
--  album       nombre de "carpeta" (viaje/rodada/evento) para agrupar
--
-- Para videos por enlace externo (YouTube/Vimeo), storage_path queda ''.
-- ============================================================

alter table public.gallery
  add column if not exists type        text not null default 'imagen',
  add column if not exists event_id    uuid references public.events(id) on delete set null,
  add column if not exists poster_url  text,
  add column if not exists poster_path text,
  add column if not exists album       text;

alter table public.gallery drop constraint if exists gallery_type_check;
alter table public.gallery add constraint gallery_type_check check (type in ('imagen', 'video'));

create index if not exists gallery_event_idx on public.gallery(event_id) where event_id is not null;
create index if not exists gallery_type_idx  on public.gallery(type);
create index if not exists gallery_album_idx on public.gallery(album) where album is not null;

-- Subir el límite de tamaño del bucket 'gallery' a 250MB (262144000 bytes).
-- Nota: el límite GLOBAL del proyecto (Dashboard → Settings → Storage)
-- también debe permitir ese tamaño.
do $$
begin
  update storage.buckets set file_size_limit = 262144000 where id = 'gallery';
exception when others then
  raise notice 'No se pudo ajustar file_size_limit del bucket gallery (%).', sqlerrm;
end;
$$;
