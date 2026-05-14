import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { FormSolicitud } from '../../components/forms/FormSolicitud';
import { CLUB, ROUTES } from '../../lib/constants';
import { IconBike, IconCheck, IconRoute } from '../../components/icons';

export function UnetePage() {
  return (
    <PublicLayout withSocialLinks={false}>
      <Hero
        kicker="Aspirante · primer paso al parche oficial"
        title={
          <>
            Únete como <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>aspirante</span>.
          </>
        }
        subtitle="El parche se gana rodando. Si cumples con los requisitos, tu ingreso al grupo de Aspirantes es inmediato. De ahí en adelante, tu disciplina y tu pasión hablan por ti."
      />

      {/* Bloque requisitos + proceso */}
      <section style={{ padding: '40px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <RequisitoCard
            icon={<IconBike />}
            title="Moto propia"
            body="En buenas condiciones para ruta. Cualquier marca o modelo."
          />
          <RequisitoCard
            icon={<IconCheck />}
            title="Licencia vigente"
            body="Licencia de conducción al día. Sin licencia no se rueda en vía pública."
          />
          <RequisitoCard
            icon={<IconRoute />}
            title="Documentos al día"
            body="SOAT vigente y tecnomecánica cuando aplique. Tarjeta de propiedad obligatoria."
          />
        </div>

        <div
          style={{
            border: '1px solid var(--borde)',
            background: 'var(--dark-1)',
            padding: '20px 22px',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div className="kicker">· Cómo te conviertes en Piloto Oficial</div>
          <p style={{ color: 'var(--blanco)', margin: 0, fontSize: 15, lineHeight: 1.55 }}>
            Una vez dentro del grupo de Aspirantes, <strong>el cronómetro no corre</strong> — tu actitud
            habla por ti. No hay tiempo definido para el ascenso. El comité evalúa:
          </p>
          <ul
            style={{
              color: 'var(--light)',
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              paddingLeft: 22,
            }}
          >
            <li><strong style={{ color: 'var(--blanco)' }}>Participación:</strong> qué tanto te involucras en el día a día del club</li>
            <li><strong style={{ color: 'var(--blanco)' }}>Asistencia:</strong> tu presencia constante en rodadas y reuniones</li>
            <li><strong style={{ color: 'var(--blanco)' }}>Apoyo en logística:</strong> aportar con la organización de eventos</li>
            <li><strong style={{ color: 'var(--blanco)' }}>Proactividad:</strong> iniciativa para aportar y crecer junto al grupo</li>
            <li><strong style={{ color: 'var(--blanco)' }}>Sentido de pertenencia:</strong> ganas reales de ser parte de la historia</li>
          </ul>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0', fontSize: 13 }}>
            El ascenso al parche oficial depende 100% de tu disciplina y pasión.{' '}
            <Link to={ROUTES.reglamento} style={{ color: 'var(--rojo)' }}>
              Lee el reglamento completo →
            </Link>
          </p>
        </div>

        <div
          style={{
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            padding: '14px 18px',
            marginBottom: 32,
            fontSize: 13.5,
            color: 'var(--blanco)',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: 'var(--rojo)' }}>Importante:</strong> si en una semana desde el envío
          no completas tus datos personales en la base, la solicitud se rechaza automáticamente. Si no
          puedes terminarla ahora, escríbenos a{' '}
          <a
            href={`mailto:${CLUB.emails.admin}`}
            style={{ color: 'var(--rojo)', borderBottom: '1px solid var(--rojo)' }}
          >
            {CLUB.emails.admin}
          </a>
          .
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: '0 32px 80px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <FormSolicitud />
      </section>
    </PublicLayout>
  );
}

function RequisitoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        padding: '18px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          background: 'var(--rojo-soft)',
          color: 'var(--rojo)',
          border: '1px solid var(--rojo)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </div>
      <strong style={{ color: 'var(--blanco)', fontSize: 16 }}>{title}</strong>
      <p style={{ color: 'var(--light)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{body}</p>
    </div>
  );
}
