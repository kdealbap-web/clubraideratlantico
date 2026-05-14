import type { Rol } from '../types';

export interface RolPermisos {
  rol: Rol;
  label: string;
  short: string;
  description: string;
  capabilities: string[];
  color: string;
}

export const ROL_PERMISOS: Record<Rol, RolPermisos> = {
  ADMINISTRADOR: {
    rol: 'ADMINISTRADOR',
    label: 'Administrador',
    short: 'Admin',
    description: 'Control total del sitio y del comité.',
    capabilities: [
      'Editar y eliminar cualquier miembro',
      'Cambiar roles y estados',
      'Aprobar y rechazar solicitudes',
      'Publicar eventos, noticias y galería',
      'Editar configuración del sitio',
      'Ver log de actividad',
    ],
    color: 'var(--rojo)',
  },
  LIDER: {
    rol: 'LIDER',
    label: 'Líder',
    short: 'Líder',
    description: 'Mismas atribuciones que el admin sobre contenido y miembros.',
    capabilities: [
      'Editar y eliminar miembros',
      'Cambiar roles (excepto a Administrador)',
      'Aprobar y rechazar solicitudes',
      'Publicar eventos, noticias y galería',
      'Editar configuración del sitio',
      'Ver log de actividad',
    ],
    color: 'var(--rojo-light)',
  },
  EDITOR: {
    rol: 'EDITOR',
    label: 'Editor',
    short: 'Editor',
    description: 'Gestiona contenido del sitio. No toca miembros ni roles.',
    capabilities: [
      'Crear/editar eventos',
      'Crear/editar noticias',
      'Subir/editar galería',
      'NO puede aprobar solicitudes ni cambiar roles',
    ],
    color: 'var(--amarillo, #E8B800)',
  },
  PILOTO_OFICIAL: {
    rol: 'PILOTO_OFICIAL',
    label: 'Piloto Oficial',
    short: 'Piloto',
    description: 'Rango operativo más alto. Lleva el parche oficial del club.',
    capabilities: [
      'Inscribirse a todas las rodadas oficiales',
      'Liderar pelotones cuando le asignen',
      'Editar sus propios datos en el portal',
      'Sin acceso al CMS administrativo',
    ],
    color: 'var(--success)',
  },
  ASPIRANTE: {
    rol: 'ASPIRANTE',
    label: 'Aspirante',
    short: 'Aspirante',
    description: 'En evaluación constante para subir a Piloto Oficial.',
    capabilities: [
      'Asiste a rodadas oficiales y apoya en logística',
      'Evaluado por participación, asistencia, compromiso',
      'Sin tiempo fijo para el ascenso — depende 100% de su actitud',
      'Editar sus propios datos en el portal',
    ],
    color: 'var(--info, #60A5FA)',
  },
  GENERAL: {
    rol: 'GENERAL',
    label: 'General',
    short: 'General',
    description: 'Rango base. Miembro recién registrado del grupo.',
    capabilities: [
      'Acceso al portal personal',
      'Asiste como acompañante a rodadas (cumpliendo equipo y documentos)',
      'Sube a Aspirante con participación activa',
      'Sin acceso al CMS',
    ],
    color: 'var(--light)',
  },
  CO_PILOTO: {
    rol: 'CO_PILOTO',
    label: 'Co-Piloto',
    short: 'Copiloto',
    description: 'Parrillero registrado. Rol transversal al rango del piloto.',
    capabilities: [
      'Inscribirse como acompañante en rodadas',
      'Editar sus propios datos',
      'Sin acceso al CMS administrativo',
    ],
    color: 'var(--muted)',
  },
};

export const ROLES_CON_CMS: Rol[] = ['ADMINISTRADOR', 'LIDER', 'EDITOR'];
export const ROLES_PILOTO: Rol[] = ['PILOTO_OFICIAL', 'ASPIRANTE', 'GENERAL', 'CO_PILOTO'];
export const ROLES_GESTION_MIEMBROS: Rol[] = ['ADMINISTRADOR', 'LIDER'];

// Orden visual en pickers: jerarquía de mayor a menor (comité → operativo → base → transversal)
export const ALL_ROLES: Rol[] = [
  'ADMINISTRADOR',
  'LIDER',
  'EDITOR',
  'PILOTO_OFICIAL',
  'ASPIRANTE',
  'GENERAL',
  'CO_PILOTO',
];

// Rol por defecto cuando se aprueba una solicitud pública
export const ROL_DEFAULT_NUEVO_MIEMBRO: Rol = 'GENERAL';

export function tieneAccesoCMS(rol: Rol | undefined | null): boolean {
  return rol ? ROLES_CON_CMS.includes(rol) : false;
}

export function puedeGestionarMiembros(rol: Rol | undefined | null): boolean {
  return rol ? ROLES_GESTION_MIEMBROS.includes(rol) : false;
}
