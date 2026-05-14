import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import type { GalleryItem } from '../../types';

export function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (e) {
        setError(e.message);
        setItems([]);
      } else {
        setItems((data ?? []) as GalleryItem[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicLayout>
      <Hero
        kicker="Archivo visual"
        title={
          <>
            Cada rodada, <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>cada foto</span>.
          </>
        }
        subtitle="Cuando bajamos del casco subimos las mejores tomas. Aquí queda el archivo del club."
      />

      <section style={{ padding: '48px 32px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
        {error ? (
          <ErrorBox message={error} />
        ) : items === null ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState title={EMPTY_TEXTS.gallery.title} body={EMPTY_TEXTS.gallery.body} />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 4,
            }}
          >
            {items.map((g) => (
              <a
                key={g.id}
                href={g.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'relative',
                  display: 'block',
                  paddingTop: `${(1 / g.ratio) * 100}%`,
                  background: `linear-gradient(135deg, var(--imgph-1), var(--imgph-3))`,
                  border: '1px solid var(--borde)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={g.url}
                  alt={g.label}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    bottom: 8,
                    padding: '4px 8px',
                    background: 'rgba(0,0,0,0.55)',
                    color: 'var(--blanco)',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {g.label}
                </div>
              </a>
            ))}
          </div>
        )}
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
      Cargando galería…
    </div>
  );
}
