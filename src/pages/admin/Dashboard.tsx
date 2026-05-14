import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';

interface Kpis {
  miembros: number;
  pendientes: number;
  eventosActivos: number;
  rodadasMes: number;
}

const ZERO_KPIS: Kpis = { miembros: 0, pendientes: 0, eventosActivos: 0, rodadasMes: 0 };

export function DashboardPage() {
  const [kpis, setKpis] = useState<Kpis>(ZERO_KPIS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ count: m }, { count: p }, { count: e }] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
          supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('estado', 'publicado'),
        ]);
        if (!active) return;
        setKpis({
          miembros: m ?? 0,
          pendientes: p ?? 0,
          eventosActivos: e ?? 0,
          rodadasMes: 0,
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const totalActividad = kpis.miembros + kpis.pendientes + kpis.eventosActivos;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <div className="kicker">· Panel administrativo</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            margin: '4px 0 0 0',
            letterSpacing: '0.01em',
          }}
        >
          Dashboard.
        </h1>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <Kpi label="Miembros activos" value={loading ? '—' : kpis.miembros} />
        <Kpi label="Solicitudes pendientes" value={loading ? '—' : kpis.pendientes} />
        <Kpi label="Eventos publicados" value={loading ? '—' : kpis.eventosActivos} />
        <Kpi label="Rodadas este mes" value={loading ? '—' : kpis.rodadasMes} />
      </div>

      {error ? (
        <ErrorBox message={error} />
      ) : !loading && totalActividad === 0 ? (
        <EmptyState
          title={EMPTY_TEXTS.dashboardKpis.title}
          body={EMPTY_TEXTS.dashboardKpis.body}
          cta={{ label: 'Ver miembros', href: '/admin/miembros' }}
        />
      ) : null}
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--light)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 44,
          lineHeight: 1,
          color: 'var(--blanco)',
        }}
      >
        {value}
      </span>
    </div>
  );
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
