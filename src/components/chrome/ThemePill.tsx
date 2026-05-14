import { useTheme } from '../../lib/theme';
import { IconMoon, IconSun } from '../icons';

export function ThemePill() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-label="Cambiar tema"
      style={{
        width: 36,
        height: 36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--dark-2)',
        color: 'var(--blanco)',
        border: '1px solid var(--borde)',
        transition: 'var(--theme-transition)',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  );
}
