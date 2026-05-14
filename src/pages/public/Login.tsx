import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { PublicLayout } from '../../components/public/PublicLayout';
import { CLUB, ROUTES } from '../../lib/constants';
import { FieldShell, TextField } from '../../components/forms/Field';

type Mode = 'password' | 'magic';

export function LoginPage() {
  const { signInMagic, signInPassword, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus('loading');
    setErrorMsg(null);
    const { error } = await signInPassword(email, password);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else {
      // Auth provider redirige por el useEffect cuando session llega
      setStatus('idle');
    }
  };

  const submitMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setErrorMsg(null);
    const { error } = await signInMagic(email);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else {
      setStatus('sent');
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
        <p style={{ color: 'var(--light)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          Si tienes contraseña del club, úsala. Si no, te mandamos un link mágico al email.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 22,
            border: '1px solid var(--borde)',
          }}
        >
          <ModeBtn
            active={mode === 'password'}
            onClick={() => {
              setMode('password');
              setStatus('idle');
              setErrorMsg(null);
            }}
          >
            Contraseña
          </ModeBtn>
          <ModeBtn
            active={mode === 'magic'}
            onClick={() => {
              setMode('magic');
              setStatus('idle');
              setErrorMsg(null);
            }}
          >
            Magic link
          </ModeBtn>
        </div>

        {status === 'sent' && mode === 'magic' ? (
          <div
            role="status"
            style={{
              border: '1px solid var(--success)',
              background: 'rgba(34,197,94,0.08)',
              color: 'var(--blanco)',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div className="kicker" style={{ color: 'var(--success)' }}>· Email enviado</div>
            <p style={{ margin: 0 }}>
              Revisa tu bandeja en <strong>{email}</strong>. Si no llega en 2 minutos, mira spam o intenta
              de nuevo.
            </p>
          </div>
        ) : mode === 'password' ? (
          <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            <button
              type="button"
              onClick={() => {
                setMode('magic');
                setStatus('idle');
                setErrorMsg(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--rojo)',
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              ¿Olvidaste tu contraseña? Usa magic link →
            </button>
          </form>
        ) : (
          <form onSubmit={submitMagic} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldShell label="Email" required error={status === 'error' ? errorMsg ?? 'Error' : undefined}>
              <TextField
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </FieldShell>
            <button type="submit" disabled={status === 'loading'} style={primaryBtn}>
              {status === 'loading' ? 'Enviando…' : 'Enviar magic link →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 32, color: 'var(--muted)', fontSize: 12 }}>
          ¿No tienes cuenta? <Link to={ROUTES.unete} style={{ color: 'var(--rojo)' }}>Solicita tu ingreso</Link>.
          Si tienes problemas, escríbenos a{' '}
          <a href={`mailto:${CLUB.emails.admin}`} style={{ color: 'var(--rojo)' }}>
            {CLUB.emails.admin}
          </a>
          .
        </div>
      </section>
    </PublicLayout>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 16px',
        background: active ? 'var(--rojo)' : 'transparent',
        color: active ? 'var(--blanco)' : 'var(--light)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-cond)',
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </button>
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
