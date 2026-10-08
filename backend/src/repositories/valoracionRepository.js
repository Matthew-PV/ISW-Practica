// Acceso a las valoraciones en MySQL (CS-01, CS-48 y CS-63).
// Capa: repositorios (repositories).
// Lo usa: services/valoracionService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL) y repositories/shared/camposPublicos.js.
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Valoracion.
const prisma = require('./shared/prisma');
const { USUARIO_PUBLICO } = require('./shared/camposPublicos');

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

// Datos públicos del autor de cada valoración (nunca su email).
const AUTOR_PUBLICO = { select: USUARIO_PUBLICO };

// Consulta común de los listados: hasta `cantidad` valoraciones que cumplen `where`, de la más
// reciente a la más antigua y anteriores al id `despuesDe` si se indica (el cursor de «Cargar
// más», ver services/shared/paginacion.js), con los datos públicos de su autor.
async function listarPagina(where, despuesDe, cantidad) {
  if (despuesDe !== null) {
    where.id = { lt: despuesDe };
  }
  return prisma.valoracion.findMany({
    where,
    include: { usuario: AUTOR_PUBLICO },
    orderBy: { id: 'desc' },
    take: cantidad,
  });
}

// CS-63: todas las valoraciones de una experiencia, por páginas.
async function listar(experienciaId, despuesDe, cantidad) {
  return listarPagina({ experienciaId }, despuesDe, cantidad);
}

// CS-48: las valoraciones de una experiencia hechas por amigos de `usuarioId` (amistad aceptada,
// la enviara quien la enviara) o por quienes lo siguen, por páginas. El filtro va dentro de la
// misma consulta, así que no hace falta cargar antes la lista de amigos y seguidores.
async function listarDeRelacionados(experienciaId, usuarioId, despuesDe, cantidad) {
  return listarPagina({
    experienciaId,
    usuario: {
      OR: [
        { solicitudesEnviadas: { some: { destinatarioId: usuarioId, estado: 'ACEPTADA' } } },
        { solicitudesRecibidas: { some: { solicitanteId: usuarioId, estado: 'ACEPTADA' } } },
        { seguimientosRealizados: { some: { seguidoId: usuarioId } } },
      ],
    },
  }, despuesDe, cantidad);
}

// CS-63: la valoración de un usuario en una experiencia, o null si todavía no la ha valorado.
async function obtenerPorUsuarioYExperiencia(usuarioId, experienciaId) {
  return prisma.valoracion.findUnique({
    where: { usuarioId_experienciaId: { usuarioId, experienciaId } },
  });
}

module.exports = { guardar, listar, listarDeRelacionados, obtenerPorUsuarioYExperiencia };
