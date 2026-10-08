// Lectura de los identificadores (ids de MySQL) que llegan en la URL o en el cuerpo de una petición.
// Capa: servicios (services/shared).
// Lo usan: services/amistadService.js, services/seguimientoService.js,
//          services/experienciaService.js y services/valoracionService.js.
// Usa: errores.js.
//
// Así un identificador mal escrito (/api/amistades/abc) responde 400 con un mensaje claro,
// en lugar de llegar a Prisma y acabar en un error 500.
const { crearError } = require('../../errores');

const ID_MAX = 2147483647; // Mayor entero positivo de una columna Int de MySQL.

// Devuelve el identificador si es un número entero entre 1 e ID_MAX; si no, lanza un error 400.
// `descripcion` completa el mensaje: leerId(valor, 'de la amistad') →
// «El identificador de la amistad no es válido».
function leerId(valor, descripcion) {
  if (!Number.isInteger(valor) || valor <= 0 || valor > ID_MAX) {
    throw crearError(`El identificador ${descripcion} no es válido`, 400);
  }
  return valor;
}

module.exports = { leerId };
