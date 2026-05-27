import { forwardRef, useEffect, useRef, useState } from 'react';
import { CLUB } from '../../lib/constants';
import { withAlpha } from './cronogramaThemes';

const W = 1080;
const H = 1920;

// ─── Fondos genéricos estilo motero ──────────────────────────────
export type CumpleBgKey = 'asfalto' | 'velocidad' | 'ruta' | 'neon' | 'fuego';

interface BgVariant {
  key: CumpleBgKey;
  label: string;
  /** background css de la base. */
  bg: string;
  /** color sólido para el export (fallback). */
  bgSolid: string;
  accent: string;
  accent2: string;
  headline: string;
  nameColor: string;
}

export const CUMPLE_BG_VARIANTS: BgVariant[] = [
  {
    key: 'asfalto',
    label: 'Asfalto',
    bg: 'linear-gradient(180deg, #1d1d20 0%, #111113 55%, #0a0a0a 100%)',
    bgSolid: '#111113',
    accent: '#CC2222',
    accent2: '#F2C744',
    headline: '#FFFFFF',
    nameColor: '#F2C744',
  },
  {
    key: 'velocidad',
    label: 'Velocidad',
    bg: 'linear-gradient(135deg, #1a0d08 0%, #0a0a0a 60%, #160a06 100%)',
    bgSolid: '#0f0a08',
    accent: '#FF6A1E',
    accent2: '#FFC93F',
    headline: '#FFFFFF',
    nameColor: '#FF6A1E',
  },
  {
    key: 'ruta',
    label: 'Ruta al atardecer',
    bg: 'linear-gradient(180deg, #160a22 0%, #3a1638 32%, #8a3a2e 58%, #1a0e14 100%)',
    bgSolid: '#1a0e1c',
    accent: '#FFB020',
    accent2: '#FF5A4D',
    headline: '#FFFFFF',
    nameColor: '#FFE0A3',
  },
  {
    key: 'neon',
    label: 'Neón',
    bg: 'linear-gradient(180deg, #07070f 0%, #0c0a1a 60%, #050509 100%)',
    bgSolid: '#08080f',
    accent: '#2ED1FF',
    accent2: '#FF4FA3',
    headline: '#FFFFFF',
    nameColor: '#2ED1FF',
  },
  {
    key: 'fuego',
    label: 'Brasa',
    bg: 'linear-gradient(180deg, #2a0808 0%, #160505 55%, #0a0202 100%)',
    bgSolid: '#160505',
    accent: '#FF3D2E',
    accent2: '#FFB020',
    headline: '#FFFFFF',
    nameColor: '#FFB020',
  },
];

export function getCumpleVariant(index: number): BgVariant {
  const n = CUMPLE_BG_VARIANTS.length;
  const i = ((Math.round(index) % n) + n) % n;
  return CUMPLE_BG_VARIANTS[i] ?? CUMPLE_BG_VARIANTS[0]!;
}

const decorLayer = {
  position: 'absolute' as const,
  inset: 0,
  overflow: 'hidden' as const,
  pointerEvents: 'none' as const,
};

