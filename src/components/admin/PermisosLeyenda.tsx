import { useState } from 'react';
import { ALL_ROLES, ROL_PERMISOS, ROLES_CON_CMS } from '../../lib/permissions';
import { IconChevronDown, IconChevronUp } from '../icons';

export function PermisosLeyenda() {
  const [open, setOpen] = useState(false);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{
        border: '1px solid var(--borde)',
        background: 'var(--dark-1)',
        marginBottom: 14,
      }}
    >
      <summary
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          listStyle: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--rojo)',
          }}
        >
          · Permisos por rol
        </span>
        <span style={{ color: 'var(--light)' }}>
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </summary>

      <div
        style={{
          padding: '8px 16px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        {ALL_ROLES.map((r) => {
          const info = ROL_PERMISOS[r];
          const cms = ROLES_CON_CMS.includes(r);
          return (
            <div
              key={r}
              style={{
                border: `1px solid ${info.color}`,
                borderLeft: `3px solid ${info.color}`,
                padding: '10px 12px',
                background: 'var(--dark-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cond)',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: info.color,
                  }}
                >
                  {info.label}
                </span>
                {cms ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-cond)',
                      fontSize: 9,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--rojo)',
                      background: 'rgba(204,34,34,0.15)',
                      padding: '2px 6px',
                    }}
                  >
                    Acceso CMS
                  </span>
                ) : null}
              </div>
              <p style={{ color: 'var(--blanco)', fontSize: 12, margin: 0 }}>{info.description}</p>
              <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--light)', fontSize: 11.5, lineHeight: 1.5 }}>
                {info.capabilities.slice(0, 3).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}
