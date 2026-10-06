// Reglas de las valoraciones de experiencias (CS-01).
// Capa: servicios (services).
// Lo usa: routes/valoracionRoutes.js.
// Usa: repositories/valoracionRepository.js (consultar y guardar la valoración),
//      repositories/usuarioRepository.js (comprobar que quien valora existe),
//      repositories/experienciaRepository.js (comprobar que la experiencia existe),
//      services/shared/visibilidad.js (comprobar que puede verla) y errores.js.
//
// Orden de trabajo: primero se valida todo lo que no necesita la base de datos (id,
// puntuación y comentario) y solo después se consulta MySQL. Si algo falla no se guarda nada.
const valoracionRepository = require('../repositories/valoracionRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const experienciaRepository = require('../repositories/experienciaRepository');
const { puedeVerExperiencia } = require('./shared/visibilidad');
const { crearError } = require('../errores');

const PUNTUACION_MIN = 1;
const PUNTUACION_MAX = 5;

// Crea la valoración del usuario sobre la experiencia o actualiza la que ya tenía.
// - `usuarioId`: el id de la sesión, nunca del cuerpo de la petición.
// - `experienciaId`: la experiencia que se valora.
// - `datos`: el cuerpo de la petición { puntuacion, comentario? }.
// Devuelve { valoracion, creada }: `creada` es false si ya existía y se ha actualizado.
// Errores: 401 si el usuario ya no existe, 400 si los datos no son válidos, 404 si la
// experiencia no existe o no puede verla (mismo mensaje, para no revelar que existe)
// y 403 si es su propia experiencia.
async function valorarExperiencia(usuarioId, experienciaId, datos) {
  // La sesión podría apuntar a un usuario que ya no existe (por ejemplo, base de datos vaciada)
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }
  if (!Number.isInteger(experienciaId) || experienciaId <= 0) {
    throw crearError('El identificador de la experiencia no es válido', 400);
  }
  // Number.isInteger descarta el texto "4", los decimales y la ausencia de valor
  const puntuacion = datos?.puntuacion;
  if (!Number.isInteger(puntuacion) || puntuacion < PUNTUACION_MIN || puntuacion > PUNTUACION_MAX) {
    throw crearError(`La puntuación debe ser un número entero del ${PUNTUACION_MIN} al ${PUNTUACION_MAX}`, 400);
  }
  const comentario = datos?.comentario ?? null;
  if (comentario !== null && typeof comentario !== 'string') {
    throw crearError('El comentario debe ser un texto', 400);
  }

  const experiencia = await experienciaRepository.buscarPorId(experienciaId);
  if (!experiencia || !(await puedeVerExperiencia(usuarioId, experiencia))) {
    throw crearError('La experiencia no existe', 404);
  }
  if (experiencia.autorId === usuarioId) {
    throw crearError('No puedes valorar tu propia experiencia', 403);
  }

  const anterior = await valoracionRepository.buscar(usuarioId, experienciaId);
  const valoracion = await valoracionRepository.guardar({ usuarioId, experienciaId, puntuacion, comentario });
  return { valoracion, creada: anterior === null };
}

module.exports = { valorarExperiencia };