function CumpleDecor({ v }: { v: BgVariant }) {
  const { key, accent, accent2 } = v;

  switch (key) {
    case 'asfalto':
      return (
        <div aria-hidden="true" style={decorLayer}>
          {/* Línea central de carretera */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: 120,
              transform: 'translateX(-50%)',
              background: `repeating-linear-gradient(180deg, ${withAlpha(accent2, 0.18)} 0 90px, transparent 90px 230px)`,
            }}
          />
          {/* Resplandor rojo superior */}
          <div
            style={{
              position: 'absolute',
              top: -240,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1000,
              height: 700,
              background: `radial-gradient(ellipse, ${withAlpha(accent, 0.32)}, transparent 70%)`,
            }}
          />
        </div>
      );

    case 'velocidad':
      return (
        <div
          aria-hidden="true"
          style={{
            ...decorLayer,
            background: `repeating-linear-gradient(-22deg, ${withAlpha(accent, 0.12)} 0 22px, transparent 22px 92px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 120,
              right: -120,
              width: 900,
              height: 360,
              transform: 'rotate(-22deg)',
              background: `linear-gradient(90deg, transparent, ${withAlpha(accent2, 0.16)})`,
            }}
          />
        </div>
      );

    case 'ruta':
      return (
        <div aria-hidden="true" style={decorLayer}>
          {/* Sol */}
          <div
            style={{
              position: 'absolute',
              top: 560,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 460,
              height: 460,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha('#FFE0A3', 0.85)}, ${withAlpha(accent, 0.25)} 60%, transparent 72%)`,
            }}
          />
          {/* Montañas */}
          <div
            style={{
              position: 'absolute',
              left: -100,
              right: -100,
              bottom: 0,
              height: 520,
              background: '#120a12',
              clipPath: 'polygon(0 60%, 18% 22%, 34% 56%, 52% 14%, 70% 50%, 86% 26%, 100% 58%, 100% 100%, 0 100%)',
            }}
          />
        </div>
      );

    case 'neon':
      return (
        <div aria-hidden="true" style={decorLayer}>
          {[420, 640, 880].map((s, i) => (
            <div
              key={s}
              style={{
                position: 'absolute',
                top: 420 - s / 2,
                left: 540 - s / 2,
                width: s,
                height: s,
                borderRadius: '50%',
                border: `3px solid ${withAlpha(i % 2 ? accent2 : accent, 0.3)}`,
                boxShadow: `0 0 40px ${withAlpha(i % 2 ? accent2 : accent, 0.25)}`,
              }}
            />
          ))}
          {/* Piso en perspectiva */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 520,
              background: `repeating-linear-gradient(90deg, ${withAlpha(accent, 0.18)} 0 2px, transparent 2px 120px)`,
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'bottom',
              opacity: 0.5,
            }}
          />
        </div>
      );

    case 'fuego':
      return (
        <div aria-hidden="true" style={decorLayer}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '60%',
              background: `radial-gradient(ellipse at 50% 100%, ${withAlpha(accent, 0.5)}, transparent 70%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(${withAlpha(accent2, 0.5)} 3px, transparent 4px)`,
              backgroundSize: '120px 160px',
              opacity: 0.35,
            }}
          />
        </div>
      );

    default:
      return null;
  }
}

// ─── Cálculo de tamaño de nombres ────────────────────────────────
function nameFontSize(count: number, longest: number): number {
  let base = count <= 1 ? 128 : count === 2 ? 100 : count <= 4 ? 76 : count <= 6 ? 58 : 46;
  const maxChars = 16;
  if (longest > maxChars) base = Math.max(38, Math.round((base * maxChars) / longest));
  return base;
}

interface CumpleanosPosterProps {
  /** Nombres de los cumpleañeros del día. */
  nombres: string[];
  /** Etiqueta de fecha, ej. "Hoy · 12 de mayo". */
  fechaLabel: string;
  /** Mensaje de felicitación. */
  mensaje: string;
  /** Índice del fondo (se normaliza). */
  variant?: number;
  scale?: number;
  responsive?: boolean;
}

export const CumpleanosPoster = forwardRef<HTMLDivElement, CumpleanosPosterProps>(
  function CumpleanosPoster(
    { nombres, fechaLabel, mensaje, variant = 0, scale, responsive = true },
    ref,
  ) {
    const v = getCumpleVariant(variant);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [autoScale, setAutoScale] = useState<number | null>(null);

    useEffect(() => {
      if (!responsive || scale != null) return;
      const wrap = wrapperRef.current;
      if (!wrap) return;
      const obs = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        setAutoScale(Math.max(0, Math.min(0.5, entry.contentRect.width / W)));
      });
      obs.observe(wrap);
      return () => obs.disconnect();
    }, [responsive, scale]);

    if (responsive && scale == null) {
      const effectiveScale = autoScale ?? 0;
      return (
        <div
          ref={wrapperRef}
          style={{
            width: '100%',
            maxWidth: W,
            height: autoScale == null ? 0 : H * autoScale,
            position: 'relative',
            overflow: 'hidden',
            background: v.bgSolid,
            transition: 'height .25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            ref={ref}
            style={{
              width: W,
              height: H,
              position: 'absolute',
              top: 0,
              left: 0,
              background: v.bg,
              overflow: 'hidden',
              color: '#F0EDE8',
              fontFamily: 'var(--font-body)',
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
            }}
          >
            <PosterContents v={v} nombres={nombres} fechaLabel={fechaLabel} mensaje={mensaje} />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          background: v.bg,
          overflow: 'hidden',
          color: '#F0EDE8',
          fontFamily: 'var(--font-body)',
          transform: scale != null ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          flexShrink: 0,
        }}
      >
        <PosterContents v={v} nombres={nombres} fechaLabel={fechaLabel} mensaje={mensaje} />
      </div>
    );
  },
);

