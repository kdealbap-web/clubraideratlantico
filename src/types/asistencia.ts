export type OrigenAsistencia = 'qr' | 'import' | 'manual';

export interface Asistencia {
  id: string;
  created_at: string;
  member_id: string | null;
  event_id: string | null;
  fecha: string; // YYYY-MM-DD
  hora: string | null;
  codigo: string | null;
  origen: OrigenAsistencia;
  registrado_por: string | null;
}
