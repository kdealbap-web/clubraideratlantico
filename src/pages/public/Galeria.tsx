import { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import type { GalleryItem } from '../../types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconDownload,
  IconImage,
} from '../../components/icons';

export function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('todas');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('gallery')
        .select('*')
        .order('fav', { ascending: false })
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

  const categories = useMemo(() => {
    if (!items) return ['todas'];
    const set = new Set(items.map((i) => i.cat).filter(Boolean));
    return ['todas', ...Array.from(set).sort()];
  }, [items]);

  const featured = useMemo(() => {
    if (!items) return [];
    const favs = items.filter((i) => i.fav);
    return (favs.length > 0 ? favs : items).slice(0, 6);
  }, [items]);

  const topThree = useMemo(() => {
    if (!items) return [];
    const favs = items.filter((i) => i.fav);
    return (favs.length >= 3 ? favs : items).slice(0, 3);
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return null;
    return category === 'todas' ? items : items.filter((i) => i.cat === category);
  }, [items, category]);

  const hasItems = items && items.length > 0;

  return (
    <PublicLayout>
      {/* Hero cinematográfico */}
      {hasItems && featured.length > 0 ? (
        <GalleryHero items={featured} />
      ) : (
        <PlainHero />
      )}

      <section
        style={{
          padding: '40px 24px 80px',
          maxWidth: 1440,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {error ? (
          <ErrorBox message={error} />
        ) : items === null ? (
          <Loading />
        ) : !hasItems ? (
          <EmptyState
            icon={<IconImage size={24} />}
            title={EMPTY_TEXTS.gallery.title}
            body={EMPTY_TEXTS.gallery.body}
          />
        ) : (
          <>
            {/* Filtros */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 24,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '10px 18px',
                    background: category === c ? 'var(--rojo)' : 'transparent',
                    color: category === c ? 'var(--blanco)' : 'var(--light)',
                    border: '1px solid var(--borde)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    transition: 'background .2s, color .2s, border-color .2s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Lo más visto este mes — solo en "todas" */}
            {category === 'todas' && topThree.length > 0 ? (
              <section style={{ marginBottom: 40 }}>
                <header style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: 'var(--rojo)',
                      borderRadius: '50%',
                      boxShadow: '0 0 0 4px rgba(204,34,34,0.18)',
                    }}
                  />
                  <span className="kicker">· Lo más visto este mes</span>
                </header>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: topThree.length === 3 ? '2fr 1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 10,
                    height: 'clamp(280px, 35vw, 420px)',
                  }}
                  className="gallery-top-grid"
                >
                  {topThree.map((g, i) => (
                    <FeatureCard
                      key={g.id}
                      g={g}
                      rank={i + 1}
                      large={i === 0}
                      onClick={() => {
                        const idx = items?.findIndex((it) => it.id === g.id) ?? 0;
                        setLightboxIdx(idx);
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Header con contador */}
            <header style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }}>
              <h2
                className="t-display"
                style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  color: 'var(--blanco)',
                  margin: 0,
                }}
              >
                {category === 'todas' ? 'Todos los recuerdos' : category}
              </h2>
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 14,
                  letterSpacing: '0.14em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                {filtered?.length ?? 0} {filtered?.length === 1 ? 'foto' : 'fotos'}
              </span>
            </header>

            {/* Masonry */}
            {filtered && filtered.length > 0 ? (
              <div
                style={{
                  columnCount: 4,
                  columnGap: 8,
                }}
                className="gallery-masonry"
              >
                {filtered.map((g, i) => (
                  <GalleryCard
                    key={g.id}
                    item={g}
                    onClick={() => setLightboxIdx(i)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`Sin fotos en ${category}`}
                body="Selecciona otra categoría arriba o vuelve a 'Todas'."
              />
            )}
          </>
        )}
      </section>

      {filtered && lightboxIdx !== null ? (
        <Lightbox
          items={filtered}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onIndexChange={setLightboxIdx}
        />
      ) : null}

      <style>{`
        @media (max-width: 1100px) { .gallery-masonry { column-count: 3 !important; } }
        @media (max-width: 760px)  { .gallery-masonry { column-count: 2 !important; } }
        @media (max-width: 480px)  { .gallery-masonry { column-count: 1 !important; } }
        @media (max-width: 700px)  { .gallery-top-grid { grid-template-columns: 1fr !important; height: auto !important; } .gallery-top-grid > * { aspect-ratio: 16/10; } }
      `}</style>
    </PublicLayout>
  );
}

// ─── Feature card del "Lo más visto" ─────────────────────────────────────
function FeatureCard({
  g,
  rank,
  large,
  onClick,
}: {
  g: GalleryItem;
  rank: number;
  large?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        background: `url('${g.url}') center/cover`,
        border: '1px solid var(--borde)',
        transition: 'transform .35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.012)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, transparent 50%, rgba(10,10,10,0.92))',
        }}
      />
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background: 'rgba(10,10,10,0.7)',
            color: 'var(--blanco)',
            padding: '4px 9px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontWeight: 700,
          }}
        >
          ★ Top {rank}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--rojo)',
            fontWeight: 600,
          }}
        >
          {g.cat}
        </div>
        <div
          className="t-display"
          style={{
            fontSize: large ? 26 : 18,
            color: 'var(--blanco)',
            lineHeight: 1.1,
            textShadow: '0 2px 8px rgba(0,0,0,0.85)',
          }}
        >
          {g.label}
        </div>
      </div>
    </div>
  );
}

