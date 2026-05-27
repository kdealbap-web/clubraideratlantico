/**
 * Utilidades de video: detecta y normaliza embeds de YouTube/Vimeo.
 * Si una URL no es un embed reconocido se asume archivo de video
 * directo (mp4/webm) y se reproduce con <video>.
 */

/** Devuelve la URL de embed (iframe) si es YouTube/Vimeo, o null. */
export function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();

  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (yt?.[1]) return `https://www.youtube.com/embed/${yt[1]}`;

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm?.[1]) return `https://player.vimeo.com/video/${vm[1]}`;

  return null;
}

/** true si la URL es un embed reconocido (YouTube/Vimeo). */
export function isEmbed(url: string | null | undefined): boolean {
  return getEmbedUrl(url) !== null;
}
