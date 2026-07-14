import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { downloadCSV } from '../../lib/csv';
import { Btn } from '../admin/Buttons';
import { IconDownload } from '../icons';
import { ROL_LABELS, type Rol } from '../../types';

const ROLES_PERSONAL: Rol[] = ['ADMINISTRADOR', 'LIDER', 'EDITOR', 'PILOTO_OFICIAL', 'CO_PILOTO'];

interface AsisRow {
  fecha: string;
  member_id: string | null;
  members: { nombre: string; apellido: string; rol: Rol } | null;
}
interface RosterMember {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}
interface Pilot {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol | null;
  dates: Set<string>;
}

export function AsistenciaHistorico({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<AsisRow[] | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: asis, error: e1 }, { data: mem, error: e2 }] = await Promise.all([
        supabase
          .from('asistencias')
          .select('fecha, member_id, members!member_id ( nombre, apellido, rol )'),
        supabase
          .from('members')
          .select('id, nombre, apellido, rol')
          .eq('estado', 'activo')
          .in('rol', ROLES_PERSONAL),
      ]);
      if (!active) return;
      if (e1 || e2) {
        setError((e1 ?? e2)?.message ?? 'Error');
        setRows([]);
        return;
      }
      const raw = (asis ?? []) as Array<Record<string, unknown>>;
      const list: AsisRow[] = raw.map((r) => {
        const memField = r.members;
        const member = (Array.isArray(memField) ? memField[0] : memField) as
          | AsisRow['members']
          | undefined;
        return {
          fecha: String(r.fecha),
          member_id: (r.member_id as string | null) ?? null,
          members: member ?? null,
        };
      });
      setRows(list);
      setRoster((mem ?? []) as RosterMember[]);
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const { dates, pilots } = useMemo(() => {
    const dateSet = new Set<string>();
    const map = new Map<string, Pilot>();
    for (const m of roster) {
      map.set(m.id, { id: m.id, nombre: m.nombre, apellido: m.apellido, rol: m.rol, dates: new Set() });
    }
    for (const r of rows ?? []) {
      dateSet.add(r.fecha);
      if (!r.member_id) continue;
      let p = map.get(r.member_id);
      if (!p) {
        p = {
          id: r.member_id,
          nombre: r.members?.nombre ?? '—',
          apellido: r.members?.apellido ?? '',
          rol: r.members?.rol ?? null,
          dates: new Set(),
        };
        map.set(r.member_id, p);
      }
      p.dates.add(r.fecha);
    }
    const ds = [...dateSet].sort();
    const ps = [...map.values()].sort(
      (a, b) =>
        b.dates.size - a.dates.size ||
        `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`),
    );
    return { dates: ds, pilots: ps };
  }, [rows, roster]);

  const exportCSV = () => {
    const header = ['Piloto', 'Rol', ...dates, 'Total'];
    const body = pilots.map((p) => [
      `${p.nombre} ${p.apellido}`.trim(),
      p.rol ? ROL_LABELS[p.rol] : '',
      ...dates.map((d) => (p.dates.has(d) ? 1 : 0)),
      p.dates.size,
    ]);
    downloadCSV(`asistencias-por-piloto.csv`, [header, ...body]);
  };

  if (error) {
    return (
      <div
        role="alert"
        style={{
          border: '1px solid var(--rojo)',
          background: 'var(--rojo-soft)',
          color: 'var(--rojo-light)',
          padding: '12px 14px',
          fontSize: 13,
        }}
      >
        Supabase: {error}
      </div>
    );
  }
  if (rows === null) return <div style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando…</div>;
  if (dates.length === 0) {
    return (
      <div style={{ border: '1px dashed var(--borde)', padding: 20, color: 'var(--muted)', fontSize: 13 }}>
        Aún no hay asistencias registradas.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          {pilots.length} pilotos · {dates.length} actividades
        </span>
        <Btn type="button" variant="ghost" icon={<IconDownload size={13} />} onClick={exportCSV}>
          Descargar CSV
        </Btn>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--borde)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--dark-2)' }}>
              <th style={{ ...th, position: 'sticky', left: 0, background: 'var(--dark-2)', textAlign: 'left', minWidth: 180 }}>
                Piloto
              </th>
              {dates.map((d) => (
                <th key={d} style={{ ...th, whiteSpace: 'nowrap' }} title={d}>
                  {d.slice(5)}
                </th>
              ))}
              <th style={{ ...th }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {pilots.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--borde)' }}>
                <td
                  style={{
                    ...td,
                    position: 'sticky',
                    left: 0,
                    background: 'var(--dark-1)',
                    textAlign: 'left',
                    minWidth: 180,
                  }}
                >
                  <div style={{ color: 'var(--blanco)' }}>
                    {p.nombre} {p.apellido}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                    {p.rol ? ROL_LABELS[p.rol] : ''}
                  </div>
                </td>
                {dates.map((d) => (
                  <td key={d} style={{ ...td, textAlign: 'center' }}>
                    {p.dates.has(d) ? (
                      <span style={{ color: 'var(--success)' }}>✓</span>
                    ) : (
                      <span style={{ color: 'var(--borde-strong)' }}>·</span>
                    )}
                  </td>
                ))}
                <td style={{ ...td, textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--blanco)', fontWeight: 600 }}>
                  {p.dates.size}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: '9px 10px',
  fontFamily: 'var(--font-cond)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--light)',
  textAlign: 'center' as const,
};
const td = {
  padding: '8px 10px',
  color: 'var(--light)',
};
