import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
}

interface AdminTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  keyOf: (row: T) => string;
}

export function AdminTable<T>({ rows, columns, onRowClick, keyOf }: AdminTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--borde)' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          background: 'var(--dark-1)',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--dark-2)' }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-cond)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--light)',
                  borderBottom: '1px solid var(--borde)',
                  width: c.width,
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyOf(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: '1px solid var(--borde)',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--dark-2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
              }}
            >
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '12px 14px', color: 'var(--blanco)' }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
