import type { EstadoEvento, EventItem } from '../types';

/**
 * Estado mostrado al usuario (derivado). 'borrador' nunca llega al
 * público, así que el estado visible siempre es uno de estos tres.
 */
export type DisplayEstado = Exclude<EstadoEvento, 'borrador'>;

/** YYYY-MM-DD de hoy en hora local. */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** true si la fecha (YYYY-MM-DD) es estrictamente anterior a hoy. */
export function isPast(fecha: string): boolean {
  if (!fecha) return false;
  return fecha < todayISO();
}

/**
 * Estado efectivo para mostrar en cronograma y poster:
 * - 'cancelado' manda siempre.
 * - 'publicado' cuya fecha ya pasó se muestra como 'realizado'
 *   (espejo de complete_past_events / pg_cron — correcto al instante,
 *   aunque el job aún no haya corrido en la base).
 */
export function displayEstado(ev: Pick<EventItem, 'estado' | 'fecha'>): DisplayEstado {
  if (ev.estado === 'cancelado') return 'cancelado';
  if (ev.estado === 'realizado') return 'realizado';
  if (ev.estado === 'publicado' && isPast(ev.fecha)) return 'realizado';
  return 'publicado';
}

export const ESTADO_LABEL: Record<DisplayEstado, string> = {
  publicado: 'Programado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
};
