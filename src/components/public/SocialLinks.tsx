import { CLUB } from '../../lib/constants';
import { TricolorStrip } from './TricolorStrip';
import { IconFacebook, IconInstagram, IconMail, IconTikTok, IconWhatsApp } from '../icons';

const TILES: Array<{
  key: keyof typeof CLUB.social;
  icon: typeof IconInstagram;
  sub: string;
}> = [
  { key: 'instagram', icon: IconInstagram, sub: 'Reels · fotos · BTS' },
  { key: 'tiktok', icon: IconTikTok, sub: 'Rodadas en video' },
  { key: 'facebook', icon: IconFacebook, sub: 'Comunidad y eventos' },
  { key: 'whatsapp', icon: IconWhatsApp, sub: 'Grupo oficial' },
];

export function SocialLinks() {
  return (
    <section style={{ position: 'relative', background: 'var(--dark-1)' }}>
      <TricolorStrip thick />

      <div style={{ padding: '72px 0 60px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
              marginBottom: 36,
            }}
          >
            <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="kicker">· Síguenos en redes</div>
              <h2
                className="t-display"
                style={{
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  color: 'var(--blanco)',
                  lineHeight: 0.9,
                  margin: 0,
                }}
              >
                @clubraideratlantico
                <br />
                <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>en todas las redes</span>.
              </h2>
              <p className="text-light" style={{ fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
                Mismas manos, distinto canal. Lo que pasa en cada rodada lo subimos completo.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4,
              }}
            >
              <a
                href={`mailto:${CLUB.emails.info}`}
                className="t-cond-up"
                style={{ fontSize: 12, color: 'var(--blanco)' }}
              >
                {CLUB.emails.info}
              </a>
              <a
                href={`mailto:${CLUB.emails.admin}`}
                className="t-cond-up"
                style={{ fontSize: 12, color: 'var(--light)' }}
              >
                {CLUB.emails.admin}
              </a>
              <a
                href={CLUB.web}
                target="_blank"
                rel="noreferrer"
                className="t-cond-up"
                style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}
              >
                {CLUB.web.replace('https://', '')}
              </a>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--borde)',
            }}
          >
            {TILES.map((t, i) => {
              const data = CLUB.social[t.key];
              const Icon = t.icon;
              return (
                <a
                  key={t.key}
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '24px 22px',
                    borderRight: i < TILES.length - 1 ? '1px solid var(--borde)' : 'none',
                    background: 'var(--dark-1)',
                    color: 'var(--blanco)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    minHeight: 150,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: 'var(--rojo-soft)',
                        color: 'var(--rojo)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--rojo)',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        color: 'var(--light)',
                        fontFamily: 'var(--font-cond)',
                        fontSize: 18,
                      }}
                    >
                      ↗
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="t-display" style={{ fontSize: 22, lineHeight: 1 }}>
                      {data.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-cond)',
                        fontSize: 13,
                        color: 'var(--rojo)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {data.handle}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {t.sub}
                    </div>
                  </div>
                </a>
              );
            })}

            {/* email tile */}
            <a
              href={`mailto:${CLUB.emails.info}`}
              style={{
                padding: '24px 22px',
                background: 'var(--rojo)',
                color: 'var(--blanco)',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 150,
                gridColumn: '1 / -1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(255,255,255,0.16)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <IconMail size={22} />
                </div>
                <div>
                  <div className="t-display" style={{ fontSize: 24 }}>
                    Escríbenos
                  </div>
                  <div className="t-cond-up" style={{ fontSize: 12 }}>
                    {CLUB.emails.info}
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <TricolorStrip />
    </section>
  );
}
