-- ============================================================
-- Campos adicionales en members para datos de salud, trabajo y bio.
-- Necesarios para importar el CSV histórico del club.
-- Todos nullable porque no todos los registros tienen toda la info.
-- ============================================================

alter table public.members
  add column if not exists direccion        text,
  add column if not exists eps              text,
  add column if not exists grupo_sanguineo  text,
  add column if not exists lugar_trabajo    text,
  add column if not exists contacto_trabajo text,
  add column if not exists bio              text,
  add column if not exists moto_soat        date;

create index if not exists members_eps_idx
  on public.members(eps)
  where eps is not null;

create index if not exists members_grupo_sang_idx
  on public.members(grupo_sanguineo)
  where grupo_sanguineo is not null;
