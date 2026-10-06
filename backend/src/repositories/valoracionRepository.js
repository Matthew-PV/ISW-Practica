// Acceso a las valoraciones en MySQL (CS-01).
// Capa: repositorios (repositories).
// Lo usa: services/valoracionService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Valoracion.
const prisma = require('./shared/prisma');

// Crea la valoración o, si el usuario ya había valorado esa experiencia, sustituye su
// puntuación y comentario. Devuelve { valoracion, creada }.
// Se intenta crear primero: la restricción única [usuarioId, experienciaId] la comprueba
// MySQL dentro del propio INSERT, así que con peticiones simultáneas solo una crea la fila.
// Las demás reciben el error P2002 (duplicado) y pasan a actualizarla: nunca hay dos.
async function guardar({ usuarioId, experienciaId, puntuacion, comentario }) {
  try {
    const valoracion = await prisma.valoracion.create({
      data: { usuarioId, experienciaId, puntuacion, comentario },
    });
    return { valoracion, creada: true };
  } catch (err) {
    // Cualquier otro error es inesperado: se relanza y app.js responde 500
    if (err.code !== 'P2002') throw err;
    const valoracion = await prisma.valoracion.update({
      where: { usuarioId_experienciaId: { usuarioId, experienciaId } },
      data: { puntuacion, comentario },
    });
    return { valoracion, creada: false };
  }
}

module.exports = { guardar };
