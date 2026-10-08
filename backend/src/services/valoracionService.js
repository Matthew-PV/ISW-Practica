// Reglas de las valoraciones de experiencias: valorar (CS-01), consultarlas (CS-63) y ver las
// de amigos y seguidores (CS-48).
// Capa: servicios (services).
// Lo usa: routes/valoracionRoutes.js.
// Usa: repositories/valoracionRepository.js (guardar la valoración),
//      services/experienciaService.js (obtenerExperiencia: que exista y pueda verla),
//      services/shared/identificadores.js (validar el id), services/shared/paginacion.js
//      (cursor de los listados), services/shared/fotoPorDefecto.js y errores.js.
//
// Orden de trabajo: primero se valida todo lo que no necesita la base de datos (id,
// puntuación y comentario) y solo después se consulta MySQL. Si algo falla no se guarda nada.
const valoracionRepository = require('../repositories/valoracionRepository');
const experienciaService = require('./experienciaService');
const { leerId } = require('./shared/identificadores');
const { leerPaginacion, cortarPagina } = require('./shared/paginacion');
const { conFotoPorDefecto } = require('./shared/fotoPorDefecto');
const { crearError } = require('../errores');

const PUNTUACION_MIN = 1;
const PUNTUACION_MAX = 5;
const COMENTARIO_MAX = 1000; // Caracteres, contados como en el navegador (value.length).

// Lee el comentario opcional de una valoración (CS-01 y CS-02): sin los espacios de los
// extremos y normalizado a NFC (una letra con tilde se guarda siempre igual, como un solo
// carácter). Sin comentario, o solo con espacios, devuelve null. Error 400 si no es texto o si
// supera COMENTARIO_MAX caracteres.
function leerComentario(valor) {
  if (valor === undefined || valor === null) {
    return null;
  }
  if (typeof valor !== 'string') {
    throw crearError('El comentario debe ser un texto', 400);
  }
  const comentario = valor.normalize('NFC').trim();
  if (comentario.length > COMENTARIO_MAX) {
    throw crearError(`El comentario no puede superar los ${COMENTARIO_MAX} caracteres`, 400);
  }
  return comentario === '' ? null : comentario;
}

// Crea la valoración del usuario sobre la experiencia o actualiza la que ya tenía.
// - `usuarioId`: el id de la sesión, nunca del cuerpo de la petición.
// - `experienciaId`: la experiencia que se valora.
// - `datos`: el cuerpo de la petición { puntuacion, comentario? }.
// Devuelve { valoracion, creada }: `creada` es false si ya existía y se ha actualizado.
// Errores: 400 si los datos no son válidos, 404 «Contenido no
// disponible» si la experiencia no existe o no puede verla (el mismo, para no revelar que
// existe) y 403 si es su propia experiencia.
async function valorarExperiencia(usuarioId, experienciaId, datos) {
  leerId(experienciaId, 'de la experiencia');
  // Number.isInteger descarta el texto "4", los decimales y la ausencia de valor
  const puntuacion = datos?.puntuacion;
  if (!Number.isInteger(puntuacion) || puntuacion < PUNTUACION_MIN || puntuacion > PUNTUACION_MAX) {
    throw crearError(`La puntuación debe ser un número entero del ${PUNTUACION_MIN} al ${PUNTUACION_MAX}`, 400);
  }
  const comentario = leerComentario(datos?.comentario);

  const experiencia = await experienciaService.obtenerExperiencia(usuarioId, experienciaId);
  if (experiencia.autorId === usuarioId) {
    throw crearError('No puedes valorar tu propia experiencia', 403);
  }

  // El repositorio decide si la crea o actualiza la existente, incluso con peticiones simultáneas
  return valoracionRepository.guardar({ usuarioId, experienciaId, puntuacion, comentario });
}

const VALORACIONES_POR_PAGINA = 10;

// CS-63: la valoración del usuario de la sesión en la experiencia, o null si todavía no la ha
// valorado. 404 «Contenido no disponible» si la experiencia no existe o no puede verla.
async function obtenerMiValoracion(usuarioId, experienciaId) {
  await experienciaService.obtenerExperiencia(usuarioId, experienciaId);
  return valoracionRepository.obtenerPorUsuarioYExperiencia(usuarioId, experienciaId);
}

// Común a los dos listados: valida la paginación y la experiencia, pide al repositorio una fila
// de más (con `consultar(despuesDe, cantidad)`) y devuelve { valoraciones, siguiente }.
async function listarPagina(usuarioId, experienciaId, paginacion, consultar) {
  const { despuesDe, limite } = leerPaginacion(paginacion, VALORACIONES_POR_PAGINA);
  await experienciaService.obtenerExperiencia(usuarioId, experienciaId);
  const { elementos, siguiente } = cortarPagina(await consultar(despuesDe, limite + 1), limite);
  return {
    valoraciones: elementos.map((valoracion) => ({ ...valoracion, usuario: conFotoPorDefecto(valoracion.usuario) })),
    siguiente,
  };
}

// CS-63: todas las valoraciones de la experiencia, de la más reciente a la más antigua y por
// páginas: { valoraciones, siguiente }. Cada una lleva los datos públicos de su autor.
// - `paginacion`: { despuesDe, limite } de la URL (ver services/shared/paginacion.js).
// Errores: 400 si la paginación no es válida y 404 «Contenido no disponible».
async function listarValoraciones(usuarioId, experienciaId, paginacion) {
  return listarPagina(usuarioId, experienciaId, paginacion,
    (despuesDe, cantidad) => valoracionRepository.listar(experienciaId, despuesDe, cantidad));
}

// CS-48: igual que listarValoraciones, pero solo las de amigos del usuario de la sesión (con la
// amistad aceptada) y de quienes lo siguen.
async function listarValoracionesRelacionadas(usuarioId, experienciaId, paginacion) {
  return listarPagina(usuarioId, experienciaId, paginacion,
    (despuesDe, cantidad) => valoracionRepository.listarDeRelacionados(experienciaId, usuarioId, despuesDe, cantidad));
}

module.exports = {
  valorarExperiencia,
  obtenerMiValoracion,
  listarValoraciones,
  listarValoracionesRelacionadas,
};
