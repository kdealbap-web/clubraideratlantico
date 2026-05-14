import { useEffect, useRef, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { supabase } from '../../lib/supabase';
import { CLUB } from '../../lib/constants';
import { PageHeader } from '../../components/admin/PageHeader';
import { Btn } from '../../components/admin/Buttons';
import { IconDownload, IconWhatsApp } from '../../components/icons';
import { CronogramaPoster, MESES } from '../../components/cronograma/CronogramaPoster';
import type { EventItem } from '../../types';

export function CronogramaPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
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
      link.download = `cronograma-${(MESES[month - 1] ?? 'mes').toLowerCase()}-${year}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert(
        `No se pudo exportar: ${e instanceof Error ? e.message : 'error desconocido'}.\n\nNota: si hay imágenes externas con CORS, el download puede fallar.`,
      );
    } finally {
      setExporting(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);
  const monthLabel = MESES[month - 1] ?? '';

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
        También aparece publicado en <strong style={{ color: 'var(--rojo)' }}>/cronograma</strong>{' '}
        del sitio público, con la misma información en vivo.
      </p>

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
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </Control>
        <Control label="Año">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={selectStyle}
          >
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
          · Preview · 1080×1920 · vertical Instagram story
        </div>

        <CronogramaPoster
          ref={posterRef}
          mes={monthLabel}
          year={year}
          events={events ?? []}
          tagline={tagline}
          highlight={highlight}
          responsive
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
            No hay eventos publicados para {monthLabel} {year}. Crea eventos en{' '}
            <strong style={{ color: 'var(--rojo)' }}>/admin/eventos</strong> con estado
            "publicado" y fecha dentro de este mes.
          </div>
        ) : null}

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

const inputStyle: React.CSSProperties = { ...selectStyle };

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
