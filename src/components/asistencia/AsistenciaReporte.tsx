import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ROL_LABELS, type Rol } from '../../types';

// El "personal" que se espera en las actividades (para calcular inasistencias):
// todos salvo General y Aspirante.
const ROLES_PERSONAL: Rol[] = ['ADMINISTRADOR', 'LIDER', 'EDITOR', 'PILOTO_OFICIAL', 'CO_PILOTO'];

interface AsisRow {
  id: string;
  fecha: string;
  hora: string | null;
  origen: string;
  member_id: string | null;
  members: { nombre: string; apellido: string; rol: Rol } | null;
}

interface RosterMember {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol;
}

export function AsistenciaReporte({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<AsisRow[] | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [fecha, setFecha] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: asis, error: e1 }, { data: mem, error: e2 }] = await Promise.all([
        supabase
          .from('asistencias')
          .select('id, fecha, hora, origen, member_id, members ( nombre, apellido, rol )')
          .order('fecha', { ascending: false })
          .order('hora', { ascending: true }),
        supabase
          .from('members')
          .select('id, nombre, apellido, rol')
          .eq('estado', 'activo')
          .in('rol', ROLES_PERSONAL),
      ]);
      if (!active) return;
      if (e1 || e2) {
        setError((e1 ?? e2)?.message ?? 'Error cargando asistencias');
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
          id: String(r.id),
          fecha: String(r.fecha),
          hora: (r.hora as string | null) ?? null,
          origen: String(r.origen ?? 'qr'),
          member_id: (r.member_id as string | null) ?? null,
          members: member ?? null,
        };
      });
      setRows(list);
      setRoster((mem ?? []) as RosterMember[]);
      setFecha((prev) => prev || list[0]?.fecha || '');
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const fechas = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.fecha, (map.get(r.fecha) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [rows]);

  const presentes = useMemo(
    () => (rows ?? []).filter((r) => r.fecha === fecha),
    [rows, fecha],
  );

  const ausentes = useMemo(() => {
    const ids = new Set(presentes.map((r) => r.member_id).filter(Boolean));
    return roster.filter((m) => !ids.has(m.id));
  }, [presentes, roster]);

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

  if (rows === null) {
    return <div style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando reporte…</div>;
  }

  if (fechas.length === 0) {
    return (
      <div
        style={{
          border: '1px dashed var(--borde)',
          padding: 20,
          color: 'var(--muted)',
          fontSize: 13,
        }}
      >
        Aún no hay asistencias registradas. Escanea en una actividad o importa el histórico.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--light)',
            }}
          >
            Fecha de la actividad
          </label>
          <select
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{
              height: 38,
              background: 'var(--dark-2)',
              color: 'var(--blanco)',
              border: '1px solid var(--borde)',
              padding: '0 12px',
              fontSize: 14,
              outline: 'none',
            }}
          >
            {fechas.map(([f, n]) => (
              <option key={f} value={f}>
                {f} — {n} {n === 1 ? 'asistente' : 'asistentes'}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 13 }}>
          <span style={{ color: 'var(--muted)' }}>
            Presentes:{' '}
            <strong style={{ color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
              {presentes.length}
            </strong>
          </span>
          <span style={{ color: 'var(--muted)' }}>
            Ausentes:{' '}
            <strong style={{ color: 'var(--rojo-light)', fontVariantNumeric: 'tabular-nums' }}>
              {ausentes.length}
            </strong>
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Columna titulo={`Presentes (${presentes.length})`} color="var(--success)">
          {presentes.map((r) => (
            <Fila
              key={r.id}
              nombre={r.members ? `${r.members.nombre} ${r.members.apellido}` : '—'}
              rol={r.members?.rol}
              meta={[r.hora ?? '', r.origen === 'import' ? 'histórico' : ''].filter(Boolean).join(' · ')}
            />
          ))}
        </Columna>
        <Columna titulo={`Ausentes (${ausentes.length})`} color="var(--rojo-light)">
          {ausentes.map((m) => (
            <Fila key={m.id} nombre={`${m.nombre} ${m.apellido}`} rol={m.rol} />
          ))}
          {ausentes.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 12.5, padding: '8px 0' }}>
              Asistencia completa 🎉
            </div>
          ) : null}
        </Columna>
      </div>
    </div>
  );
}

function Columna({
  titulo,
  color,
  children,
}: {
  titulo: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: '1px solid var(--borde)', background: 'var(--dark-1)' }}>
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--borde)',
          fontFamily: 'var(--font-cond)',
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color,
        }}
      >
        {titulo}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 420, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

function Fila({ nombre, rol, meta }: { nombre: string; rol?: Rol; meta?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '9px 14px',
        borderBottom: '1px solid var(--borde)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: 'var(--blanco)', fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nombre}
        </div>
        {rol ? (
          <div style={{ color: 'var(--muted)', fontSize: 11 }}>{ROL_LABELS[rol]}</div>
        ) : null}
      </div>
      {meta ? (
        <span style={{ color: 'var(--muted)', fontSize: 11, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}
