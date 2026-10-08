// Paginación por cursor, común a los listados («Cargar más»).
// Capa: servicios (services/shared).
// Lo usa: services/experienciaService.js (CS-44).
// Usa: errores.js.
//
// En lugar de pedir «la página 3» (OFFSET, que obliga a MySQL a recorrer todas las filas
// anteriores y repite o salta elementos si la lista cambia entre dos peticiones), el cliente
// pide «los siguientes `limite` elementos después del id `despuesDe`». Los listados se ordenan
// por id de mayor a menor (lo más reciente primero), así que «después» significa id menor.
const { crearError } = require('../../errores');

const LIMITE_MAX = 50;
const ID_MAX = 2147483647; // Mayor entero positivo de una columna Int de MySQL.

// Lee `despuesDe` y `limite` de la query de la URL (llegan como texto) y los devuelve como
// números: { despuesDe, limite }. `despuesDe` es opcional (null = desde el principio) y `limite`
// va de 1 a LIMITE_MAX, con `porDefecto` si no se indica. Si no son válidos, error 400.
function leerPaginacion({ despuesDe, limite } = {}, porDefecto) {
  const cursor = despuesDe === undefined ? null : Number(despuesDe);
  const cantidad = limite === undefined ? porDefecto : Number(limite);

  const cursorValido = cursor === null || (Number.isInteger(cursor) && cursor > 0 && cursor <= ID_MAX);
  const cantidadValida = Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= LIMITE_MAX;
  if (!cursorValido || !cantidadValida) {
    throw crearError('La paginación no es válida', 400);
  }
  return { despuesDe: cursor, limite: cantidad };
}

// El repositorio pide una fila más de las que se muestran (limite + 1): si llega, hay otra
// página. Devuelve { elementos, siguiente }, donde `siguiente` es el `despuesDe` de la próxima
// petición (el id del último elemento mostrado) o null si no hay más.
function cortarPagina(filas, limite) {
  if (filas.length <= limite) {
    return { elementos: filas, siguiente: null };
  }
  const elementos = filas.slice(0, limite);
  return { elementos, siguiente: elementos[elementos.length - 1].id };
}

module.exports = { leerPaginacion, cortarPagina };
