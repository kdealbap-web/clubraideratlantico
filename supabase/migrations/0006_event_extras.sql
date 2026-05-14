-- ============================================================
-- Campos extras para events: cover, contacto, ubicación.
-- Para soportar el detalle público con share + maps + organizador.
-- ============================================================

alter table public.events
  add column if not exists cover_url       text,
  add column if not exists contacto_lider  text,
  add column if not exists contacto_tel    text,
  add column if not exists ubicacion_url   text,
  add column if not exists requisitos      text;
