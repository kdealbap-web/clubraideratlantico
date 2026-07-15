import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { PublicLayout } from '../../components/public/PublicLayout';
import { ROUTES } from '../../lib/constants';
import { FieldShell, TextField } from '../../components/forms/Field';

export function ResetPasswordPage() {
  const { updatePassword, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('error');
      setMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMsg('Las contraseñas no coinciden.');
      return;
    }
    setStatus('loading');
    setMsg(null);
    const { error } = await updatePassword(password);
    if (error) {
      setStatus('error');
      setMsg(error);
      return;
    }
    setStatus('done');
    setTimeout(() => navigate(isAdmin ? ROUTES.admin : ROUTES.portal), 1600);
  };

  return (
    <PublicLayout withSocialLinks={false}>
      <section style={{ padding: '80px 32px', maxWidth: 540, margin: '0 auto' }}>
        <div className="kicker">· Restablecer contraseña</div>
        <h1
          className="t-display"
          style={{ fontSize: 'clamp(40px, 6vw, 68px)', margin: '12px 0 20px', color: 'var(--blanco)' }}
        >
          Nueva <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>contraseña</span>.
        </h1>

        {loading ? (
          <p style={{ color: 'var(--light)' }}>Cargando…</p>
        ) : !user ? (
          <p style={{ color: 'var(--light)', lineHeight: 1.6 }}>
            Abre esta página desde el enlace que te llegó al correo. Si el enlace expiró,{' '}
            <Link to={ROUTES.login} style={{ color: 'var(--rojo)' }}>
              vuelve a solicitar el restablecimiento
            </Link>
            .
          </p>
        ) : status === 'done' ? (
          <p style={{ color: 'var(--success)', fontSize: 16 }}>
            ✓ Contraseña actualizada. Redirigiendo…
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldShell label="Nueva contraseña" required>
              <TextField
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
              />
            </FieldShell>
            <FieldShell
              label="Repite la contraseña"
              required
              error={status === 'error' ? msg ?? 'Error' : undefined}
            >
              <TextField
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
              />
            </FieldShell>
            <button type="submit" disabled={status === 'loading'} style={primaryBtn}>
              {status === 'loading' ? 'Guardando…' : 'Guardar contraseña →'}
            </button>
          </form>
        )}
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
};
