import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { PageHeader } from '../../components/admin/PageHeader';
import { AsistenciaPanel } from '../../components/asistencia/AsistenciaPanel';
import { AsistenciaReporte } from '../../components/asistencia/AsistenciaReporte';

export function AsistenciaAdminPage() {
  const { member } = useAuth();
  const puede =
    member != null &&
    member.estado === 'activo' &&
    (member.rol === 'ADMINISTRADOR' || member.rol === 'LIDER' || member.grupo === 'disciplina');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section>
      <PageHeader kicker="Control" title="Asistencia." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Card
          title="Registrar asistencia"
          subtitle="Selecciona la actividad y escanea el QR del carnet de cada piloto. Solo se habilita el día del evento."
        >
          {puede ? (
            <AsistenciaPanel
              registradoPor={member?.id ?? null}
              onRegistered={() => setRefreshKey((k) => k + 1)}
            />
          ) : (
            <div
              style={{
                border: '1px dashed var(--borde-strong)',
                background: 'var(--dark-2)',
                color: 'var(--light)',
                padding: '16px 18px',
                fontSize: 13.5,
              }}
            >
              Solo Administradores, Líderes y el grupo de Disciplina pueden registrar asistencia.
            </div>
          )}
        </Card>

        <Card
          title="Reporte de asistencia"
          subtitle="Presentes e inasistentes por actividad, incluyendo el histórico importado."
        >
          <AsistenciaReporte refreshKey={refreshKey} />
        </Card>
      </div>
    </section>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <h3
          className="t-display"
          style={{ fontSize: 20, color: 'var(--blanco)', margin: 0, letterSpacing: '0.02em' }}
        >
          {title}
        </h3>
        {subtitle ? <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>{subtitle}</span> : null}
      </header>
      {children}
    </section>
  );
}
