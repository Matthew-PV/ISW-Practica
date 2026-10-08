// Reglas de las experiencias: crearlas (CS-49) con su visibilidad (CS-22), editarlas (CS-57),
// leer una si se puede ver (CS-30) y listar las de un autor (CS-44).
// Capa: servicios (services).
// Lo usa: routes/experienciaRoutes.js.
// Usa: repositories/ciudadRepository.js (comprobar que la ciudad existe),
//      repositories/experienciaRepository.js (guardar la experiencia),
//      repositories/usuarioRepository.js (comprobar que el autor existe),
//      services/shared/visibilidad.js, services/shared/identificadores.js,
//      services/shared/paginacion.js y errores.js.
//
// Orden de trabajo: primero se valida todo lo que no necesita la base de datos (textos,
// longitudes, tipo de ciudadId) y solo después se consulta MySQL. Así una petición con
// datos malos se rechaza sin tocar la base de datos.
const ciudadRepository = require('../repositories/ciudadRepository');
const experienciaRepository = require('../repositories/experienciaRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const { puedeVerExperiencia, nivelesVisibles } = require('./shared/visibilidad');
const { leerPaginacion, cortarPagina } = require('./shared/paginacion');
const { leerId } = require('./shared/identificadores');
const { crearError } = require('../errores');

const TEXTO_CORTO_MAX = 191; // Columnas VARCHAR(191) de MySQL.
const DESCRIPCION_MAX_BYTES = 65535; // Capacidad de la columna TEXT en UTF-8.
const CIUDAD_ID_MAX = 2147483647; // Mayor entero positivo de una columna Int.
const VISIBILIDADES_VALIDAS = new Set(['PRIVADA', 'AMIGOS', 'PUBLICA']);

// Devuelve el texto limpio; si falta o está vacío, null cuando es opcional o error 400 cuando es obligatorio.
// - `valor`: lo que llega en la petición (puede ser cualquier cosa).
// - `nombre`: cómo se llama el campo en el mensaje de error («El título»...).
// - `obligatorio`: si el campo es obligatorio.
function leerTexto(valor, nombre, obligatorio) {
  if (valor === undefined || valor === null) {
    if (!obligatorio) return null;
    throw crearError(`${nombre} es obligatorio`, 400);
  }
  if (typeof valor !== 'string') {
    throw crearError(`${nombre} debe ser un texto`, 400);
  }
  // Quita espacios exteriores y unifica formas equivalentes de escribir las tildes.
  const texto = valor.normalize('NFC').trim();
  if (!texto) {
    if (!obligatorio) return null;
    throw crearError(`${nombre} es obligatorio`, 400);
  }
  return texto;
}

// Error 400 si el texto no cabe en una columna VARCHAR(191). null (campo opcional vacío) siempre vale.
function comprobarTextoCorto(texto, nombre) {
  // Cuenta caracteres Unicode; un emoji puede ocupar dos posiciones en String.length.
  if (texto !== null && Array.from(texto).length > TEXTO_CORTO_MAX) {
    throw crearError(`${nombre} no puede superar los 191 caracteres`, 400);
  }
}

function leerVisibilidad(valor) {
  if (valor === undefined || valor === null) {
    return 'PUBLICA';
  }

  if (typeof valor !== 'string') {
    throw crearError('La visibilidad debe ser una de: PRIVADA, AMIGOS o PUBLICA', 400);
  }

  const visibilidad = valor.normalize('NFC').trim().toUpperCase();

  if (!VISIBILIDADES_VALIDAS.has(visibilidad)) {
    throw crearError('La visibilidad debe ser una de: PRIVADA, AMIGOS o PUBLICA', 400);
  }

  return visibilidad;
}

// Devuelve únicamente los campos admitidos y preparados para guardar.
// No crea registros. La ciudad se consulta solo después de validar los datos locales.
// - `datos`: el cuerpo de la petición { titulo, descripcion, ciudadId, tipo?, momentoAdecuado? }.
// Cualquier otro campo que llegue (por ejemplo autorId) se ignora.
// Se exporta aparte para probar la validación sola (tests/experienciaValidacion.test.js).
async function validarCreacion(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw crearError('Los datos de la experiencia deben ser un objeto', 400);
  }

  const titulo = leerTexto(datos.titulo, 'El título', true);
  const descripcion = leerTexto(datos.descripcion, 'La descripción', true);
  const tipo = leerTexto(datos.tipo, 'El tipo', false);
  const momentoAdecuado = leerTexto(datos.momentoAdecuado, 'El momento adecuado', false);
  const visibilidad = leerVisibilidad(datos.visibilidad);
  const ciudadId = datos.ciudadId;

  comprobarTextoCorto(titulo, 'El título');
  comprobarTextoCorto(tipo, 'El tipo');
  comprobarTextoCorto(momentoAdecuado, 'El momento adecuado');
  // TEXT limita bytes: las tildes y los emojis pueden ocupar más de uno.
  if (Buffer.byteLength(descripcion, 'utf8') > DESCRIPCION_MAX_BYTES) {
    throw crearError('La descripción es demasiado larga (máximo 65535 bytes en UTF-8)', 400);
  }
  // ciudadId debe ser un número entero (no el texto "3") que quepa en la columna
  if (!Number.isInteger(ciudadId) || ciudadId <= 0 || ciudadId > CIUDAD_ID_MAX) {
    throw crearError('Debes indicar una ciudad con un identificador entero positivo válido', 400);
  }
  // Última comprobación, la única que consulta MySQL: que la ciudad exista en el catálogo
  if (!(await ciudadRepository.buscarPorId(ciudadId))) {
    throw crearError('La ciudad seleccionada no existe', 400);
  }

  return { titulo, descripcion, ciudadId, tipo, momentoAdecuado, visibilidad };
}

