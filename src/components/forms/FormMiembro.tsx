import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { FieldShell, TextField } from './Field';
import { RolPicker } from '../admin/RolPicker';
import { Btn } from '../admin/Buttons';
import type { Member, Rol, EstadoMiembro } from '../../types';

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
