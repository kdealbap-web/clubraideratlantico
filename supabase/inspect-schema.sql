-- ============================================================
-- Snapshot completo del schema actual de Supabase.
-- Corre este bloque en SQL Editor → New query → Run.
-- Copia el JSON resultante y mándamelo entero.
-- Read-only — no modifica nada.
-- ============================================================

select jsonb_pretty(jsonb_build_object(

  -- 1. Tablas + columnas
  'tables', (
    select jsonb_agg(jsonb_build_object(
      'name',    t.table_name,
      'columns', (
        select jsonb_agg(jsonb_build_object(
          'col',       c.column_name,
          'type',      c.data_type,
          'udt',       c.udt_name,
          'nullable',  c.is_nullable,
          'default',   c.column_default,
          'max_len',   c.character_maximum_length
        ) order by c.ordinal_position)
        from information_schema.columns c
        where c.table_schema = t.table_schema
          and c.table_name   = t.table_name
      )
    ) order by t.table_name)
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_type  = 'BASE TABLE'
  ),

  -- 2. Enums
  'enums', (
    select jsonb_agg(jsonb_build_object(
      'name',   typname,
      'values', vals
    ) order by typname)
    from (
      select t.typname, array_agg(e.enumlabel order by e.enumsortorder) as vals
      from pg_type t
      join pg_enum e         on e.enumtypid = t.oid
      join pg_namespace n    on t.typnamespace = n.oid
      where n.nspname = 'public'
      group by t.typname
    ) e
  ),

  -- 3. Constraints (PK, FK, UNIQUE, CHECK)
  'constraints', (
    select jsonb_agg(jsonb_build_object(
      'table',      tc.table_name,
      'name',       tc.constraint_name,
      'type',       tc.constraint_type,
      'definition', pg_get_constraintdef(c.oid)
    ) order by tc.table_name, tc.constraint_name)
    from information_schema.table_constraints tc
    join pg_constraint c       on c.conname = tc.constraint_name
    join pg_namespace n        on n.oid = c.connamespace and n.nspname = tc.constraint_schema
    where tc.table_schema = 'public'
  ),

  -- 4. Índices
  'indexes', (
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'name',  indexname,
      'def',   indexdef
    ) order by tablename, indexname)
    from pg_indexes
    where schemaname = 'public'
  ),

  -- 5. RLS habilitado por tabla
  'rls_enabled', (
    select jsonb_object_agg(relname, relrowsecurity)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  ),

  -- 6. Policies
  'policies', (
    select jsonb_agg(jsonb_build_object(
      'table',  tablename,
      'name',   policyname,
      'cmd',    cmd,
      'roles',  roles,
      'using',  qual,
      'check',  with_check
    ) order by tablename, policyname)
    from pg_policies
    where schemaname = 'public'
  ),

  -- 7. Funciones
  'functions', (
    select jsonb_agg(jsonb_build_object(
      'name',       p.proname,
      'returns',    pg_get_function_result(p.oid),
      'arguments',  pg_get_function_arguments(p.oid),
      'language',   l.lanname,
      'security',   case when p.prosecdef then 'definer' else 'invoker' end
    ) order by p.proname)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_language  l on l.oid = p.prolang
    where n.nspname = 'public'
  ),

  -- 8. Triggers
  'triggers', (
    select jsonb_agg(jsonb_build_object(
      'table',  event_object_table,
      'name',   trigger_name,
      'event',  event_manipulation,
      'timing', action_timing,
      'action', action_statement
    ) order by event_object_table, trigger_name)
    from information_schema.triggers
    where trigger_schema = 'public'
  ),

  -- 9. Buckets de Storage
  'storage_buckets', (
    select jsonb_agg(jsonb_build_object(
      'name',             name,
      'public',           public,
      'file_size_limit',  file_size_limit,
      'allowed_mime',     allowed_mime_types
    ) order by name)
    from storage.buckets
  ),

  -- 10. Conteos de filas
  'row_counts', (
    select jsonb_object_agg(table_name, n_live_tup)
    from pg_stat_user_tables
    where schemaname = 'public'
  ),

  -- 11. Conteo de usuarios auth (sin exponer datos)
  'auth_users_count', (select count(*) from auth.users),

  -- 12. Versión Postgres + extensiones instaladas
  'postgres_version', current_setting('server_version'),
  'extensions', (
    select jsonb_agg(jsonb_build_object('name', extname, 'version', extversion) order by extname)
    from pg_extension
  )

)) as schema_snapshot;
