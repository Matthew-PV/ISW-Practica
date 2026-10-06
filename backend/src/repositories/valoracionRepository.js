// Acceso a las valoraciones en MySQL (CS-01).
// Capa: repositorios (repositories).
// Lo usa: services/valoracionService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Valoracion.
const prisma = require('./shared/prisma');

// Devuelve la valoración de un usuario sobre una experiencia, o null si aún no la ha valorado.
async function buscar(usuarioId, experienciaId) {
  return prisma.valoracion.findUnique({
    where: { usuarioId_experienciaId: { usuarioId, experienciaId } },
  });
}

// Crea la valoración o, si el usuario ya había valorado esa experiencia, sustituye su
// puntuación y comentario (upsert). La restricción única impide que existan dos.
async function guardar({ usuarioId, experienciaId, puntuacion, comentario }) {
  return prisma.valoracion.upsert({
    where: { usuarioId_experienciaId: { usuarioId, experienciaId } },
    create: { usuarioId, experienciaId, puntuacion, comentario },
    update: { puntuacion, comentario },
  });
}

module.exports = { buscar, guardar };
