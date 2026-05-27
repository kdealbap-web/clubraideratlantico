import { getEmbedUrl } from '../../lib/video';

/**
 * Reproductor responsivo (16:9) que funciona en desktop y móvil.
 * - YouTube/Vimeo → iframe embebido.
 * - Archivo directo (mp4/webm) → <video> nativo con controles.
 *   `playsInline` evita que iOS fuerce pantalla completa.
 */
export function VideoPlayer({
  url,
  poster,
  label,
}: {
  url: string;
  poster?: string | null;
  label?: string;
}) {
  const embed = getEmbedUrl(url);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#000',
        overflow: 'hidden',
        border: '1px solid var(--borde)',
      }}
    >
      {embed ? (
        <iframe
          src={embed}
          title={label ?? 'Video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <video
          src={url}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#000',
          }}
        />
      )}
    </div>
  );
}
