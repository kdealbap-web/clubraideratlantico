import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { IconChevronLeft, IconChevronRight, IconClose, IconWhatsApp } from '../../components/icons';
import { CLUB, ROUTES } from '../../lib/constants';
import type { News, NewsImage } from '../../types';

export function NoticiasPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
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

  // Vista de lectura del artículo completo (cuando la URL es /noticias/:id)
  const selected = useMemo<News | null>(
    () => (params.id && items ? items.find((n) => n.id === params.id) ?? null : null),
    [params.id, items],
  );

  if (params.id) {
    if (items === null) {
      return (
        <PublicLayout>
          <div style={{ padding: '48px 32px' }}>
            <Loading />
          </div>
        </PublicLayout>
      );
    }
    if (!selected) {
      return <Navigate to={ROUTES.noticias} replace />;
    }
    return (
      <PublicLayout>
        <ArticleReader news={selected} onBack={() => navigate(ROUTES.noticias)} />
      </PublicLayout>
    );
  }

  const lead = items?.[0] ?? null;
  const rest = items ? items.slice(1) : [];

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
          <>
            {lead ? <LeadArticle news={lead} onOpen={() => navigate(`${ROUTES.noticias}/${lead.id}`)} /> : null}

            {rest.length > 0 ? (
              <>
                <header style={{ margin: '44px 0 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 8, height: 8, background: 'var(--rojo)', borderRadius: '50%' }} />
                  <span className="kicker">· Más comunicados</span>
                </header>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                  }}
                >
                  {rest.map((n) => (
                    <NewsCard key={n.id} news={n} onOpen={() => navigate(`${ROUTES.noticias}/${n.id}`)} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </section>
    </PublicLayout>
  );
}

// ─── Artículo destacado (portada) ────────────────────────────────────────
function LeadArticle({ news, onOpen }: { news: News; onOpen: () => void }) {
  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
        gap: 0,
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      className="news-lead"
    >
      <div
        style={{
          minHeight: 320,
          background: news.cover_url
            ? `url('${news.cover_url}') center/cover`
            : 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
        }}
        aria-hidden={!news.cover_url}
      />
      <div style={{ padding: 'clamp(24px, 4vw, 44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
        <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--rojo)', letterSpacing: '0.18em' }}>
          Portada · {fmtDate(news.fecha)} · {news.autor}
        </div>
        <h2 className="t-display" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: 'var(--blanco)', margin: 0, lineHeight: 1.02 }}>
          {news.titulo}
        </h2>
        <p style={{ color: 'var(--light)', fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>{news.resumen}</p>
        <Tags tags={news.tags} />
        <span
          style={{
            marginTop: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--blanco)',
            fontFamily: 'var(--font-cond)',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Leer nota completa <IconChevronRight size={14} style={{ color: 'var(--rojo)' }} />
        </span>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .news-lead { grid-template-columns: 1fr !important; }
          .news-lead > div:first-child { min-height: 220px !important; }
        }
      `}</style>
    </article>
  );
}

// ─── Tarjeta de noticia ──────────────────────────────────────────────────
function NewsCard({ news, onOpen }: { news: News; onOpen: () => void }) {
  return (
    <article
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          paddingTop: '52%',
          background: news.cover_url
            ? `url('${news.cover_url}') center/cover`
            : 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
        }}
        aria-hidden={!news.cover_url}
      />
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div className="t-cond-up" style={{ fontSize: 10, color: 'var(--rojo)', letterSpacing: '0.16em' }}>
          {fmtDate(news.fecha)} · {news.autor}
        </div>
        <h3 className="t-display" style={{ fontSize: 20, color: 'var(--blanco)', margin: 0, lineHeight: 1.12 }}>
          {news.titulo}
        </h3>
        <p
          style={{
            color: 'var(--light)',
            fontSize: 13.5,
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {news.resumen}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Tags tags={news.tags} />
        </div>
      </div>
    </article>
  );
}

// ─── Lector del artículo completo (estilo diario digital) ────────────────
function ArticleReader({ news, onBack }: { news: News; onBack: () => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [news.id]);

  const paras = paragraphs(news.contenido);

  return (
    <article>
      {/* Banner de portada */}
      <div
        style={{
          position: 'relative',
          minHeight: news.cover_url ? 'clamp(280px, 42vh, 460px)' : 0,
          background: news.cover_url
            ? `url('${news.cover_url}') center/cover`
            : 'transparent',
          borderBottom: news.cover_url ? '1px solid var(--borde)' : 'none',
        }}
      >
        {news.cover_url ? (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.45), rgba(10,10,10,0.2))' }} />
        ) : null}
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            background: 'transparent',
            border: '1px solid var(--borde-strong)',
            color: 'var(--blanco)',
            cursor: 'pointer',
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          <IconChevronLeft size={14} /> Volver a noticias
        </button>

        <div className="t-cond-up" style={{ fontSize: 12, color: 'var(--rojo)', letterSpacing: '0.18em', marginBottom: 12 }}>
          {fmtDateLong(news.fecha)} · Por {news.autor}
        </div>

        <h1
          className="t-display"
          style={{ fontSize: 'clamp(34px, 6vw, 60px)', color: 'var(--blanco)', margin: 0, lineHeight: 1.02 }}
        >
          {news.titulo}
        </h1>

        {news.resumen ? (
          <p
            style={{
              color: 'var(--light)',
              fontSize: 'clamp(17px, 2.4vw, 21px)',
              lineHeight: 1.55,
              margin: '20px 0 0',
              fontStyle: 'italic',
              borderLeft: '3px solid var(--rojo)',
              paddingLeft: 18,
            }}
          >
            {news.resumen}
          </p>
        ) : null}

        <div style={{ height: 1, background: 'var(--borde)', margin: '28px 0' }} />

        {/* Cuerpo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {paras.length > 0 ? (
            paras.map((p, i) => (
              <p
                key={i}
                style={{
                  color: 'var(--blanco)',
                  fontSize: 'clamp(16px, 2.2vw, 18px)',
                  lineHeight: 1.8,
                  margin: 0,
                  whiteSpace: 'pre-line',
                  opacity: 0.92,
                }}
              >
                {p}
              </p>
            ))
          ) : (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>
              Esta nota aún no tiene contenido ampliado.
            </p>
          )}
        </div>

        <NewsGallery images={news.galeria ?? []} />

        <ShareRow news={news} />

        {news.tags && news.tags.length > 0 ? (
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--borde)' }}>
            <Tags tags={news.tags} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onBack}
          style={{
            marginTop: 36,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 16px',
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
          <IconChevronLeft size={14} /> Volver a noticias
        </button>
      </div>
    </article>
  );
}

// ─── Galería del artículo con lightbox ───────────────────────────────────
function NewsGallery({ images }: { images: NewsImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === 'ArrowLeft')
        setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  if (!images || images.length === 0) return null;

  const current = open !== null ? images[open] : null;

  return (
    <div style={{ marginTop: 44 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 8, height: 8, background: 'var(--rojo)', borderRadius: '50%' }} />
        <span className="kicker">· Galería</span>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
        }}
      >
        {images.map((img, i) => (
          <button
            key={img.path || `n-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={img.caption || `Ver imagen ${i + 1}`}
            style={{
              position: 'relative',
              paddingTop: '75%',
              border: '1px solid var(--borde)',
              background: `url('${img.url}') center/cover`,
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <button type="button" onClick={() => setOpen(null)} aria-label="Cerrar" style={lightboxClose}>
            <IconClose size={20} />
          </button>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
              }}
              aria-label="Anterior"
              style={{ ...lightboxNav, left: 12 }}
            >
              <IconChevronLeft size={22} />
            </button>
          ) : null}
          <img
            src={current.url}
            alt={current.caption ?? ''}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              objectFit: 'contain',
              boxShadow: '0 10px 50px rgba(0,0,0,0.6)',
            }}
          />
          {current.caption ? (
            <div
              style={{
                color: 'var(--light)',
                fontSize: 13,
                marginTop: 14,
                textAlign: 'center',
                maxWidth: 680,
              }}
            >
              {current.caption}
            </div>
          ) : null}
          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((i) => (i === null ? i : (i + 1) % images.length));
              }}
              aria-label="Siguiente"
              style={{ ...lightboxNav, right: 12 }}
            >
              <IconChevronRight size={22} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const lightboxClose = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 44,
  height: 44,
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'var(--blanco)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
} as const;

const lightboxNav = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 44,
  height: 44,
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'var(--blanco)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
} as const;

function ShareRow({ news }: { news: News }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${CLUB.web}${ROUTES.noticias}/${news.id}`;
  const shareText = `🏍️ ${news.titulo}${news.resumen ? ` — ${news.resumen}` : ''}\n${shareUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copia el enlace:', shareUrl);
    }
  };

  return (
    <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <span className="kicker" style={{ marginRight: 6 }}>· Compartir esta nota</span>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#25D366',
          color: '#fff',
          padding: '10px 16px',
          textDecoration: 'none',
          fontFamily: 'var(--font-cond)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <IconWhatsApp size={14} /> WhatsApp
      </a>
      <button
        type="button"
        onClick={() => void copy()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          color: 'var(--blanco)',
          border: '1px solid var(--borde-strong)',
          padding: '10px 16px',
          cursor: 'pointer',
          fontFamily: 'var(--font-cond)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {copied ? 'Copiado ✓' : 'Copiar enlace'}
      </button>
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map((t) => (
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
  );
}

function paragraphs(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function fmtDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
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
