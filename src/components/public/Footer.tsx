import { Link } from 'react-router-dom';
import { CLUB, ROUTES } from '../../lib/constants';
import { TricolorStrip } from './TricolorStrip';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--negro)',
        color: 'var(--light)',
        padding: '48px 32px 0',
        transition: 'var(--theme-transition)',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            paddingBottom: 32,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                color: 'var(--blanco)',
                lineHeight: 1,
              }}
            >
              {CLUB.nombre}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Comunidad sin ánimo de lucro de motociclistas en el Caribe colombiano. Membresía
              gratuita, abierta a cualquier marca o modelo.
            </p>
            <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--muted)' }}>
              {CLUB.ciudad}
            </div>
          </div>

          <FootCol title="Navega">
            <FootLink to={ROUTES.nosotros}>El club</FootLink>
            <FootLink to={ROUTES.reglamento}>Reglamento</FootLink>
            <FootLink to={ROUTES.eventos}>Rodadas</FootLink>
            <FootLink to={ROUTES.galeria}>Galería</FootLink>
            <FootLink to={ROUTES.noticias}>Noticias</FootLink>
          </FootCol>

          <FootCol title="Únete">
            <FootLink to={ROUTES.unete}>Formulario de ingreso</FootLink>
            <FootLink to={ROUTES.login}>Acceso miembros</FootLink>
            <a
              href={CLUB.social.whatsapp.url}
              target="_blank"
              rel="noreferrer"
              style={footLinkStyle}
            >
              Grupo de WhatsApp
            </a>
          </FootCol>

          <FootCol title="Contacto">
            <a href={`mailto:${CLUB.emails.info}`} style={footLinkStyle}>
              {CLUB.emails.info}
            </a>
            <a href={`mailto:${CLUB.emails.admin}`} style={footLinkStyle}>
              {CLUB.emails.admin}
            </a>
            <a href={CLUB.web} target="_blank" rel="noreferrer" style={footLinkStyle}>
              {CLUB.web.replace('https://', '')}
            </a>
          </FootCol>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 24,
            borderTop: '1px solid var(--borde)',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: 'var(--muted)',
            paddingBottom: 24,
          }}
        >
          <span>© 2026 {CLUB.nombre} · {CLUB.ciudad}</span>
          <span>Hermandad sobre dos ruedas</span>
        </div>
      </div>

      <TricolorStrip />
    </footer>
  );
}

const footLinkStyle = {
  color: 'var(--light)',
  textDecoration: 'none',
  fontSize: 13,
  paddingBottom: 2,
};

function FootCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="t-cond-up" style={{ fontSize: 11, color: 'var(--rojo)' }}>
        · {title}
      </div>
      {children}
    </div>
  );
}

function FootLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={footLinkStyle}>
      {children}
    </Link>
  );
}
