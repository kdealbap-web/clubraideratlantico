import type { CSSProperties } from 'react';

// ════════════════════════════════════════════════════════════════
// Temas mensuales del poster de cronograma.
// Cada mes tiene su propia paleta, forma de "chip" de fecha,
// alineación y capa decorativa de fondo — para que la imagen se vea
// distinta cada mes pero siga clara y estructurada. El logo y la
// marca ("RAIDER ATLÁNTICO" en rojo, en el footer) son constantes:
// el rojo de marca es el hilo conductor entre todos los meses.
// ════════════════════════════════════════════════════════════════

export type ChipShape = 'pill' | 'square' | 'cut' | 'tag';

export type DecorVariant =
  | 'sunRings'
  | 'stripes'
  | 'leaves'
  | 'rain'
  | 'dots'
  | 'sunBig'
  | 'tricolor'
  | 'kites'
  | 'rings'
  | 'blocks'
  | 'topo'
  | 'snow';

export interface PosterTheme {
  /** Color base del fondo. */
  bg: string;
  /** Acento principal: chip de fecha + kicker "Cronograma". */
  accent: string;
  /** Acento secundario: decoración. */
  accent2: string;
  /** Color del mes gigante. */
  monthColor: string;
  /** Forma del chip de fecha. */
  chip: ChipShape;
  /** Alineación del encabezado (logo + título). */
  align: 'center' | 'left';
  /** Capa decorativa de fondo. */
  decor: DecorVariant;
  /** Opacidad del logo difuminado de fondo. */
  logoOpacity: number;
}

/** Convierte #RRGGBB + alpha en rgba(). */
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Tema de respaldo = el original rojo/negro de marca.
const FALLBACK_THEME: PosterTheme = {
  bg: '#0a0a0a',
  accent: '#CC2222',
  accent2: '#CC2222',
  monthColor: '#FFFFFF',
  chip: 'pill',
  align: 'center',
  decor: 'rings',
  logoOpacity: 0.4,
};

// 1=Enero … 12=Diciembre
export const POSTER_THEMES: PosterTheme[] = [
  // ENERO — verano seco, sol caribeño
  { bg: '#08201d', accent: '#16B8A6', accent2: '#FFB020', monthColor: '#FFFFFF', chip: 'pill', align: 'center', decor: 'sunRings', logoOpacity: 0.30 },
  // FEBRERO — cálido, brasa (cercano a la marca)
  { bg: '#1c0a0a', accent: '#FF5A4D', accent2: '#FFC2BD', monthColor: '#FFFFFF', chip: 'square', align: 'left', decor: 'stripes', logoOpacity: 0.34 },
  // MARZO — verde, brote
  { bg: '#0c1a08', accent: '#8FD64F', accent2: '#2FA84F', monthColor: '#FFFFFF', chip: 'pill', align: 'center', decor: 'leaves', logoOpacity: 0.28 },
  // ABRIL — lluvia, azul
  { bg: '#08111f', accent: '#4FA3FF', accent2: '#8FD0FF', monthColor: '#FFFFFF', chip: 'cut', align: 'left', decor: 'rain', logoOpacity: 0.30 },
  // MAYO — flores, magenta/violeta
  { bg: '#150a1a', accent: '#FF4FA3', accent2: '#B14FFF', monthColor: '#FFFFFF', chip: 'pill', align: 'center', decor: 'dots', logoOpacity: 0.30 },
  // JUNIO — sol pleno, naranja
  { bg: '#1f1205', accent: '#FF9A1E', accent2: '#FFD23F', monthColor: '#FFFFFF', chip: 'square', align: 'left', decor: 'sunBig', logoOpacity: 0.26 },
  // JULIO — patrio (amarillo/azul/rojo de marca)
  { bg: '#0a0e1a', accent: '#FFD21E', accent2: '#1E5BFF', monthColor: '#FFFFFF', chip: 'tag', align: 'center', decor: 'tricolor', logoOpacity: 0.30 },
  // AGOSTO — viento, cometas
  { bg: '#06141a', accent: '#2ED1FF', accent2: '#FF7A1E', monthColor: '#FFFFFF', chip: 'cut', align: 'left', decor: 'kites', logoOpacity: 0.28 },
  // SEPTIEMBRE — amor y amistad, rosa-rojo
  { bg: '#1a0a10', accent: '#FF3D6E', accent2: '#FFB020', monthColor: '#FFFFFF', chip: 'pill', align: 'center', decor: 'rings', logoOpacity: 0.32 },
  // OCTUBRE — otoño, calabaza/morado
  { bg: '#160a14', accent: '#FF6A1E', accent2: '#7A3DFF', monthColor: '#FFFFFF', chip: 'square', align: 'left', decor: 'blocks', logoOpacity: 0.30 },
  // NOVIEMBRE — niebla, teal frío
  { bg: '#0c1413', accent: '#38C5A8', accent2: '#6E8BA6', monthColor: '#FFFFFF', chip: 'tag', align: 'center', decor: 'topo', logoOpacity: 0.28 },
  // DICIEMBRE — fiesta, verde/oro/rojo
  { bg: '#08140d', accent: '#2FB36B', accent2: '#E23B3B', monthColor: '#FFFFFF', chip: 'pill', align: 'center', decor: 'snow', logoOpacity: 0.32 },
];

