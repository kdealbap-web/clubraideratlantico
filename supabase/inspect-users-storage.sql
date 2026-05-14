-- ============================================================
-- Inventario read-only ANTES de wipe.
-- Corre los 2 bloques por separado y mándame ambos outputs.
-- ============================================================

-- ============================================================
-- BLOQUE 1 — usuarios en auth.users
-- ============================================================
select
  id,
  email,
  case when email_confirmed_at is not null then 'confirmado' else 'pendiente' end as estado,
  created_at::date as creado,
  last_sign_in_at::date as ultimo_login,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '—') as nombre_meta,
  case when banned_until is not null then 'banneado' else 'activo' end as ban_status
from auth.users
order by created_at asc;

-- ============================================================
-- BLOQUE 2 — objetos en el bucket clubraiderbucket
-- ============================================================
select
  name,
  pg_size_pretty((metadata->>'size')::bigint) as tamano,
  metadata->>'mimetype' as mime,
  created_at::date as subido,
  (metadata->>'lastModified')::timestamptz::date as modificado
from storage.objects
where bucket_id = 'clubraiderbucket'
order by created_at desc
limit 100;
