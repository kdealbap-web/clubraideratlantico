import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import type { EventItem } from '../../types';

export function EventosPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .in('estado', ['publicado', 'realizado'])
        .order('fecha', { ascending: false });
      if (!active) return;
      if (e) {
        setError(e.message);
        setEvents([]);
      } else {
        setEvents((data ?? []) as EventItem[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicLayout>
      <Hero
        kicker="Calendario público"
        title={
          <>
            Rodadas y <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>eventos</span>.
          </>
        }
        subtitle="Todo el club arranca con briefing. Aquí publicamos cupos, dificultad, kilómetros y punto de salida."
      />

      <section style={{ padding: '48px 32px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
        {error ? (
          <ErrorBox message={error} />
        ) : events === null ? (
          <Loading />
        ) : events.length === 0 ? (
          <EmptyState title={EMPTY_TEXTS.events.title} body={EMPTY_TEXTS.events.body} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.map((e) => (
              <EventRow key={e.id} ev={e} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function EventRow({ ev }: { ev: EventItem }) {
  return (
    <article
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: '20px 22px',
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: 18,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="t-display" style={{ fontSize: 36, color: 'var(--rojo)', lineHeight: 1 }}>
          {formatDay(ev.fecha)}
        </div>
        <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--light)' }}>
          {formatMonth(ev.fecha)} · {ev.hora}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div className="t-display" style={{ fontSize: 24, color: 'var(--blanco)' }}>
          {ev.titulo}
        </div>
        <p style={{ color: 'var(--light)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
          {ev.descripcion}
        </p>
        <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--muted)' }}>
          {ev.salida} · {ev.km > 0 ? `${ev.km} km` : ''} · {ev.dificultad}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--light)' }}>
          {ev.inscritos}/{ev.cupos} cupos
        </div>
        <div
          style={{
            padding: '6px 12px',
            background: ev.estado === 'realizado' ? 'var(--dark-2)' : 'var(--rojo)',
            color: 'var(--blanco)',
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {ev.estado}
        </div>
      </div>
    </article>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : String(d.getUTCDate()).padStart(2, '0');
}

function formatMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        border: '1px solid var(--rojo)',
        background: 'var(--rojo-soft)',
        color: 'var(--rojo-light)',
        padding: '14px 16px',
        fontSize: 13,
      }}
    >
      Supabase: {message}
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        border: '1px dashed var(--borde)',
        padding: 24,
        color: 'var(--muted)',
        fontFamily: 'var(--font-cond)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      Cargando eventos…
    </div>
  );
}
