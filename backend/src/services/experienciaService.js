// Reglas de creación de experiencias (LUC01).
const ciudadRepository = require('../repositories/ciudadRepository');
const experienciaRepository = require('../repositories/experienciaRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');

const TEXTO_CORTO_MAX = 191; // Columnas VARCHAR(191) de MySQL.
const DESCRIPCION_MAX_BYTES = 65535; // Capacidad de la columna TEXT en UTF-8.
const CIUDAD_ID_MAX = 2147483647; // Mayor entero positivo de una columna Int.

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

function comprobarTextoCorto(texto, nombre) {
  // Cuenta caracteres Unicode; un emoji puede ocupar dos posiciones en String.length.
  if (texto !== null && Array.from(texto).length > TEXTO_CORTO_MAX) {
    throw crearError(`${nombre} no puede superar los 191 caracteres`, 400);
  }
}

// Devuelve únicamente los campos admitidos y preparados para guardar.
// No crea registros. La ciudad se consulta solo después de validar los datos locales.
async function validarCreacion(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw crearError('Los datos de la experiencia deben ser un objeto', 400);
  }

  const titulo = leerTexto(datos.titulo, 'El título', true);
  const descripcion = leerTexto(datos.descripcion, 'La descripción', true);
  const tipo = leerTexto(datos.tipo, 'El tipo', false);
  const momentoAdecuado = leerTexto(datos.momentoAdecuado, 'El momento adecuado', false);
  const ciudadId = datos.ciudadId;

  comprobarTextoCorto(titulo, 'El título');
  comprobarTextoCorto(tipo, 'El tipo');
  comprobarTextoCorto(momentoAdecuado, 'El momento adecuado');
  // TEXT limita bytes: las tildes y los emojis pueden ocupar más de uno.
  if (Buffer.byteLength(descripcion, 'utf8') > DESCRIPCION_MAX_BYTES) {
    throw crearError('La descripción es demasiado larga (máximo 65535 bytes en UTF-8)', 400);
  }
  if (!Number.isInteger(ciudadId) || ciudadId <= 0 || ciudadId > CIUDAD_ID_MAX) {
    throw crearError('Debes indicar una ciudad con un identificador entero positivo válido', 400);
  }
  if (!(await ciudadRepository.buscarPorId(ciudadId))) {
    throw crearError('La ciudad seleccionada no existe', 400);
  }

  return { titulo, descripcion, ciudadId, tipo, momentoAdecuado };
}

// El autor viene de la sesión, nunca del cuerpo de la petición.
async function crearExperiencia(usuarioId, datos) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }
  const datosValidados = await validarCreacion(datos);
  try {
    return await experienciaRepository.crear({ ...datosValidados, autorId: usuarioId });
  } catch (err) {
    // P2003: una ciudad o usuario desapareció entre la validación y el guardado.
    if (err.code === 'P2003') {
      if (!(await usuarioRepository.buscarPorId(usuarioId))) {
        throw crearError('No hay sesión iniciada', 401);
      }
      throw crearError('La ciudad seleccionada ya no está disponible', 400);
    }
    throw err;
  }
}

module.exports = { validarCreacion, crearExperiencia };