// El autor viene de la sesión, nunca del cuerpo de la petición.
// - `usuarioId`: el id de la sesión.
// - `datos`: el cuerpo de la petición (ver validarCreacion).
// Devuelve la experiencia guardada, con su ciudad. Error 401 si el usuario ya no existe,
// 400 si los datos no son válidos.

// Valida los campos que se pueden modificar de una experiencia.
// En una edición no es obligatorio enviar todos los campos,
// solo aquellos que se quieran cambiar.
async function validarEdicion(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw crearError('Los datos de la experiencia deben ser un objeto', 400);
  }

  const cambios = {};

  if (datos.titulo !== undefined) {
    const titulo = leerTexto(datos.titulo, 'El título', true);
    comprobarTextoCorto(titulo, 'El título');
    cambios.titulo = titulo;
  }

  if (datos.descripcion !== undefined) {
    const descripcion = leerTexto(datos.descripcion, 'La descripción', true);

    if (Buffer.byteLength(descripcion, 'utf8') > DESCRIPCION_MAX_BYTES) {
      throw crearError(
        'La descripción es demasiado larga (máximo 65535 bytes en UTF-8)',
        400
      );
    }

    cambios.descripcion = descripcion;
  }

  if (datos.tipo !== undefined) {
    const tipo = leerTexto(datos.tipo, 'El tipo', false);
    comprobarTextoCorto(tipo, 'El tipo');
    cambios.tipo = tipo;
  }

  if (datos.momentoAdecuado !== undefined) {
    const momentoAdecuado = leerTexto(
      datos.momentoAdecuado,
      'El momento adecuado',
      false
    );

    comprobarTextoCorto(momentoAdecuado, 'El momento adecuado');
    cambios.momentoAdecuado = momentoAdecuado;
  }

  if (datos.visibilidad !== undefined) {
    cambios.visibilidad = leerVisibilidad(datos.visibilidad);
  }

  if (datos.ciudadId !== undefined) {
  const ciudadId = datos.ciudadId;

  if (!Number.isInteger(ciudadId) || ciudadId <= 0 || ciudadId > CIUDAD_ID_MAX) {
    throw crearError(
      'Debes indicar una ciudad con un identificador entero positivo válido',
      400
    );
  }

  if (!(await ciudadRepository.buscarPorId(ciudadId))) {
    throw crearError('La ciudad seleccionada no existe', 400);
  }

  cambios.ciudadId = ciudadId;
}

  if (Object.keys(cambios).length === 0) {
    throw crearError('Debes indicar al menos un campo para modificar', 400);
  }

  return cambios;
}
async function crearExperiencia(usuarioId, datos) {
  // La sesión podría apuntar a un usuario que ya no existe (por ejemplo, base de datos vaciada)
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }
  const datosValidados = await validarCreacion(datos);
  try {
    return await experienciaRepository.crear({ ...datosValidados, autorId: usuarioId });
  } catch (err) {
    // P2003: una ciudad o usuario desapareció entre la validación y el guardado.
    // Se mira cuál de los dos ha sido para dar el mensaje correcto.
    if (err.code === 'P2003') {
      if (!(await usuarioRepository.buscarPorId(usuarioId))) {
        throw crearError('No hay sesión iniciada', 401);
      }
      throw crearError('La ciudad seleccionada ya no está disponible', 400);
    }
    // Cualquier otro fallo es inesperado: app.js responde 500
    throw err;
  }
}

