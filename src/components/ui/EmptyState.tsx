import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CtaProp {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body: string;
  cta?: CtaProp;
}

export function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        border: '1px dashed var(--borde)',
        background: 'var(--dark-1)',
        gap: 14,
      }}
    >
      {icon ? (
        <div
          style={{
            width: 56,
            height: 56,
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          letterSpacing: '0.01em',
          margin: 0,
          color: 'var(--blanco)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          maxWidth: 460,
          margin: 0,
          color: 'var(--light)',
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
      {cta ? (
        <Link
          to={cta.href}
          style={{
            marginTop: 8,
            background: 'var(--rojo)',
            color: 'var(--blanco)',
            padding: '10px 18px',
            fontFamily: 'var(--font-cond)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: 13,
            clipPath: 'var(--clip-btn)',
          }}
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

export const EMPTY_TEXTS = {
  members: {
    title: 'Aún no hay miembros aprobados',
    body: 'Cuando aceptes la primera solicitud aparecerá aquí.',
  },
  solicitudes: {
    title: 'Sin solicitudes pendientes',
    body: 'Cuando alguien envíe el formulario de Únete, aparecerá en esta lista.',
  },
  events: {
    title: 'Aún no hay eventos publicados',
    body: 'Crea el primero y publícalo para que tus pilotos lo vean.',
  },
  news: {
    title: 'Aún no hay noticias publicadas',
    body: 'Comparte el primer comunicado con tu comunidad.',
  },
  gallery: {
    title: 'La galería se llena con cada rodada',
    body: 'Sube las primeras fotos para arrancar el archivo visual del club.',
  },
  birthdays: {
    title: 'No hay cumpleaños este mes',
    body: 'Aún no tenemos pilotos registrados con fecha de nacimiento.',
  },
  activity: {
    title: 'La actividad del comité aparecerá aquí',
    body: 'Acciones como aprobaciones y publicaciones se registran automáticamente.',
  },
  dashboardKpis: {
    title: 'Comparte el link de Únete',
    body: 'Las métricas se llenan a medida que recibes solicitudes y publicas contenido.',
  },
} as const;