export function getPosterTheme(monthNum: number): PosterTheme {
  const n = Math.round(monthNum);
  const idx = Math.min(12, Math.max(1, Number.isFinite(n) ? n : 1)) - 1;
  return POSTER_THEMES[idx] ?? FALLBACK_THEME;
}

/** clip-path por forma de chip (vacío = usa borderRadius). */
export function chipClipPath(shape: ChipShape): string | undefined {
  switch (shape) {
    case 'cut':
      return 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)';
    case 'tag':
      return 'polygon(22px 0, 100% 0, 100% 100%, 22px 100%, 0 50%)';
    default:
      return undefined;
  }
}

export function chipRadius(shape: ChipShape): number {
  if (shape === 'pill') return 999;
  if (shape === 'square') return 8;
  return 0; // cut / tag usan clip-path
}

// ─── Capa decorativa de fondo ────────────────────────────────────
const layer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
};

export function PosterDecor({ theme }: { theme: PosterTheme }) {
  const { accent, accent2, decor } = theme;

  switch (decor) {
    case 'sunRings':
      return (
        <div aria-hidden="true" style={layer}>
          {[420, 620, 840, 1080].map((s, i) => (
            <div
              key={s}
              style={{
                position: 'absolute',
                top: 360 - s / 2,
                left: 540 - s / 2,
                width: s,
                height: s,
                borderRadius: '50%',
                border: `2px solid ${withAlpha(i % 2 ? accent2 : accent, 0.22 - i * 0.03)}`,
              }}
            />
          ))}
        </div>
      );

    case 'stripes':
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            background: `repeating-linear-gradient(-45deg, ${withAlpha(accent, 0.10)} 0 36px, transparent 36px 96px)`,
          }}
        />
      );

    case 'leaves':
      return (
        <div aria-hidden="true" style={layer}>
          {[
            [120, 1320, 18],
            [840, 300, -24],
            [300, 760, 40],
            [920, 1500, 12],
            [200, 240, -16],
            [700, 1080, 30],
          ].map(([left, top, rot], i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width: 120,
                height: 120,
                background: withAlpha(i % 2 ? accent2 : accent, 0.16),
                transform: `rotate(${rot}deg)`,
                clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
              }}
            />
          ))}
        </div>
      );

    case 'rain':
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            background: `repeating-linear-gradient(12deg, ${withAlpha(accent, 0.13)} 0 3px, transparent 3px 46px)`,
          }}
        />
      );

    case 'dots':
      return (
        <div
          aria-hidden="true"
          style={{
            ...layer,
            backgroundImage: `radial-gradient(${withAlpha(accent2, 0.30)} 7px, transparent 8px)`,
            backgroundSize: '74px 74px',
            opacity: 0.8,
          }}
        />
      );

    case 'sunBig':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              top: -180,
              right: -180,
              width: 720,
              height: 720,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(accent2, 0.55)}, ${withAlpha(accent, 0.10)} 60%, transparent 72%)`,
            }}
          />
          {[760, 980, 1200].map((s) => (
            <div
              key={s}
              style={{
                position: 'absolute',
                top: 100 - s / 2,
                right: 100 - s / 2,
                width: s,
                height: s,
                borderRadius: '50%',
                border: `2px solid ${withAlpha(accent, 0.16)}`,
              }}
            />
          ))}
        </div>
      );

    case 'tricolor':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(115deg, transparent 0 62%, ${withAlpha(accent, 0.18)} 62% 74%, ${withAlpha(accent2, 0.18)} 74% 86%, ${withAlpha('#CC2222', 0.20)} 86% 100%)`,
            }}
          />
        </div>
      );

    case 'kites':
      return (
        <div aria-hidden="true" style={layer}>
          {[
            [160, 360, 16],
            [780, 560, -18],
            [420, 1280, 24],
            [900, 1180, -12],
          ].map(([left, top, rot], i) => (
            <div key={i} style={{ position: 'absolute', left, top, transform: `rotate(${rot}deg)` }}>
              <div
                style={{
                  width: 150,
                  height: 150,
                  background: withAlpha(i % 2 ? accent2 : accent, 0.18),
                  clipPath: 'polygon(50% 0, 100% 38%, 50% 100%, 0 38%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 73,
                  top: 150,
                  width: 3,
                  height: 220,
                  background: withAlpha(accent, 0.18),
                }}
              />
            </div>
          ))}
        </div>
      );

    case 'rings':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              top: -260,
              left: -260,
              width: 760,
              height: 760,
              borderRadius: '50%',
              border: `60px solid ${withAlpha(accent, 0.12)}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -300,
              right: -200,
              width: 820,
              height: 820,
              borderRadius: '50%',
              border: `48px solid ${withAlpha(accent2, 0.12)}`,
            }}
          />
        </div>
      );

    case 'blocks':
      return (
        <div aria-hidden="true" style={layer}>
          {[
            [-80, 1380, 22, accent],
            [820, 220, -18, accent2],
            [560, 1560, 14, accent2],
            [-40, 360, -10, accent],
          ].map(([left, top, rot, c], i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width: 340,
                height: 180,
                background: withAlpha(c as string, 0.14),
                transform: `rotate(${rot}deg)`,
              }}
            />
          ))}
        </div>
      );

    case 'topo':
      return (
        <div aria-hidden="true" style={layer}>
          {[0, 70, 140, 210, 280, 350].map((off, i) => (
            <div
              key={off}
              style={{
                position: 'absolute',
                left: -200,
                right: -200,
                bottom: -420 + off,
                height: 760,
                borderRadius: '50% 50% 0 0',
                border: `2px solid ${withAlpha(i % 2 ? accent2 : accent, 0.16)}`,
                borderBottom: 'none',
              }}
            />
          ))}
        </div>
      );

    case 'snow':
      return (
        <div aria-hidden="true" style={layer}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(${withAlpha('#FFFFFF', 0.55)} 3px, transparent 4px), radial-gradient(${withAlpha(accent2, 0.40)} 5px, transparent 6px)`,
              backgroundSize: '90px 120px, 160px 200px',
              backgroundPosition: '0 0, 40px 60px',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -200,
              left: 540 - 360,
              width: 720,
              height: 720,
              borderRadius: '50%',
              border: `40px solid ${withAlpha(accent, 0.10)}`,
            }}
          />
        </div>
      );

    default:
      return null;
  }
}
