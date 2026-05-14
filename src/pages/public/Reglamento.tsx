import { useEffect, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { REGLAMENTO } from '../../data/reglamento';
import { CLUB } from '../../lib/constants';
import { IconChevronDown, IconDownload } from '../../components/icons';

export function ReglamentoPage() {
  const firstTitulo = REGLAMENTO[0];
  const firstArticleId = firstTitulo?.items[0]?.n ?? '1.1';
  const [openArticle, setOpenArticle] = useState<string | null>(firstArticleId);
  const [activeTitle, setActiveTitle] = useState<string>(firstTitulo?.id ?? 'titulo-1');

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
      <section
        style={{
          padding: '80px 32px 40px',
          borderBottom: '1px solid var(--borde)',
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="kicker">· Bases del club</div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(56px, 11vw, 160px)',
              lineHeight: 0.9,
              margin: '12px 0 24px',
              color: 'var(--blanco)',
            }}
          >
            Reglamento del{' '}
            <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>club</span>.
          </h1>
          <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--light)', lineHeight: 1.6 }}>
            Estas son las reglas que sostienen al club. Al solicitar tu ingreso, las aceptas todas. Si
            algo no está claro, escríbele al admin a{' '}
            <a
              href={`mailto:${CLUB.emails.admin}`}
              style={{
                color: 'var(--blanco)',
                borderBottom: '1px solid var(--rojo)',
                textDecoration: 'none',
              }}
            >
              {CLUB.emails.admin}
            </a>{' '}
            antes de inscribirte.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: 40,
              borderTop: '1px solid var(--borde)',
            }}
          >
            {[
              { k: 'Total artículos', v: totalArticulos },
              { k: 'Títulos', v: REGLAMENTO.length },
              { k: 'Última revisión', v: 'Marzo 2026' },
              { k: 'Aprobado por', v: 'Asamblea general' },
            ].map((m, i) => (
              <div
                key={m.k}
                style={{
                  flex: '1 1 200px',
                  padding: '20px 24px 0',
                  borderRight: i < 3 ? '1px solid var(--borde)' : 'none',
                }}
              >
                <div className="t-display" style={{ fontSize: 36, color: 'var(--rojo)' }}>
                  {m.v}
                </div>
                <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--light)' }}>
                  {m.k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 32px' }}>
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 48,
            alignItems: 'flex-start',
          }}
          className="reglamento-grid"
        >
          {/* TOC */}
          <aside
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
            <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
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
                  padding: '8px 10px',
                  borderLeft: `2px solid ${activeTitle === g.id ? 'var(--rojo)' : 'transparent'}`,
                  color: activeTitle === g.id ? 'var(--blanco)' : 'var(--light)',
                  background: activeTitle === g.id ? 'var(--rojo-soft)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                <span style={{ color: 'var(--rojo)', marginRight: 6 }}>{g.n}.</span>
                {g.t}
              </a>
            ))}

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                marginTop: 14,
                fontFamily: 'var(--font-cond)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--light)',
                background: 'var(--dark-2)',
                border: '1px solid var(--borde)',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <IconDownload size={12} /> Imprimir / PDF
            </button>
          </aside>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {REGLAMENTO.map((g) => (
              <section key={g.id} id={g.id} style={{ scrollMarginTop: 80 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--borde)',
                    marginBottom: 16,
                  }}
                >
                  <span
                    className="t-display"
                    style={{ fontSize: 48, color: 'var(--rojo)' }}
                  >
                    {g.n}.
                  </span>
                  <h2
                    className="t-display"
                    style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, color: 'var(--blanco)' }}
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
                            gap: 14,
                            padding: '14px 18px',
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
                              minWidth: 36,
                            }}
                          >
                            {item.n}
                          </span>
                          <span
                            className="t-display"
                            style={{ flex: 1, fontSize: 19, color: 'var(--blanco)' }}
                          >
                            {item.t}
                          </span>
                          <span
                            style={{
                              transform: `rotate(${open ? 180 : 0}deg)`,
                              transition: 'transform .2s',
                              color: 'var(--light)',
                            }}
                          >
                            <IconChevronDown size={14} />
                          </span>
                        </button>
                        {open ? (
                          <div
                            className="fade-up"
                            style={{
                              padding: '0 18px 18px 68px',
                              color: 'var(--light)',
                              fontSize: 14.5,
                              lineHeight: 1.7,
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
                · Aceptación
              </div>
              <h3
                className="t-display"
                style={{ fontSize: 28, color: 'var(--blanco)', margin: '0 0 10px' }}
              >
                Al solicitar tu ingreso, aceptas todo este reglamento.
              </h3>
              <p style={{ color: 'var(--light)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 16 }}>
                No hay letra chica, no hay cuotas, no hay sorpresas. Si algo no está claro, escríbenos
                antes de inscribirte.
              </p>
              <a
                href={`mailto:${CLUB.emails.admin}`}
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--blanco)',
                  border: '1px solid var(--borde-strong)',
                  padding: '10px 16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Tengo una duda →
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
