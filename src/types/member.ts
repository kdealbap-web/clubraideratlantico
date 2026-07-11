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

  foto_url: string | null;
  foto_path: string | null;

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

  grupo: GrupoComite | null;
  cargo: string | null;
  num: number | null;
  desde: number | null;
}

export type GrupoComite = 'lideres' | 'disciplina' | 'ruta' | 'contenido';

export const GRUPOS_COMITE: Array<{
  id: GrupoComite;
  label: string;
  short: string;
  desc: string;
}> = [
  {
    id: 'lideres',
    label: 'Líderes',
    short: 'LD',
    desc: 'Dirección y representación oficial del club.',
  },
  {
    id: 'disciplina',
    label: 'Grupo de Disciplina',
    short: 'DC',
    desc: 'Reglamento, seguridad vial y código de conducta.',
  },
  {
    id: 'ruta',
    label: 'Grupo de Ruta',
    short: 'RT',
    desc: 'Diseño de recorridos, logística y guía de rodadas.',
  },
  {
    id: 'contenido',
    label: 'Grupo de Contenido',
    short: 'CT',
    desc: 'Fotografía, video, redes sociales y narrativa del club.',
  },
];

export const ROL_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  LIDER: 'Líder',
  EDITOR: 'Editor',
  PILOTO_OFICIAL: 'Piloto Oficial',
  ASPIRANTE: 'Aspirante',
  GENERAL: 'General',
  CO_PILOTO: 'Co-Piloto',
};
