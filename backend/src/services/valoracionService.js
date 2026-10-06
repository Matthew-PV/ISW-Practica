// Reglas de las valoraciones de experiencias (CS-01).
// Capa: servicios (services).
// Lo usa: routes/valoracionRoutes.js.
// Usa: repositories/valoracionRepository.js (consultar y guardar la valoración).
const valoracionRepository = require('../repositories/valoracionRepository');

// Crea la valoración del usuario sobre la experiencia o actualiza la que ya tenía.
// - `usuarioId`: el id de la sesión, nunca del cuerpo de la petición.
// - `experienciaId`: la experiencia que se valora.
// - `datos`: el cuerpo de la petición { puntuacion, comentario? }.
// Devuelve { valoracion, creada }: `creada` es false si ya existía y se ha actualizado.
async function valorarExperiencia(usuarioId, experienciaId, datos) {
  const anterior = await valoracionRepository.buscar(usuarioId, experienciaId);
  const valoracion = await valoracionRepository.guardar({
    usuarioId,
    experienciaId,
    puntuacion: datos?.puntuacion,
    comentario: datos?.comentario ?? null,
  });
  return { valoracion, creada: anterior === null };
}

module.exports = { valorarExperiencia };
