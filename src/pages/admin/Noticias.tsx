import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/useTable';
import { useAuth } from '../../lib/auth';
import { PageHeader } from '../../components/admin/PageHeader';
import { AdminTable, type Column } from '../../components/admin/AdminTable';
import { Drawer } from '../../components/admin/Drawer';
import { Btn } from '../../components/admin/Buttons';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { IconEdit, IconNews, IconPlus, IconTrash } from '../../components/icons';
import { FormNoticia } from '../../components/forms/FormNoticia';
import type { News } from '../../types';

export function NoticiasAdminPage() {
  const { rows, error, reload } = useTable<News>('news', {
    order: { column: 'fecha', ascending: false },
  });
  const { member } = useAuth();
  const defaultAutor = member ? `${member.nombre} ${member.apellido}` : '';

  const [editing, setEditing] = useState<News | null>(null);
  const [creating, setCreating] = useState(false);

  const onDelete = async (n: News) => {
    if (!window.confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return;
    const { error: e } = await supabase.from('news').delete().eq('id', n.id);
    if (e) {
      alert(e.message);
      return;
    }
    void reload();
  };

  const columns: Column<News>[] = [
    { key: 'fecha', header: 'Fecha', width: '120px', render: (r) => <span className="tabular">{r.fecha}</span> },
    {
      key: 'titulo',
      header: 'Título',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{r.titulo}</strong>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{r.resumen.slice(0, 80)}…</span>
        </div>
      ),
    },
    { key: 'autor', header: 'Autor', width: '140px', render: (r) => r.autor },
    {
      key: 'estado',
      header: 'Estado',
      width: '120px',
      render: (r) => (
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            border: '1px solid var(--borde)',
            color: r.estado === 'publicado' ? 'var(--success)' : 'var(--light)',
          }}
        >
          {r.estado}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" icon={<IconEdit size={12} />} onClick={(e) => { e.stopPropagation(); setEditing(r); }}>
            Editar
          </Btn>
          <Btn variant="danger" icon={<IconTrash size={12} />} onClick={(e) => { e.stopPropagation(); void onDelete(r); }}>
            Borrar
          </Btn>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        kicker="Comunicados"
        title="Noticias."
        actions={
          <Btn icon={<IconPlus size={12} />} onClick={() => setCreating(true)}>
            Nueva noticia
          </Btn>
        }
      />

      {error ? (
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
      ) : rows === null ? (
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
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<IconNews size={24} />}
          title={EMPTY_TEXTS.news.title}
          body={EMPTY_TEXTS.news.body}
        />
      ) : (
        <AdminTable rows={rows} columns={columns} keyOf={(r) => r.id} />
      )}

      <Drawer open={creating} title="Nueva noticia" onClose={() => setCreating(false)} width={680}>
        <FormNoticia
          defaultAutor={defaultAutor}
          onDone={() => {
            setCreating(false);
            void reload();
          }}
        />
      </Drawer>

      <Drawer
        open={editing !== null}
        title={editing ? `Editar · ${editing.titulo}` : 'Editar noticia'}
        onClose={() => setEditing(null)}
        width={680}
      >
        {editing ? (
          <FormNoticia
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
