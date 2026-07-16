-- ============================================================
-- 0016 — Inscripciones de miembros a rodadas/eventos
-- Cada miembro (general o piloto) se inscribe a una rodada desde el portal.
-- ============================================================

create table if not exists public.inscripciones (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  member_id  uuid not null references public.members(id) on delete cascade,
  event_id   uuid not null references public.events(id) on delete cascade
);

-- Un miembro no puede inscribirse dos veces al mismo evento.
create unique index if not exists inscripciones_member_event_uidx
  on public.inscripciones (member_id, event_id);
create index if not exists inscripciones_event_idx on public.inscripciones (event_id);

alter table public.inscripciones enable row level security;

-- Ver: el propio miembro ve las suyas; editores/admin ven todas (para conteos).
drop policy if exists inscripciones_select on public.inscripciones;
create policy inscripciones_select on public.inscripciones
  for select using (
    public.is_editor(auth.uid())
    or member_id in (select id from public.members where auth_user_id = auth.uid())
  );

-- Inscribirse: solo a nombre propio.
drop policy if exists inscripciones_insert on public.inscripciones;
create policy inscripciones_insert on public.inscripciones
  for insert with check (
    member_id in (select id from public.members where auth_user_id = auth.uid())
  );

-- Cancelar: el propio miembro o un admin.
drop policy if exists inscripciones_delete on public.inscripciones;
create policy inscripciones_delete on public.inscripciones
  for delete using (
    public.is_admin(auth.uid())
    or member_id in (select id from public.members where auth_user_id = auth.uid())
  );
