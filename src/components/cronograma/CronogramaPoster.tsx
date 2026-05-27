import { forwardRef, useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../types';
import { CLUB } from '../../lib/constants';
import { displayEstado } from '../../lib/eventStatus';
import {
  type PosterTheme,
  chipClipPath,
  chipRadius,
  getPosterTheme,
  PosterDecor,
  withAlpha,
} from './cronogramaThemes';

export const MESES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
] as const;

const DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'] as const;

const W = 1080;
const H = 1920;

interface CronogramaPosterProps {
  mes: string;
  year: number;
  events: EventItem[];
  /** Mes 1-12 — selecciona el tema. Si falta, se deriva de `mes`. */
  monthNum?: number;
  tagline?: string;
  highlight?: string;
  /** Scale fijo. Si presente, ignora responsive. */
  scale?: number;
  /** Si true, escala automáticamente con el ancho del contenedor (no del viewport). */
  responsive?: boolean;
}

export const CronogramaPoster = forwardRef<HTMLDivElement, CronogramaPosterProps>(
  function CronogramaPoster(
    {
      mes,
      year,
      events,
      monthNum,
      tagline = '¡Súbete A La Aventura!',
      highlight = 'Todos juntos.',
      scale,
      responsive = true,
    },
    ref,
  ) {
    const theme = getPosterTheme(monthNum ?? MESES.indexOf(mes.toUpperCase() as (typeof MESES)[number]) + 1);

    // Modo responsive con ResizeObserver: medimos el contenedor real, no el viewport.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [autoScale, setAutoScale] = useState<number | null>(null);

    useEffect(() => {
      if (!responsive || scale != null) return;
      const wrap = wrapperRef.current;
      if (!wrap) return;
      const obs = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = entry.contentRect.width;
        setAutoScale(Math.max(0, Math.min(0.5, w / W)));
      });
      obs.observe(wrap);
      return () => obs.disconnect();
    }, [responsive, scale]);

    // Modo responsive: wrapper con altura calculada, poster interno escalado
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
            background: theme.bg,
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
              background: theme.bg,
              overflow: 'hidden',
              color: '#F0EDE8',
              fontFamily: 'var(--font-body)',
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
            }}
          >
            <PosterContents
              mes={mes}
              year={year}
              events={events}
              tagline={tagline}
              highlight={highlight}
              theme={theme}
            />
          </div>
        </div>
      );
    }

    // Modo fijo (export, html-to-image): tamaño completo 1080×1920
    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          background: theme.bg,
          overflow: 'hidden',
          color: '#F0EDE8',
          fontFamily: 'var(--font-body)',
          transform: scale != null ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          flexShrink: 0,
        }}
      >
        <PosterContents
          mes={mes}
          year={year}
          events={events}
          tagline={tagline}
          highlight={highlight}
          theme={theme}
        />
      </div>
    );
  },
);

