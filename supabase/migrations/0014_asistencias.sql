-- ============================================================
-- 0014 — Registro de asistencia por QR
-- Cada piloto tiene un QR (en el portal) que codifica su cédula. En una
-- actividad, Admin/Líder/Disciplina escanean el QR y se registra la asistencia.
-- ============================================================

create table if not exists public.asistencias (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  member_id      uuid references public.members(id) on delete cascade,
  event_id       uuid references public.events(id) on delete set null,
  fecha          date not null,
  hora           text,
  codigo         text,                          -- cédula escaneada (traza)
  origen         text not null default 'qr',    -- 'qr' | 'import' | 'manual'
  registrado_por uuid references public.members(id) on delete set null
);

-- Una asistencia por miembro por día (evita duplicados en escaneo e importación).
create unique index if not exists asistencias_member_fecha_uidx
  on public.asistencias (member_id, fecha);
create index if not exists asistencias_fecha_idx on public.asistencias (fecha);
create index if not exists asistencias_event_idx on public.asistencias (event_id);

-- Helper: quién puede registrar asistencia = Admin/Líder (rol) o grupo Disciplina.
create or replace function public.puede_asistencia(uid uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.members m
    where m.auth_user_id = uid
      and m.estado = 'activo'
      and (m.rol in ('ADMINISTRADOR', 'LIDER') or m.grupo = 'disciplina')
  );
$$;

-- RLS
alter table public.asistencias enable row level security;

-- Ven el reporte los roles con panel (admin/líder/editor); cada miembro ve lo suyo.
drop policy if exists asistencias_select on public.asistencias;
create policy asistencias_select on public.asistencias
  for select using (
    public.is_editor(auth.uid())
    or member_id in (select id from public.members where auth_user_id = auth.uid())
  );

drop policy if exists asistencias_insert on public.asistencias;
create policy asistencias_insert on public.asistencias
  for insert with check (public.puede_asistencia(auth.uid()));

drop policy if exists asistencias_update on public.asistencias;
create policy asistencias_update on public.asistencias
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists asistencias_delete on public.asistencias;
create policy asistencias_delete on public.asistencias
  for delete using (public.is_admin(auth.uid()));
