import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { uploadToBucket } from '../../lib/storage';
import { resizeImage } from '../../lib/image';
import { FieldShell, TextField, TextAreaField } from './Field';
import { Btn } from '../admin/Buttons';
import { IconUpload, IconClose } from '../icons';
import type { News, NewsImage } from '../../types';

const ESTADOS = ['borrador', 'publicado', 'archivado'] as const;

const NoticiaSchema = z.object({
  titulo: z.string().min(2, 'Título obligatorio'),
  resumen: z.string().min(10, 'Resumen mínimo 10 caracteres'),
  contenido: z.string().min(1, 'Contenido obligatorio').default(''),
  autor: z.string().min(2, 'Autor obligatorio'),
  fecha: z.string().min(1, 'Fecha obligatoria'),
  estado: z.enum(ESTADOS),
  tags: z.string().default(''),
  cover_url: z.string().optional(),
  cover_path: z.string().optional(),
});

type NoticiaInput = z.infer<typeof NoticiaSchema>;

interface Props {
  initial?: News;
  defaultAutor?: string;
  onDone: () => void;
}

export function FormNoticia({ initial, defaultAutor, onDone }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NoticiaInput>({
    resolver: zodResolver(NoticiaSchema),
    defaultValues: initial
      ? {
          titulo: initial.titulo,
          resumen: initial.resumen,
          contenido: initial.contenido,
          autor: initial.autor,
          fecha: initial.fecha,
          estado: initial.estado,
          tags: initial.tags.join(', '),
          cover_url: initial.cover_url ?? '',
          cover_path: initial.cover_path ?? '',
        }
      : {
          estado: 'borrador',
          fecha: new Date().toISOString().slice(0, 10),
          autor: defaultAutor ?? '',
          tags: '',
          contenido: '',
          cover_url: '',
          cover_path: '',
        },
  });

  const coverUrl = watch('cover_url');
  const [galeria, setGaleria] = useState<NewsImage[]>(initial?.galeria ?? []);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGal, setUploadingGal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setUploadError(null);
    try {
      const blob = await resizeImage(file, { maxDim: 1600, quality: 0.82, mime: 'image/webp' });
      const up = await uploadToBucket(blob, { prefix: 'news/', filename: 'cover.webp' });
      setValue('cover_url', up.url, { shouldDirty: true });
      setValue('cover_path', up.path, { shouldDirty: true });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error subiendo la portada.');
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCover = () => {
    setValue('cover_url', '', { shouldDirty: true });
    setValue('cover_path', '', { shouldDirty: true });
  };

  const handleGalUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGal(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const blob = await resizeImage(file, { maxDim: 1600, quality: 0.82, mime: 'image/webp' });
        const up = await uploadToBucket(blob, { prefix: 'news/', filename: 'img.webp' });
        setGaleria((prev) => [...prev, { url: up.url, path: up.path }]);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error subiendo imágenes.');
    } finally {
      setUploadingGal(false);
    }
  };

  const removeGalImage = (idx: number) => {
    setGaleria((prev) => prev.filter((_, i) => i !== idx));
  };

  const setCaption = (idx: number, caption: string) => {
    setGaleria((prev) => prev.map((g, i) => (i === idx ? { ...g, caption } : g)));
  };

  const onSubmit: SubmitHandler<NoticiaInput> = async (values) => {
    const tags = values.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      titulo: values.titulo,
      resumen: values.resumen,
      contenido: values.contenido,
      autor: values.autor,
      fecha: values.fecha,
      estado: values.estado,
      tags,
      cover_url: values.cover_url || null,
      cover_path: values.cover_path || null,
      galeria: galeria.map((g) => ({
        url: g.url,
        path: g.path,
        ...(g.caption ? { caption: g.caption } : {}),
      })),
    };
    if (initial) {
      const { error } = await supabase.from('news').update(payload).eq('id', initial.id);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from('news').insert(payload);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    }
    onDone();
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <FieldShell label="Título" required error={errors.titulo?.message}>
        <TextField {...register('titulo')} />
      </FieldShell>
      <FieldShell label="Resumen" required error={errors.resumen?.message}>
        <TextAreaField {...register('resumen')} style={{ minHeight: 70 }} />
      </FieldShell>
      <FieldShell label="Contenido" required error={errors.contenido?.message}>
        <TextAreaField {...register('contenido')} style={{ minHeight: 180 }} />
      </FieldShell>
      <div style={gridTwo}>
        <FieldShell label="Autor" required error={errors.autor?.message}>
          <TextField {...register('autor')} />
        </FieldShell>
        <FieldShell label="Fecha" required error={errors.fecha?.message}>
          <TextField type="date" {...register('fecha')} />
        </FieldShell>
        <FieldShell label="Estado" required error={errors.estado?.message}>
          <select
            {...register('estado')}
            style={{
              height: 38,
              background: 'var(--dark-2)',
              color: 'var(--blanco)',
              border: '1px solid var(--borde)',
              padding: '0 12px',
            }}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>
      <FieldShell label="Tags" hint="Separados por coma. Ej: aniversario, rodada, comunicado">
        <TextField {...register('tags')} />
      </FieldShell>

      {/* Portada */}
      <FieldShell label="Imagen de portada" hint="Se muestra grande en la lista y arriba del artículo.">
        {coverUrl ? (
          <div
            style={{
              position: 'relative',
              border: '1px solid var(--borde)',
              background: `url('${coverUrl}') center/cover`,
              paddingTop: '42%',
            }}
          >
            <button
              type="button"
              onClick={removeCover}
              title="Quitar portada"
              style={iconBtn}
            >
              <IconClose size={14} />
            </button>
          </div>
        ) : (
          <label htmlFor="news-cover" style={{ ...dropzone, cursor: uploadingCover ? 'wait' : 'pointer' }}>
            <IconUpload size={26} />
            <div style={dropzoneTitle}>
              {uploadingCover ? 'Subiendo…' : 'Haz click para subir portada'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              JPG/PNG/WebP · se optimiza automáticamente
            </div>
            <input
              id="news-cover"
              type="file"
              accept="image/*"
              disabled={uploadingCover}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleCoverUpload(f);
                e.target.value = '';
              }}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </FieldShell>
      <FieldShell label="O pega una URL externa de portada" hint="Si la foto vive en Drive, Instagram, etc.">
        <TextField
          type="url"
          value={coverUrl ?? ''}
          onChange={(e) => {
            setValue('cover_url', e.target.value, { shouldDirty: true });
            setValue('cover_path', '', { shouldDirty: true });
          }}
          placeholder="https://…"
        />
      </FieldShell>

      {/* Galería */}
      <FieldShell label="Galería de la nota (opcional)" hint="Fotos que aparecen al final del artículo. Puedes subir varias.">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10,
          }}
        >
          {galeria.map((g, i) => (
            <div
              key={g.path || `g-${i}`}
              style={{ border: '1px solid var(--borde)', background: 'var(--dark-1)' }}
            >
              <div
                style={{
                  position: 'relative',
                  paddingTop: '72%',
                  background: `url('${g.url}') center/cover`,
                }}
              >
                <button
                  type="button"
                  onClick={() => removeGalImage(i)}
                  title="Quitar imagen"
                  style={{ ...iconBtn, width: 26, height: 26, top: 6, right: 6 }}
                >
                  <IconClose size={12} />
                </button>
              </div>
              <input
                value={g.caption ?? ''}
                onChange={(e) => setCaption(i, e.target.value)}
                placeholder="Pie de foto…"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: 30,
                  background: 'var(--dark-2)',
                  color: 'var(--blanco)',
                  border: 'none',
                  borderTop: '1px solid var(--borde)',
                  padding: '0 8px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11.5,
                  outline: 'none',
                }}
              />
            </div>
          ))}
          <label
            htmlFor="news-gal"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 120,
              border: '1px dashed var(--borde-strong)',
              background: 'var(--dark-2)',
              cursor: uploadingGal ? 'wait' : 'pointer',
              color: 'var(--light)',
            }}
          >
            <IconUpload size={20} />
            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {uploadingGal ? 'Subiendo…' : 'Añadir'}
            </span>
            <input
              id="news-gal"
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingGal}
              onChange={(e) => {
                void handleGalUpload(e.target.files);
                e.target.value = '';
              }}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </FieldShell>

      {uploadError ? (
        <div
          role="alert"
          style={{
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo-light)',
            padding: '10px 14px',
            fontSize: 12.5,
          }}
        >
          {uploadError}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="ghost" onClick={onDone} disabled={uploadingCover || uploadingGal}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={isSubmitting || uploadingCover || uploadingGal}>
          {isSubmitting ? 'Guardando…' : initial ? 'Actualizar' : 'Crear noticia'}
        </Btn>
      </div>
    </form>
  );
}

const gridTwo = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 12,
} as const;

const dropzone = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '28px 18px',
  border: '1px dashed var(--borde-strong)',
  background: 'var(--dark-2)',
  color: 'var(--light)',
} as const;

const dropzoneTitle = {
  fontFamily: 'var(--font-cond)',
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--blanco)',
  fontWeight: 600,
} as const;

const iconBtn = {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  background: 'rgba(0,0,0,0.7)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'var(--blanco)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
} as const;
