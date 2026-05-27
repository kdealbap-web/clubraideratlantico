import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/useTable';
import { PageHeader } from '../../components/admin/PageHeader';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Drawer } from '../../components/admin/Drawer';
import { Btn } from '../../components/admin/Buttons';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { IconCalendar, IconEdit, IconPlus, IconTrash } from '../../components/icons';
import { FormEvento } from '../../components/forms/FormEvento';
import type { EstadoEvento, EventItem } from '../../types';

const ESTADOS_EVENTO: EstadoEvento[] = ['borrador', 'publicado', 'realizado', 'cancelado'];

export function EventosAdminPage() {
  const { rows, error, reload } = useTable<EventItem>('events', {
    order: { column: 'fecha', ascending: false },
  });
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);

  const onDelete = async (ev: EventItem) => {
    if (!window.confirm(`¿Eliminar el evento "${ev.titulo}"? No se puede deshacer.`)) return;
    const { error: e } = await supabase.from('events').delete().eq('id', ev.id);
    if (e) {
      alert(e.message);
      return;
    }
    void reload();
  };

  const columns: Column<EventItem>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      width: '120px',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-cond)', letterSpacing: '0.04em' }}>
          {r.fecha} · {r.hora}
        </span>
      ),
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{r.titulo}</strong>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{r.salida}</span>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      width: '120px',
      render: (r) => (
        <span style={{ color: 'var(--light)' }}>
          {r.tipo} · {r.dificultad}
        </span>
      ),
    },
    {
      key: 'cupos',
      header: 'Cupos',
      width: '120px',
      render: (r) => (
        <span className="tabular">
          {r.inscritos}/{r.cupos}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '150px',
      render: (r) => <EstadoSelect ev={r} onChanged={() => void reload()} />,
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Btn
            variant="ghost"
            icon={<IconEdit size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(r);
            }}
          >
            Editar
          </Btn>
          <Btn
            variant="danger"
            icon={<IconTrash size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              void onDelete(r);
            }}
          >
            Borrar
          </Btn>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        kicker="Calendario"
        title="Eventos."
        actions={
          <Btn icon={<IconPlus size={12} />} onClick={() => setCreating(true)}>
            Nuevo evento
          </Btn>
        }
      />

      {error ? (
        <ErrorBox message={error} />
      ) : rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<IconCalendar size={24} />}
          title={EMPTY_TEXTS.events.title}
          body={EMPTY_TEXTS.events.body}
        />
      ) : (
        <AdminTable rows={rows} columns={columns} keyOf={(r) => r.id} />
      )}

      <Drawer
        open={creating}
        title="Nuevo evento"
        onClose={() => setCreating(false)}
      >
        <FormEvento
          onDone={() => {
            setCreating(false);
            void reload();
          }}
        />
      </Drawer>

      <Drawer
        open={editing !== null}
        title={editing ? `Editar · ${editing.titulo}` : 'Editar evento'}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <FormEvento
            initial={editing}
            onDone={() => {
              setEditing(null);
              void reload();
            }}
          />
        ) : null}
      </Drawer>
    </section>
  );
}

function EstadoSelect({ ev, onChanged }: { ev: EventItem; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);

  const change = async (estado: EstadoEvento) => {
    if (estado === ev.estado) return;
    setSaving(true);
    const { error } = await supabase.from('events').update({ estado }).eq('id', ev.id);
    setSaving(false);
    if (error) {
      alert(`No se pudo cambiar el estado: ${error.message}`);
      return;
    }
    onChanged();
  };

  const cancelado = ev.estado === 'cancelado';
  const realizado = ev.estado === 'realizado';
  const color = cancelado ? 'var(--rojo-light)' : realizado ? 'var(--muted)' : 'var(--blanco)';
  const borderColor = cancelado ? 'var(--rojo)' : 'var(--borde)';

  return (
    <select
      value={ev.estado}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => void change(e.target.value as EstadoEvento)}
      title="Cambiar estado del evento"
      style={{
        width: '100%',
        height: 32,
        background: 'var(--dark-2)',
        color,
        border: `1px solid ${borderColor}`,
        padding: '0 8px',
        fontFamily: 'var(--font-cond)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        outline: 'none',
        cursor: saving ? 'wait' : 'pointer',
      }}
    >
      {ESTADOS_EVENTO.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

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
