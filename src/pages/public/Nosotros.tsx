import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { supabase } from '../../lib/supabase';
import { ROL_LABELS, type Member } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { ROUTES } from '../../lib/constants';

export function NosotrosPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('members')
        .select('id, nombre, apellido, alias, rol, ciudad, moto_marca, moto_modelo')
        .eq('estado', 'activo')
        .order('created_at', { ascending: true })
        .limit(60);
      if (!active) return;
      if (e) {
        setError(e.message);
        setMembers([]);
      } else {
        setMembers((data ?? []) as Member[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicLayout>
      <Hero
        kicker="Quiénes somos"
        title={
          <>
            El club <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>en personas</span>.
          </>
        }
        subtitle="Pilotos del Caribe colombiano, de cualquier marca y modelo, que comparten dos cosas: respeto en la vía y ganas de rodar bien."
      />

      <section style={{ padding: '48px 32px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
        {error ? (
          <ErrorBox message={error} />
        ) : members === null ? (
          <Loading />
        ) : members.length === 0 ? (
          <EmptyState
            title="Aún no hay miembros aprobados"
            body="Sé el primero — el comité revisa cada solicitud manualmente."
            cta={{ label: 'Solicita tu ingreso', href: ROUTES.unete }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--borde)',
            }}
          >
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  borderRight: '1px solid var(--borde)',
                  borderBottom: '1px solid var(--borde)',
                  padding: '20px 18px',
                  background: 'var(--dark-1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: 'var(--rojo)',
                    color: 'var(--blanco)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'var(--font-cond)',
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {(m.alias || `${m.nombre[0] ?? ''}${m.apellido[0] ?? ''}`).slice(0, 2).toUpperCase()}
                </div>
                <div className="t-display" style={{ fontSize: 22, color: 'var(--blanco)' }}>
                  {m.nombre} {m.apellido}
                </div>
                <div className="t-cond-up" style={{ fontSize: 10, color: 'var(--rojo)' }}>
                  {ROL_LABELS[m.rol]}
                </div>
                <div style={{ color: 'var(--light)', fontSize: 13 }}>
                  {m.ciudad} · {m.moto_marca} {m.moto_modelo}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 36,
            padding: 28,
            border: '1px solid var(--borde)',
            background: 'var(--dark-1)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div className="kicker">· Sumate</div>
            <h3 className="t-display" style={{ fontSize: 28, color: 'var(--blanco)', margin: '6px 0 0' }}>
              ¿Quieres aparecer aquí?
            </h3>
          </div>
          <Link
            to={ROUTES.unete}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              padding: '12px 18px',
              textDecoration: 'none',
              clipPath: 'var(--clip-btn)',
            }}
          >
            Solicita tu ingreso →
          </Link>
        </div>
      </section>
    </PublicLayout>
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
      Cargando miembros…
    </div>
  );
}
