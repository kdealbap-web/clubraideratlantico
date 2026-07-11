// Helper único de Storage. Todo el proyecto sube al bucket público `gallery`
// usando prefijos por sección (members/, news/, events/). Antes esta lógica
// estaba duplicada en FormGaleria y FormEvento.

import { supabase } from './supabase';

export const BUCKET = 'gallery';

export interface Uploaded {
  url: string;
  path: string;
}

/**
 * Sube un archivo o blob al bucket `gallery`.
 * @param file   File o Blob a subir.
 * @param opts.prefix   carpeta lógica dentro del bucket (ej. 'members/'). Vacío = raíz.
 * @param opts.filename nombre base a usar cuando `file` es un Blob sin nombre.
 */
export async function uploadToBucket(
  file: File | Blob,
  opts: { prefix?: string; filename?: string } = {},
): Promise<Uploaded> {
  const prefix = opts.prefix ?? '';
  const rawName = opts.filename ?? (file instanceof File ? file.name : 'archivo');
  const safe = rawName.replace(/[^a-zA-Z0-9.-]/g, '-');
  const path = `${prefix}${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Elimina objetos del bucket (best-effort, no lanza). */
export async function removeFromBucket(...paths: Array<string | null | undefined>): Promise<void> {
  const clean = paths.filter((p): p is string => Boolean(p));
  if (clean.length === 0) return;
  await supabase.storage.from(BUCKET).remove(clean);
}
