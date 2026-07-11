import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { uploadToBucket } from '../../lib/storage';
import { resizeImage } from '../../lib/image';
import { FieldShell, TextField } from './Field';
import { RolPicker } from '../admin/RolPicker';
import { Btn } from '../admin/Buttons';
import { IconUpload, IconClose } from '../icons';
import type { Member, Rol, EstadoMiembro } from '../../types';
import { GRUPOS_COMITE } from '../../types';

const ROL_VALUES: [Rol, ...Rol[]] = [
  'ADMINISTRADOR',
  'LIDER',
  'EDITOR',
  'PILOTO_OFICIAL',
  'ASPIRANTE',
  'GENERAL',
  'CO_PILOTO',
];

const ESTADO_VALUES: [EstadoMiembro, ...EstadoMiembro[]] = ['activo', 'pendiente', 'inactivo'];

const MiembroSchema = z.object({
  nombre: z.string().min(1, 'Nombre obligatorio'),
  apellido: z.string().min(1, 'Apellido obligatorio'),
  email: z.string().email('Email inválido'),
  foto_url: z.string().optional(),
  foto_path: z.string().optional(),
  cedula: z.string().optional(),
  fecha_nac: z.string().optional(),
  tel: z.string().optional(),
  ciudad: z.string().optional(),
  alias: z.string().optional(),
  rol: z.enum(ROL_VALUES),
  estado: z.enum(ESTADO_VALUES),
  ingreso: z.string().optional(),
  rodadas: z.coerce.number().int().min(0).default(0),

  moto_marca: z.string().optional(),
  moto_modelo: z.string().optional(),
  moto_year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional().or(z.literal('').transform(() => undefined)),
  moto_placa: z.string().optional(),
  moto_color: z.string().optional(),

  emergencia_nombre: z.string().optional(),
  emergencia_tel: z.string().optional(),
  emergencia_relacion: z.string().optional(),

  grupo: z.enum(['lideres', 'disciplina', 'ruta', 'contenido', '']).optional(),
  cargo: z.string().optional(),
  num: z.coerce.number().int().min(1).max(9999).optional().or(z.literal('').transform(() => undefined)),
  desde: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).optional().or(z.literal('').transform(() => undefined)),
});

type MiembroInput = z.infer<typeof MiembroSchema>;

interface Props {
  initial?: Member;
  onDone: () => void;
  onDelete?: (m: Member) => void;
  canChangeRole?: boolean;
}

