-- ============================================================
-- Row Level Security — Club Raider Atlántico (hito 1)
-- ============================================================

-- helpers --------------------------------------------------------------
create or replace function public.is_admin(uid uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.members m
    where m.auth_user_id = uid
      and m.rol in ('ADMINISTRADOR','LIDER')
      and m.estado = 'activo'
  );
$$;

create or replace function public.is_editor(uid uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.members m
    where m.auth_user_id = uid
      and m.rol in ('ADMINISTRADOR','LIDER','EDITOR')
      and m.estado = 'activo'
  );
$$;

-- members --------------------------------------------------------------
alter table public.members enable row level security;

drop policy if exists members_select_public on public.members;
create policy members_select_public on public.members
  for select using (estado = 'activo');

drop policy if exists members_all_admin on public.members;
create policy members_all_admin on public.members
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists members_update_self on public.members;
create policy members_update_self on public.members
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- solicitudes ----------------------------------------------------------
alter table public.solicitudes enable row level security;

drop policy if exists solicitudes_insert_public on public.solicitudes;
create policy solicitudes_insert_public on public.solicitudes
  for insert with check (true);

drop policy if exists solicitudes_all_admin on public.solicitudes;
create policy solicitudes_all_admin on public.solicitudes
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- events ---------------------------------------------------------------
alter table public.events enable row level security;

drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events
  for select using (estado in ('publicado','realizado'));

drop policy if exists events_all_editor on public.events;
create policy events_all_editor on public.events
  for all using (public.is_editor(auth.uid()))
  with check (public.is_editor(auth.uid()));

-- news -----------------------------------------------------------------
alter table public.news enable row level security;

drop policy if exists news_select_public on public.news;
create policy news_select_public on public.news
  for select using (estado = 'publicado');

drop policy if exists news_all_editor on public.news;
create policy news_all_editor on public.news
  for all using (public.is_editor(auth.uid()))
  with check (public.is_editor(auth.uid()));

-- gallery --------------------------------------------------------------
alter table public.gallery enable row level security;

drop policy if exists gallery_select_public on public.gallery;
create policy gallery_select_public on public.gallery
  for select using (true);

drop policy if exists gallery_all_editor on public.gallery;
create policy gallery_all_editor on public.gallery
  for all using (public.is_editor(auth.uid()))
  with check (public.is_editor(auth.uid()));

-- settings -------------------------------------------------------------
alter table public.settings enable row level security;

drop policy if exists settings_select_public on public.settings;
create policy settings_select_public on public.settings
  for select using (true);

drop policy if exists settings_all_admin on public.settings;
create policy settings_all_admin on public.settings
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- activity_log ---------------------------------------------------------
alter table public.activity_log enable row level security;

drop policy if exists activity_select_admin on public.activity_log;
create policy activity_select_admin on public.activity_log
  for select using (public.is_admin(auth.uid()));

drop policy if exists activity_insert_admin on public.activity_log;
create policy activity_insert_admin on public.activity_log
  for insert with check (public.is_editor(auth.uid()));
