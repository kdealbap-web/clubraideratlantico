import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/useTable';
import { PageHeader } from '../../components/admin/PageHeader';
import { Drawer } from '../../components/admin/Drawer';
import { Btn } from '../../components/admin/Buttons';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { IconEdit, IconImage, IconPlus, IconTrash } from '../../components/icons';
import { FormGaleria } from '../../components/forms/FormGaleria';
import type { GalleryItem } from '../../types';

export function GaleriaAdminPage() {
  const { rows, error, reload } = useTable<GalleryItem>('gallery', {
    order: { column: 'created_at', ascending: false },
  });
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [creating, setCreating] = useState(false);

  const onDelete = async (g: GalleryItem) => {
    if (!window.confirm(`¿Eliminar "${g.label}"? Esto borra también el archivo en Storage.`)) return;
    if (g.storage_path) {
      await supabase.storage.from('gallery').remove([g.storage_path]);
    }
    const { error: e } = await supabase.from('gallery').delete().eq('id', g.id);
    if (e) {
      alert(e.message);
      return;
    }
    void reload();
  };

  return (
    <section>
      <PageHeader
        kicker="Archivo visual"
        title="Galería."
        actions={
          <Btn icon={<IconPlus size={12} />} onClick={() => setCreating(true)}>
            Subir imagen
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
          icon={<IconImage size={24} />}
          title={EMPTY_TEXTS.gallery.title}
          body={EMPTY_TEXTS.gallery.body}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {rows.map((g) => (
            <article
              key={g.id}
              style={{
                background: 'var(--dark-1)',
                border: '1px solid var(--borde)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  paddingTop: `${(1 / g.ratio) * 100}%`,
                  background: `linear-gradient(135deg, var(--imgph-1), var(--imgph-3))`,
                }}
              >
                <img
                  src={g.url}
                  alt={g.label}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {g.fav ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      padding: '4px 8px',
                      background: 'var(--rojo)',
                      color: 'var(--blanco)',
                      fontFamily: 'var(--font-cond)',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fav
                  </span>
                ) : null}
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <strong style={{ color: 'var(--blanco)', fontSize: 13 }}>{g.label}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{g.cat}</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <Btn variant="ghost" icon={<IconEdit size={12} />} onClick={() => setEditing(g)}>
                    Editar
                  </Btn>
                  <Btn variant="danger" icon={<IconTrash size={12} />} onClick={() => void onDelete(g)}>
                    Borrar
                  </Btn>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer open={creating} title="Subir imagen" onClose={() => setCreating(false)}>
        <FormGaleria
          onDone={() => {
            setCreating(false);
            void reload();
          }}
        />
      </Drawer>

      <Drawer
        open={editing !== null}
        title={editing ? `Editar · ${editing.label}` : 'Editar imagen'}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <FormGaleria
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