// ─── Hero cinematográfico ────────────────────────────────────────────────
function GalleryHero({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 5500);
    return () => clearInterval(t);
  }, [items.length, paused]);

  const current = items[active];

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        height: 'clamp(420px, 65vh, 720px)',
        overflow: 'hidden',
        background: 'var(--negro)',
        borderBottom: '1px solid var(--borde)',
      }}
    >
      {/* Capas de imagen con crossfade */}
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`gallery-hero-slide ${i === active ? 'is-active' : ''}`}
          style={{
            backgroundImage: `url('${item.url}')`,
          }}
          aria-hidden={i !== active}
        />
      ))}

      {/* Overlay gradiente para legibilidad */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Caption */}
      {current ? (
        <div
          key={current.id}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'clamp(28px, 6vw, 64px) clamp(24px, 5vw, 64px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            animation: 'fade-in-up 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.28em',
              color: 'var(--rojo)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            · {current.cat || 'Galería'}
          </div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(40px, 8vw, 96px)',
              lineHeight: 0.95,
              margin: 0,
              color: 'var(--blanco)',
              maxWidth: 1100,
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {current.label}
          </h1>
        </div>
      ) : null}

      {/* Dots indicador */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(20px, 4vw, 40px)',
          right: 'clamp(20px, 4vw, 40px)',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver foto ${i + 1} de ${items.length}`}
            style={{
              width: i === active ? 24 : 8,
              height: 4,
              background: i === active ? 'var(--blanco)' : 'rgba(255,255,255,0.45)',
              border: 'none',
              cursor: 'pointer',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Pill de categoría top-left */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(20px, 4vw, 40px)',
          left: 'clamp(20px, 4vw, 40px)',
          padding: '8px 14px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          fontFamily: 'var(--font-cond)',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--blanco)',
        }}
      >
        Archivo visual del club
      </div>
    </section>
  );
}

function PlainHero() {
  return (
    <section
      style={{
        padding: '88px 32px 56px',
        borderBottom: '1px solid var(--borde)',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>
          · Archivo visual
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(56px, 11vw, 156px)', lineHeight: 0.92, margin: 0, color: 'var(--blanco)' }}
        >
          Cada rodada, <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>cada foto</span>.
        </h1>
      </div>
    </section>
  );
}

// ─── Card del grid masonry ───────────────────────────────────────────────
function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  return (
    <div className="gallery-card" onClick={onClick} role="button" tabIndex={0}>
      <img src={item.url} alt={item.label} loading="lazy" />
      <div className="gallery-card-overlay">
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--rojo)',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {item.cat}
        </div>
        <div
          className="t-display"
          style={{
            fontSize: 16,
            color: 'var(--blanco)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {item.label}
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox con crossfade ──────────────────────────────────────────────
function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const current = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, items.length, onClose, onIndexChange]);

  if (!current) return null;

  const prev = () => onIndexChange((index - 1 + items.length) % items.length);
  const next = () => onIndexChange((index + 1) % items.length);

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      {/* Header */}
      <header
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 28px',
          color: 'var(--blanco)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--rojo)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {current.cat}
          </span>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{current.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.18em',
              color: 'var(--light)',
            }}
          >
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            title="Descargar / ver original"
            style={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'var(--blanco)',
              textDecoration: 'none',
            }}
          >
            <IconDownload size={14} />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 38,
              height: 38,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'var(--blanco)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconClose size={14} />
          </button>
        </div>
      </header>

      {/* Stage con crossfade entre imágenes */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`lightbox-image-slide ${i === index ? 'is-active' : ''}`}
          >
            <img src={item.url} alt={item.label} />
          </div>
        ))}

        {/* Nav buttons */}
        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              style={navBtnStyle('left')}
            >
              <IconChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              style={navBtnStyle('right')}
            >
              <IconChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>

      {/* Footer thumbnails */}
      {items.length > 1 ? (
        <footer
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '14px 20px 22px',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', minWidth: 'min-content' }}>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Ir a foto ${i + 1}`}
                style={{
                  width: 64,
                  height: 44,
                  flexShrink: 0,
                  border: i === index ? '2px solid var(--rojo)' : '2px solid transparent',
                  background: `url('${item.url}') center/cover`,
                  cursor: 'pointer',
                  opacity: i === index ? 1 : 0.55,
                  transition: 'opacity .25s, border-color .25s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    [side]: 18,
    transform: 'translateY(-50%)',
    width: 48,
    height: 48,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'var(--blanco)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    transition: 'background .2s, transform .2s',
    backdropFilter: 'blur(10px)',
  };
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
