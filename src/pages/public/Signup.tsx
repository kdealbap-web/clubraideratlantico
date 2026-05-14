import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { PublicLayout } from '../../components/public/PublicLayout';
import { CLUB, ROUTES } from '../../lib/constants';
import { FieldShell, TextField } from '../../components/forms/Field';

type Status = 'idle' | 'checking' | 'creating' | 'success' | 'error';

export function SignupPage() {
  const { signUpPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setStatus('error');
      setErrorMsg('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    // 1. Verifica que el email exista en members (admin lo aprobó previamente)
    setStatus('checking');
    const cleanEmail = email.trim().toLowerCase();
    const { data: m, error: lookupErr } = await supabase
      .from('members')
      .select('id, email, estado, auth_user_id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (lookupErr) {
      setStatus('error');
      setErrorMsg(lookupErr.message);
      return;
    }
    if (!m) {
      setStatus('error');
      setErrorMsg(
        'Este email no está aprobado por el comité. Primero solicita tu ingreso en /unete.',
      );
      return;
    }
    if (m.auth_user_id) {
      setStatus('error');
      setErrorMsg(
        'Este email ya tiene contraseña. Si la olvidaste, pídele reset al admin.',
      );
      return;
    }
    if (m.estado !== 'activo') {
      setStatus('error');
      setErrorMsg(
        `Tu solicitud aún está en estado "${m.estado}". Espera la aprobación del comité.`,
      );
      return;
    }

    // 2. Crea el auth.user. El trigger vincula auth_user_id automáticamente.
    setStatus('creating');
    const { error } = await signUpPassword(cleanEmail, password);
    if (error) {
      setStatus('error');
      setErrorMsg(error);
      return;
    }

    setStatus('success');
    setTimeout(() => navigate(ROUTES.portal), 2500);
  };

  if (status === 'success') {
    return (
      <PublicLayout withSocialLinks={false}>
        <section style={{ padding: '80px 32px', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <div className="kicker">· Contraseña creada</div>
          <h1
            className="t-display"
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', margin: '12px 0', color: 'var(--blanco)' }}
          >
            Listo, <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>piloto</span>.
          </h1>
          <p style={{ color: 'var(--light)', marginBottom: 18 }}>
            Tu cuenta quedó activa. Te redirigimos al portal en 2 segundos…
          </p>
          <Link to={ROUTES.portal} style={primaryBtn}>
            Entrar al portal →
          </Link>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout withSocialLinks={false}>
      <section style={{ padding: '80px 32px', maxWidth: 540, margin: '0 auto' }}>
        <div className="kicker">· Crea tu contraseña</div>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(44px, 7vw, 72px)', margin: '12px 0 8px', color: 'var(--blanco)' }}
        >
          Activa tu <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>cuenta</span>.
        </h1>
        <p style={{ color: 'var(--light)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          Si el comité ya aprobó tu solicitud, usa el mismo email para crear tu contraseña. Solo se
          permite una vez por email.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FieldShell label="Email registrado" required>
            <TextField
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </FieldShell>
          <FieldShell label="Contraseña nueva" required hint="Mínimo 8 caracteres">
            <TextField
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
            />
          </FieldShell>
          <FieldShell
            label="Repite la contraseña"
            required
            error={status === 'error' ? errorMsg ?? 'Error' : undefined}
          >
            <TextField
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
            />
          </FieldShell>
          <button
            type="submit"
            disabled={status === 'checking' || status === 'creating'}
            style={primaryBtn}
          >
            {status === 'checking'
              ? 'Verificando email…'
              : status === 'creating'
                ? 'Creando cuenta…'
                : 'Crear contraseña →'}
          </button>
        </form>

        <div style={{ marginTop: 32, color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>
          ¿Ya tienes contraseña? <Link to={ROUTES.login} style={{ color: 'var(--rojo)' }}>Iniciar sesión</Link>
          <br />
          ¿Aún no eres miembro? <Link to={ROUTES.unete} style={{ color: 'var(--rojo)' }}>Solicita tu ingreso</Link>
          <br />
          ¿Problemas? Escríbele al admin a{' '}
          <a href={`mailto:${CLUB.emails.admin}`} style={{ color: 'var(--rojo)' }}>
            {CLUB.emails.admin}
          </a>
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
