import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Hero } from '../../components/public/Hero';
import { HomeCronogramaPreview } from '../../components/public/HomeCronogramaPreview';
import { CLUB, ROUTES } from '../../lib/constants';
import { CoverImage } from '../../components/ui/CoverImage';
import { IconBike, IconCalendar, IconImage, IconNews, IconRoute, IconUsers } from '../../components/icons';

export function HomePage() {
  return (
    <PublicLayout>
      <Hero
        kicker="Caribe colombiano · sin ánimo de lucro · cualquier moto"
        title={
          <>
            Hermandad sobre
            <br />
            <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>dos ruedas</span>.
          </>
        }
        subtitle="Comunidad de motociclistas en Barranquilla y el Caribe colombiano. Rodadas seguras, hermandad sobre la pista y red de apoyo vial. La membresía es gratuita."
        meta={[
          { value: '2022', label: 'Fundado' },
          { value: 'Gratis', label: 'Sin cuotas' },
          { value: '18+', label: 'Solo mayores' },
          { value: 'Caribe', label: 'Región' },
        ]}
        bgImage="/home-hero-moto.jpg"
      />

      <HomeCronogramaPreview />

      <section style={{ padding: '64px 32px', background: 'var(--negro)' }}>
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          <FeatureCard icon={<IconUsers />} title="Pilotos de cualquier marca" body="No es exclusivo TVS Raider. Si te apasiona la moto y respetas las reglas, eres bienvenido." />
          <FeatureCard icon={<IconRoute />} title="Rodadas con briefing" body="Toda salida arranca con briefing de seguridad: ruta, paradas, líder, cierre, comunicación." />
          <FeatureCard icon={<IconBike />} title="Apoyo en la vía" body="Red de pilotos lista para asistir en pinchazos, accidentes o varadas en el corredor caribeño." />
          <FeatureCard icon={<IconCalendar />} title="Calendario público" body="Rodadas, eventos y capacitaciones publicadas con anticipación y cupos visibles." />
        </div>
      </section>

      <section style={{ padding: '64px 32px', borderTop: '1px solid var(--borde)' }}>
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 36,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="kicker">· Misión</div>
            <h2
              className="t-display"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', margin: '12px 0 16px', color: 'var(--blanco)' }}
            >
              Manejamos rápido en las redes,
              <br />
              <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>seguros en la vía</span>.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--light)', maxWidth: 620 }}>
              Promover el motociclismo responsable, la seguridad vial y la hermandad entre pilotos del
              Caribe colombiano. Sin cuotas, sin política, sin presión. El que rueda con respeto, rueda
              con el club.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                to={ROUTES.reglamento}
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 13,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--blanco)',
                  padding: '12px 18px',
                  border: '1px solid var(--borde-strong)',
                  textDecoration: 'none',
                }}
              >
                Lee el reglamento →
              </Link>
              <Link
                to={ROUTES.unete}
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 13,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--blanco)',
                  background: 'var(--rojo)',
                  padding: '12px 18px',
                  textDecoration: 'none',
                  clipPath: 'var(--clip-btn)',
                }}
              >
                Únete al club →
              </Link>
            </div>
          </div>

          <CoverImage
            url="/home-mision-moto.jpg"
            alt="Piloto del Club Raider Atlántico rodando en la vía"
            minHeight={320}
            style={{ border: '1px solid var(--borde)' }}
          />
        </div>
      </section>

      <section
        style={{
          padding: '48px 32px',
          background: 'var(--dark-1)',
          borderTop: '1px solid var(--borde)',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 0,
          }}
        >
          <PreviewLink to={ROUTES.eventos} icon={<IconCalendar />} title="Rodadas" body={`Calendario completo con cupos, dificultad y kilómetros.`} />
          <PreviewLink to={ROUTES.galeria} icon={<IconImage />} title="Galería" body="Fotos de cada salida. El archivo visual del club." />
          <PreviewLink to={ROUTES.noticias} icon={<IconNews />} title="Noticias" body="Comunicados, convocatorias y cambios de reglamento." />
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 32px',
          background: 'linear-gradient(180deg, var(--negro) 0%, var(--dark-1) 100%)',
          borderTop: '1px solid var(--borde)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/home-grupo.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.72) 100%)',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="kicker">· Sin costo · sin SLA</div>
          <h2
            className="t-display"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)', margin: '12px 0 20px', color: 'var(--blanco)' }}
          >
            ¿Listo para rodar
            <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}> con nosotros</span>?
          </h2>
          <p style={{ color: 'var(--light)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Llena el formulario, el comité revisa tu solicitud y te avisamos. No hay prisa ni filtros
            secretos: respeto, mayoría de edad y ganas de rodar bien.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={ROUTES.unete}
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-cond)',
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--blanco)',
                background: 'var(--rojo)',
                padding: '14px 24px',
                textDecoration: 'none',
                clipPath: 'var(--clip-btn-l)',
              }}
            >
              Solicita tu ingreso →
            </Link>
            <Link
              to={ROUTES.login}
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-cond)',
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--blanco)',
                background: 'transparent',
                border: '1px solid var(--borde-strong)',
                padding: '14px 24px',
                textDecoration: 'none',
                clipPath: 'var(--clip-btn-l)',
              }}
            >
              Portal del piloto →
            </Link>
          </div>
          <div style={{ marginTop: 16, color: 'var(--muted)', fontSize: 12 }}>
            {CLUB.emails.info}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function FeatureCard({
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
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: '24px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: 'var(--rojo-soft)',
          color: 'var(--rojo)',
          border: '1px solid var(--rojo)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </div>
      <div className="t-display" style={{ fontSize: 24, color: 'var(--blanco)' }}>
        {title}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--light)', margin: 0 }}>{body}</p>
    </div>
  );
}

function PreviewLink({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      style={{
        padding: '28px 24px',
        borderRight: '1px solid var(--borde)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ color: 'var(--rojo)' }}>{icon}</div>
      <div className="t-display" style={{ fontSize: 28, color: 'var(--blanco)' }}>
        {title}
      </div>
      <p style={{ color: 'var(--light)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{body}</p>
      <span className="t-cond-up" style={{ fontSize: 11, color: 'var(--rojo)', marginTop: 6 }}>
        Ver →
      </span>
    </Link>
  );
}
