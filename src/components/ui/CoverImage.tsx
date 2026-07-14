import type { CSSProperties, ReactNode } from 'react';

interface Props {
  url: string | null | undefined;
  alt?: string;
  /** Relación de aspecto en % (alto/ancho). Ej. 56 = caja 56%. Se ignora si se pasa minHeight. */
  ratio?: number;
  /** Altura mínima fija (para columnas que se estiran, ej. hero de 2 columnas). */
  minHeight?: number;
  style?: CSSProperties;
  /** Overlays (badges, degradados, chips) posicionados sobre la imagen. */
  children?: ReactNode;
}

/**
 * Portada que muestra la imagen COMPLETA (object-fit: contain) sobre un fondo
 * desenfocado de la misma foto, para que nunca quede recortada sin importar su
 * formato (vertical u horizontal). Si no hay url, muestra un placeholder gris.
 */
export function CoverImage({ url, alt = '', ratio = 56, minHeight, style, children }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--dark-2)',
        ...(minHeight != null ? { minHeight } : { paddingTop: `${ratio}%` }),
        ...style,
      }}
    >
      {url ? (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: `url('${url}') center/cover`,
              filter: 'blur(18px) brightness(0.55)',
              transform: 'scale(1.1)',
            }}
          />
          <img
            src={url}
            alt={alt}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
          }}
        />
      )}
      {children}
    </div>
  );
}
