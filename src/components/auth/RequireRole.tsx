import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { ROUTES } from '../../lib/constants';

type Role = 'auth' | 'editor' | 'admin';

interface RequireRoleProps {
  role: Role;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { loading, user, isAdmin, isEditor } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        style={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--muted)',
          fontFamily: 'var(--font-cond)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontSize: 12,
        }}
      >
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} state={{ from: loc.pathname }} replace />;
  }

  if (role === 'admin' && !isAdmin) return <NoAccess role="admin" />;
  if (role === 'editor' && !isEditor) return <NoAccess role="editor" />;

  return <>{children}</>;
}

function NoAccess({ role }: { role: 'admin' | 'editor' }) {
  return (
    <div
      role="alert"
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            color: 'var(--rojo)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          · Acceso restringido
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            margin: 0,
            color: 'var(--blanco)',
          }}
        >
          Tu sesión no tiene permiso de {role === 'admin' ? 'administrador' : 'editor'}.
        </h1>
        <p style={{ color: 'var(--light)', margin: 0 }}>
          Pídele al comité que actualice tu rol o vuelve al portal del piloto.
        </p>
      </div>
    </div>
  );
}