export function FormMiembro({ initial, onDone, onDelete, canChangeRole = true }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MiembroInput>({
    resolver: zodResolver(MiembroSchema),
    defaultValues: initial
      ? {
          nombre: initial.nombre,
          apellido: initial.apellido,
          email: initial.email,
          foto_url: initial.foto_url ?? '',
          foto_path: initial.foto_path ?? '',
          cedula: initial.cedula ?? '',
          fecha_nac: initial.fecha_nac ?? '',
          tel: initial.tel ?? '',
          ciudad: initial.ciudad ?? '',
          alias: initial.alias ?? '',
          rol: initial.rol,
          estado: initial.estado,
          ingreso: initial.ingreso ?? '',
          rodadas: initial.rodadas,
          moto_marca: initial.moto_marca ?? '',
          moto_modelo: initial.moto_modelo ?? '',
          moto_year: initial.moto_year ?? undefined,
          moto_placa: initial.moto_placa ?? '',
          moto_color: initial.moto_color ?? '',
          emergencia_nombre: initial.emergencia?.nombre ?? '',
          emergencia_tel: initial.emergencia?.tel ?? '',
          emergencia_relacion: initial.emergencia?.relacion ?? '',
          grupo: initial.grupo ?? '',
          cargo: initial.cargo ?? '',
          num: initial.num ?? undefined,
          desde: initial.desde ?? undefined,
        }
      : {
          rol: 'GENERAL',
          estado: 'activo',
          rodadas: 0,
          ingreso: new Date().toISOString().slice(0, 10),
        },
  });

  const rol = watch('rol');
  const estado = watch('estado');
  const fotoUrl = watch('foto_url');
  const fotoInitials = (
    watch('alias') || `${(watch('nombre') ?? '')[0] ?? ''}${(watch('apellido') ?? '')[0] ?? ''}`
  )
    .slice(0, 2)
    .toUpperCase();

  const handleFotoUpload = async (file: File) => {
    setUploadingFoto(true);
    setFotoError(null);
    try {
      const blob = await resizeImage(file, { maxDim: 1000, quality: 0.82, mime: 'image/webp' });
      const ced = (watch('cedula') ?? '').replace(/\D/g, '');
      const up = await uploadToBucket(blob, {
        prefix: 'members/',
        filename: `${ced || 'foto'}.webp`,
      });
      setValue('foto_url', up.url, { shouldDirty: true });
      setValue('foto_path', up.path, { shouldDirty: true });
    } catch (e) {
      setFotoError(e instanceof Error ? e.message : 'Error subiendo la foto.');
    } finally {
      setUploadingFoto(false);
    }
  };

  const removeFoto = () => {
    setValue('foto_url', '', { shouldDirty: true });
    setValue('foto_path', '', { shouldDirty: true });
  };

  const onSubmit: SubmitHandler<MiembroInput> = async (values) => {
    setServerError(null);

    const emergencia =
      values.emergencia_nombre || values.emergencia_tel || values.emergencia_relacion
        ? {
            nombre: values.emergencia_nombre ?? '',
            tel: values.emergencia_tel ?? '',
            relacion: values.emergencia_relacion ?? '',
          }
        : null;

    const payload = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      foto_url: values.foto_url || null,
      foto_path: values.foto_path || null,
      cedula: values.cedula || null,
      fecha_nac: values.fecha_nac || null,
      tel: values.tel || null,
      ciudad: values.ciudad || null,
      alias: values.alias || null,
      rol: values.rol,
      estado: values.estado,
      ingreso: values.ingreso || null,
      rodadas: values.rodadas,
      moto_marca: values.moto_marca || null,
      moto_modelo: values.moto_modelo || null,
      moto_year: values.moto_year || null,
      moto_placa: values.moto_placa || null,
      moto_color: values.moto_color || null,
      emergencia,
      grupo: values.grupo ? values.grupo : null,
      cargo: values.cargo || null,
      num: values.num ?? null,
      desde: values.desde ?? null,
    };

    if (initial) {
      const { error } = await supabase.from('members').update(payload).eq('id', initial.id);
      if (error) {
        setServerError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('members').insert(payload);
      if (error) {
        setServerError(error.message);
        return;
      }
    }
    onDone();
  };

  const handleDelete = async () => {
    if (!initial || !onDelete) return;
    if (!window.confirm(`¿Eliminar definitivamente a ${initial.nombre} ${initial.apellido}? Esto borra su fila en members. Auth.users no se toca.`)) return;
    setDeleting(true);
    const { error } = await supabase.from('members').delete().eq('id', initial.id);
    setDeleting(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    onDelete(initial);
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      {/* Foto */}
      <Section
        title="Foto del piloto"
        subtitle="Se muestra en el carnet, el listado del panel y la card pública de /nosotros."
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid var(--rojo)',
              background: 'linear-gradient(135deg, var(--rojo), #4a0f0f)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto del miembro"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
              />
            ) : (
              <span className="t-display" style={{ fontSize: 34, color: 'var(--blanco)' }}>
                {fotoInitials || '?'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label
                htmlFor="foto-miembro"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  border: '1px solid var(--borde-strong)',
                  background: 'var(--dark-2)',
                  color: 'var(--blanco)',
                  cursor: uploadingFoto ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-cond)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                <IconUpload size={14} />
                {uploadingFoto ? 'Subiendo…' : fotoUrl ? 'Cambiar foto' : 'Subir foto'}
                <input
                  id="foto-miembro"
                  type="file"
                  accept="image/*"
                  disabled={uploadingFoto}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFotoUpload(f);
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              {fotoUrl ? (
                <button
                  type="button"
                  onClick={removeFoto}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 12px',
                    border: '1px solid var(--borde)',
                    background: 'transparent',
                    color: 'var(--light)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <IconClose size={12} /> Quitar
                </button>
              ) : null}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              JPG o PNG · se optimiza a WebP automáticamente en tu navegador.
            </span>
          </div>
        </div>
        {fotoError ? (
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
            {fotoError}
          </div>
        ) : null}
      </Section>

      {/* Datos básicos */}
      <Section title="Datos básicos">
        <Row>
          <FieldShell label="Nombre" required error={errors.nombre?.message}>
            <TextField {...register('nombre')} />
          </FieldShell>
          <FieldShell label="Apellido" required error={errors.apellido?.message}>
            <TextField {...register('apellido')} />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Email" required error={errors.email?.message} hint="Vincula con auth.users por coincidencia exacta">
            <TextField type="email" {...register('email')} disabled={Boolean(initial)} />
          </FieldShell>
          <FieldShell label="Alias / iniciales" error={errors.alias?.message}>
            <TextField {...register('alias')} maxLength={4} placeholder="KD, AM, …" />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Cédula" error={errors.cedula?.message}>
            <TextField {...register('cedula')} inputMode="numeric" />
          </FieldShell>
          <FieldShell label="Fecha de nacimiento" error={errors.fecha_nac?.message}>
            <TextField type="date" {...register('fecha_nac')} />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Teléfono" error={errors.tel?.message}>
            <TextField type="tel" {...register('tel')} placeholder="+57 …" />
          </FieldShell>
          <FieldShell label="Ciudad" error={errors.ciudad?.message}>
            <TextField {...register('ciudad')} placeholder="Barranquilla" />
          </FieldShell>
        </Row>
      </Section>

      {/* Rol y estado */}
      <Section title="Rol y permisos">
        {canChangeRole ? (
          <RolPicker value={rol} onChange={(r) => setValue('rol', r, { shouldDirty: true })} />
        ) : (
          <div
            style={{
              padding: '12px 14px',
              border: '1px solid var(--borde)',
              background: 'var(--dark-2)',
              color: 'var(--light)',
              fontSize: 13,
            }}
          >
            Tu rol no permite cambiar el rol de otros miembros. Pídele a un administrador.
          </div>
        )}

        <Row>
          <FieldShell label="Estado">
            <div style={{ display: 'flex', gap: 8 }}>
              {ESTADO_VALUES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('estado', s, { shouldDirty: true })}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: estado === s ? '1px solid var(--rojo)' : '1px solid var(--borde)',
                    background: estado === s ? 'var(--rojo-soft)' : 'var(--dark-2)',
                    color: estado === s ? 'var(--blanco)' : 'var(--light)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </FieldShell>
          <FieldShell label="Fecha de ingreso">
            <TextField type="date" {...register('ingreso')} />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Rodadas asistidas" hint="Contador histórico. Se incrementa al hacer check-in.">
            <TextField type="number" {...register('rodadas')} />
          </FieldShell>
        </Row>
      </Section>

      {/* Plantilla oficial */}
      <Section title="Plantilla oficial (público)" subtitle="Datos visibles en /nosotros si el miembro forma parte del comité.">
        <Row>
          <FieldShell label="Sub-grupo" hint="Solo para Administradores/Líderes que pertenezcan a un grupo">
            <select
              {...register('grupo')}
              style={{
                height: 38,
                background: 'var(--dark-2)',
                color: 'var(--blanco)',
                border: '1px solid var(--borde)',
                padding: '0 12px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                outline: 'none',
              }}
            >
              <option value="">— Ninguno —</option>
              {GRUPOS_COMITE.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </FieldShell>
          <FieldShell label="Cargo" hint="Presidente · Capitán de ruta · Fotógrafa…">
            <TextField {...register('cargo')} />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Dorsal #" hint="Número único de piloto (1-9999)">
            <TextField type="number" {...register('num')} />
          </FieldShell>
          <FieldShell label="Año de ingreso" hint="Para card 'Desde'">
            <TextField type="number" {...register('desde')} />
          </FieldShell>
        </Row>
      </Section>

      {/* Moto */}
      <Section title="Moto">
        <Row>
          <FieldShell label="Marca">
            <TextField {...register('moto_marca')} placeholder="TVS, Yamaha, Bajaj…" />
          </FieldShell>
          <FieldShell label="Modelo">
            <TextField {...register('moto_modelo')} placeholder="Raider 125…" />
          </FieldShell>
        </Row>
        <Row>
          <FieldShell label="Año">
            <TextField type="number" {...register('moto_year')} />
          </FieldShell>
          <FieldShell label="Placa">
            <TextField {...register('moto_placa')} />
          </FieldShell>
          <FieldShell label="Color">
            <TextField {...register('moto_color')} />
          </FieldShell>
        </Row>
      </Section>

      {/* Emergencia */}
      <Section title="Contacto de emergencia" subtitle="Quién debe ser contactado si pasa algo en una rodada.">
        <Row>
          <FieldShell label="Nombre">
            <TextField {...register('emergencia_nombre')} />
          </FieldShell>
          <FieldShell label="Teléfono">
            <TextField type="tel" {...register('emergencia_tel')} />
          </FieldShell>
          <FieldShell label="Relación">
            <TextField {...register('emergencia_relacion')} placeholder="Esposa, padre, hermano…" />
          </FieldShell>
        </Row>
      </Section>

      {serverError ? (
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
          {serverError}
        </div>
      ) : null}

      <footer
        style={{
          position: 'sticky',
          bottom: -22,
          background: 'var(--negro)',
          padding: '14px 0 4px',
          borderTop: '1px solid var(--borde)',
          display: 'flex',
          gap: 10,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {initial && onDelete ? (
            <Btn variant="danger" onClick={() => void handleDelete()} disabled={deleting} type="button">
              {deleting ? 'Eliminando…' : 'Eliminar miembro'}
            </Btn>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={onDone} type="button">
            Cancelar
          </Btn>
          <Btn type="submit" disabled={isSubmitting || (Boolean(initial) && !isDirty)}>
            {isSubmitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear miembro'}
          </Btn>
        </div>
      </footer>
    </form>
  );
}

function Section({
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
      <header style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <h3
          className="t-display"
          style={{ fontSize: 18, color: 'var(--blanco)', margin: 0, letterSpacing: '0.02em' }}
        >
          {title}
        </h3>
        {subtitle ? (
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{subtitle}</span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
