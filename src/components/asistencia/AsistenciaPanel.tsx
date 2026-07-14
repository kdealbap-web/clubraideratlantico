import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AsistenciaScanner } from './AsistenciaScanner';
import type { EventItem } from '../../types';

/** Fecha local del dispositivo en YYYY-MM-DD (no UTC: los escaneos son de noche). */
export function localDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface Props {
  registradoPor: string | null;
  onRegistered?: () => void;
}

export function AsistenciaPanel({ registradoPor, onRegistered }: Props) {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('estado', ['publicado', 'realizado'])
        .order('fecha', { ascending: false })
        .limit(80);
      if (!active) return;
      const list = (data ?? []) as EventItem[];
      setEvents(list);
      const hoy = list.find((e) => e.fecha === localDateStr());
      if (hoy) setSelectedId(hoy.id);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => events?.find((e) => e.id === selectedId) ?? null,
    [events, selectedId],
  );

  const today = localDateStr();
  const isToday = selected?.fecha === today;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--light)',
          }}
        >
          Actividad / evento
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{
            height: 40,
            background: 'var(--dark-2)',
            color: 'var(--blanco)',
            border: '1px solid var(--borde)',
            padding: '0 12px',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            outline: 'none',
          }}
        >
          <option value="">— Selecciona un evento —</option>
          {(events ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.fecha} · {e.titulo}
            </option>
          ))}
        </select>
      </div>

      {!selected ? (
        <Aviso>Selecciona el evento para registrar asistencia.</Aviso>
      ) : isToday ? (
        <AsistenciaScanner
          event={selected}
          registradoPor={registradoPor}
          onRegistered={onRegistered}
        />
      ) : (
        <Aviso>
          El escáner solo se habilita el <strong>día de la actividad</strong> ({selected.fecha}). Hoy
          es {today}.
        </Aviso>
      )}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px dashed var(--borde-strong)',
        background: 'var(--dark-2)',
        color: 'var(--light)',
        padding: '16px 18px',
        fontSize: 13.5,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
