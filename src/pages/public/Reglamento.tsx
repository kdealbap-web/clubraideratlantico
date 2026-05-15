import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { REGLAMENTO, REGLAMENTO_META } from '../../data/reglamento';
import { CLUB } from '../../lib/constants';
import { IconChevronDown, IconDownload } from '../../components/icons';

export function ReglamentoPage() {
  const firstTitulo = REGLAMENTO[0];
  const firstArticleId = firstTitulo?.items[0]?.n ?? '1.1';
  const [openArticle, setOpenArticle] = useState<string | null>(firstArticleId);
  const [activeTitle, setActiveTitle] = useState<string>(firstTitulo?.id ?? 'titulo-1');
  const [tocMobileOpen, setTocMobileOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveTitle(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    REGLAMENTO.forEach((g) => {
      const el = document.getElementById(g.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const totalArticulos = REGLAMENTO.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <PublicLayout>
      {/* HERO */}
      <section
        style={{
          padding: '64px 24px 36px',
          borderBottom: '1px solid var(--borde)',
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="kicker">· Bases del club</div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(48px, 10vw, 140px)',
              lineHeight: 0.9,
              margin: '12px 0 18px',
              color: 'var(--blanco)',
            }}
          >
            Reglamento{' '}
            <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>interno</span>.
          </h1>
          <p
            style={{
              maxWidth: 720,
              fontSize: 15.5,
              color: 'var(--light)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {REGLAMENTO_META.subtitulo}. Documento de uso interno del Club Raider Atlántico.
            Al solicitar tu ingreso aceptas estas normas. Si algo no está claro, escribe a{' '}
            <a
              href={`mailto:${CLUB.emails.admin}`}
              style={{
                color: 'var(--blanco)',
                borderBottom: '1px solid var(--rojo)',
                textDecoration: 'none',
              }}
            >
              {CLUB.emails.admin}
            </a>
            .
          </p>

          {/* Acciones: descargar PDF + imprimir */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 24,
            }}
          >
            <a
              href={REGLAMENTO_META.pdfUrl}
              download="Reglamento_ClubRaider_2026.pdf"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--rojo)',
                color: 'var(--blanco)',
                padding: '12px 18px',
                fontFamily: 'var(--font-cond)',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                clipPath: 'var(--clip-btn)',
              }}
            >
              <IconDownload size={14} /> Descargar PDF
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: 'var(--blanco)',
                border: '1px solid var(--borde-strong)',
                padding: '12px 18px',
                fontFamily: 'var(--font-cond)',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Imprimir
            </button>
          </div>

          {/* Metadata strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              marginTop: 36,
              borderTop: '1px solid var(--borde)',
            }}
          >
            {[
              { k: 'Total artículos', v: String(totalArticulos) },
              { k: 'Títulos', v: String(REGLAMENTO.length) },
              { k: 'Versión', v: REGLAMENTO_META.version.replace('Versión ', '') },
              { k: 'Fecha', v: REGLAMENTO_META.fecha },
              { k: 'Aprobado por', v: REGLAMENTO_META.fundador },
            ].map((m, i, arr) => (
              <div
                key={m.k}
                style={{
                  padding: '20px 22px 4px',
                  borderRight: i < arr.length - 1 ? '1px solid var(--borde)' : 'none',
                }}
              >
                <div
                  className="t-display"
                  style={{ fontSize: 28, color: 'var(--rojo)', lineHeight: 1 }}
                >
                  {m.v}
                </div>
                <div className="kicker" style={{ fontSize: 10, marginTop: 6 }}>
                  {m.k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOC móvil (accordion sticky) */}
      <div
        className="reglamento-toc-mobile"
        style={{
          display: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '1px solid var(--borde)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          type="button"
          onClick={() => setTocMobileOpen((v) => !v)}
          aria-expanded={tocMobileOpen}
          style={{
            width: '100%',
            padding: '14px 22px',
            background: 'transparent',
            border: 'none',
            color: 'var(--blanco)',
            fontFamily: 'var(--font-cond)',
            fontSize: 13,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <span>
            <span style={{ color: 'var(--rojo)', marginRight: 8 }}>·</span> Índice del reglamento
          </span>
          <IconChevronDown
            size={14}
            style={{
              transform: `rotate(${tocMobileOpen ? 180 : 0}deg)`,
              transition: 'transform .25s',
            }}
          />
        </button>
        {tocMobileOpen ? (
          <div
            style={{
              padding: '4px 14px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {REGLAMENTO.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                onClick={() => setTocMobileOpen(false)}
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '10px 12px',
                  borderLeft: `2px solid ${activeTitle === g.id ? 'var(--rojo)' : 'transparent'}`,
                  color: activeTitle === g.id ? 'var(--blanco)' : 'var(--light)',
                  background: activeTitle === g.id ? 'var(--rojo-soft)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <span style={{ color: 'var(--rojo)', marginRight: 8 }}>{g.n}.</span>
                {g.t}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {/* CONTENIDO */}
      <section style={{ padding: '36px 24px' }}>
        <div
          className="reglamento-grid"
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '260px minmax(0, 1fr)',
            gap: 40,
            alignItems: 'flex-start',
          }}
        >
          {/* TOC desktop sticky */}
          <aside
            className="reglamento-toc-desktop"
            style={{
              position: 'sticky',
              top: 24,
              alignSelf: 'flex-start',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
            }}
          >
            <div
              className="kicker"
              style={{ marginBottom: 8 }}
            >
              · Índice
            </div>
            {REGLAMENTO.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '10px 12px',
                  borderLeft: `2px solid ${activeTitle === g.id ? 'var(--rojo)' : 'transparent'}`,
                  color: activeTitle === g.id ? 'var(--blanco)' : 'var(--light)',
                  background: activeTitle === g.id ? 'var(--rojo-soft)' : 'transparent',
                  textDecoration: 'none',
                  lineHeight: 1.35,
                }}
              >
                <span style={{ color: 'var(--rojo)', marginRight: 6 }}>{g.n}.</span>
                {g.t}
              </a>
            ))}
          </aside>

          {/* Articulos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 44, minWidth: 0 }}>
            {REGLAMENTO.map((g) => (
              <section
                key={g.id}
                id={g.id}
                style={{ scrollMarginTop: 100 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 14,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--borde)',
                    marginBottom: 14,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    className="t-display"
                    style={{ fontSize: 'clamp(32px, 5vw, 48px)', color: 'var(--rojo)' }}
                  >
                    {g.n}.
                  </span>
                  <h2
                    className="t-display"
                    style={{
                      fontSize: 'clamp(24px, 4vw, 38px)',
                      margin: 0,
                      color: 'var(--blanco)',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {g.t}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.items.map((item) => {
                    const open = openArticle === item.n;
                    return (
                      <div
                        key={item.n}
                        style={{
                          border: '1px solid var(--borde)',
                          background: 'var(--dark-1)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenArticle(open ? null : item.n)}
                          aria-expanded={open}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '13px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-cond)',
                              fontSize: 11,
                              color: 'var(--rojo)',
                              letterSpacing: '0.14em',
                              minWidth: 56,
                              flexShrink: 0,
                              fontWeight: 700,
                            }}
                          >
                            {item.n}
                          </span>
                          <span
                            className="t-display"
                            style={{
                              flex: 1,
                              fontSize: 17,
                              color: 'var(--blanco)',
                              lineHeight: 1.25,
                              minWidth: 0,
                            }}
                          >
                            {item.t}
                          </span>
                          <span
                            style={{
                              transform: `rotate(${open ? 180 : 0}deg)`,
                              transition: 'transform .2s',
                              color: 'var(--light)',
                              flexShrink: 0,
                            }}
                          >
                            <IconChevronDown size={14} />
                          </span>
                        </button>
                        {open ? (
                          <div
                            className="fade-up"
                            style={{
                              padding: '0 16px 18px 78px',
                              color: 'var(--blanco-soft, var(--light))',
                              fontSize: 14.5,
                              lineHeight: 1.7,
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {item.d}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Firma final */}
            <div
              style={{
                position: 'relative',
                background: 'var(--dark-1)',
                border: '1px solid var(--borde)',
                padding: 28,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 3,
                  width: 80,
                  background: 'var(--rojo)',
                }}
              />
              <div className="kicker" style={{ marginBottom: 8 }}>
                · Expedición
              </div>
              <p style={{ color: 'var(--blanco)', fontSize: 16, lineHeight: 1.65, margin: '0 0 16px' }}>
                El presente Reglamento Interno se expide el día{' '}
                <strong style={{ color: 'var(--rojo)' }}>{REGLAMENTO_META.fecha}</strong> en la
                ciudad de {REGLAMENTO_META.ciudad}.
              </p>
              <div
                style={{
                  paddingTop: 14,
                  borderTop: '1px solid var(--borde)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div>
                  <div
                    className="t-display"
                    style={{ fontSize: 20, color: 'var(--blanco)', letterSpacing: '0.04em' }}
                  >
                    {REGLAMENTO_META.fundador.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      color: 'var(--rojo)',
                      fontSize: 14,
                      marginTop: 2,
                    }}
                  >
                    Fundador Principal de Club Raider Atlántico
                  </div>
                </div>
                <a
                  href={REGLAMENTO_META.pdfUrl}
                  download="Reglamento_ClubRaider_2026.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--rojo)',
                    color: 'var(--blanco)',
                    padding: '12px 18px',
                    fontFamily: 'var(--font-cond)',
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    clipPath: 'var(--clip-btn)',
                  }}
                >
                  <IconDownload size={14} /> Descargar PDF oficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .reglamento-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .reglamento-toc-desktop { display: none !important; }
          .reglamento-toc-mobile { display: block !important; }
        }
        @media print {
          .public-nav-links, header, footer { display: none !important; }
        }
      `}</style>
    </PublicLayout>
  );
}
