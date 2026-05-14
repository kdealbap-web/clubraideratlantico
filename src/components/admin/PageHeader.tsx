import type { ReactNode } from 'react';

interface PageHeaderProps {
  kicker: string;
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ kicker, title, actions }: PageHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <div>
        <div className="kicker">· {kicker}</div>
        <h1
          className="t-display"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            margin: '4px 0 0',
            color: 'var(--blanco)',
          }}
        >
          {title}
        </h1>
      </div>
      {actions ? <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div> : null}
    </header>
  );
}
