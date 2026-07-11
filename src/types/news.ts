export type EstadoNoticia = 'borrador' | 'publicado' | 'archivado';

export interface NewsImage {
  url: string;
  path: string;
  caption?: string;
}

export interface News {
  id: string;
  created_at: string;
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  fecha: string;
  estado: EstadoNoticia;
  tags: string[];
  cover_url: string | null;
  cover_path: string | null;
  galeria: NewsImage[];
}
