export type Rol =
  | 'ADMINISTRADOR'
  | 'LIDER'
  | 'EDITOR'
  | 'PILOTO_OFICIAL'
  | 'ASPIRANTE'
  | 'GENERAL'
  | 'CO_PILOTO';

export type EstadoMiembro = 'activo' | 'pendiente' | 'inactivo';

export interface Emergencia {
  nombre: string;
  tel: string;
  relacion: string;
}

export interface Member {
  id: string;
  created_at: string;
  auth_user_id: string | null;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  estado: EstadoMiembro;
  rodadas: number;

  cedula: string | null;
  fecha_nac: string | null;
  tel: string | null;
  ciudad: string | null;

  moto_marca: string | null;
  moto_modelo: string | null;
  moto_year: number | null;
  moto_placa: string | null;
  moto_color: string | null;

  alias: string | null;
  ingreso: string | null;
  emergencia: Emergencia | null;

  direccion: string | null;
  eps: string | null;
  grupo_sanguineo: string | null;
  lugar_trabajo: string | null;
  contacto_trabajo: string | null;
  bio: string | null;
  moto_soat: string | null;
}

export const ROL_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  LIDER: 'Líder',
  EDITOR: 'Editor',
  PILOTO_OFICIAL: 'Piloto Oficial',
  ASPIRANTE: 'Aspirante',
  GENERAL: 'General',
  CO_PILOTO: 'Co-Piloto',
};
