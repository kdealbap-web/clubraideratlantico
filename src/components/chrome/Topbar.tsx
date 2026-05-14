import { useSidebar } from '../../lib/sidebar';
import { ThemePill } from './ThemePill';
import { IconBell, IconChevronLeft, IconChevronRight, IconSearch } from '../icons';

interface TopbarProps {
  section: string;
  breadcrumb?: string;
}

export function Topbar({ section, breadcrumb }: TopbarProps) {
  const { collapsed, toggle } = useSidebar();
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
        }}
      >
        {collapsed ? <IconChevronRight size={12} /> : <IconChevronLeft size={12} />}
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
          flex: 1,
        }}
      >
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

      <ThemePill />

      <button
        type="button"
        title="Notificaciones"
        aria-label="Notificaciones"
        style={{
          width: 36,
          height: 36,
          position: 'relative',
          background: 'var(--dark-2)',
          color: 'var(--blanco)',
          border: '1px solid var(--borde)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <IconBell size={14} />
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 6,
            height: 6,
            background: 'var(--rojo)',
            borderRadius: '50%',
          }}
        />
      </button>
    </header>
  );
}
