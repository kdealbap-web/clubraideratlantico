import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CLUB, ROUTES } from '../../lib/constants';

interface PageStubProps {
  kicker: string;
  title: string;
  children?: ReactNode;
}

export function PageStub({ kicker, title, children }: PageStubProps) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--negro)', color: 'var(--blanco)' }}>
      <header
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to={ROUTES.home}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
        >
          <img src="/logo.png" alt="" width={32} height={32} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              letterSpacing: '0.02em',
            }}
          >
            {CLUB.nombre}
          </span>
        </Link>
        <nav
          style={{
            display: 'flex',
            gap: 18,
            fontFamily: 'var(--font-cond)',
            fontSize: 14,
            color: 'var(--light)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          <Link to={ROUTES.unete}>Únete</Link>
          <Link to={ROUTES.login}>Acceso</Link>
        </nav>
      </header>

      <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            color: 'var(--rojo)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          · {kicker}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 0.95,
            margin: '0 0 32px 0',
          }}
        >
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}
