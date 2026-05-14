import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField } from './Field';
import { Btn } from '../admin/Buttons';
import type { GalleryItem } from '../../types';

const BUCKET = 'gallery';

const Schema = z.object({
  label: z.string().min(2, 'Título obligatorio'),
  cat: z.string().min(2, 'Categoría obligatoria'),
  ratio: z.coerce.number().min(0.3).max(3).default(1.5),
  fav: z.boolean().default(false),
});

type Input = z.infer<typeof Schema>;

interface Props {
  initial?: GalleryItem;
  onDone: () => void;
}

export function FormGaleria({ initial, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({
    resolver: zodResolver(Schema),
    defaultValues: initial
      ? { label: initial.label, cat: initial.cat, ratio: initial.ratio, fav: initial.fav }
      : { cat: 'Rodada', ratio: 1.5, fav: false },
  });

  const onSubmit: SubmitHandler<Input> = async (values) => {
    setUploadError(null);

    if (initial) {
      const { error } = await supabase.from('gallery').update(values).eq('id', initial.id);
      if (error) {
        setUploadError(error.message);
        return;
      }
      onDone();
      return;
    }

    if (!file) {
      setUploadError('Selecciona una imagen');
      return;
    }

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      setUploadError(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: insErr } = await supabase.from('gallery').insert({
      ...values,
      url: pub.publicUrl,
      storage_path: path,
    });
    if (insErr) {
      setUploadError(insErr.message);
      return;
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
      {!initial ? (
        <FieldShell label="Archivo de imagen" required hint="Bucket Supabase: gallery. Debe estar creado.">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ color: 'var(--blanco)', fontFamily: 'var(--font-body)', fontSize: 13 }}
          />
        </FieldShell>
      ) : null}
      <FieldShell label="Título" required error={errors.label?.message}>
        <TextField {...register('label')} />
      </FieldShell>
      <FieldShell label="Categoría" required error={errors.cat?.message}>
        <TextField {...register('cat')} placeholder="Rodada / Evento / Aniversario…" />
      </FieldShell>
      <FieldShell label="Aspect ratio" hint="Ancho/alto. 1.5 = paisaje, 0.75 = retrato" error={errors.ratio?.message}>
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
        <Btn type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Subiendo…' : initial ? 'Actualizar' : 'Subir imagen'}
        </Btn>
      </div>
    </form>
  );
}
