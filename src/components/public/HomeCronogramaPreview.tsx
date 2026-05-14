import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/constants';
import { MESES } from '../cronograma/CronogramaPoster';
import { IconCalendar, IconChevronRight } from '../icons';
import type { EventItem } from '../../types';

const DIAS_LARGO = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'] as const;

export function HomeCronogramaPreview() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const monthLabel = MESES[month - 1] ?? '';

  useEffect(() => {
    let active = true;
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, titulo, fecha, hora, salida, cupos, inscritos, tipo, dificultad, estado')
        .gte('fecha', start)
        .lte('fecha', end)
        .eq('estado', 'publicado')
        .order('fecha', { ascending: true })
        .limit(3);
      if (!active) return;
      setEvents((data as EventItem[]) ?? []);
    })();
    return () => {
      active = false;
    };
  }, [month, year]);

  // No mostrar nada si no hay eventos del mes
  if (events === null) return null;
  if (events.length === 0) return null;

  return (
    <section
      style={{
        padding: '64px 32px',
        background: 'linear-gradient(180deg, var(--negro) 0%, var(--dark-1) 100%)',
        borderTop: '1px solid var(--borde)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            'linear-gradient(90deg, transparent, var(--rojo) 50%, transparent)',
        }}
      />

      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="kicker">· Cronograma · {monthLabel.toLowerCase()} {year}</div>
            <h2
              className="t-display"
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                color: 'var(--blanco)',
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              Próximas <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>rodadas</span>.
            </h2>
            <p style={{ color: 'var(--light)', fontSize: 14, lineHeight: 1.6, margin: '6px 0 0', maxWidth: 540 }}>
              Los eventos publicados para este mes. Click en cualquiera para ver el detalle e
              inscripciones.
            </p>
          </div>
          <Link
            to={ROUTES.cronograma}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'transparent',
              border: '1px solid var(--borde-strong)',
              padding: '12px 18px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            Ver cronograma completo <IconChevronRight size={14} />
          </Link>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {events.map((ev) => (
            <PreviewCard key={ev.id} ev={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ ev }: { ev: EventItem }) {
  const d = new Date(ev.fecha);
  const dia = Number.isNaN(d.getTime()) ? '—' : String(d.getUTCDate()).padStart(2, '0');
  const dow = Number.isNaN(d.getTime()) ? '' : DIAS_LARGO[d.getUTCDay()] ?? '';

  return (
    <Link
      to={ROUTES.cronograma}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '20px 22px',
        background: 'var(--dark-2)',
        border: '1px solid var(--borde)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            background: 'var(--rojo)',
            color: 'var(--blanco)',
            borderRadius: 999,
            padding: '10px 18px',
            textAlign: 'center',
            fontFamily: 'var(--font-cond)',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            minWidth: 90,
            boxShadow: '0 4px 12px rgba(204,34,34,0.3)',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.2em' }}>{dow}</div>
          <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{dia}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              letterSpacing: '0.16em',
              color: 'var(--rojo)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {ev.tipo} · {ev.dificultad}
          </div>
          <div
            className="t-display"
            style={{ fontSize: 18, color: 'var(--blanco)', lineHeight: 1.1 }}
          >
            {ev.titulo}
          </div>
        </div>
      </div>
      <div
        style={{
          paddingTop: 12,
          borderTop: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12.5,
          color: 'var(--light)',
        }}
      >
        <IconCalendar size={14} style={{ color: 'var(--rojo)', flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ev.salida}
          {ev.hora ? ` · ${ev.hora}` : ''}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.06em',
            color: 'var(--muted)',
            flexShrink: 0,
          }}
        >
          {ev.inscritos}/{ev.cupos}
        </span>
      </div>
    </Link>
  );
}
