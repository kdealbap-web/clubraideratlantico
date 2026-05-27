import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { IconGift } from '../icons';
import { CUMPLE_ROLES } from './cumpleanos';

interface Cumple {
  id: string;
  nombre: string;
  apellido: string;
  day: number;
}

interface MemberRow {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nac: string | null;
}

/**
 * Cumpleañeros del mes. Solo miembros activos con fecha de nacimiento
 * registrada. Muestra nombre + día (sin año ni edad). Usado en el
 * cronograma público y como widget en el panel admin.
 */
export function CumpleanosMes({
  month,
  variant,
}: {
  month: number;
  variant: 'public' | 'admin';
}) {
  const [rows, setRows] = useState<Cumple[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, nombre, apellido, fecha_nac')
        .eq('estado', 'activo')
        .in('rol', CUMPLE_ROLES)
        .not('fecha_nac', 'is', null);
      if (!active) return;
      if (error) {
        setRows([]);
        return;
      }
      const list: Cumple[] = [];
      for (const m of (data ?? []) as MemberRow[]) {
        const f = m.fecha_nac;
        if (!f || f.length < 10) continue;
        const mm = Number(f.slice(5, 7));
        const dd = Number(f.slice(8, 10));
        if (mm === month && dd >= 1 && dd <= 31) {
          list.push({ id: m.id, nombre: m.nombre, apellido: m.apellido, day: dd });
        }
      }
      list.sort((a, b) => a.day - b.day || a.nombre.localeCompare(b.nombre));
      setRows(list);
    })();
    return () => {
      active = false;
    };
  }, [month]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month;
  const todayDay = today.getDate();

  return (
    <div
      style={{
        border: '1px solid var(--borde)',
        background: variant === 'admin' ? 'var(--dark-1)' : 'var(--dark-2)',
        padding: variant === 'admin' ? 18 : '20px 22px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
          <div className="kicker">· Cumpleaños del mes</div>
          <h3
            className="t-display"
            style={{ fontSize: variant === 'admin' ? 20 : 24, color: 'var(--blanco)', margin: 0, lineHeight: 1 }}
          >
            {isCurrentMonth ? 'Cumpleañeros' : 'Cumpleañeros del mes'}
          </h3>
        </div>
        {rows && rows.length > 0 ? (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-cond)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            {rows.length} {rows.length === 1 ? 'cumpleaños' : 'cumpleaños'}
          </span>
        ) : null}
      </header>

      {rows === null ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
          Cargando cumpleaños…
        </p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
          Ningún miembro activo cumple años este mes.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: variant === 'admin' ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 8,
          }}
        >
          {rows.map((c) => {
            const isToday = isCurrentMonth && c.day === todayDay;
            return (
              <li
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  background: isToday ? 'var(--rojo-soft)' : 'var(--dark-1)',
                  border: `1px solid ${isToday ? 'var(--rojo)' : 'var(--borde)'}`,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: isToday ? 'var(--rojo)' : 'var(--dark-2)',
                    border: `1px solid ${isToday ? 'var(--rojo)' : 'var(--borde-strong)'}`,
                    color: 'var(--blanco)',
                    fontFamily: 'var(--font-cond)',
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {String(c.day).padStart(2, '0')}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      color: 'var(--blanco)',
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.nombre} {c.apellido}
                  </span>
                  {isToday ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-cond)',
                        fontSize: 10,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--rojo)',
                        fontWeight: 700,
                      }}
                    >
                      · ¡Hoy es su cumpleaños!
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
