-- ============================================================
-- 0009 — El cronograma público puede mostrar eventos cancelados.
--
-- Antes la RLS pública de events solo permitía leer 'publicado' y
-- 'realizado'. Para que el cronograma (/cronograma) y el poster
-- exportable puedan mostrar un evento CANCELADO tachado / marcado,
-- el público debe poder leerlo. 'borrador' sigue oculto al público.
--
-- Nota: cada query del front filtra por estado, así que los eventos
-- cancelados solo aparecen donde se piden explícitamente (cronograma
-- y poster), no en /eventos ni en "próximas rodadas" del home.
-- ============================================================

drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events
  for select using (estado in ('publicado', 'realizado', 'cancelado'));
