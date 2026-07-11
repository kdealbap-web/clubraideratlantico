import { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { VideoPlayer } from '../../components/media/VideoPlayer';
import type { GalleryItem } from '../../types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconDownload,
  IconFolder,
  IconImage,
  IconPlay,
} from '../../components/icons';

interface Album {
  name: string;
  items: GalleryItem[];
  cover: string;
  count: number;
  videoCount: number;
  lastDate: string;
}

/** Portada de un item: video usa su poster; imagen usa su url. */
function coverUrl(it: GalleryItem | undefined): string {
  if (!it) return '';
  return it.type === 'video' ? it.poster_url ?? '' : it.url;
}

function fmtShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function GaleriaPage() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
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

  const albums = useMemo<Album[] | null>(() => {
    if (!items) return null;
    const map = new Map<string, GalleryItem[]>();
    for (const it of items) {
      const key = (it.album && it.album.trim()) || 'General';
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    const out: Album[] = [];
    for (const [name, arr] of map) {
      const sorted = [...arr].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      const favImg = sorted.find((i) => i.fav && coverUrl(i));
      const firstWithCover = sorted.find((i) => coverUrl(i));
      out.push({
        name,
        items: sorted,
        cover: coverUrl(favImg ?? firstWithCover ?? sorted[0]),
        count: sorted.length,
        videoCount: sorted.filter((i) => i.type === 'video').length,
        lastDate: sorted[0]?.created_at ?? '',
      });
    }
    out.sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1));
    return out;
  }, [items]);

  const featured = useMemo(() => {
    if (!items) return [];
    const withCover = items.filter((i) => coverUrl(i));
    const favs = withCover.filter((i) => i.fav);
    return (favs.length > 0 ? favs : withCover).slice(0, 6);
  }, [items]);

  const activeItems = useMemo(() => {
    if (!activeAlbum || !albums) return null;
    return albums.find((a) => a.name === activeAlbum)?.items ?? [];
  }, [albums, activeAlbum]);

  const hasItems = items && items.length > 0;

  const openAlbum = (name: string) => {
    setActiveAlbum(name);
    setLightboxIdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      {hasItems && featured.length > 0 ? <GalleryHero items={featured} /> : <PlainHero />}

      <section style={{ padding: '40px 24px 80px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
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
        ) : activeAlbum && activeItems ? (
          <AlbumView
            name={activeAlbum}
            items={activeItems}
            onBack={() => {
              setActiveAlbum(null);
              setLightboxIdx(null);
            }}
            onOpen={(i) => setLightboxIdx(i)}
          />
        ) : (
          <>
            <header style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }}>
              <h2 className="t-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--blanco)', margin: 0 }}>
                Álbumes
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
                {albums?.length ?? 0} {albums?.length === 1 ? 'carpeta' : 'carpetas'}
              </span>
            </header>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {albums?.map((a) => (
                <FolderCard key={a.name} album={a} onOpen={() => openAlbum(a.name)} />
              ))}
            </div>
          </>
        )}
      </section>

      {activeItems && lightboxIdx !== null ? (
        <Lightbox
          items={activeItems}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onIndexChange={setLightboxIdx}
        />
      ) : null}

      <style>{`
        @media (max-width: 1100px) { .gallery-masonry { column-count: 3 !important; } }
        @media (max-width: 760px)  { .gallery-masonry { column-count: 2 !important; } }
        @media (max-width: 480px)  { .gallery-masonry { column-count: 1 !important; } }
      `}</style>
    </PublicLayout>
  );
}

