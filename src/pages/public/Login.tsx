import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { PublicLayout } from '../../components/public/PublicLayout';
import { ROUTES } from '../../lib/constants';
import { FieldShell, TextField } from '../../components/forms/Field';

export function LoginPage() {
  const { signInPassword, resetPassword, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const sendReset = async () => {
    if (!email) {
      setResetMsg('Escribe tu email arriba y vuelve a tocar aquí.');
      return;
    }
    setResetMsg('Enviando…');
    const { error } = await resetPassword(email);
    setResetMsg(
      error
        ? `No se pudo enviar: ${error}`
        : 'Listo. Te enviamos un enlace a tu correo para crear una nueva contraseña.',
    );
  };

  if (user) {
    return (
      <PublicLayout withSocialLinks={false}>
        <section style={{ padding: '80px 32px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="kicker">· Sesión activa</div>
          <h1
            className="t-display"
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', margin: '12px 0', color: 'var(--blanco)' }}
          >
            Ya iniciaste sesión.
          </h1>
          <p style={{ color: 'var(--light)' }}>
            Hola <strong>{user.email}</strong>. Tu sesión está activa.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(isAdmin ? ROUTES.admin : ROUTES.portal)}
              style={primaryBtn}
            >
              Ir a {isAdmin ? 'Admin' : 'Portal'} →
            </button>
            <Link to={ROUTES.home} style={secondaryBtn}>
              Volver al inicio
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus('loading');
    setErrorMsg(null);
    const { error } = await signInPassword(email, password);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else {
      setStatus('idle');
    }
  };

  return (
    <PublicLayout withSocialLinks={false}>
      <section style={{ padding: '80px 32px', maxWidth: 540, margin: '0 auto' }}>
        <div className="kicker">· Acceso miembros</div>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(48px, 7vw, 80px)', margin: '12px 0 8px', color: 'var(--blanco)' }}
        >
          Iniciar <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>sesión</span>.
        </h1>
        <p style={{ color: 'var(--light)', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
          Ingresa con tu email y contraseña del club.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FieldShell label="Email" required>
            <TextField
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </FieldShell>
          <FieldShell
            label="Contraseña"
            required
            error={status === 'error' ? errorMsg ?? 'Error' : undefined}
          >
            <TextField
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </FieldShell>
          <button type="submit" disabled={status === 'loading'} style={primaryBtn}>
            {status === 'loading' ? 'Verificando…' : 'Iniciar sesión →'}
          </button>
        </form>

        <div
          style={{
            marginTop: 28,
            padding: '16px 18px',
            border: '1px solid var(--borde)',
            background: 'var(--dark-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 13,
          }}
        >
          <strong style={{ color: 'var(--blanco)' }}>¿Aprobado pero sin contraseña?</strong>
          <p style={{ color: 'var(--light)', margin: 0, lineHeight: 1.5 }}>
            Si el comité ya aprobó tu solicitud, crea tu contraseña con el mismo email que
            registraste:
          </p>
          <Link
            to={ROUTES.signup}
            style={{
              color: 'var(--rojo)',
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Crear contraseña →
          </Link>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() => void sendReset()}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--rojo)',
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
          {resetMsg ? (
            <p style={{ color: 'var(--light)', fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>
              {resetMsg}
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: 20, color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.unete} style={{ color: 'var(--rojo)' }}>
            Solicita tu ingreso
          </Link>
          .
        </div>
      </section>
    </PublicLayout>
  );
}

const primaryBtn = {
  fontFamily: 'var(--font-cond)',
  fontSize: 14,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: 'var(--blanco)',
  background: 'var(--rojo)',
  padding: '14px 22px',
  border: 'none',
  cursor: 'pointer',
  clipPath: 'var(--clip-btn-l)',
  textDecoration: 'none',
  display: 'inline-block',
};

const secondaryBtn = {
  ...primaryBtn,
  background: 'transparent',
  color: 'var(--blanco)',
  border: '1px solid var(--borde-strong)',
  clipPath: 'var(--clip-btn-l)',
};
