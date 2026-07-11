import type { Rol } from '../../types';

/**
 * Roles cuyos cumpleaños se muestran y se pueden felicitar.
 * Incluye a todo el personal (Administrador, Líder, Editor, Piloto Oficial, Co-Piloto).
 * Excluye únicamente: General y Aspirante.
 * (Cambiar esta lista ajusta tanto la sección de cumpleaños del mes como el
 *  generador de felicitaciones del admin — es la única fuente de verdad.)
 */
export const CUMPLE_ROLES: Rol[] = [
  'ADMINISTRADOR',
  'LIDER',
  'EDITOR',
  'PILOTO_OFICIAL',
  'CO_PILOTO',
];
