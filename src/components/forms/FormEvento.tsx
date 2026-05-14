import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField, TextAreaField } from './Field';
import { Btn } from '../admin/Buttons';
import { IconImage, IconUpload, IconClose } from '../icons';
import type { EventItem } from '../../types';

const ESTADOS = ['borrador', 'publicado', 'realizado', 'cancelado'] as const;
const TIPOS = ['Rodada', 'Evento', 'Capacitación'] as const;
const DIFICULTADES = ['Fácil', 'Media', 'Alta', '—'] as const;
const BUCKET = 'gallery';

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
  cover_url: z.string().optional(),
  contacto_lider: z.string().optional(),
  contacto_tel: z.string().optional(),
  ubicacion_url: z.string().optional(),
  requisitos: z.string().optional(),
  recomendaciones: z.string().optional(),
  que_llevar: z.string().optional(),
});

type EventoInput = z.infer<typeof EventoSchema>;

interface Props {
  initial?: EventItem;
  onDone: () => void;
}

export function FormEvento({ initial, onDone }: Props) {
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_url ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
          cover_url: initial.cover_url ?? '',
          contacto_lider: initial.contacto_lider ?? '',
          contacto_tel: initial.contacto_tel ?? '',
          ubicacion_url: initial.ubicacion_url ?? '',
          requisitos: initial.requisitos ?? '',
          recomendaciones: initial.recomendaciones ?? '',
          que_llevar: initial.que_llevar ?? '',
        }
      : {
          estado: 'borrador',
          tipo: 'Rodada',
          dificultad: 'Fácil',
          cupos: 30,
          inscritos: 0,
          km: 0,
          ruta: '',
          cover_url: '',
          contacto_lider: '',
          contacto_tel: '',
          ubicacion_url: '',
          requisitos: '',
          recomendaciones: '',
          que_llevar: '',
        },
  });

  const currentCoverUrl = watch('cover_url');

  const handleFileUpload = async (file: File) => {
    setUploadingCover(true);
    setUploadError(null);
    try {
      const path = `events/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setValue('cover_url', pub.publicUrl, { shouldDirty: true });
      setCoverPreview(pub.publicUrl);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error subiendo imagen');
    } finally {
      setUploadingCover(false);
    }
  };

  const removeCover = () => {
    setValue('cover_url', '', { shouldDirty: true });
    setCoverPreview(null);
  };

  const onSubmit: SubmitHandler<EventoInput> = async (values) => {
    const payload = {
      ...values,
      cover_url: values.cover_url || null,
      contacto_lider: values.contacto_lider || null,
      contacto_tel: values.contacto_tel || null,
      ubicacion_url: values.ubicacion_url || null,
      requisitos: values.requisitos || null,
      recomendaciones: values.recomendaciones || null,
      que_llevar: values.que_llevar || null,
    };
    if (initial) {
      const { error } = await supabase.from('events').update(payload).eq('id', initial.id);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from('events').insert(payload);
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
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <FormSection
        title="Imagen de portada"
        subtitle="Una foto del lugar o de la rodada anterior. Se muestra grande en /eventos."
      >
        {coverPreview ? (
          <div
            style={{
              position: 'relative',
              border: '1px solid var(--borde)',
              background: `url('${coverPreview}') center/cover`,
              paddingTop: '40%',
            }}
          >
            <button
              type="button"
              onClick={removeCover}
              title="Quitar imagen"
              style={{
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
              }}
            >
              <IconClose size={14} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="cover-file"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '32px 18px',
              border: '1px dashed var(--borde-strong)',
              background: 'var(--dark-2)',
              cursor: uploadingCover ? 'wait' : 'pointer',
              color: 'var(--light)',
            }}
          >
            <IconUpload size={28} />
            <div
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--blanco)',
                fontWeight: 600,
              }}
            >
              {uploadingCover ? 'Subiendo…' : 'Haz click para subir imagen'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              JPG, PNG o WebP · se sube a bucket gallery/events/
            </div>
            <input
              id="cover-file"
              type="file"
              accept="image/*"
              disabled={uploadingCover}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileUpload(f);
              }}
              style={{ display: 'none' }}
            />
          </label>
        )}
        <FieldShell label="O pega una URL externa" hint="Útil si la foto vive en Drive, Instagram, etc.">
          <TextField
            type="url"
            value={currentCoverUrl ?? ''}
            onChange={(e) => {
              setValue('cover_url', e.target.value, { shouldDirty: true });
              setCoverPreview(e.target.value || null);
            }}
            placeholder="https://…"
          />
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
      </FormSection>

      <FormSection title="Información básica">
        <FieldShell label="Título" required error={errors.titulo?.message}>
          <TextField {...register('titulo')} placeholder="Rodada Vía al Mar" />
        </FieldShell>
        <FieldShell label="Descripción" required error={errors.descripcion?.message}>
          <TextAreaField {...register('descripcion')} style={{ minHeight: 90 }} />
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
          <TextField {...register('salida')} placeholder="Estación Texaco · Cra 53 #76" />
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
      </FormSection>

      <FormSection title="Recomendaciones del líder" subtitle="Aparece como sección visual en el detalle público.">
        <FieldShell
          label="Recomendaciones"
          hint="Tips del líder: clima, ritmo, paradas previstas, lo que diferencia esta rodada"
        >
          <TextAreaField
            {...register('recomendaciones')}
            style={{ minHeight: 100 }}
            placeholder="Ej: Salimos temprano para evitar el calor. Llenar tanque antes. Habrá parada técnica en el km 40."
          />
        </FieldShell>
        <FieldShell
          label="Qué llevar"
          hint="Una cosa por línea. Se renderiza como checklist visual en el detalle público."
        >
          <TextAreaField
            {...register('que_llevar')}
            style={{ minHeight: 110 }}
            placeholder={'Documentos al día\nCasco y guantes\n1.5L de agua\nGafas o careta\nDinero efectivo para peajes'}
          />
        </FieldShell>
        <FieldShell label="Requisitos especiales (obligatorios)" hint="Cosas no negociables específicas de esta rodada">
          <TextAreaField
            {...register('requisitos')}
            style={{ minHeight: 60 }}
            placeholder="Ej: Solo motos ≥250cc · Licencia A2 vigente"
          />
        </FieldShell>
      </FormSection>

      <FormSection title="Ubicación y contacto">
        <FieldShell
          label="URL ubicación Google Maps"
          hint="Pega el link compartido de Maps. Si vacío, el sitio busca por 'Punto de salida'."
        >
          <TextField type="url" {...register('ubicacion_url')} placeholder="https://maps.app.goo.gl/…" />
        </FieldShell>
        <div style={gridTwo}>
          <FieldShell label="Líder de ruta">
            <TextField {...register('contacto_lider')} placeholder="Nombre del líder" />
          </FieldShell>
          <FieldShell label="WhatsApp líder" hint="+57 3xx xxx xxxx">
            <TextField type="tel" {...register('contacto_tel')} placeholder="+57 …" />
          </FieldShell>
        </div>
      </FormSection>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Btn>
        <Btn type="submit" disabled={isSubmitting || uploadingCover}>
          {isSubmitting ? 'Guardando…' : initial ? 'Actualizar evento' : 'Crear evento'}
        </Btn>
      </div>
    </form>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingBottom: 14,
        borderBottom: '1px solid var(--borde)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            background: 'var(--rojo-soft)',
            color: 'var(--rojo)',
            border: '1px solid var(--rojo)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <IconImage size={14} />
        </span>
        <div>
          <h3
            className="t-display"
            style={{ fontSize: 18, color: 'var(--blanco)', margin: 0, letterSpacing: '0.02em' }}
          >
            {title}
          </h3>
          {subtitle ? (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{subtitle}</span>
          ) : null}
        </div>
      </header>
      {children}
    </section>
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
