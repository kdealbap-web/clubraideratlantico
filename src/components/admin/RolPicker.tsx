import { ALL_ROLES, ROL_PERMISOS, ROLES_CON_CMS } from '../../lib/permissions';
import type { Rol } from '../../types';

interface RolPickerProps {
  value: Rol;
  onChange: (r: Rol) => void;
  disabledRoles?: Rol[];
  showCapabilities?: boolean;
}

export function RolPicker({
  value,
  onChange,
  disabledRoles = [],
  showCapabilities = true,
}: RolPickerProps) {
  const current = ROL_PERMISOS[value];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 6,
        }}
      >
        {ALL_ROLES.map((r) => {
          const info = ROL_PERMISOS[r];
          const active = r === value;
          const disabled = disabledRoles.includes(r);
          const tieneCMS = ROLES_CON_CMS.includes(r);

          return (
            <button
              key={r}
              type="button"
              disabled={disabled}
              onClick={() => onChange(r)}
              style={{
                padding: '12px 10px',
                background: active ? 'var(--rojo-soft)' : 'var(--dark-2)',
                border: active ? `2px solid ${info.color}` : '1px solid var(--borde)',
                color: 'var(--blanco)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: info.color,
                }}
              >
                {info.label}
              </span>
              {tieneCMS ? (
                <span
                  style={{
                    fontFamily: 'var(--font-cond)',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--rojo)',
                    background: 'rgba(204,34,34,0.12)',
                    padding: '2px 6px',
                  }}
                >
                  CMS
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {showCapabilities ? (
        <div
          style={{
            background: 'var(--dark-2)',
            border: `1px solid ${current.color}`,
            borderLeft: `3px solid ${current.color}`,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: current.color,
            }}
          >
            · {current.label}
          </div>
          <p style={{ color: 'var(--blanco)', margin: 0, fontSize: 13, lineHeight: 1.5 }}>
            {current.description}
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              color: 'var(--light)',
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            {current.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
