import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField, TextAreaField } from './Field';
import { Btn } from '../admin/Buttons';
import type { EventItem } from '../../types';

const ESTADOS = ['borrador', 'publicado', 'realizado', 'cancelado'] as const;
const TIPOS = ['Rodada', 'Evento', 'Capacitación'] as const;
const DIFICULTADES = ['Fácil', 'Media', 'Alta', '—'] as const;

const EventoSchema = z.object({
  titulo: z.string().min(2, 'Título obligatorio'),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres'),
  fecha: z.string().min(1, 'Fecha obligatoria'),
  hora: z.string().min(1, 'Hora obligatoria'),
  salida: z.string().min(2, 'Punto de salida'),
  ruta: z.string().default(''),
  cupos: z.coerce.number().int().min(0),
  inscritos: z.coerce.number().int().min(0).default(0),
  estado: z.enum(ESTADOS),
  dificultad: z.enum(DIFICULTADES),
  tipo: z.enum(TIPOS),
  km: z.coerce.number().int().min(0).default(0),
});

type EventoInput = z.infer<typeof EventoSchema>;

interface Props {
  initial?: EventItem;
  onDone: () => void;
}

export function FormEvento({ initial, onDone }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventoInput>({
    resolver: zodResolver(EventoSchema),
    defaultValues: initial
      ? {
          titulo: initial.titulo,
          descripcion: initial.descripcion,
          fecha: initial.fecha,
          hora: initial.hora,
          salida: initial.salida,
          ruta: initial.ruta,
          cupos: initial.cupos,
          inscritos: initial.inscritos,
          estado: initial.estado,
          dificultad: initial.dificultad,
          tipo: initial.tipo,
          km: initial.km,
        }
      : {
          estado: 'borrador',
          tipo: 'Rodada',
          dificultad: 'Fácil',
          cupos: 30,
          inscritos: 0,
          km: 0,
          ruta: '',
        },
  });

  const onSubmit: SubmitHandler<EventoInput> = async (values) => {
    if (initial) {
      const { error } = await supabase.from('events').update(values).eq('id', initial.id);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from('events').insert(values);
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
      <FieldShell label="Descripción" required error={errors.descripcion?.message}>
        <TextAreaField {...register('descripcion')} />
      </FieldShell>
      <div style={gridTwo}>
        <FieldShell label="Fecha" required error={errors.fecha?.message}>
          <TextField type="date" {...register('fecha')} />
        </FieldShell>
        <FieldShell label="Hora" required error={errors.hora?.message}>
          <TextField type="time" {...register('hora')} />
        </FieldShell>
      </div>
      <FieldShell label="Punto de salida" required error={errors.salida?.message}>
        <TextField {...register('salida')} />
      </FieldShell>
      <FieldShell label="Ruta" error={errors.ruta?.message}>
        <TextField {...register('ruta')} placeholder="Bquilla → Pto Colombia → Bquilla" />
      </FieldShell>
      <div style={gridTwo}>
        <FieldShell label="Cupos" required error={errors.cupos?.message}>
          <TextField type="number" {...register('cupos')} />
        </FieldShell>
        <FieldShell label="Inscritos" error={errors.inscritos?.message}>
          <TextField type="number" {...register('inscritos')} />
        </FieldShell>
        <FieldShell label="Kilómetros" error={errors.km?.message}>
          <TextField type="number" {...register('km')} />
        </FieldShell>
      </div>
      <div style={gridTwo}>
        <FieldShell label="Tipo" required error={errors.tipo?.message}>
          <select {...register('tipo')} style={selectStyle}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FieldShell>
        <FieldShell label="Dificultad" required error={errors.dificultad?.message}>
          <select {...register('dificultad')} style={selectStyle}>
            {DIFICULTADES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </FieldShell>
        <FieldShell label="Estado" required error={errors.estado?.message}>
          <select {...register('estado')} style={selectStyle}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : initial ? 'Actualizar' : 'Crear evento'}
        </Btn>
      </div>
    </form>
  );
}

const gridTwo = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
} as const;

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
