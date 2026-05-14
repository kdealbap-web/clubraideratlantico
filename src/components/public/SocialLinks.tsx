import { CLUB } from '../../lib/constants';
import { TricolorStrip } from './TricolorStrip';
import { IconFacebook, IconInstagram, IconMail, IconTikTok, IconWhatsApp } from '../icons';

interface BrandTile {
  key: 'instagram' | 'tiktok' | 'facebook' | 'whatsapp';
  icon: typeof IconInstagram;
  sub: string;
  /** Gradiente o color sólido de marca para el fondo en hover */
  bg: string;
  /** Color principal de marca (para el borde + icono en estado idle) */
  brand: string;
  /** Color del texto sobre el fondo del hover */
  fg: string;
  /** Glow para box-shadow en hover */
  glow: string;
}

const TILES: BrandTile[] = [
  {
    key: 'instagram',
    icon: IconInstagram,
    sub: 'Reels · fotos · BTS de cada rodada',
    // Gradiente oficial Instagram (Bottom-Left → Top-Right)
    bg: 'linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)',
    brand: '#E1306C',
    fg: '#FFFFFF',
    glow: 'rgba(220, 39, 67, 0.55)',
  },
  {
    key: 'tiktok',
    icon: IconTikTok,
    sub: 'Rodadas en video · cortes verticales',
    bg: '#010101',
    brand: '#FF0050',
    fg: '#FFFFFF',
    glow: 'rgba(255, 0, 80, 0.55)',
  },
  {
    key: 'facebook',
    icon: IconFacebook,
    sub: 'Eventos públicos y comunidad',
    bg: '#1877F2',
    brand: '#1877F2',
    fg: '#FFFFFF',
    glow: 'rgba(24, 119, 242, 0.55)',
  },
  {
    key: 'whatsapp',
    icon: IconWhatsApp,
    sub: 'Grupo oficial · coordinación de rodadas',
    bg: '#25D366',
    brand: '#25D366',
    fg: '#FFFFFF',
    glow: 'rgba(37, 211, 102, 0.55)',
  },
];

export function SocialLinks() {
  return (
    <section style={{ position: 'relative', background: 'var(--dark-1)' }}>
      <TricolorStrip thick />

      <div style={{ padding: '88px 0 72px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
              marginBottom: 44,
            }}
          >
            <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="kicker">· Encuéntranos en redes</div>
              <h2
                className="t-display"
                style={{
                  fontSize: 'clamp(44px, 7vw, 88px)',
                  color: 'var(--blanco)',
                  lineHeight: 0.92,
                  margin: 0,
                }}
              >
                @clubraideratlantico
                <br />
                <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>
                  en todas las redes
                </span>
                .
              </h2>
              <p className="text-light" style={{ fontSize: 15.5, lineHeight: 1.6, marginTop: 6 }}>
                Mismas manos, distinto canal. Lo que pasa en cada rodada lo subimos completo —
                reels en IG, cortes verticales en TikTok, eventos en Facebook y coordinación en
                WhatsApp.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 5,
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

          {/* Grid de tiles con colores de marca */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {TILES.map((t) => (
              <BrandLink key={t.key} tile={t} />
            ))}
          </div>

          {/* Email destacado — color del club */}
          <a
            href={`mailto:${CLUB.emails.info}`}
            className="social-email-tile"
            style={{
              marginTop: 14,
              padding: '28px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              color: 'var(--blanco)',
              textDecoration: 'none',
              border: '2px solid var(--rojo)',
              background:
                'linear-gradient(135deg, var(--rojo) 0%, #8B1818 50%, var(--rojo) 100%)',
              boxShadow: '0 0 0 0 rgba(204, 34, 34, 0)',
              transition: 'transform .25s, box-shadow .25s',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: 'rgba(255,255,255,0.18)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <IconMail size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="t-display" style={{ fontSize: 30, lineHeight: 1 }}>
                Escríbenos directo
              </div>
              <div className="t-cond-up" style={{ fontSize: 12, marginTop: 6, opacity: 0.92 }}>
                {CLUB.emails.info} · respuesta en 48h
              </div>
            </div>
            <span
              className="social-arrow"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 38,
                lineHeight: 1,
                transition: 'transform .25s',
              }}
            >
              →
            </span>
          </a>
        </div>
      </div>

      <TricolorStrip />
    </section>
  );
}

function BrandLink({ tile }: { tile: BrandTile }) {
  const data = CLUB.social[tile.key];
  const Icon = tile.icon;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noreferrer"
      className="social-brand-tile"
      style={
        {
          padding: '26px 22px 22px',
          background: 'var(--dark-2)',
          color: 'var(--blanco)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minHeight: 200,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid var(--borde)`,
          borderTop: `3px solid ${tile.brand}`,
          transition: 'transform .3s, box-shadow .3s, background .3s',
          // CSS vars consumidas por hover state en globals.css
          '--brand-bg': tile.bg,
          '--brand-color': tile.brand,
          '--brand-fg': tile.fg,
          '--brand-glow': tile.glow,
        } as React.CSSProperties
      }
    >
      {/* Overlay con color de marca que aparece en hover */}
      <span
        aria-hidden="true"
        className="social-tile-bg"
        style={{
          position: 'absolute',
          inset: 0,
          background: tile.bg,
          opacity: 0,
          transition: 'opacity .3s',
          pointerEvents: 'none',
        }}
      />

      {/* Contenido (z-index encima del overlay) */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
          className="social-icon-box"
          style={{
            width: 50,
            height: 50,
            background: 'transparent',
            color: tile.brand,
            border: `1.5px solid ${tile.brand}`,
            display: 'grid',
            placeItems: 'center',
            transition: 'background .3s, color .3s, transform .3s',
          }}
        >
          <Icon size={26} />
        </div>
        <span
          className="social-arrow"
          style={{
            color: tile.brand,
            fontFamily: 'var(--font-cond)',
            fontSize: 22,
            transition: 'transform .3s, color .3s',
            display: 'inline-block',
          }}
        >
          ↗
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div className="t-display" style={{ fontSize: 26, lineHeight: 1 }}>
          {data.label}
        </div>
        <div
          className="social-handle"
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 14,
            color: tile.brand,
            letterSpacing: '0.04em',
            fontWeight: 600,
            transition: 'color .3s',
          }}
        >
          {data.handle}
        </div>
        <div
          className="social-sub"
          style={{
            color: 'var(--muted)',
            fontSize: 12.5,
            lineHeight: 1.45,
            marginTop: 4,
            transition: 'color .3s',
          }}
        >
          {tile.sub}
        </div>
      </div>

      {/* Línea inferior de marca que se anima en hover */}
      <span
        aria-hidden="true"
        className="social-tile-underline"
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 3,
          width: '30%',
          background: tile.brand,
          transition: 'width .35s ease',
        }}
      />
    </a>
  );
}
