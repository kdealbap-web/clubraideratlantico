// Utilidades de imagen client-side.
// Redimensiona y comprime en el navegador (canvas) antes de subir a Storage,
// para no guardar fotos de celular de 1-3 MB. Mantiene el aspect ratio.

export interface ResizeOpts {
  /** Lado más largo en px (el otro se escala proporcional). */
  maxDim?: number;
  /** Calidad de compresión 0..1. */
  quality?: number;
  mime?: 'image/webp' | 'image/jpeg';
}

const DEFAULTS: Required<ResizeOpts> = {
  maxDim: 1000,
  quality: 0.82,
  mime: 'image/webp',
};

/**
 * Redimensiona/comprime una imagen. Respeta la orientación EXIF (fotos de celular)
 * y nunca agranda una imagen más pequeña que `maxDim`. Devuelve un Blob.
 */
export async function resizeImage(file: File, opts: ResizeOpts = {}): Promise<Blob> {
  const { maxDim, quality, mime } = { ...DEFAULTS, ...opts };
  const bitmap = await loadBitmap(file);
  const srcW = 'width' in bitmap ? bitmap.width : (bitmap as HTMLImageElement).naturalWidth;
  const srcH = 'height' in bitmap ? bitmap.height : (bitmap as HTMLImageElement).naturalHeight;

  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el contexto de canvas.');
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
  if ('close' in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality),
  );
  if (!blob) throw new Error('No se pudo procesar la imagen.');
  return blob;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Safari viejo o formato no soportado → fallback a <img>.
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}

/**
 * Extrae la cédula (solo dígitos) del nombre de archivo.
 * Ej. "1002028831.jpg" → "1002028831"; "foto-72229089 (1).jpg" → "72229089".
 * Devuelve null si no hay al menos 5 dígitos.
 */
export function parseCedulaFromFilename(filename: string): string | null {
  const base = filename.replace(/\.[^./\\]+$/, '');
  const digits = base.replace(/\D/g, '');
  return digits.length >= 5 ? digits : null;
}
