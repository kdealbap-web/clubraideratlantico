import { NavLink, Link } from 'react-router-dom';
import { useSidebar } from '../../lib/sidebar';
import { useAuth } from '../../lib/auth';
import { ROUTES } from '../../lib/constants';
import {
  IconDashboard,
  IconUsers,
  IconCalendar,
  IconImage,
  IconNews,
  IconSettings,
  IconChecklist,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconHelmet,
  IconHome,
  IconLogout,
} from '../icons';
import { Logo } from './Logo';

interface NavItem {
  to: string;
  label: string;
  icon: typeof IconDashboard;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: ROUTES.admin, label: 'Dashboard', icon: IconDashboard, end: true },
  { to: ROUTES.adminMiembros, label: 'Miembros', icon: IconUsers },
  { to: ROUTES.adminEventos, label: 'Eventos', icon: IconCalendar },
  { to: ROUTES.adminCronograma, label: 'Cronograma', icon: IconChecklist },
  { to: ROUTES.adminAsistencia, label: 'Asistencia', icon: IconCheck },
  { to: ROUTES.adminGaleria, label: 'Galería', icon: IconImage },
  { to: ROUTES.adminNoticias, label: 'Noticias', icon: IconNews },
  { to: ROUTES.adminConfiguracion, label: 'Configuración', icon: IconSettings },
];

const PILOT_LINKS: NavItem[] = [
  { to: ROUTES.portal, label: 'Portal del piloto', icon: IconHelmet },
  { to: ROUTES.home, label: 'Landing pública', icon: IconHome },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { member, signOut } = useAuth();
  const width = collapsed ? 68 : 240;

  const initials =
    member?.alias?.slice(0, 2).toUpperCase() ||
    `${member?.nombre?.[0] ?? '·'}${member?.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <aside
      style={{
        width,
        minHeight: '100vh',
        background: 'var(--dark-1)',
        borderRight: '1px solid var(--borde)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s ease',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: collapsed ? '18px 0' : '20px 18px',
          borderBottom: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}
      >
        {collapsed ? (
          <img src="/logo.png" alt="" width={32} height={32} />
        ) : (
          <Logo size={28} />
        )}
        {collapsed ? null : (
          <button
            type="button"
            onClick={toggle}
            title="Plegar sidebar"
            aria-label="Plegar sidebar"
            style={{
              width: 28,
              height: 28,
              border: '1px solid var(--borde)',
              background: 'var(--dark-2)',
              color: 'var(--light)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconChevronLeft size={12} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0' }}>
        {collapsed ? null : (
          <SectionLabel>Administración</SectionLabel>
        )}
        {NAV.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}

        {collapsed ? null : <SectionLabel>Vistas</SectionLabel>}
        {PILOT_LINKS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid var(--borde)',
          padding: collapsed ? '12px 0' : 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          title={member ? `${member.nombre} ${member.apellido}` : 'Sin sesión'}
          style={{
            width: 36,
            height: 36,
            background: 'var(--rojo)',
            color: 'var(--blanco)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-cond)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {collapsed ? null : (
          <>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--blanco)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {member ? `${member.nombre} ${member.apellido}` : 'Invitado'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--rojo)',
                }}
              >
                {member?.rol ?? 'sin rol'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                color: 'var(--light)',
                border: '1px solid var(--borde)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <IconLogout size={12} />
            </button>
          </>
        )}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={toggle}
          title="Expandir sidebar"
          aria-label="Expandir sidebar"
          style={{
            border: 'none',
            borderTop: '1px solid var(--borde)',
            background: 'var(--dark-2)',
            color: 'var(--light)',
            padding: '10px 0',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconChevronRight size={14} />
        </button>
      ) : null}
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '14px 18px 8px',
        fontFamily: 'var(--font-cond)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
      }}
    >
      {children}
    </div>
  );
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '12px 0' : '11px 18px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        fontFamily: 'var(--font-cond)',
        fontSize: 14,
        letterSpacing: '0.04em',
        color: isActive ? 'var(--blanco)' : 'var(--light)',
        background: isActive ? 'var(--rojo-soft)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--rojo)' : '2px solid transparent',
        textDecoration: 'none',
        transition: 'background .15s, color .15s',
      })}
    >
      <Icon size={18} />
      {collapsed ? null : <span style={{ flex: 1 }}>{item.label}</span>}
    </NavLink>
  );
}

export { Link };
