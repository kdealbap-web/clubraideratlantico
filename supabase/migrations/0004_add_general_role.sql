-- ============================================================
-- Agrega rol 'GENERAL' como el rango base de membresía.
-- Jerarquía:
--   1. GENERAL          ← recién registrado (default)
--   2. ASPIRANTE        ← participación activa + cumple reglas
--   3. PILOTO_OFICIAL   ← rango más alto operativo
--   4. EDITOR           ← comité (gestiona contenido)
--   5. LIDER            ← comité (gestiona miembros + contenido)
--   6. ADMINISTRADOR    ← comité (control total)
--   *. CO_PILOTO        ← transversal (parrillero registrado)
--
-- NOTA: `alter type ... add value` no se puede correr dentro de un BEGIN;
-- ejecuta este archivo entero de una vez, sin envolver en transacción manual.
-- ============================================================

alter type rol_miembro add value if not exists 'GENERAL' before 'CO_PILOTO';
