import type { Rol } from '../../types';

/**
 * Roles cuyos cumpleaños se muestran y se pueden felicitar.
 * Incluye: Administrador, Piloto Oficial, Co-Piloto y Aspirante.
 * Excluye: General, Líder y Editor.
 * (Cambiar esta lista ajusta tanto la sección de cumpleaños como el
 *  generador de felicitaciones del admin.)
 */
export const CUMPLE_ROLES: Rol[] = [
  'ADMINISTRADOR',
  'PILOTO_OFICIAL',
  'CO_PILOTO',
  'ASPIRANTE',
];
