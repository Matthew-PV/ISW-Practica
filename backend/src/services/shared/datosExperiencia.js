// Lectura y validación de los datos de una experiencia (CS-49, CS-53, CS-55, CS-56, CS-57).
// Capa: servicios (services/shared).
// Lo usa: services/experienciaService.js (crear, editar y buscar).
// Usa: repositories/ciudadRepository.js (comprobar que la ciudad existe),
//      services/shared/opcionesExperiencia.js y errores.js.
//
// Orden de trabajo: primero se valida todo lo que no necesita la base de datos (textos,
// longitudes, tipo de ciudadId) y solo después se consulta MySQL. Así una petición con
// datos malos se rechaza sin tocar la base de datos.
const ciudadRepository = require('../../repositories/ciudadRepository');
const { CATEGORIAS, MOMENTOS } = require('./opcionesExperiencia');
const { crearError } = require('../../errores');

const TEXTO_CORTO_MAX = 191; // Columnas VARCHAR(191) de MySQL.
const DESCRIPCION_MAX_BYTES = 65535; // Capacidad de la columna TEXT en UTF-8.
const ID_MAX = 2147483647; // Mayor entero positivo de una columna Int (ids y minutos).
const VISIBILIDADES_VALIDAS = new Set(['PRIVADA', 'AMIGOS', 'PUBLICA']);
const MOMENTOS_VALIDOS = MOMENTOS.flatMap((grupo) => grupo.valores);

// CS-53: duración opcional en minutos.
// Si se indica, debe ser un entero positivo.
function leerDuracion(valor) {
  if (valor === undefined || valor === null || valor === '') return null;

  if (!Number.isInteger(valor) ||
      valor <= 0 ||
      valor > ID_MAX) {
    throw crearError(
      'La duración debe ser un número entero positivo de minutos',
      400
    );
  }

  return valor;
}

// CS-53: tarifa opcional en euros.
// Acepta números o cadenas, con hasta dos decimales.
// Se devuelve como cadena para conservar la precisión decimal.
function leerTarifa(valor) {
  if (valor === undefined || valor === null) return null;

  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw crearError('La tarifa debe ser un importe válido', 400);
  }

  const texto = String(valor).trim().replace(',', '.');

  if (texto === '') return null;

  // DECIMAL(10,2): hasta 8 cifras enteras y 2 decimales.
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(texto)) {
    throw crearError(
      'La tarifa debe ser un importe no negativo con hasta dos decimales',
      400
    );
  }

  return texto;
}

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

// Lee un texto que cabe en una columna VARCHAR(191) (el título).
function leerTextoCorto(valor, nombre, obligatorio) {
  const texto = leerTexto(valor, nombre, obligatorio);
  comprobarTextoCorto(texto, nombre);
  return texto;
}

// Lee un texto opcional que, si llega, debe ser exactamente uno de `permitidos` (CS-55 y CS-56).
function leerOpcion(valor, nombre, permitidos) {
  const texto = leerTexto(valor, nombre, false);
  if (texto !== null && !permitidos.includes(texto)) {
    throw crearError(`${nombre} debe ser una de: ${permitidos.join(', ')}`, 400);
  }
  return texto;
}

// Lee la descripción, obligatoria y que quepa en la columna TEXT.
function leerDescripcion(valor) {
  const descripcion = leerTexto(valor, 'La descripción', true);
  // TEXT limita bytes: las tildes y los emojis pueden ocupar más de uno.
  if (Buffer.byteLength(descripcion, 'utf8') > DESCRIPCION_MAX_BYTES) {
    throw crearError('La descripción es demasiado larga (máximo 65535 bytes en UTF-8)', 400);
  }
  return descripcion;
}

// Comprueba la ciudad: un número entero (no el texto "3") que quepa en la columna y que esté en
// el catálogo. Es la única comprobación que consulta MySQL, por eso va la última.
async function leerCiudadId(ciudadId) {
  if (!Number.isInteger(ciudadId) || ciudadId <= 0 || ciudadId > ID_MAX) {
    throw crearError('Debes indicar una ciudad con un identificador entero positivo válido', 400);
  }
  if (!(await ciudadRepository.buscarPorId(ciudadId))) {
    throw crearError('La ciudad seleccionada no existe', 400);
  }
  return ciudadId;
}

// Cómo se lee cada campo de texto de una experiencia. Las reglas son las mismas al crearla (se
// leen todos) y al editarla (solo los que llegan).
const LECTORES = {
  titulo: (valor) => leerTextoCorto(valor, 'El título', true),
  descripcion: leerDescripcion,
  tipo: (valor) => leerOpcion(valor, 'La categoría', CATEGORIAS),
  momentoAdecuado: (valor) => leerOpcion(valor, 'El momento adecuado', MOMENTOS_VALIDOS),
  visibilidad: leerVisibilidad,
  duracionMinutos: leerDuracion,
  tarifa: leerTarifa,
};

const CAMPOS_SOLO_SI_LLEGAN = ['duracionMinutos', 'tarifa'];

// Error 400 si los datos no son un objeto (por ejemplo, una lista o un texto).
function comprobarObjeto(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw crearError('Los datos de la experiencia deben ser un objeto', 400);
  }
}

// Devuelve únicamente los campos admitidos y preparados para guardar.
// No crea registros. La ciudad se consulta solo después de validar los datos locales.
// - `datos`: el cuerpo de la petición { titulo, descripcion, ciudadId, tipo?, momentoAdecuado?, visibilidad? }.
// Cualquier otro campo que llegue (por ejemplo autorId) se ignora.
// Se exporta aparte para probar la validación sola (tests/services/experienciaService.validacion.test.js).
async function validarCreacion(datos) {
  comprobarObjeto(datos);
  const experiencia = {};
  for (const [campo, leer] of Object.entries(LECTORES)) {
    // Duración y tarifa son opcionales: si no llegan, no se envían y Prisma las deja a null.
    if (datos[campo] === undefined && CAMPOS_SOLO_SI_LLEGAN.includes(campo)) continue;
    experiencia[campo] = leer(datos[campo]);
  }
  experiencia.ciudadId = await leerCiudadId(datos.ciudadId);
  return experiencia;
}

// Valida los campos que se pueden modificar de una experiencia.
// En una edición no es obligatorio enviar todos los campos,
// solo aquellos que se quieran cambiar.
async function validarEdicion(datos) {
  comprobarObjeto(datos);
  // Al crear, sin visibilidad es PUBLICA; al editar, null no puede publicar una experiencia sin avisar
  if (datos.visibilidad === null) {
    throw crearError('La visibilidad debe ser una de: PRIVADA, AMIGOS o PUBLICA', 400);
  }
  const cambios = {};
  for (const [campo, leer] of Object.entries(LECTORES)) {
    if (datos[campo] !== undefined) {
      cambios[campo] = leer(datos[campo]);
    }
  }

  if (datos.ciudadId !== undefined) {
    cambios.ciudadId = await leerCiudadId(datos.ciudadId);
  }

  if (Object.keys(cambios).length === 0) {
    throw crearError('Debes indicar al menos un campo para modificar', 400);
  }

  return cambios;
}

module.exports = { validarCreacion, validarEdicion, leerTextoCorto, leerOpcion, leerTarifa, MOMENTOS_VALIDOS, ID_MAX };
