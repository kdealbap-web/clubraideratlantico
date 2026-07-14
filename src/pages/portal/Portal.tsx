import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { CLUB, ROUTES } from '../../lib/constants';
import { PublicNav } from '../../components/public/PublicNav';
import { Footer } from '../../components/public/Footer';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  IconBike,
  IconCalendar,
  IconCheck,
  IconDownload,
  IconHelmet,
  IconQR,
  IconRoute,
} from '../../components/icons';
import { Btn } from '../../components/admin/Buttons';
import { Drawer } from '../../components/admin/Drawer';
import { FieldShell, TextField } from '../../components/forms/Field';
import { AsistenciaPanel } from '../../components/asistencia/AsistenciaPanel';
import { downloadCSV } from '../../lib/csv';
import { ROL_LABELS, type EventItem } from '../../types';

type Tab = 'carnet' | 'rodadas' | 'datos' | 'miasistencia' | 'asistencia';

export function PortalPage() {
  const { member, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('carnet');
  const puedeAsistencia =
    member != null &&
    member.estado === 'activo' &&
    (member.rol === 'ADMINISTRADOR' || member.rol === 'LIDER' || member.grupo === 'disciplina');

  if (!member) {
    return (
      <div style={{ background: 'var(--negro)', color: 'var(--blanco)', minHeight: '100vh' }}>
        <PublicNav />
        <section style={{ padding: '80px 32px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="kicker">· Portal del piloto</div>
          <h1
            className="t-display"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: '12px 0', color: 'var(--blanco)' }}
          >
            Tu cuenta aún no está vinculada.
          </h1>
          <p style={{ color: 'var(--light)' }}>
            Iniciaste sesión, pero no encontramos tu registro en la tabla <code>members</code>. Pídele al
            admin que active tu cuenta o solicita tu ingreso desde el formulario público.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to={ROUTES.unete} style={primaryBtn}>
              Solicitar ingreso →
            </Link>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              style={ghostBtn}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--negro)',
        color: 'var(--blanco)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PublicNav />

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div className="kicker">· Portal del piloto</div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(40px, 6vw, 64px)',
              margin: '8px 0 0',
              color: 'var(--blanco)',
            }}
          >
            Hola, <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>{member.nombre}</span>.
          </h1>
          <p style={{ color: 'var(--light)', marginTop: 8 }}>
            {ROL_LABELS[member.rol]} · {member.ciudad} · Estado: {member.estado}
          </p>
        </header>

        <nav
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--borde)',
            marginBottom: 22,
            flexWrap: 'wrap',
          }}
        >
          <TabBtn active={tab === 'carnet'} onClick={() => setTab('carnet')} icon={<IconQR size={14} />}>
            Mi carnet
          </TabBtn>
          <TabBtn active={tab === 'rodadas'} onClick={() => setTab('rodadas')} icon={<IconRoute size={14} />}>
            Mis rodadas
          </TabBtn>
          <TabBtn active={tab === 'datos'} onClick={() => setTab('datos')} icon={<IconHelmet size={14} />}>
            Mis datos
          </TabBtn>
          <TabBtn
            active={tab === 'miasistencia'}
            onClick={() => setTab('miasistencia')}
            icon={<IconCalendar size={14} />}
          >
            Mi asistencia
          </TabBtn>
          {puedeAsistencia ? (
            <TabBtn
              active={tab === 'asistencia'}
              onClick={() => setTab('asistencia')}
              icon={<IconCheck size={14} />}
            >
              Registrar
            </TabBtn>
          ) : null}
        </nav>

        {tab === 'carnet' ? <CarnetView /> : null}
        {tab === 'rodadas' ? <RodadasView /> : null}
        {tab === 'datos' ? <DatosView /> : null}
        {tab === 'miasistencia' ? (
          <MiAsistenciaView memberId={member.id} nombre={member.nombre} apellido={member.apellido} />
        ) : null}
        {tab === 'asistencia' && puedeAsistencia ? <AsistenciaView memberId={member.id} /> : null}
      </main>

      <Footer />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 18px',
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? 'var(--rojo)' : 'transparent'}`,
        color: active ? 'var(--blanco)' : 'var(--light)',
        fontFamily: 'var(--font-cond)',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function CarnetView() {
  const { member } = useAuth();
  if (!member) return null;

  const ingreso = member.ingreso ?? '—';
  const initials = (
    member.alias || `${member.nombre[0] ?? ''}${member.apellido[0] ?? ''}`
  )
    .slice(0, 2)
    .toUpperCase();

  // El QR codifica la cédula del piloto (compatible con el sistema anterior de
  // asistencia, donde el código escaneado es la cédula).
  const qrPayload = (member.cedula ?? '').replace(/\D/g, '') || member.id;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0a0a0a&color=cc2222&data=${encodeURIComponent(
    qrPayload,
  )}`;

  return (
    <article
      style={{
        background:
          'linear-gradient(135deg, var(--dark-1) 0%, var(--dark-2) 60%, var(--dark-1) 100%)',
        border: '1px solid var(--rojo)',
        padding: 28,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 28,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 80% 20%, rgba(204,34,34,0.25), transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 140,
          height: 140,
          background: 'var(--rojo)',
          color: 'var(--blanco)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          fontFamily: 'var(--font-display)',
          fontSize: 64,
          letterSpacing: '0.02em',
          position: 'relative',
        }}
      >
        {member.foto_url ? (
          <img
            src={member.foto_url}
            alt={`${member.nombre} ${member.apellido}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
          />
        ) : (
          initials
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
        <div className="kicker">· Carnet · {CLUB.nombre}</div>
        <h2
          className="t-display"
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            margin: 0,
            color: 'var(--blanco)',
            lineHeight: 1,
          }}
        >
          {member.nombre} {member.apellido}
        </h2>
        <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--rojo)' }}>
          {ROL_LABELS[member.rol]} · {member.estado}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
            marginTop: 12,
            borderTop: '1px solid var(--borde)',
            paddingTop: 12,
          }}
        >
          <CarnetField k="Ciudad" v={member.ciudad ?? '—'} />
          <CarnetField k="Ingreso" v={ingreso} />
          <CarnetField k="Moto" v={`${member.moto_marca ?? '—'} ${member.moto_modelo ?? ''}`.trim()} />
          <CarnetField k="Placa" v={member.moto_placa ?? '—'} />
        </div>
      </div>

      <div
        style={{
          background: 'var(--negro)',
          padding: 12,
          border: '1px solid var(--borde-strong)',
          position: 'relative',
        }}
      >
        <img src={qrUrl} alt="QR identidad" width={140} height={140} />
        <div className="t-cond-up" style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>
          ID #{member.id.slice(0, 8)}
        </div>
      </div>
    </article>
  );
}

function CarnetField({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        className="t-cond-up"
        style={{ fontSize: 10, color: 'var(--muted)' }}
      >
        {k}
      </span>
      <span style={{ color: 'var(--blanco)', fontSize: 14 }}>{v}</span>
    </div>
  );
}

interface MiAsis {
  id: string;
  fecha: string;
  hora: string | null;
  event_id: string | null;
  events: { titulo: string; tipo: string } | null;
}

function MiAsistenciaView({
  memberId,
  nombre,
  apellido,
}: {
  memberId: string;
  nombre: string;
  apellido: string;
}) {
  const [rows, setRows] = useState<MiAsis[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('asistencias')
        .select('id, fecha, hora, event_id, events!event_id ( titulo, tipo )')
        .eq('member_id', memberId)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false });
      if (!active) return;
      if (e) {
        setError(e.message);
        setRows([]);
        return;
      }
      const raw = (data ?? []) as Array<Record<string, unknown>>;
      const list: MiAsis[] = raw.map((r) => {
        const evField = r.events;
        const ev = (Array.isArray(evField) ? evField[0] : evField) as MiAsis['events'] | undefined;
        return {
          id: String(r.id),
          fecha: String(r.fecha),
          hora: (r.hora as string | null) ?? null,
          event_id: (r.event_id as string | null) ?? null,
          events: ev ?? null,
        };
      });
      setRows(list);
    })();
    return () => {
      active = false;
    };
  }, [memberId]);

  const exportCSV = () => {
    if (!rows) return;
    const header = ['Fecha', 'Hora', 'Actividad'];
    const body = rows.map((r) => [
      r.fecha.split('-').reverse().join('/'),
      r.hora ?? '',
      r.events?.titulo ?? 'Reunión / actividad',
    ]);
    const nombreArchivo = `mi-asistencia-${nombre}-${apellido}`
      .replace(/\s+/g, '-')
      .toLowerCase();
    downloadCSV(`${nombreArchivo}.csv`, [header, ...body]);
  };

  return (
    <div
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="t-display" style={{ fontSize: 24, color: 'var(--blanco)', margin: 0 }}>
            Mi asistencia
          </h2>
          <p style={{ color: 'var(--light)', fontSize: 13.5, margin: '6px 0 0' }}>
            Tus registros de asistencia a rodadas, eventos y reuniones del club.
          </p>
        </div>
        {rows && rows.length > 0 ? (
          <Btn type="button" variant="ghost" icon={<IconDownload size={13} />} onClick={exportCSV}>
            Descargar CSV
          </Btn>
        ) : null}
      </div>

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
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando…</div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Aún no tienes asistencias"
          body="Cuando el equipo escanee tu carnet en una actividad, aparecerá aquí tu registro."
        />
      ) : (
        <>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Total:{' '}
            <strong style={{ color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
              {rows.length}
            </strong>{' '}
            {rows.length === 1 ? 'asistencia' : 'asistencias'}
          </div>
          <div style={{ border: '1px solid var(--borde)' }}>
            {rows.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '11px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--borde)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--blanco)', fontSize: 14 }}>
                    {r.events?.titulo ?? 'Reunión / actividad'}
                  </div>
                  {r.events?.tipo ? (
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>{r.events.tipo}</div>
                  ) : null}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    color: 'var(--light)',
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.fecha.split('-').reverse().join('/')}
                  {r.hora ? ` · ${r.hora.slice(0, 5)}` : ''}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AsistenciaView({ memberId }: { memberId: string }) {
  return (
    <div
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h2 className="t-display" style={{ fontSize: 24, color: 'var(--blanco)', margin: 0 }}>
          Registrar asistencia
        </h2>
        <p style={{ color: 'var(--light)', fontSize: 13.5, margin: '6px 0 0' }}>
          Selecciona la actividad y escanea el QR del carnet de cada piloto. El escáner solo se
          habilita el día del evento.
        </p>
      </div>
      <AsistenciaPanel registradoPor={memberId} />
    </div>
  );
}

function RodadasView() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha', { ascending: true });
      if (!active) return;
      if (e) {
        setError(e.message);
        setEvents([]);
      } else {
        setEvents((data ?? []) as EventItem[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
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
    );
  }
  if (events === null) {
    return <SkelLoading />;
  }
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<IconCalendar size={24} />}
        title="Aún no hay rodadas publicadas"
        body="Cuando el comité publique la próxima rodada, aparecerá acá con cupos y briefing."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {events.map((ev) => (
        <article
          key={ev.id}
          style={{
            background: 'var(--dark-1)',
            border: '1px solid var(--borde)',
            padding: '18px 20px',
            display: 'grid',
            gridTemplateColumns: '90px 1fr auto',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="t-display"
              style={{ fontSize: 32, color: 'var(--rojo)', lineHeight: 1 }}
            >
              {ev.fecha.slice(8, 10)}
            </span>
            <span className="t-cond-up" style={{ fontSize: 11, color: 'var(--light)' }}>
              {ev.hora}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <strong style={{ fontSize: 18, color: 'var(--blanco)' }}>{ev.titulo}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              {ev.salida} · {ev.dificultad} {ev.km ? `· ${ev.km} km` : ''}
            </span>
          </div>
          <button
            type="button"
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              border: 'none',
              padding: '10px 14px',
              cursor: 'pointer',
              clipPath: 'var(--clip-btn)',
            }}
            onClick={() => alert('Inscripciones a rodadas se entregan en hito 8 v2.')}
          >
            Inscribirme
          </button>
        </article>
      ))}
    </div>
  );
}

function DatosView() {
  const { member, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: member?.nombre ?? '',
    apellido: member?.apellido ?? '',
    tel: member?.tel ?? '',
    ciudad: member?.ciudad ?? '',
    moto_marca: member?.moto_marca ?? '',
    moto_modelo: member?.moto_modelo ?? '',
    moto_placa: member?.moto_placa ?? '',
    moto_color: member?.moto_color ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!member) return null;

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error: e } = await supabase.from('members').update(form).eq('id', member.id);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <div
        style={{
          background: 'var(--dark-1)',
          border: '1px solid var(--borde)',
          padding: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <Field k="Nombre" v={`${member.nombre} ${member.apellido}`} />
        <Field k="Cédula" v={member.cedula ?? '—'} />
        <Field k="Email" v={member.email} />
        <Field k="Teléfono" v={member.tel ?? '—'} />
        <Field k="Ciudad" v={member.ciudad ?? '—'} />
        <Field k="Rol" v={ROL_LABELS[member.rol]} />
        <Field k="Moto" v={`${member.moto_marca ?? '—'} ${member.moto_modelo ?? ''} ${member.moto_year ?? ''}`.trim()} />
        <Field k="Placa" v={member.moto_placa ?? '—'} />
        <Field k="Color" v={member.moto_color ?? '—'} />
        <Field k="Rodadas" v={String(member.rodadas)} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <Btn onClick={() => setOpen(true)} icon={<IconBike size={12} />}>
          Editar mis datos
        </Btn>
        <Btn variant="ghost" onClick={() => void signOut()}>
          Cerrar sesión
        </Btn>
      </div>

      <Drawer open={open} title="Editar mis datos" onClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FieldShell label="Nombre">
            <TextField value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Apellido">
            <TextField value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Teléfono">
            <TextField value={form.tel} onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Ciudad">
            <TextField value={form.ciudad} onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Marca de moto">
            <TextField value={form.moto_marca} onChange={(e) => setForm((f) => ({ ...f, moto_marca: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Modelo">
            <TextField value={form.moto_modelo} onChange={(e) => setForm((f) => ({ ...f, moto_modelo: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Placa">
            <TextField value={form.moto_placa} onChange={(e) => setForm((f) => ({ ...f, moto_placa: e.target.value }))} />
          </FieldShell>
          <FieldShell label="Color">
            <TextField value={form.moto_color} onChange={(e) => setForm((f) => ({ ...f, moto_color: e.target.value }))} />
          </FieldShell>

          {error ? (
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
              {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Btn>
            <Btn disabled={saving} onClick={() => void save()}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Btn>
          </div>
        </div>
      </Drawer>
    </>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        className="t-cond-up"
        style={{ fontSize: 10, color: 'var(--muted)' }}
      >
        {k}
      </span>
      <span style={{ color: 'var(--blanco)' }}>{v}</span>
    </div>
  );
}

function SkelLoading() {
  return (
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
  );
}

const primaryBtn = {
  fontFamily: 'var(--font-cond)',
  fontSize: 13,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--blanco)',
  background: 'var(--rojo)',
  padding: '12px 18px',
  textDecoration: 'none',
  display: 'inline-block',
  clipPath: 'var(--clip-btn)',
};

const ghostBtn = {
  ...primaryBtn,
  background: 'transparent',
  border: '1px solid var(--borde-strong)',
  cursor: 'pointer' as const,
};
