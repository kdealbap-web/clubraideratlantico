import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import type { News } from '../../types';

export function NoticiasPage() {
  const [items, setItems] = useState<News[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('news')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha', { ascending: false });
      if (!active) return;
      if (e) {
        setError(e.message);
        setItems([]);
      } else {
        setItems((data ?? []) as News[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicLayout>
      <Hero
        kicker="Comunicados"
        title={
          <>
            Lo último del <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>club</span>.
          </>
        }
        subtitle="Convocatorias, cambios de reglamento, alianzas y crónicas de rodada."
      />

      <section style={{ padding: '48px 32px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
        {error ? (
          <ErrorBox message={error} />
        ) : items === null ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState title={EMPTY_TEXTS.news.title} body={EMPTY_TEXTS.news.body} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {items.map((n) => (
              <article
                key={n.id}
                style={{
                  background: 'var(--dark-1)',
                  border: '1px solid var(--borde)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--rojo)' }}>
                  {fmtDate(n.fecha)} · {n.autor}
                </div>
                <h2
                  className="t-display"
                  style={{ fontSize: 28, color: 'var(--blanco)', margin: 0, lineHeight: 1 }}
                >
                  {n.titulo}
                </h2>
                <p style={{ color: 'var(--light)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {n.resumen}
                </p>
                {n.tags && n.tags.length ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {n.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: 'var(--font-cond)',
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--light)',
                          border: '1px solid var(--borde)',
                          padding: '3px 8px',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
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
      Cargando noticias…
    </div>
  );
}
