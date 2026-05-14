import { useEffect, useRef, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { supabase } from '../../lib/supabase';
import { CLUB } from '../../lib/constants';
import { PageHeader } from '../../components/admin/PageHeader';
import { Btn } from '../../components/admin/Buttons';
import { IconDownload, IconWhatsApp } from '../../components/icons';
import type { EventItem } from '../../types';

const MESES = [
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

export function CronogramaPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [tagline, setTagline] = useState('¡Súbete A La Aventura!');
  const [highlight, setHighlight] = useState('Todos juntos.');

  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .gte('fecha', start)
        .lte('fecha', end)
        .in('estado', ['publicado', 'realizado'])
        .order('fecha', { ascending: true });
      if (!active) return;
      if (e) {
        setError(e.message);
        setEvents([]);
      } else {
        setEvents((data ?? []) as EventItem[]);
      }
    })();
    return () => {
      active = false;
    };
  }, [year, month]);

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const fn = format === 'png' ? toPng : toJpeg;
      const dataUrl = await fn(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: format === 'jpg' ? 0.95 : undefined,
        backgroundColor: '#0a0a0a',
      });
      const link = document.createElement('a');
      link.download = `cronograma-${(MESES[month - 1] ?? '').toLowerCase()}-${year}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert(
        `No se pudo exportar: ${e instanceof Error ? e.message : 'error desconocido'}.\n\nNota: si las imágenes externas dan CORS, el download puede fallar. Quita las imágenes externas o asegúrate de que vivan en el bucket gallery (mismo origen).`,
      );
    } finally {
      setExporting(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);

  return (
    <section>
      <PageHeader
        kicker="Comunicación"
        title="Cronograma del mes."
        actions={
          <>
            <Btn
              variant="ghost"
              icon={<IconDownload size={12} />}
              onClick={() => void handleDownload('jpg')}
              disabled={exporting || !events}
            >
              {exporting ? 'Exportando…' : 'Descargar JPG'}
            </Btn>
            <Btn
              icon={<IconDownload size={12} />}
              onClick={() => void handleDownload('png')}
              disabled={exporting || !events}
            >
              {exporting ? 'Exportando…' : 'Descargar PNG'}
            </Btn>
          </>
        }
      />

      <p style={{ color: 'var(--light)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
        Genera el poster del mes para compartir en Instagram Stories, WhatsApp o Facebook.
        Selecciona mes, edita el tagline si quieres, y descarga como imagen 1080×1920.
      </p>

      {/* Controles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
          padding: 18,
          background: 'var(--dark-1)',
          border: '1px solid var(--borde)',
        }}
      >
        <Control label="Mes">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={selectStyle}>
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </Control>
        <Control label="Año">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={selectStyle}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Control>
        <Control label="Tagline pequeño (lado derecho)">
          <input
            type="text"
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Todos juntos."
            style={inputStyle}
          />
        </Control>
        <Control label="Tagline final (bajo logo)">
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="¡Súbete A La Aventura!"
            style={inputStyle}
          />
        </Control>
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo-light)',
            padding: '12px 14px',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Supabase: {error}
        </div>
      ) : null}

      {/* Preview */}
      <div
        style={{
          background: 'var(--dark-2)',
          border: '1px solid var(--borde)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div className="kicker" style={{ alignSelf: 'flex-start' }}>
          · Preview · 1080×1920 (vertical Instagram story)
        </div>

        <CronogramaPoster
          ref={posterRef}
          mes={(MESES[month - 1] ?? '')}
          year={year}
          events={events ?? []}
          tagline={tagline}
          highlight={highlight}
        />

        {events && events.length === 0 ? (
          <div
            style={{
              color: 'var(--muted)',
              fontSize: 13,
              fontStyle: 'italic',
              padding: 12,
            }}
          >
            No hay eventos publicados para {(MESES[month - 1] ?? '')} {year}. Crea o publica eventos en{' '}
            <strong style={{ color: 'var(--rojo)' }}>/admin/eventos</strong> con fechas dentro de este
            mes para que aparezcan acá.
          </div>
        ) : null}

        {/* Share Helpers */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignSelf: 'stretch',
            marginTop: 6,
          }}
        >
          <a
            href={CLUB.social.whatsapp.url}
            target="_blank"
            rel="noreferrer"
            style={waBtn}
          >
            <IconWhatsApp size={14} /> Abrir grupo WhatsApp
          </a>
          <a
            href={CLUB.social.instagram.url}
            target="_blank"
            rel="noreferrer"
            style={igBtn}
          >
            Subir a Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Poster vertical 1080x1920 ───────────────────────────────────────────
interface PosterProps {
  mes: string;
  year: number;
  events: EventItem[];
  tagline: string;
  highlight: string;
}

const CronogramaPoster = (() => {
  const Poster = (
    { mes, year, events, tagline, highlight }: PosterProps,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const W = 1080;
    const H = 1920;

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
          // escalado responsive en preview
          transform: 'scale(min(0.45, calc((100vw - 80px) / 1080)))',
          transformOrigin: 'top center',
          marginBottom: 'calc(-1920px * (1 - min(0.45, (100vw - 80px) / 1080)))',
          flexShrink: 0,
        }}
      >
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
        {/* Red gradient overlay bottom */}
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

        {/* Logo arriba */}
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
            events.map((e) => <EventRow key={e.id} ev={e} />)
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
      </div>
    );
  };
  Poster.displayName = 'CronogramaPoster';
  // Forward ref through a small wrapper
  return (props: PosterProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const { ref, ...rest } = props;
    return Poster(rest, ref ?? null);
  };
})();

function EventRow({ ev }: { ev: EventItem }) {
  const d = new Date(ev.fecha);
  const dia = Number.isNaN(d.getTime()) ? '—' : d.getUTCDate();
  const dow = Number.isNaN(d.getTime()) ? '—' : (DIAS_CORTO[d.getUTCDay()] ?? '—');
  const sub = ev.salida ? `${ev.salida}${ev.hora ? ` / ${ev.hora}` : ''}` : ev.hora ?? '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 32,
        position: 'relative',
      }}
    >
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

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="kicker" style={{ fontSize: 10 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const selectStyle: React.CSSProperties = {
  height: 38,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
};

const waBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: '#25D366',
  color: '#fff',
  padding: '12px 18px',
  textDecoration: 'none',
  fontFamily: 'var(--font-cond)',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const igBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background:
    'linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)',
  color: '#fff',
  padding: '12px 18px',
  textDecoration: 'none',
  fontFamily: 'var(--font-cond)',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
};
