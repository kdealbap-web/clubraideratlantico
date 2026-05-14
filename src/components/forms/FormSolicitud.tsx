import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { Section, FieldShell, TextField, TextAreaField } from './Field';
import { CLUB } from '../../lib/constants';

function calcAge(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return -1;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}

const SiNo = z.enum(['si', 'no']);

const SolicitudSchema = z
  .object({
    nombre: z.string().min(1, 'Tu nombre es obligatorio'),
    apellido: z.string().min(1, 'Tu apellido es obligatorio'),
    cedula: z.string().min(6, 'Cédula muy corta'),
    fecha_nac: z.string().refine((v) => calcAge(v) >= 18, 'Solo mayores de 18'),
    email: z.string().email('Email inválido'),
    tel: z.string().min(7, 'Teléfono muy corto'),
    ciudad: z.string().min(2, 'Ciudad obligatoria'),

    moto_marca: z.string().min(1, 'Marca obligatoria'),
    moto_modelo: z.string().min(1, 'Modelo obligatorio'),
    moto_year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
    moto_placa: z.string().min(3, 'Placa obligatoria'),
    moto_color: z.string().min(2, 'Color obligatorio'),

    doc_propia: SiNo,
    doc_tarjeta: SiNo,
    doc_soat: SiNo,
    doc_tecno: SiNo,

    tiene_licencia: z.boolean().default(false),
    experiencia: z.enum(['novato', 'intermedio', 'experimentado']),

    con_copiloto: z.boolean().default(false),
    co_nombre: z.string().optional(),
    co_apellido: z.string().optional(),
    co_cedula: z.string().optional(),
    co_fecha_nac: z.string().optional(),
    co_tel: z.string().optional(),

    motivo: z.string().optional(),

    acepta_reglamento: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar el reglamento' }) }),
    acepta_datos: z.literal(true, { errorMap: () => ({ message: 'Debes autorizar el tratamiento de datos' }) }),
  })
  .refine((d) => !d.con_copiloto || (d.co_nombre && d.co_apellido && d.co_cedula && d.co_fecha_nac), {
    message: 'Completa los datos del copiloto',
    path: ['co_nombre'],
  });

export type SolicitudInput = z.infer<typeof SolicitudSchema>;

