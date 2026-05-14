import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--rojo)',
    color: 'var(--blanco)',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--blanco)',
    border: '1px solid var(--borde-strong)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--rojo-light)',
    border: '1px solid var(--rojo)',
  },
};

export function Btn({ variant = 'primary', icon, children, style, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '10px 16px',
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
