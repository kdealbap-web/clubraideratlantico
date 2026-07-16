import { Link } from 'react-router-dom';
import { useSidebar } from '../../lib/sidebar';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useTable';
import { ROUTES } from '../../lib/constants';
import { IconBell, IconChevronLeft, IconChevronRight, IconLogout, IconSearch } from '../icons';
import type { Solicitud } from '../../types';

interface TopbarProps {
  section: string;
  breadcrumb?: string;
}

export function Topbar({ section, breadcrumb }: TopbarProps) {
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useAuth();
  const { rows: pendientes } = useTable<Solicitud>('solicitudes', {
    filter: [{ column: 'estado', op: 'eq', value: 'pendiente' }],
    order: { column: 'created_at', ascending: false },
  });
  const pendingCount = pendientes?.length ?? 0;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        background: 'var(--dark-1)',
        borderBottom: '1px solid var(--borde)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'var(--theme-transition)',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        title={collapsed ? 'Expandir sidebar' : 'Plegar sidebar'}
        aria-label="Toggle sidebar"
        style={{
          width: 32,
          height: 32,
          border: '1px solid var(--borde)',
          background: 'var(--dark-2)',
          color: 'var(--light)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        {collapsed ? <IconChevronRight size={12} /> : <IconChevronLeft size={12} />}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          CMS
        </span>
        <IconChevronRight size={12} style={{ color: 'var(--borde-strong)' }} />
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--blanco)',
          }}
        >
          {section}
        </span>
        {breadcrumb ? (
          <>
            <IconChevronRight size={12} style={{ color: 'var(--borde-strong)' }} />
            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                letterSpacing: '0.14em',
                color: 'var(--light)',
              }}
            >
              {breadcrumb}
            </span>
          </>
        ) : null}
      </div>

      <div className="topbar-search" style={{ position: 'relative' }}>
        <IconSearch
          size={14}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
          }}
        />
        <input
          type="search"
          placeholder="Buscar miembros, eventos…"
          aria-label="Buscar"
          style={{
            paddingLeft: 36,
            paddingRight: 12,
            width: 280,
            height: 36,
            background: 'var(--dark-2)',
            color: 'var(--blanco)',
            border: '1px solid var(--borde)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>

      {/* Notificaciones: solicitudes de miembro pendientes */}
      <Link
        to={`${ROUTES.adminMiembros}?tab=solicitudes`}
        title={
          pendingCount > 0
            ? `${pendingCount} solicitud(es) de miembro pendientes`
            : 'Sin solicitudes pendientes'
        }
        aria-label="Notificaciones"
        style={{
          width: 36,
          height: 36,
          position: 'relative',
          background: 'var(--dark-2)',
          color: pendingCount > 0 ? 'var(--rojo-light)' : 'var(--blanco)',
          border: `1px solid ${pendingCount > 0 ? 'var(--rojo)' : 'var(--borde)'}`,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          textDecoration: 'none',
        }}
      >
        <IconBell size={14} />
        {pendingCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -7,
              right: -7,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              background: 'var(--rojo)',
              color: 'var(--blanco)',
              borderRadius: 9,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'var(--font-cond)',
              display: 'grid',
              placeItems: 'center',
              border: '2px solid var(--dark-1)',
            }}
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        ) : null}
      </Link>

      {/* Cerrar sesión */}
      <button
        type="button"
        onClick={() => void signOut()}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        style={{
          width: 36,
          height: 36,
          background: 'var(--dark-2)',
          color: 'var(--blanco)',
          border: '1px solid var(--borde)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <IconLogout size={14} />
      </button>
    </header>
  );
}
