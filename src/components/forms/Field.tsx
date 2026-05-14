import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldShell({ label, required, error, hint, children }: FieldShellProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          color: 'var(--light)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        {label}
        {required ? <span style={{ color: 'var(--rojo)', marginLeft: 4 }}>*</span> : null}
      </span>
      {children}
      {error ? (
        <span style={{ color: 'var(--rojo-light)', fontSize: 12 }}>{error}</span>
      ) : hint ? (
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{hint}</span>
      ) : null}
    </label>
  );
}

const inputBaseStyle = {
  height: 38,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
} as const;

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextField(props, ref) {
    return <input ref={ref} {...props} style={{ ...inputBaseStyle, ...(props.style || {}) }} />;
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField(props, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        style={{
          ...inputBaseStyle,
          height: 'auto',
          minHeight: 90,
          padding: '10px 12px',
          resize: 'vertical',
          ...(props.style || {}),
        }}
      />
    );
  },
);

export function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="kicker">· Sección {number}</div>
        <h2 className="t-display" style={{ fontSize: 28, color: 'var(--blanco)', margin: 0 }}>
          {title}
        </h2>
        {subtitle ? (
          <p style={{ color: 'var(--light)', fontSize: 13, margin: 0 }}>{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
