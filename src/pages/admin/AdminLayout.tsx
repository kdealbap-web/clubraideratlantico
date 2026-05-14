import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/chrome/Sidebar';
import { Topbar } from '../../components/chrome/Topbar';
import { ROUTES } from '../../lib/constants';

const SECTIONS: Record<string, string> = {
  [ROUTES.admin]: 'Dashboard',
  [ROUTES.adminMiembros]: 'Miembros',
  [ROUTES.adminEventos]: 'Eventos',
  [ROUTES.adminGaleria]: 'Galería',
  [ROUTES.adminNoticias]: 'Noticias',
  [ROUTES.adminConfiguracion]: 'Configuración',
};

export function AdminLayout() {
  const loc = useLocation();
  const section = useMemo(() => SECTIONS[loc.pathname] ?? 'Admin', [loc.pathname]);

  return (
    <div
      className="admin-shell"
      style={{
        minHeight: '100vh',
        background: 'var(--negro)',
        color: 'var(--blanco)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        transition: 'var(--theme-transition)',
      }}
    >
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar section={section} />
        <main style={{ padding: '28px 32px', minWidth: 0, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
