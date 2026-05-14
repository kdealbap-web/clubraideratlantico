-- ============================================================
-- Campos blandos para enriquecer el detalle público del evento.
-- recomendaciones: sugerencias del líder (clima, ritmo, etc.)
-- que_llevar:      lista en texto libre con cosas a llevar (1 por línea)
-- ============================================================

alter table public.events
  add column if not exists recomendaciones  text,
  add column if not exists que_llevar       text;