function PosterContents({
  v,
  nombres,
  fechaLabel,
  mensaje,
}: {
  v: BgVariant;
  nombres: string[];
  fechaLabel: string;
  mensaje: string;
}) {
  const longest = nombres.reduce((m, n) => Math.max(m, n.length), 0);
  const fs = nameFontSize(nombres.length, longest);

  return (
    <>
      <CumpleDecor v={v} />

      {/* Viñeta para legibilidad */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '110px 80px 90px',
        }}
      >
        {/* Logo + club */}
        <img
          src="/logo.png"
          alt="Club Raider Atlántico"
          width={170}
          height={170}
          style={{ display: 'block', filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))' }}
          crossOrigin="anonymous"
        />
        <div
          style={{
            marginTop: 14,
            fontFamily: 'var(--font-cond)',
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: '0.42em',
            color: withAlpha('#FFFFFF', 0.78),
            textTransform: 'uppercase',
            paddingLeft: '0.42em',
          }}
        >
          Club Raider Atlántico
        </div>

        {/* Panel central */}
        <div
          style={{
            marginTop: 56,
            width: '100%',
            background: 'rgba(8,8,8,0.5)',
            border: `1px solid ${withAlpha(v.accent, 0.55)}`,
            borderTop: `6px solid ${v.accent}`,
            padding: '54px 48px 60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 26,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 96,
              lineHeight: 0.92,
              textAlign: 'center',
              color: v.headline,
              letterSpacing: '-0.01em',
              textShadow: '0 4px 18px rgba(0,0,0,0.6)',
            }}
          >
            ¡Feliz <span style={{ color: v.accent, fontStyle: 'italic' }}>cumpleaños!</span>
          </div>

          {/* Chip de fecha */}
          <div
            style={{
              background: v.accent,
              color: '#FFFFFF',
              padding: '12px 28px',
              borderRadius: 999,
              fontFamily: 'var(--font-cond)',
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
            }}
          >
            {fechaLabel}
          </div>

          <div
            aria-hidden="true"
            style={{ width: 90, height: 4, background: withAlpha(v.accent2, 0.8), marginTop: 4 }}
          />

          {/* Nombres */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: nombres.length > 4 ? 12 : 18,
              width: '100%',
            }}
          >
            {nombres.length === 0 ? (
              <div
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 34,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: withAlpha('#FFFFFF', 0.7),
                  textAlign: 'center',
                  padding: '24px 0',
                }}
              >
                · Sin cumpleaños este día ·
              </div>
            ) : (
              nombres.map((n, i) => (
                <div
                  key={`${n}-${i}`}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: fs,
                    lineHeight: 1.02,
                    color: v.nameColor,
                    textAlign: 'center',
                    textShadow: '0 3px 14px rgba(0,0,0,0.6)',
                    maxWidth: '100%',
                  }}
                >
                  {n}
                </div>
              ))
            )}
          </div>

          {/* Mensaje */}
          {mensaje ? (
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 34,
                lineHeight: 1.45,
                color: withAlpha('#FFFFFF', 0.92),
                textAlign: 'center',
                maxWidth: 720,
                textShadow: '0 2px 10px rgba(0,0,0,0.55)',
              }}
            >
              {mensaje}
            </p>
          ) : null}
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: '#0a0a0a',
              color: '#FFFFFF',
              padding: '12px 24px',
              fontFamily: 'var(--font-display)',
              fontSize: 34,
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            RAIDER<span style={{ color: '#CC2222' }}> ATLÁNTICO</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontWeight: 600,
              fontSize: 26,
              letterSpacing: '0.16em',
              color: withAlpha('#FFFFFF', 0.8),
              textTransform: 'uppercase',
            }}
          >
            {CLUB.social.instagram.handle.replace('@', '')} · Kilómetros de hermandad
          </div>
        </div>
      </div>
    </>
  );
}
