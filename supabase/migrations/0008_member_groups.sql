-- ============================================================
-- Plantilla oficial: agrupa miembros del comité en sub-grupos
-- y le da a cada uno un cargo + dorsal (num) para Nosotros.
--
-- grupo: 'lideres' | 'disciplina' | 'ruta' | 'contenido' | null
-- cargo: texto libre — Presidente, Capitán de ruta, Fotógrafa, etc.
-- num:   dorsal del piloto (entero único)
-- desde: año de ingreso al club
-- ============================================================

alter table public.members
  add column if not exists grupo  text,
  add column if not exists cargo  text,
  add column if not exists num    int,
  add column if not exists desde  int;

create index if not exists members_grupo_idx on public.members(grupo) where grupo is not null;
create unique index if not exists members_num_uidx on public.members(num) where num is not null;