// ─── Tarjeta de carpeta/álbum ────────────────────────────────────────────
function FolderCard({ album, onOpen }: { album: Album; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      style={{
        cursor: 'pointer',
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        overflow: 'hidden',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
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
      <div
        style={{
          position: 'relative',
          paddingTop: '62%',
          background: album.cover
            ? `url('${album.cover}') center/cover`
            : 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
        }}
      >
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.85))' }}
        />
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 9px',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'var(--blanco)',
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <IconFolder size={13} /> Álbum
        </span>
        {album.videoCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 9px',
              background: 'var(--rojo)',
              color: 'var(--blanco)',
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <IconPlay size={11} /> {album.videoCount}
          </span>
        ) : null}
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="t-display" style={{ fontSize: 18, color: 'var(--blanco)', lineHeight: 1.15 }}>
          {album.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--light)', fontFamily: 'var(--font-cond)', fontSize: 12, letterSpacing: '0.06em' }}>
            {album.count} {album.count === 1 ? 'archivo' : 'archivos'}
          </span>
          {album.lastDate ? (
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{fmtShort(album.lastDate)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Vista de un álbum (masonry de su contenido) ─────────────────────────
function AlbumView({
  name,
  items,
  onBack,
  onOpen,
}: {
  name: string;
  items: GalleryItem[];
  onBack: () => void;
  onOpen: (i: number) => void;
}) {
  return (
    <>
      <header style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'transparent',
            border: '1px solid var(--borde-strong)',
            color: 'var(--blanco)',
            cursor: 'pointer',
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <IconChevronLeft size={14} /> Álbumes
        </button>
        <h2 className="t-display" style={{ fontSize: 'clamp(26px, 4vw, 44px)', color: 'var(--blanco)', margin: 0 }}>
          {name}
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
          {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </header>

      <div style={{ columnCount: 4, columnGap: 8 }} className="gallery-masonry">
        {items.map((g, i) => (
          <GalleryCard key={g.id} item={g} onClick={() => onOpen(i)} />
        ))}
      </div>
    </>
  );
}

// ─── Hero cinematográfico ────────────────────────────────────────────────
function GalleryHero({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 5500);
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
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`gallery-hero-slide ${i === active ? 'is-active' : ''}`}
          style={{ backgroundImage: `url('${coverUrl(item)}')` }}
          aria-hidden={i !== active}
        />
      ))}

      {current ? (
        <img
          key={`photo-${current.id}`}
          className="gallery-hero-photo"
          src={coverUrl(current)}
          alt={current.label}
        />
      ) : null}

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
            · {current.album?.trim() || current.cat || 'Galería'}
          </div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(18px, 2.4vw, 28px)',
              lineHeight: 1.05,
              margin: 0,
              color: 'var(--blanco)',
              maxWidth: 900,
              textShadow: '0 2px 14px rgba(0,0,0,0.7)',
            }}
          >
            {current.label}
          </h1>
        </div>
      ) : null}

      <div style={{ position: 'absolute', top: 'clamp(20px, 4vw, 40px)', right: 'clamp(20px, 4vw, 40px)', display: 'flex', gap: 6, alignItems: 'center' }}>
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver ${i + 1} de ${items.length}`}
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
    <section style={{ padding: '88px 32px 56px', borderBottom: '1px solid var(--borde)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>
          · Archivo visual
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(56px, 11vw, 156px)', lineHeight: 0.92, margin: 0, color: 'var(--blanco)' }}
        >
          Cada rodada, <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>cada recuerdo</span>.
        </h1>
      </div>
    </section>
  );
}

// ─── Card del grid masonry (imagen o video) ──────────────────────────────
function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const cover = coverUrl(item);
  const isVideo = item.type === 'video';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        cursor: 'pointer',
        breakInside: 'avoid',
        marginBottom: 8,
        border: '1px solid var(--borde)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
      }}
    >
      {cover ? (
        <img src={cover} alt={item.label} loading="lazy" style={{ width: '100%', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', paddingTop: `${(1 / (item.ratio || 1.78)) * 100}%` }} />
      )}

      {isVideo ? (
        <span
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--blanco)' }}
        >
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.5)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconPlay size={24} />
          </span>
        </span>
      ) : null}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 55%, rgba(10,10,10,0.9))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 14,
        }}
      >
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
          {isVideo ? 'Video' : item.cat}
        </div>
        <div className="t-display" style={{ fontSize: 16, color: 'var(--blanco)', margin: 0, lineHeight: 1.2 }}>
          {item.label}
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox (imagen o video) ───────────────────────────────────────────
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
  const isVideo = current.type === 'video';

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <header
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', color: 'var(--blanco)', flexShrink: 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--rojo)', textTransform: 'uppercase', fontWeight: 600 }}>
            {isVideo ? 'Video' : current.cat}
          </span>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{current.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, letterSpacing: '0.18em', color: 'var(--light)' }}>
            {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            title="Abrir original"
            style={{ width: 38, height: 38, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'var(--blanco)', textDecoration: 'none' }}
          >
            <IconDownload size={14} />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'var(--blanco)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            <IconClose size={14} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 'clamp(12px, 3vw, 40px)' }}>
          {isVideo ? (
            <div style={{ width: 'min(100%, 1100px)' }}>
              <VideoPlayer url={current.url} poster={current.poster_url} label={current.label} />
            </div>
          ) : (
            <img
              src={current.url}
              alt={current.label}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          )}
        </div>

        {items.length > 1 ? (
          <>
            <button type="button" onClick={prev} aria-label="Anterior" style={navBtnStyle('left')}>
              <IconChevronLeft size={22} />
            </button>
            <button type="button" onClick={next} aria-label="Siguiente" style={navBtnStyle('right')}>
              <IconChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <footer onClick={(e) => e.stopPropagation()} style={{ padding: '14px 20px 22px', overflowX: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', minWidth: 'min-content' }}>
            {items.map((item, i) => {
              const c = coverUrl(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Ir a ${i + 1}`}
                  style={{
                    position: 'relative',
                    width: 64,
                    height: 44,
                    flexShrink: 0,
                    border: i === index ? '2px solid var(--rojo)' : '2px solid transparent',
                    background: c ? `url('${c}') center/cover` : 'var(--dark-2)',
                    cursor: 'pointer',
                    opacity: i === index ? 1 : 0.55,
                    transition: 'opacity .25s, border-color .25s',
                    padding: 0,
                  }}
                >
                  {item.type === 'video' ? (
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--blanco)' }}>
                      <IconPlay size={14} />
                    </span>
                  ) : null}
                </button>
              );
            })}
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
      style={{ border: '1px solid var(--rojo)', background: 'var(--rojo-soft)', color: 'var(--rojo-light)', padding: '14px 16px', fontSize: 13 }}
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
