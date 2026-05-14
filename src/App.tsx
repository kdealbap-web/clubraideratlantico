import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './lib/constants';

import { HomePage } from './pages/public/Home';
import { NosotrosPage } from './pages/public/Nosotros';
import { ReglamentoPage } from './pages/public/Reglamento';
import { EventosPage } from './pages/public/Eventos';
import { GaleriaPage } from './pages/public/Galeria';
import { NoticiasPage } from './pages/public/Noticias';
import { UnetePage } from './pages/public/Unete';
import { LoginPage } from './pages/public/Login';
import { SignupPage } from './pages/public/Signup';

import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/Dashboard';
import { MiembrosPage } from './pages/admin/Miembros';
import { EventosAdminPage } from './pages/admin/Eventos';
import { GaleriaAdminPage } from './pages/admin/Galeria';
import { NoticiasAdminPage } from './pages/admin/Noticias';
import { ConfiguracionPage } from './pages/admin/Configuracion';

import { PortalPage } from './pages/portal/Portal';

import { RequireRole } from './components/auth/RequireRole';

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.nosotros} element={<NosotrosPage />} />
      <Route path={ROUTES.reglamento} element={<ReglamentoPage />} />
      <Route path={ROUTES.eventos} element={<EventosPage />} />
      <Route path={ROUTES.galeria} element={<GaleriaPage />} />
      <Route path={ROUTES.noticias} element={<NoticiasPage />} />
      <Route path={ROUTES.unete} element={<UnetePage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.signup} element={<SignupPage />} />

      <Route
        path={ROUTES.admin}
        element={
          <RequireRole role="editor">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="miembros" element={<MiembrosPage />} />
        <Route path="eventos" element={<EventosAdminPage />} />
        <Route path="galeria" element={<GaleriaAdminPage />} />
        <Route path="noticias" element={<NoticiasAdminPage />} />
        <Route
          path="configuracion"
          element={
            <RequireRole role="admin">
              <ConfiguracionPage />
            </RequireRole>
          }
        />
      </Route>

      <Route
        path={ROUTES.portal}
        element={
          <RequireRole role="auth">
            <PortalPage />
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
