-- ============================================================
-- 0010 — Auto-completar eventos pasados.
--
-- Regla: si la fecha del evento ya pasó y NO fue cancelado, se marca
-- como 'realizado' (completado). Solo afecta eventos en estado
-- 'publicado'; un 'borrador' pasado NO debe volverse 'realizado'
-- (lo haría visible al público sin haber sido publicado).
--
-- Mecanismo robusto (opción "ambos"):
--   1. Función complete_past_events() — idempotente.
--   2. Se ejecuta una vez al aplicar la migración.
--   3. Se programa diariamente con pg_cron si la extensión está
--      disponible en el proyecto.
--   La app además deriva el estado en lectura (lib/eventStatus.ts),
--   así que el cronograma se ve correcto al instante aunque pg_cron
--   no esté habilitado.
-- ============================================================

create or replace function public.complete_past_events()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.events
     set estado = 'realizado'
   where estado = 'publicado'
     and fecha < current_date;
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function public.complete_past_events() is
  'Marca como realizado los eventos publicados cuya fecha ya pasó. Idempotente. No toca borradores ni cancelados.';

-- Ejecutar una vez ahora (al aplicar la migración).
select public.complete_past_events();

-- Programar diariamente con pg_cron, de forma defensiva: si la
-- extensión no está disponible/permitida, la migración no falla.
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron no se pudo habilitar (%). Se omite la programación; la app deriva el estado en lectura.', sqlerrm;
    return;
  end;

  -- Re-programar de forma idempotente.
  if exists (select 1 from cron.job where jobname = 'complete-past-events') then
    perform cron.unschedule('complete-past-events');
  end if;

  -- 06:10 UTC todos los días (~01:10 hora Colombia, UTC-5).
  perform cron.schedule(
    'complete-past-events',
    '10 6 * * *',
    'select public.complete_past_events();'
  );
exception when others then
  raise notice 'No se pudo programar el job pg_cron (%). La app deriva el estado en lectura.', sqlerrm;
end;
$$;
