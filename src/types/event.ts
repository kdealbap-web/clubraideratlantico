export type EstadoEvento = 'borrador' | 'publicado' | 'realizado' | 'cancelado';
export type Dificultad = 'Fácil' | 'Media' | 'Alta' | '—';
export type TipoEvento = 'Rodada' | 'Evento' | 'Capacitación';

export interface EventItem {
  id: string;
  created_at: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  salida: string;
  ruta: string;
  cupos: number;
  inscritos: number;
  estado: EstadoEvento;
  dificultad: Dificultad;
  tipo: TipoEvento;
  km: number;
}
