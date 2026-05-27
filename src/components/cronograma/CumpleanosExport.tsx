import { useEffect, useRef, useState } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { supabase } from '../../lib/supabase';
import { CLUB } from '../../lib/constants';
import { Btn } from '../admin/Buttons';
import { IconDownload, IconGift, IconWhatsApp } from '../icons';
import { CUMPLE_ROLES } from './cumpleanos';
import { CUMPLE_BG_VARIANTS, CumpleanosPoster, getCumpleVariant } from './CumpleanosPoster';

const MENSAJE_DEFAULT =
  'Que este nuevo año de vida venga cargado de bendiciones, salud y kilómetros seguros. ' +
  'Toda la familia Raider te abraza y te desea los mejores caminos. ¡A celebrar!';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface MemberRow {
  nombre: string;
  apellido: string;
  fecha_nac: string | null;
}

/**
 * Generador de imagen de felicitación de cumpleaños por día.
 * Solo para el panel admin: el administrador elige el día, ve quién
 * cumple años, ajusta el fondo y el mensaje, y descarga la imagen
 * para compartirla.
 */
export function CumpleanosExport() {
  const [date, setDate] = useState(todayStr());
  const [variant, setVariant] = useState(0);
  const [mensaje, setMensaje] = useState(MENSAJE_DEFAULT);
  const [nombres, setNombres] = useState<string[] | null>(null);
  const [exporting, setExporting] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('members')
        .select('nombre, apellido, fecha_nac')
        .eq('estado', 'activo')
        .in('rol', CUMPLE_ROLES)
        .not('fecha_nac', 'is', null);
      if (!active) return;
      if (error) {
        setNombres([]);
        return;
      }
      const mm = Number(date.slice(5, 7));
      const dd = Number(date.slice(8, 10));
      const out: string[] = [];
      for (const m of (data ?? []) as MemberRow[]) {
        const f = m.fecha_nac;
        if (!f || f.length < 10) continue;
        if (Number(f.slice(5, 7)) === mm && Number(f.slice(8, 10)) === dd) {
          out.push(`${m.nombre} ${m.apellido}`.trim());
        }
      }
      out.sort((a, b) => a.localeCompare(b));
      setNombres(out);
    })();
    return () => {
      active = false;
    };
  }, [date]);

  const parts = date.split('-').map(Number);
  const dObj = new Date(parts[0] ?? 2000, (parts[1] ?? 1) - 1, parts[2] ?? 1);
  const labelDia = Number.isNaN(dObj.getTime())
    ? date
    : dObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  const esHoy = date === todayStr();
  const fechaLabel = `${esHoy ? 'Hoy · ' : ''}${labelDia}`;

  const lista = nombres ?? [];
  const hayCumple = lista.length > 0;
  const variantLabel = getCumpleVariant(variant).label;

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!posterRef.current || !hayCumple) return;
    setExporting(true);
    try {
      const fn = format === 'png' ? toPng : toJpeg;
      const dataUrl = await fn(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: format === 'jpg' ? 0.95 : undefined,
        backgroundColor: getCumpleVariant(variant).bgSolid,
      });
      const link = document.createElement('a');
      link.download = `cumpleanos-${date}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert(`No se pudo exportar: ${e instanceof Error ? e.message : 'error desconocido'}.`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section
      style={{
        background: 'var(--dark-2)',
        border: '1px solid var(--borde)',
        padding: 24,
        marginTop: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo)',
            border: '1px solid var(--rojo)',
            flexShrink: 0,
          }}
        >
          <IconGift size={18} />
        </span>
        <div>
          <div className="kicker">· Comunicación · Cumpleaños</div>
          <h3 className="t-display" style={{ fontSize: 22, color: 'var(--blanco)', margin: 0, lineHeight: 1 }}>
            Felicitación del día
          </h3>
        </div>
      </header>

      <p style={{ color: 'var(--light)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        Genera una imagen de felicitación con los cumpleañeros de un día específico para compartir
        en redes o en el grupo de WhatsApp. Cambia el fondo y el mensaje a tu gusto.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          padding: 18,
          background: 'var(--dark-1)',
          border: '1px solid var(--borde)',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="kicker" style={{ fontSize: 10 }}>
            Día
          </span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="kicker" style={{ fontSize: 10 }}>
            Fondo · {variantLabel} ({(variant % CUMPLE_BG_VARIANTS.length) + 1}/{CUMPLE_BG_VARIANTS.length})
          </span>
          <Btn variant="ghost" onClick={() => setVariant((x) => x + 1)}>
            Cambiar fondo →
          </Btn>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <span className="kicker" style={{ fontSize: 10 }}>
            Mensaje de felicitación
          </span>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div className="kicker" style={{ alignSelf: 'flex-start' }}>
          · Preview · 1080×1920 · {hayCumple ? `${lista.length} cumpleañero${lista.length > 1 ? 's' : ''}` : 'sin cumpleaños'}
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            justifyContent: 'center',
            background: 'var(--dark-1)',
            border: '1px solid var(--borde)',
            overflow: 'hidden',
            padding: 14,
          }}
        >
          <CumpleanosPoster
            ref={posterRef}
            nombres={lista}
            fechaLabel={fechaLabel}
            mensaje={mensaje}
            variant={variant}
            responsive
          />
        </div>

        {nombres !== null && !hayCumple ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
            Nadie cumple años el {labelDia}. Elige otro día con cumpleañeros para poder exportar.
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'stretch', justifyContent: 'center' }}>
          <Btn
            variant="ghost"
            icon={<IconDownload size={12} />}
            onClick={() => void handleDownload('jpg')}
            disabled={exporting || !hayCumple}
          >
            {exporting ? 'Exportando…' : 'Descargar JPG'}
          </Btn>
          <Btn
            icon={<IconDownload size={12} />}
            onClick={() => void handleDownload('png')}
            disabled={exporting || !hayCumple}
          >
            {exporting ? 'Exportando…' : 'Descargar PNG'}
          </Btn>
          <a href={CLUB.social.whatsapp.url} target="_blank" rel="noreferrer" style={waBtn}>
            <IconWhatsApp size={14} /> Abrir grupo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  height: 38,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
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
