import { Link, NavLink } from 'react-router-dom';
import { CLUB, ROUTES } from '../../lib/constants';
import { ThemePill } from '../chrome/ThemePill';
import { Logo } from '../chrome/Logo';

const LINKS: Array<{ to: string; label: string }> = [
  { to: ROUTES.home, label: 'Inicio' },
  { to: ROUTES.nosotros, label: 'El club' },
  { to: ROUTES.reglamento, label: 'Reglamento' },
  { to: ROUTES.eventos, label: 'Rodadas' },
  { to: ROUTES.galeria, label: 'Galería' },
  { to: ROUTES.noticias, label: 'Noticias' },
  { to: ROUTES.unete, label: 'Únete' },
];

export function PublicNav() {
  return (
    <>
      {/* utility strip */}
      <div
        style={{
          background: 'var(--rojo)',
          color: 'var(--blanco)',
          fontFamily: 'var(--font-cond)',
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '8px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span>Comunidad sin ánimo de lucro · Caribe colombiano</span>
        <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href={CLUB.social.whatsapp.url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
            WhatsApp
          </a>
          <a
            href={CLUB.social.instagram.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'inherit' }}
          >
            Instagram
          </a>
        </span>
      </div>

      <header
        style={{
          padding: '14px 24px',
          background: 'var(--negro)',
          borderBottom: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          transition: 'var(--theme-transition)',
        }}
      >
        <Link to={ROUTES.home} style={{ textDecoration: 'none' }}>
          <Logo size={36} />
        </Link>

        <nav
          className="public-nav-links"
          style={{
            display: 'flex',
            gap: 22,
            fontFamily: 'var(--font-cond)',
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === ROUTES.home}
              style={({ isActive }) => ({
                color: isActive ? 'var(--rojo)' : 'var(--light)',
                textDecoration: 'none',
                paddingBottom: 2,
                borderBottom: isActive ? '1px solid var(--rojo)' : '1px solid transparent',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemePill />
          <Link
            to={ROUTES.login}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--light)',
              textDecoration: 'none',
              padding: '8px 12px',
              border: '1px solid var(--borde)',
            }}
          >
            Acceso miembros
          </Link>
          <Link
            to={ROUTES.unete}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              padding: '10px 16px',
              textDecoration: 'none',
              clipPath: 'var(--clip-btn)',
            }}
          >
            Únete →
          </Link>
        </div>
      </header>
    </>
  );
}