// ─── Contenido del poster (compartido entre responsive y fijo) ───────────
function PosterContents({
  mes,
  year,
  events,
  tagline,
  highlight,
  theme,
}: {
  mes: string;
  year: number;
  events: EventItem[];
  tagline: string;
  highlight: string;
  theme: PosterTheme;
}) {
  // Mes gigante: escala el tamaño según el largo del nombre para que
  // siempre quepa en una línea (ENERO grande, SEPTIEMBRE más pequeño).
  const monthFontSize = Math.min(260, Math.round(980 / (Math.max(mes.length, 1) * 0.58)));
  const left = theme.align === 'left';

  return (
    <>
      {/* Background blurred logo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `url('/logo.png') center/700px no-repeat`,
          filter: 'blur(60px)',
          opacity: theme.logoOpacity,
        }}
      />

      {/* Capa decorativa del mes */}
      <PosterDecor theme={theme} />

      {/* Gradiente inferior con el acento del mes */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '68%',
          background: `linear-gradient(180deg, transparent 0%, ${withAlpha(
            theme.accent,
            0.5,
          )} 70%, ${withAlpha(theme.accent, 0.82)} 100%)`,
        }}
      />

      {/* Logo + título */}
      <div
        style={{
          position: 'relative',
          paddingTop: 120,
          paddingLeft: left ? 90 : 0,
          paddingRight: left ? 90 : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: left ? 'flex-start' : 'center',
          gap: 28,
        }}
      >
        <img
          src="/logo.png"
          alt="Club Raider Atlántico"
          width={300}
          height={300}
          style={{ display: 'block', filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.45))' }}
          crossOrigin="anonymous"
        />

        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: '0.45em',
            color: theme.accent,
            textTransform: 'uppercase',
            textAlign: left ? 'left' : 'center',
            paddingLeft: '0.45em',
          }}
        >
          Cronograma
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: monthFontSize,
            lineHeight: 0.95,
            color: theme.monthColor,
            letterSpacing: '-0.02em',
            textAlign: left ? 'left' : 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.45)',
            whiteSpace: 'nowrap',
          }}
        >
          {mes}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 36,
            letterSpacing: '0.32em',
            color: 'rgba(240,237,232,0.7)',
            textTransform: 'uppercase',
            marginTop: -18,
          }}
        >
          {year}
        </div>
      </div>

      {/* Lista de eventos */}
      <div
        style={{
          position: 'relative',
          marginTop: 50,
          padding: '0 90px',
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {events.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(240,237,232,0.85)',
              fontFamily: 'var(--font-cond)',
              fontSize: 32,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '60px 0',
            }}
          >
            · Por publicar próximamente ·
          </div>
        ) : (
          events.map((e) => <PosterEventRow key={e.id} ev={e} theme={theme} />)
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '40px 60px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 36,
                height: 36,
                background: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 8,
                color: '#0a0a0a',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              ◉
            </span>
            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontWeight: 600,
                fontSize: 30,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
              }}
            >
              {CLUB.social.instagram.handle.replace('@', '')}
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24 }}>|</span>
          <div
            style={{
              background: '#0a0a0a',
              color: '#FFFFFF',
              padding: '12px 22px',
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            RAIDER<span style={{ color: '#CC2222' }}> ATLÁNTICO</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 14,
                height: 30,
                background: theme.accent,
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontWeight: 600,
                fontSize: 30,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
              }}
            >
              {highlight}
            </span>
          </div>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 38,
            color: '#FFFFFF',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {tagline}
        </div>
      </div>
    </>
  );
}

function PosterEventRow({ ev, theme }: { ev: EventItem; theme: PosterTheme }) {
  const d = new Date(ev.fecha);
  const dia = Number.isNaN(d.getTime()) ? '—' : d.getUTCDate();
  const dow = Number.isNaN(d.getTime()) ? '—' : (DIAS_CORTO[d.getUTCDay()] ?? '—');
  const sub = ev.salida ? `${ev.salida}${ev.hora ? ` / ${ev.hora}` : ''}` : ev.hora ?? '';

  const estado = displayEstado(ev);
  const cancelado = estado === 'cancelado';
  const realizado = estado === 'realizado';
  const muted = cancelado || realizado;

  const chipBg = cancelado ? withAlpha('#FFFFFF', 0.16) : realizado ? withAlpha(theme.accent, 0.5) : theme.accent;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, opacity: muted ? 0.82 : 1 }}>
      <div
        style={{
          flexShrink: 0,
          background: chipBg,
          color: '#FFFFFF',
          padding: '18px 32px',
          borderRadius: chipRadius(theme.chip),
          clipPath: chipClipPath(theme.chip),
          minWidth: 200,
          textAlign: 'center',
          fontFamily: 'var(--font-cond)',
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
        }}
      >
        {dow}. {String(dia).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontWeight: 700,
              fontSize: 50,
              color: cancelado ? 'rgba(255,255,255,0.7)' : '#FFFFFF',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              lineHeight: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.45)',
              textDecoration: cancelado ? 'line-through' : 'none',
              textDecorationThickness: cancelado ? 4 : undefined,
            }}
          >
            {ev.titulo}
          </div>
          {cancelado ? <StatusStamp label="Cancelado" bg="#FFFFFF" color="#0a0a0a" /> : null}
          {realizado ? <StatusStamp label="✓ Realizado" bg={theme.accent} color="#FFFFFF" /> : null}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 28,
              color: cancelado ? 'rgba(255,255,255,0.55)' : theme.accent,
              marginTop: 6,
              textShadow: '0 2px 6px rgba(0,0,0,0.3)',
              textDecoration: cancelado ? 'line-through' : 'none',
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusStamp({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        flexShrink: 0,
        background: bg,
        color,
        padding: '6px 16px',
        borderRadius: 6,
        fontFamily: 'var(--font-cond)',
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}
