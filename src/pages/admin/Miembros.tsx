import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useTable';
import { puedeGestionarMiembros, ROL_PERMISOS } from '../../lib/permissions';
import { PageHeader } from '../../components/admin/PageHeader';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Drawer } from '../../components/admin/Drawer';
import { Btn } from '../../components/admin/Buttons';
import { PermisosLeyenda } from '../../components/admin/PermisosLeyenda';
import { FormMiembro } from '../../components/forms/FormMiembro';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { IconCheck, IconClose, IconPlus, IconUsers } from '../../components/icons';
import { ROL_LABELS, type Member, type Rol, type Solicitud } from '../../types';

type Tab = 'miembros' | 'solicitudes';

export function MiembrosPage() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'solicitudes' ? 'solicitudes' : 'miembros';
  const setTab = (t: Tab) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (t === 'solicitudes') n.set('tab', 'solicitudes');
      else n.delete('tab');
      return n;
    });

  const { rows: pendientes } = useTable<Solicitud>('solicitudes', {
    filter: [{ column: 'estado', op: 'eq', value: 'pendiente' }],
    order: { column: 'created_at', ascending: false },
  });

  return (
    <section>
      <PageHeader kicker="Comunidad" title="Miembros." />

      <PermisosLeyenda />

      <nav
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--borde)',
          marginBottom: 18,
        }}
      >
        <TabBtn active={tab === 'miembros'} onClick={() => setTab('miembros')}>
          Miembros
        </TabBtn>
        <TabBtn
          active={tab === 'solicitudes'}
          onClick={() => setTab('solicitudes')}
          badge={pendientes?.length ?? null}
        >
          Solicitudes
        </TabBtn>
      </nav>

      {tab === 'miembros' ? <MembersList /> : <SolicitudesList />}
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 18px',
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? 'var(--rojo)' : 'transparent'}`,
        color: active ? 'var(--blanco)' : 'var(--light)',
        fontFamily: 'var(--font-cond)',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {children}
      {badge !== undefined && badge !== null && badge > 0 ? (
        <span
          style={{
            background: 'var(--rojo)',
            color: 'var(--blanco)',
            padding: '2px 7px',
            fontSize: 10,
            letterSpacing: '0.06em',
            borderRadius: 10,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function MembersList() {
  const { rows, error, reload } = useTable<Member>('members', {
    order: { column: 'created_at', ascending: false },
  });
  const { member: me } = useAuth();
  const canManage = puedeGestionarMiembros(me?.rol);

  const [filterRol, setFilterRol] = useState<Rol | 'TODOS'>('TODOS');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo' | 'pendiente'>('todos');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (!rows) return null;
    return rows.filter((m) => {
      if (filterRol !== 'TODOS' && m.rol !== filterRol) return false;
      if (filterEstado !== 'todos' && m.estado !== filterEstado) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (
          !`${m.nombre} ${m.apellido} ${m.email} ${m.ciudad ?? ''} ${m.moto_placa ?? ''}`
            .toLowerCase()
            .includes(needle)
        )
          return false;
      }
      return true;
    });
  }, [rows, filterRol, filterEstado, q]);

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Miembro',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: ROL_PERMISOS[r.rol].color,
              color: 'var(--blanco)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-cond)',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {(r.alias || `${r.nombre[0] ?? ''}${r.apellido[0] ?? ''}`).slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <strong>
              {r.nombre} {r.apellido}
            </strong>
            <span
              style={{
                color: 'var(--muted)',
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'ciudad',
      header: 'Ciudad',
      width: '140px',
      render: (r) => r.ciudad ?? <span style={{ color: 'var(--muted)' }}>—</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      width: '160px',
      render: (r) => (
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            border: `1px solid ${ROL_PERMISOS[r.rol].color}`,
            color: ROL_PERMISOS[r.rol].color,
          }}
        >
          {ROL_LABELS[r.rol]}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '110px',
      render: (r) => (
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            border: '1px solid var(--borde)',
            color:
              r.estado === 'activo'
                ? 'var(--success)'
                : r.estado === 'inactivo'
                  ? 'var(--muted)'
                  : 'var(--warn)',
          }}
        >
          {r.estado}
        </span>
      ),
    },
    {
      key: 'moto',
      header: 'Moto',
      render: (r) => (
        <span style={{ color: 'var(--light)' }}>
          {r.moto_marca ? `${r.moto_marca} ${r.moto_modelo ?? ''}` : '—'}
          {r.moto_placa ? ` · ${r.moto_placa}` : ''}
        </span>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
          alignItems: 'flex-end',
        }}
      >
        <input
          type="search"
          placeholder="Buscar nombre, email, placa…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: '1 1 240px',
            height: 36,
            background: 'var(--dark-2)',
            color: 'var(--blanco)',
            border: '1px solid var(--borde)',
            padding: '0 12px',
            fontSize: 13,
          }}
        />
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value as Rol | 'TODOS')}
          style={selectStyle}
        >
          <option value="TODOS">Todos los roles</option>
          {(Object.keys(ROL_LABELS) as Rol[]).map((r) => (
            <option key={r} value={r}>
              {ROL_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)}
          style={selectStyle}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="pendiente">Pendientes</option>
          <option value="inactivo">Inactivos</option>
        </select>
        {canManage ? (
          <Btn icon={<IconPlus size={12} />} onClick={() => setCreating(true)}>
            Nuevo miembro
          </Btn>
        ) : null}
      </div>

      {error ? (
        <ErrorBox message={error} />
      ) : filtered === null ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={24} />}
          title={EMPTY_TEXTS.members.title}
          body={EMPTY_TEXTS.members.body}
          cta={{ label: 'Ver solicitudes', href: '/admin/miembros?tab=solicitudes' }}
        />
      ) : (
        <AdminTable
          rows={filtered}
          columns={columns}
          keyOf={(r) => r.id}
          onRowClick={(r) => setEditing(r)}
        />
      )}

      <Drawer
        open={creating}
        title="Nuevo miembro"
        onClose={() => setCreating(false)}
        width={680}
      >
        <FormMiembro
          onDone={() => {
            setCreating(false);
            void reload();
          }}
          canChangeRole={canManage}
        />
      </Drawer>

      <Drawer
        open={editing !== null}
        title={editing ? `${editing.nombre} ${editing.apellido}` : ''}
        onClose={() => setEditing(null)}
        width={680}
      >
        {editing ? (
          <FormMiembro
            initial={editing}
            canChangeRole={canManage}
            onDelete={() => {
              setEditing(null);
              void reload();
            }}
            onDone={() => {
              setEditing(null);
              void reload();
            }}
          />
        ) : null}
      </Drawer>
    </>
  );
}

function SolicitudesList() {
  const { rows, error, reload } = useTable<Solicitud>('solicitudes', {
    order: { column: 'created_at', ascending: false },
  });
  const { member } = useAuth();
  const [sub, setSub] = useState<'pendiente' | 'aprobada' | 'rechazada'>('pendiente');
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [nota, setNota] = useState('');

  const filtered = useMemo(() => rows?.filter((s) => s.estado === sub) ?? null, [rows, sub]);

  const decide = async (s: Solicitud, estado: 'aprobada' | 'rechazada') => {
    const payload = {
      estado,
      decided_at: new Date().toISOString(),
      decided_by: member?.id ?? null,
      nota_decision: nota || null,
    };
    const { error: e } = await supabase.from('solicitudes').update(payload).eq('id', s.id);
    if (e) {
      alert(e.message);
      return;
    }

    if (estado === 'aprobada') {
      const { error: insErr } = await supabase.from('members').insert({
        nombre: s.nombre,
        apellido: s.apellido,
        cedula: s.cedula,
        fecha_nac: s.fecha_nac,
        email: s.email,
        tel: s.tel,
        ciudad: s.ciudad,
        moto_marca: s.moto_marca,
        moto_modelo: s.moto_modelo,
        moto_year: s.moto_year,
        moto_placa: s.moto_placa,
        moto_color: s.moto_color,
        rol: 'GENERAL',
        estado: 'activo',
        ingreso: new Date().toISOString().slice(0, 10),
      });
      if (insErr) {
        alert(`Solicitud marcada aprobada, pero falló crear el miembro: ${insErr.message}`);
      }
    }

    setSelected(null);
    setNota('');
    void reload();
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['pendiente', 'aprobada', 'rechazada'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSub(s)}
            style={{
              padding: '8px 14px',
              border: '1px solid var(--borde)',
              background: sub === s ? 'var(--rojo)' : 'var(--dark-2)',
              color: sub === s ? 'var(--blanco)' : 'var(--light)',
              fontFamily: 'var(--font-cond)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBox message={error} />
      ) : filtered === null ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={24} />}
          title={
            sub === 'pendiente'
              ? EMPTY_TEXTS.solicitudes.title
              : `No hay solicitudes ${sub}`
          }
          body={
            sub === 'pendiente'
              ? EMPTY_TEXTS.solicitudes.body
              : 'Las decisiones del comité quedan registradas aquí.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((s) => (
            <article
              key={s.id}
              onClick={() => setSelected(s)}
              style={{
                cursor: 'pointer',
                background: 'var(--dark-1)',
                border: '1px solid var(--borde)',
                padding: '16px 18px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--rojo)',
                  color: 'var(--blanco)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-cond)',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {`${s.nombre[0] ?? ''}${s.apellido[0] ?? ''}`.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <strong>
                  {s.nombre} {s.apellido}
                </strong>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {s.ciudad} · {s.moto_marca} {s.moto_modelo} · {s.moto_placa}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {s.con_copiloto ? <Pill>Copiloto</Pill> : null}
                {s.tiene_licencia ? <Pill>Licencia</Pill> : null}
                <Pill>{`Docs ${[s.doc_propia, s.doc_tarjeta, s.doc_soat, s.doc_tecno].filter(Boolean).length}/4`}</Pill>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer
        open={selected !== null}
        title={selected ? `Solicitud · ${selected.nombre} ${selected.apellido}` : ''}
        onClose={() => {
          setSelected(null);
          setNota('');
        }}
        width={620}
      >
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Row k="Cédula" v={selected.cedula} />
            <Row k="Email" v={selected.email} />
            <Row k="Teléfono" v={selected.tel} />
            <Row k="Ciudad" v={selected.ciudad} />
            <Row k="Fecha nac." v={selected.fecha_nac} />
            <Row k="Experiencia" v={selected.experiencia} />
            <Row k="Licencia" v={selected.tiene_licencia ? 'Sí' : 'No'} />
            <Row k="Moto" v={`${selected.moto_marca} ${selected.moto_modelo} ${selected.moto_year}`} />
            <Row k="Placa" v={selected.moto_placa} />

            <h4 style={{ color: 'var(--blanco)', fontFamily: 'var(--font-display)', margin: '8px 0 0' }}>
              Documentos (declaración)
            </h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <DocPill ok={selected.doc_propia}>Propia</DocPill>
              <DocPill ok={selected.doc_tarjeta}>T. propiedad</DocPill>
              <DocPill ok={selected.doc_soat}>SOAT</DocPill>
              <DocPill ok={selected.doc_tecno}>Tecno</DocPill>
            </div>

            {selected.con_copiloto ? (
              <>
                <h4 style={{ color: 'var(--blanco)', fontFamily: 'var(--font-display)', margin: '8px 0 0' }}>
                  Copiloto
                </h4>
                <Row k="Nombre" v={`${selected.co_nombre ?? ''} ${selected.co_apellido ?? ''}`} />
                <Row k="Cédula" v={selected.co_cedula ?? '—'} />
                <Row k="Teléfono" v={selected.co_tel ?? '—'} />
              </>
            ) : null}

            {selected.motivo ? (
              <>
                <h4 style={{ color: 'var(--blanco)', fontFamily: 'var(--font-display)', margin: '8px 0 0' }}>
                  Motivo
                </h4>
                <p style={{ color: 'var(--light)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {selected.motivo}
                </p>
              </>
            ) : null}

            {selected.estado === 'pendiente' ? (
              <>
                <h4 style={{ color: 'var(--blanco)', fontFamily: 'var(--font-display)', margin: '8px 0 0' }}>
                  Nota de decisión (opcional)
                </h4>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Mensaje interno para el equipo"
                  style={{
                    minHeight: 80,
                    background: 'var(--dark-2)',
                    color: 'var(--blanco)',
                    border: '1px solid var(--borde)',
                    padding: 12,
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <Btn icon={<IconCheck size={12} />} onClick={() => void decide(selected, 'aprobada')}>
                    Aprobar
                  </Btn>
                  <Btn variant="danger" icon={<IconClose size={12} />} onClick={() => void decide(selected, 'rechazada')}>
                    Rechazar
                  </Btn>
                </div>
              </>
            ) : (
              <Row k="Decisión" v={`${selected.estado} · ${selected.decided_at ?? ''}`} />
            )}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--borde)',
        paddingBottom: 6,
        fontSize: 13,
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          color: 'var(--light)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        {k}
      </span>
      <span style={{ color: 'var(--blanco)', textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        border: '1px solid var(--borde)',
        color: 'var(--light)',
      }}
    >
      {children}
    </span>
  );
}

function DocPill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        border: `1px solid ${ok ? 'var(--success)' : 'var(--rojo)'}`,
        color: ok ? 'var(--success)' : 'var(--rojo-light)',
        background: ok ? 'rgba(34,197,94,0.08)' : 'var(--rojo-soft)',
      }}
    >
      {children}: {ok ? 'Sí' : 'No'}
    </span>
  );
}

const selectStyle = {
  height: 36,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  outline: 'none',
} as const;

function ErrorBox({ message }: { message: string }) {
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
      Supabase: {message}
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        border: '1px dashed var(--borde)',
        padding: 18,
        color: 'var(--muted)',
        fontFamily: 'var(--font-cond)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      Cargando…
    </div>
  );
}
