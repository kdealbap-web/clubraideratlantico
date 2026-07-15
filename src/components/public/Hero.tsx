import type { ReactNode } from 'react';

interface HeroProps {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  meta?: Array<{ label: string; value: string }>;
  /** Foto de fondo opcional (con overlay para legibilidad del texto). */
  bgImage?: string;
}

export function Hero({ kicker, title, subtitle, meta, bgImage }: HeroProps) {
  return (
    <section
      style={{
        position: 'relative',
        background:
          'radial-gradient(ellipse at 75% 25%, rgba(204,34,34,.18), transparent 55%), var(--negro)',
        padding: '88px 32px 64px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--borde)',
      }}
    >
      {bgImage ? (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.8) 42%, rgba(10,10,10,0.5) 100%), linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.85) 100%)',
            }}
          />
        </>
      ) : null}
      <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="kicker" style={{ marginBottom: 14 }}>
          · {kicker}
        </div>
        <h1
          className="t-display"
          style={{
            fontSize: 'clamp(56px, 11vw, 156px)',
            lineHeight: 0.92,
            margin: 0,
            color: 'var(--blanco)',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              marginTop: 18,
              maxWidth: 720,
              fontSize: 17,
              lineHeight: 1.55,
              color: 'var(--light)',
            }}
          >
            {subtitle}
          </p>
        ) : null}

        {meta && meta.length ? (
          <div
            style={{
              marginTop: 48,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 0,
              borderTop: '1px solid var(--borde)',
            }}
          >
            {meta.map((m, i) => (
              <div
                key={m.label}
                style={{
                  padding: '22px 24px 0',
                  borderRight: i < meta.length - 1 ? '1px solid var(--borde)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div className="t-display" style={{ fontSize: 40, color: 'var(--rojo)' }}>
                  {m.value}
                </div>
                <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--light)' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
