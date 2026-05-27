export type GalleryType = 'imagen' | 'video';

export interface GalleryItem {
  id: string;
  created_at: string;
  label: string;
  cat: string;
  ratio: number;
  fav: boolean;
  url: string;
  storage_path: string;
  /** 'imagen' | 'video' */
  type: GalleryType;
  /** Rodada/evento al que pertenece (opcional). */
  event_id: string | null;
  /** Miniatura/portada del video (opcional). */
  poster_url: string | null;
  /** Ruta en Storage de la portada (para borrarla al eliminar). */
  poster_path: string | null;
  /** Carpeta/álbum (viaje, rodada o evento) para agrupar. */
  album: string | null;
}
