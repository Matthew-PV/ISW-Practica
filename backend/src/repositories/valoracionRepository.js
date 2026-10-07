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

// Devuelve las valoraciones de una experiencia hechas por los usuarios indicados.
// La consulta está paginada y solo incluye datos públicos del autor de la valoración.
// Los identificadores de experiencia, usuarios, página y límite llegan ya validados
// desde el servicio.
async function listarDeUsuarios(experienciaId, usuarioIds, pagina, limite) {
  if (usuarioIds.length === 0) {
    return { valoraciones: [], total: 0 };
  }

  const where = {
    experienciaId,
    usuarioId: { in: usuarioIds },
  };

  const [valoraciones, total] = await Promise.all([
    prisma.valoracion.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombreUsuario: true,
            foto: true,
          },
        },
      },
      orderBy: [
        { actualizadaEn: 'desc' },
        { id: 'desc' },
      ],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.valoracion.count({ where }),
  ]);

  return { valoraciones, total };
}

// Busca la valoración de un usuario específico en una experiencia específica
async function obtenerPorUsuarioYExperiencia(usuarioId, experienciaId) {
  return prisma.valoracion.findUnique({
    where: {
      // CORRECCIÓN: El nombre debe coincidir exactamente con el orden del schema.prisma
      usuarioId_experienciaId: {
        usuarioId: usuarioId,
        experienciaId: experienciaId
      }
    }
  });
}

module.exports = { guardar, listarDeUsuarios, obtenerPorUsuarioYExperiencia };
