import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField, TextAreaField } from './Field';
import { Btn } from '../admin/Buttons';
import type { News } from '../../types';

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
        }
      : {
          estado: 'borrador',
          fecha: new Date().toISOString().slice(0, 10),
          autor: defaultAutor ?? '',
          tags: '',
          contenido: '',
        },
  });

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
      <FieldShell label="URL cover (opcional)">
        <TextField type="url" {...register('cover_url')} placeholder="https://…" />
      </FieldShell>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={isSubmitting}>
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
