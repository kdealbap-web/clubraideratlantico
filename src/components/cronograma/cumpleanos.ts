import type { Rol } from '../../types';

/**
 * Roles cuyos cumpleaños se muestran y se pueden felicitar.
 * Incluye: Piloto Oficial, Administrador y Co-Piloto.
 * Excluye: Aspirante, General, Líder y Editor.
 * (Cambiar esta lista ajusta tanto la sección de cumpleaños del mes como el
 *  generador de felicitaciones del admin — es la única fuente de verdad.)
 */
export const CUMPLE_ROLES: Rol[] = ['PILOTO_OFICIAL', 'ADMINISTRADOR', 'CO_PILOTO'];