export function FormSolicitud() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudInput>({
    resolver: zodResolver(SolicitudSchema),
    defaultValues: {
      tiene_licencia: false,
      con_copiloto: false,
      experiencia: 'novato',
    },
  });

  const conCopiloto = watch('con_copiloto');
  const fechaNac = watch('fecha_nac');
  const age = fechaNac ? calcAge(fechaNac) : null;

  const onSubmit: SubmitHandler<SolicitudInput> = async (values) => {
    setServerError(null);
    const payload = {
      nombre: values.nombre,
      apellido: values.apellido,
      cedula: values.cedula,
      fecha_nac: values.fecha_nac,
      email: values.email,
      tel: values.tel,
      ciudad: values.ciudad,
      moto_marca: values.moto_marca,
      moto_modelo: values.moto_modelo,
      moto_year: values.moto_year,
      moto_placa: values.moto_placa,
      moto_color: values.moto_color,
      doc_propia: values.doc_propia === 'si',
      doc_tarjeta: values.doc_tarjeta === 'si',
      doc_soat: values.doc_soat === 'si',
      doc_tecno: values.doc_tecno === 'si',
      tiene_licencia: values.tiene_licencia,
      experiencia: values.experiencia,
      con_copiloto: values.con_copiloto,
      co_nombre: values.con_copiloto ? values.co_nombre ?? null : null,
      co_apellido: values.con_copiloto ? values.co_apellido ?? null : null,
      co_cedula: values.con_copiloto ? values.co_cedula ?? null : null,
      co_fecha_nac: values.con_copiloto ? values.co_fecha_nac ?? null : null,
      co_tel: values.con_copiloto ? values.co_tel ?? null : null,
      motivo: values.motivo ?? null,
      acepta_reglamento: values.acepta_reglamento,
      acepta_datos: values.acepta_datos,
    };

    const { error } = await supabase.from('solicitudes').insert(payload);
    if (error) {
      setServerError(error.message);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        style={{
          border: '1px solid var(--rojo)',
          background: 'var(--rojo-soft)',
          padding: '32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div className="kicker">· Solicitud enviada</div>
        <h2 className="t-display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, color: 'var(--blanco)' }}>
          Listo, piloto.
        </h2>
        <p style={{ color: 'var(--light)', maxWidth: 520, margin: '0 auto' }}>
          El comité revisará tu solicitud manualmente. Te avisamos al email{' '}
          <strong style={{ color: 'var(--blanco)' }}>{watch('email')}</strong> cuando haya respuesta.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <a
            href={CLUB.social.instagram.url}
            target="_blank"
            rel="noreferrer"
            style={ctaBtn}
          >
            Síguenos en IG →
          </a>
          <a href={CLUB.social.whatsapp.url} target="_blank" rel="noreferrer" style={ctaBtn}>
            Grupo de WhatsApp →
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
    >
      <Section number="01" title="Tus datos">
        <div style={gridTwo}>
          <FieldShell label="Nombre" required error={errors.nombre?.message}>
            <TextField {...register('nombre')} />
          </FieldShell>
          <FieldShell label="Apellido" required error={errors.apellido?.message}>
            <TextField {...register('apellido')} />
          </FieldShell>
          <FieldShell label="Cédula" required error={errors.cedula?.message}>
            <TextField {...register('cedula')} inputMode="numeric" />
          </FieldShell>
          <FieldShell
            label="Fecha de nacimiento"
            required
            error={errors.fecha_nac?.message}
            hint={
              age != null && age >= 0
                ? age >= 18
                  ? `${age} años · OK`
                  : 'Solo mayores de 18'
                : undefined
            }
          >
            <TextField type="date" {...register('fecha_nac')} />
          </FieldShell>
          <FieldShell label="Email" required error={errors.email?.message}>
            <TextField type="email" {...register('email')} />
          </FieldShell>
          <FieldShell label="WhatsApp" required error={errors.tel?.message}>
            <TextField type="tel" {...register('tel')} placeholder="+57 …" />
          </FieldShell>
          <FieldShell label="Ciudad" required error={errors.ciudad?.message}>
            <TextField {...register('ciudad')} placeholder="Barranquilla" />
          </FieldShell>
        </div>
      </Section>

      <Section number="02" title="Tu moto" subtitle="Cualquier marca y modelo es bienvenida.">
        <div style={gridTwo}>
          <FieldShell label="Marca" required error={errors.moto_marca?.message}>
            <TextField {...register('moto_marca')} placeholder="TVS, Yamaha, Bajaj…" />
          </FieldShell>
          <FieldShell label="Modelo" required error={errors.moto_modelo?.message}>
            <TextField {...register('moto_modelo')} placeholder="Raider 125, FZ-S…" />
          </FieldShell>
          <FieldShell label="Año" required error={errors.moto_year?.message}>
            <TextField type="number" inputMode="numeric" {...register('moto_year')} />
          </FieldShell>
          <FieldShell label="Placa" required error={errors.moto_placa?.message}>
            <TextField {...register('moto_placa')} />
          </FieldShell>
          <FieldShell label="Color" required error={errors.moto_color?.message}>
            <TextField {...register('moto_color')} />
          </FieldShell>
        </div>
      </Section>

      <Section
        number="03"
        title="Documentos de la moto"
        subtitle="Solo consulta · respuesta honesta. El club no exige verificación documental."
      >
        <div style={gridTwo}>
          <RadioRow label="¿La moto es propia (tuya)?" name="doc_propia" register={register} error={errors.doc_propia?.message} />
          <RadioRow label="¿Tarjeta de propiedad vigente?" name="doc_tarjeta" register={register} error={errors.doc_tarjeta?.message} />
          <RadioRow label="¿SOAT vigente?" name="doc_soat" register={register} error={errors.doc_soat?.message} />
          <RadioRow label="¿Tecnomecánica al día (cuando aplique)?" name="doc_tecno" register={register} error={errors.doc_tecno?.message} />
        </div>
      </Section>

      <Section number="04" title="Tú como piloto">
        <label
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            color: 'var(--blanco)',
            fontSize: 14,
          }}
        >
          <input type="checkbox" {...register('tiene_licencia')} />
          Tengo licencia de conducción
        </label>
        <FieldShell label="Nivel de experiencia" required error={errors.experiencia?.message}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            {(['novato', 'intermedio', 'experimentado'] as const).map((opt) => (
              <label
                key={opt}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid var(--borde)',
                  background: 'var(--dark-2)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-cond)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                <input type="radio" value={opt} {...register('experiencia')} />
                {opt}
              </label>
            ))}
          </div>
        </FieldShell>
      </Section>

      <Section number="05" title="Copiloto (opcional)" subtitle="Si llevas parrillero, regístralo aquí.">
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--blanco)', fontSize: 14 }}>
          <input type="checkbox" {...register('con_copiloto')} />
          Voy a llevar copiloto / parrillero
        </label>

        {conCopiloto ? (
          <div style={gridTwo}>
            <FieldShell label="Nombre" error={errors.co_nombre?.message}>
              <TextField {...register('co_nombre')} />
            </FieldShell>
            <FieldShell label="Apellido" error={errors.co_apellido?.message}>
              <TextField {...register('co_apellido')} />
            </FieldShell>
            <FieldShell label="Cédula" error={errors.co_cedula?.message}>
              <TextField {...register('co_cedula')} inputMode="numeric" />
            </FieldShell>
            <FieldShell label="Fecha de nacimiento" error={errors.co_fecha_nac?.message}>
              <TextField type="date" {...register('co_fecha_nac')} />
            </FieldShell>
            <FieldShell label="Teléfono" error={errors.co_tel?.message}>
              <TextField type="tel" {...register('co_tel')} />
            </FieldShell>
          </div>
        ) : null}
      </Section>

      <Section number="06" title="Cuéntanos por qué">
        <FieldShell label="¿Por qué quieres pertenecer al club?" hint="Opcional · máx. 500 caracteres">
          <TextAreaField {...register('motivo')} maxLength={500} />
        </FieldShell>
      </Section>

      <section
        style={{
          border: '1px solid var(--borde)',
          background: 'var(--dark-1)',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <label style={{ display: 'flex', gap: 10, color: 'var(--blanco)', fontSize: 14, alignItems: 'flex-start' }}>
          <input type="checkbox" {...register('acepta_reglamento')} style={{ marginTop: 3 }} />
          <span>
            Acepto el <a href="/reglamento" style={{ color: 'var(--rojo)' }}>reglamento</a> del club en su totalidad.
            {errors.acepta_reglamento ? (
              <span style={{ display: 'block', color: 'var(--rojo-light)', fontSize: 12 }}>
                {errors.acepta_reglamento.message as string}
              </span>
            ) : null}
          </span>
        </label>
        <label style={{ display: 'flex', gap: 10, color: 'var(--blanco)', fontSize: 14, alignItems: 'flex-start' }}>
          <input type="checkbox" {...register('acepta_datos')} style={{ marginTop: 3 }} />
          <span>
            Autorizo el tratamiento de mis datos personales según política de privacidad del club.
            {errors.acepta_datos ? (
              <span style={{ display: 'block', color: 'var(--rojo-light)', fontSize: 12 }}>
                {errors.acepta_datos.message as string}
              </span>
            ) : null}
          </span>
        </label>

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

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>
            No hay costo · no hay plazo fijo. El comité responde cuando pueda.
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 14,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              padding: '14px 24px',
              border: 'none',
              cursor: isSubmitting ? 'wait' : 'pointer',
              clipPath: 'var(--clip-btn-l)',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar solicitud →'}
          </button>
        </div>
      </section>
    </form>
  );
}

const ctaBtn = {
  fontFamily: 'var(--font-cond)',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--blanco)',
  border: '1px solid var(--borde-strong)',
  padding: '10px 16px',
  textDecoration: 'none',
};

const gridTwo = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
} as const;

function RadioRow({
  label,
  name,
  register,
  error,
}: {
  label: string;
  name: 'doc_propia' | 'doc_tarjeta' | 'doc_soat' | 'doc_tecno';
  register: ReturnType<typeof useForm<SolicitudInput>>['register'];
  error?: string;
}) {
  return (
    <FieldShell label={label} required error={error}>
      <div style={{ display: 'flex', gap: 10 }}>
        {(['si', 'no'] as const).map((opt) => (
          <label
            key={opt}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--borde)',
              background: 'var(--dark-2)',
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <input type="radio" value={opt} {...register(name)} />
            {opt}
          </label>
        ))}
      </div>
    </FieldShell>
  );
}