// Edita una experiencia existente.
// Comprueba que el usuario exista, que la experiencia exista
// y que pertenezca al usuario que intenta modificarla.
async function editarExperiencia(usuarioId, experienciaId, datos) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }

  leerId(experienciaId, 'de la experiencia');

  const experiencia = await experienciaRepository.buscarPorId(experienciaId);

  if (!experiencia) {
    throw crearError('La experiencia no existe', 404);
  }

  if (experiencia.autorId !== usuarioId) {
    throw crearError('No puedes editar una experiencia de otro usuario', 403);
  }

  const cambiosValidados = await validarEdicion(datos);

  try {
    return await experienciaRepository.actualizar(
      experienciaId,
      cambiosValidados
    );
  } catch (err) {
    // La experiencia podría haberse eliminado entre la búsqueda y la actualización.
    if (err.code === 'P2025') {
      throw crearError('La experiencia ya no existe', 404);
    }

    throw err;
  }
}

// Devuelve una experiencia concreta si el usuario de la sesión puede verla.
// Requiere sesión y valida el identificador primero; si no existe o no es visible,
// devuelve errores explícitos sin filtrar la causa final.
async function obtenerExperiencia(usuarioId, experienciaId) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }

  leerId(experienciaId, 'de la experiencia');

  const experiencia = await experienciaRepository.buscarPorId(experienciaId);

  if (!experiencia || !(await puedeVerExperiencia(usuarioId, experiencia))) {
    throw crearError('Contenido no disponible', 404);
  }

  return experiencia;
}

const EXPERIENCIAS_POR_PAGINA = 10;

// CS-44: experiencias publicadas por un usuario, de la más reciente a la más antigua y por
// páginas, solo las que puede ver el usuario de la sesión (el autor ve también las privadas).
// - `nombreUsuario`: el autor, tal como aparece en su perfil.
// - `paginacion`: { despuesDe, limite } de la URL (ver services/shared/paginacion.js).
// Devuelve { experiencias, siguiente }. Error 400 si falta el autor o la paginación no es
// válida, y 404 si el autor no existe. Un autor sin experiencias da una lista vacía.
async function listarDeAutor(usuarioId, nombreUsuario, paginacion) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }
  if (typeof nombreUsuario !== 'string' || nombreUsuario === '') {
    throw crearError('Indica el nombre de usuario del autor', 400);
  }
  const { despuesDe, limite } = leerPaginacion(paginacion, EXPERIENCIAS_POR_PAGINA);

  const autor = await usuarioRepository.obtenerPerfilPublico(nombreUsuario);
  if (!autor) {
    throw crearError('Usuario no encontrado', 404);
  }

  const niveles = await nivelesVisibles(usuarioId, autor.id);
  const filas = await experienciaRepository.listarDeAutor(autor.id, niveles, despuesDe, limite + 1);
  const { elementos, siguiente } = cortarPagina(filas, limite);
  return { experiencias: elementos, siguiente };
}

module.exports = {
  listarDeAutor,
  obtenerExperiencia,
  validarCreacion,
  validarEdicion,
  crearExperiencia,
  editarExperiencia
};
