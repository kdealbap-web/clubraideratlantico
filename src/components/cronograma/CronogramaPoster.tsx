import { forwardRef, useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../types';
import { CLUB } from '../../lib/constants';

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
      tagline = '¡Súbete A La Aventura!',
      highlight = 'Todos juntos.',
      scale,
      responsive = true,
    },
    ref,
  ) {
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
            background: '#0a0a0a',
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
              background: '#0a0a0a',
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
          background: '#0a0a0a',
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
}: {
  mes: string;
  year: number;
  events: EventItem[];
  tagline: string;
  highlight: string;
}) {
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
          opacity: 0.45,
        }}
      />
      {/* Red gradient bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '68%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(204,34,34,0.55) 70%, rgba(204,34,34,0.85) 100%)',
        }}
      />

      {/* Logo + título */}
      <div
        style={{
          position: 'relative',
          paddingTop: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
            color: '#CC2222',
            textTransform: 'uppercase',
            textAlign: 'center',
            paddingLeft: '0.45em',
          }}
        >
          Cronograma
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 260,
            lineHeight: 0.95,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            textShadow: '0 6px 30px rgba(0,0,0,0.45)',
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
          events.map((e) => <PosterEventRow key={e.id} ev={e} />)
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
                background: '#CC2222',
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

function PosterEventRow({ ev }: { ev: EventItem }) {
  const d = new Date(ev.fecha);
  const dia = Number.isNaN(d.getTime()) ? '—' : d.getUTCDate();
  const dow = Number.isNaN(d.getTime()) ? '—' : (DIAS_CORTO[d.getUTCDay()] ?? '—');
  const sub = ev.salida ? `${ev.salida}${ev.hora ? ` / ${ev.hora}` : ''}` : ev.hora ?? '';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
      <div
        style={{
          flexShrink: 0,
          background: '#CC2222',
          color: '#FFFFFF',
          padding: '18px 32px',
          borderRadius: 999,
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
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontWeight: 700,
            fontSize: 50,
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            lineHeight: 1,
            textShadow: '0 2px 8px rgba(0,0,0,0.45)',
          }}
        >
          {ev.titulo}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 28,
              color: '#CC2222',
              marginTop: 6,
              textShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}
