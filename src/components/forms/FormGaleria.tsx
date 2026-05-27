import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField } from './Field';
import { Btn } from '../admin/Buttons';
import type { GalleryItem } from '../../types';

const BUCKET = 'gallery';
const MAX_VIDEO = 250 * 1024 * 1024; // 250 MB
const MAX_POSTER = 25 * 1024 * 1024; // 25 MB
const TIPOS = ['imagen', 'video'] as const;

const Schema = z.object({
  label: z.string().min(2, 'Título obligatorio'),
  type: z.enum(TIPOS),
  cat: z.string().min(2, 'Categoría obligatoria'),
  album: z.string().optional(),
  event_id: z.string().optional(),
  external_url: z.string().optional(),
  ratio: z.coerce.number().min(0.3).max(3).default(1.5),
  fav: z.boolean().default(false),
});

type Input = z.infer<typeof Schema>;

interface EventOpt {
  id: string;
  titulo: string;
  fecha: string;
}

interface Props {
  initial?: GalleryItem;
  onDone: () => void;
}

async function uploadToBucket(file: File): Promise<{ url: string; path: string }> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function FormGaleria({ initial, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<EventOpt[]>([]);

  const externalDefault =
    initial && initial.type === 'video' && !initial.storage_path ? initial.url : '';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(Schema),
    defaultValues: initial
      ? {
          label: initial.label,
          type: initial.type,
          cat: initial.cat,
          album: initial.album ?? '',
          event_id: initial.event_id ?? '',
          external_url: externalDefault,
          ratio: initial.ratio,
          fav: initial.fav,
        }
      : { type: 'imagen', cat: 'Rodada', album: '', event_id: '', external_url: '', ratio: 1.5, fav: false },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, titulo, fecha')
        .order('fecha', { ascending: false });
      if (active) setEvents((data ?? []) as EventOpt[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  const type = watch('type');
  const isVideo = type === 'video';

  const eventReg = register('event_id');

  const onSubmit: SubmitHandler<Input> = async (values) => {
    setUploadError(null);
    const ext = (values.external_url ?? '').trim();

    if (file && file.size > MAX_VIDEO) {
      setUploadError('El archivo supera el límite de 250 MB.');
      return;
    }
    if (posterFile && posterFile.size > MAX_POSTER) {
      setUploadError('La portada supera el límite de 25 MB.');
      return;
    }
    if (!initial) {
      if (isVideo && !file && !ext) {
        setUploadError('Sube un video o pega un enlace de YouTube/Vimeo.');
        return;
      }
      if (!isVideo && !file) {
        setUploadError('Selecciona una imagen.');
        return;
      }
    }

    setUploading(true);
    try {
      let url = initial?.url ?? '';
      let storage_path = initial?.storage_path ?? '';
      if (file) {
        const up = await uploadToBucket(file);
        url = up.url;
        storage_path = up.path;
      } else if (isVideo && ext) {
        url = ext;
        storage_path = '';
      }

      let poster_url = initial?.poster_url ?? null;
      let poster_path = initial?.poster_path ?? null;
      if (isVideo && posterFile) {
        const up = await uploadToBucket(posterFile);
        poster_url = up.url;
        poster_path = up.path;
      }
      if (!isVideo) {
        poster_url = null;
        poster_path = null;
      }

      const payload = {
        label: values.label,
        cat: values.cat,
        ratio: values.ratio,
        fav: values.fav,
        type: values.type,
        album: (values.album ?? '').trim() || null,
        event_id: (values.event_id ?? '').trim() || null,
        url,
        storage_path,
        poster_url,
        poster_path,
      };

      if (initial) {
        const { error } = await supabase.from('gallery').update(payload).eq('id', initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gallery').insert(payload);
        if (error) throw error;
      }
      onDone();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error subiendo el archivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <FieldShell label="Tipo de contenido" required>
        <select {...register('type')} style={selectStyle}>
          <option value="imagen">Imagen / foto</option>
          <option value="video">Video</option>
        </select>
      </FieldShell>

      {/* Medio principal */}
      <FieldShell
        label={isVideo ? 'Archivo de video' : 'Archivo de imagen'}
        required={!initial}
        hint={
          isVideo
            ? 'Máximo 250 MB. O deja vacío y pega un enlace abajo (YouTube/Vimeo).'
            : 'Bucket Supabase: gallery.'
        }
      >
        <input
          type="file"
          accept={isVideo ? 'video/*' : 'image/*'}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ color: 'var(--blanco)', fontFamily: 'var(--font-body)', fontSize: 13 }}
        />
        {initial && !file ? (
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>
            Deja vacío para conservar el archivo actual.
          </span>
        ) : null}
      </FieldShell>

      {isVideo ? (
        <>
          <FieldShell label="O enlace externo (YouTube / Vimeo)" hint="Se usa si no subes archivo.">
            <TextField type="url" {...register('external_url')} placeholder="https://youtu.be/…" />
          </FieldShell>
          <FieldShell label="Portada del video (opcional)" hint="Imagen de miniatura. Si no, se muestra un botón de play.">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
              style={{ color: 'var(--blanco)', fontFamily: 'var(--font-body)', fontSize: 13 }}
            />
          </FieldShell>
        </>
      ) : null}

      <FieldShell label="Título" required error={errors.label?.message}>
        <TextField {...register('label')} />
      </FieldShell>

      {/* Carpeta / álbum */}
      <FieldShell label="Rodada / evento (opcional)" hint="Vincula el archivo a una rodada del cronograma.">
        <select
          {...eventReg}
          onChange={(e) => {
            void eventReg.onChange(e);
            const ev = events.find((x) => x.id === e.target.value);
            const cur = (watch('album') ?? '').trim();
            if (ev && !cur) setValue('album', ev.titulo);
          }}
          style={selectStyle}
        >
          <option value="">— Ninguna —</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.titulo} · {ev.fecha}
            </option>
          ))}
        </select>
      </FieldShell>
      <FieldShell label="Álbum / carpeta" hint="Nombre de la carpeta donde se agrupa (ej. 'Viaje a Santa Marta').">
        <TextField {...register('album')} placeholder="Rodada Vía al Mar — Mayo 2026" />
      </FieldShell>

      <FieldShell label="Categoría" required error={errors.cat?.message}>
        <TextField {...register('cat')} placeholder="Rodada / Evento / Aniversario…" />
      </FieldShell>
      <FieldShell label="Aspect ratio" hint="Ancho/alto. 1.5 = paisaje, 0.75 = retrato, 1.78 = video" error={errors.ratio?.message}>
        <TextField type="number" step="0.05" {...register('ratio')} />
      </FieldShell>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--blanco)', fontSize: 14 }}>
        <input type="checkbox" {...register('fav')} />
        Destacar (fav)
      </label>

      {uploadError ? (
        <div
          role="alert"
          style={{
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo-light)',
            padding: '10px 14px',
            fontSize: 13,
          }}
        >
          {uploadError}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="ghost" onClick={onDone} disabled={uploading}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={uploading}>
          {uploading ? 'Subiendo…' : initial ? 'Actualizar' : 'Subir'}
        </Btn>
      </div>
    </form>
  );
}

const selectStyle = {
  height: 38,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
} as const;
