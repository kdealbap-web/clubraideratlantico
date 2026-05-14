import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { IconClose } from '../icons';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Drawer({ open, title, onClose, children, width = 520 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          background: 'var(--negro)',
          borderLeft: '1px solid var(--borde)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <header
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--borde)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--dark-1)',
          }}
        >
          <h2
            className="t-display"
            style={{ fontSize: 22, margin: 0, color: 'var(--blanco)' }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 32,
              height: 32,
              background: 'var(--dark-2)',
              border: '1px solid var(--borde)',
              color: 'var(--light)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconClose size={14} />
          </button>
        </header>
        <div style={{ overflowY: 'auto', padding: 22, flex: 1 }}>{children}</div>
      </aside>
    </div>
  );
}
