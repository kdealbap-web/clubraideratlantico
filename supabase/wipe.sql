-- ============================================================
-- WIPE quirúrgico del schema public.
-- Preserva: auth.users (6 cuentas) + storage.objects + bucket clubraiderbucket.
-- Destruye: las 8 tablas + función es_lider_o_admin + rls_auto_enable + set_updated_at
--           + event triggers + policies (caen con las tablas) + secuencias asociadas.
-- ============================================================

begin;

-- 1. Drop event triggers cuyo function vive en public
do $$
declare et record;
begin
  for et in
    select t.evtname
    from pg_event_trigger t
    join pg_proc p      on p.oid = t.evtfoid
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('drop event trigger if exists %I cascade', et.evtname);
  end loop;
end $$;

-- 2. Drop tablas en orden FK-safe (CASCADE limpia índices, secuencias, constraints, policies)
drop table if exists public.contactos_emergencia cascade;
drop table if exists public.motos                 cascade;
drop table if exists public.trabajos              cascade;
drop table if exists public.miembros_club         cascade;
drop table if exists public.cat_ciudades          cascade;
drop table if exists public.cat_eps               cascade;
drop table if exists public.cat_grupos_sanguineos cascade;
drop table if exists public.cat_roles             cascade;

-- 3. Drop funciones
drop function if exists public.es_lider_o_admin() cascade;
drop function if exists public.rls_auto_enable()  cascade;
drop function if exists public.set_updated_at()   cascade;

-- 4. Sanity check
do $$
declare n_tables int;
begin
  select count(*) into n_tables
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE';
  if n_tables <> 0 then
    raise exception 'Wipe falló: aún quedan % tablas en public', n_tables;
  end if;
end $$;

commit;

-- ============================================================
-- Verificación post-wipe:
-- select count(*) from auth.users;          -- esperado: 6
-- select count(*) from storage.buckets;     -- esperado: 1 (clubraiderbucket)
-- select count(*) from information_schema.tables where table_schema='public'; -- esperado: 0
-- ============================================================
