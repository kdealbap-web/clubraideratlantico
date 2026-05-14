export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export type Experiencia = 'novato' | 'intermedio' | 'experimentado';

export interface Solicitud {
  id: string;
  created_at: string;
  estado: EstadoSolicitud;

  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nac: string;
  email: string;
  tel: string;
  ciudad: string;

  moto_marca: string;
  moto_modelo: string;
  moto_year: number;
  moto_placa: string;
  moto_color: string;

  doc_propia: boolean;
  doc_tarjeta: boolean;
  doc_soat: boolean;
  doc_tecno: boolean;

  tiene_licencia: boolean;
  experiencia: Experiencia;

  con_copiloto: boolean;
  co_nombre: string | null;
  co_apellido: string | null;
  co_cedula: string | null;
  co_fecha_nac: string | null;
  co_tel: string | null;

  motivo: string | null;

  acepta_reglamento: boolean;
  acepta_datos: boolean;

  decided_at: string | null;
  decided_by: string | null;
  nota_decision: string | null;
}
