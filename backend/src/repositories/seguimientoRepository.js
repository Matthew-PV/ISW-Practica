// Acceso a los seguimientos en MySQL.
// Capa: repositorios (repositories).
// Lo usarán los servicios de seguimiento cuando se implementen.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Seguimiento.
const prisma = require('./shared/prisma');

// Crea un seguimiento. La fecha se asigna automáticamente en el esquema.
async function seguir(seguidorId, seguidoId) {
  return prisma.seguimiento.create({
    data: { seguidorId, seguidoId },
  });
}

// Elimina exactamente el seguimiento de un usuario a otro.
async function dejarDeSeguir(seguidorId, seguidoId) {
  return prisma.seguimiento.delete({
    where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
  });
}

// Indica si existe el seguimiento solicitado.
async function sigueA(seguidorId, seguidoId) {
  const seguimiento = await prisma.seguimiento.findUnique({
    where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
  });
  return seguimiento !== null;
}

// Devuelve los identificadores de los usuarios que siguen al usuario indicado.
async function listarSeguidoresIds(usuarioId) {
  const seguimientos = await prisma.seguimiento.findMany({
    where: { seguidoId: usuarioId },
    select: { seguidorId: true },
  });

  return seguimientos.map((seguimiento) => seguimiento.seguidorId);
}

// Cuenta cuántas personas siguen a un usuario.
async function contarSeguidores(seguidoId) {
  return prisma.seguimiento.count({
    where: { seguidoId },
  });
}

// Devuelve una página de las personas que siguen a un usuario, con sus datos públicos (nunca el email), del seguimiento más reciente al más antiguo.

async function listarSeguidores(usuarioId, pagina, limite) {
  const seguimientos = await prisma.seguimiento.findMany({
    where: { seguidoId: usuarioId },
    select: { seguidor: { select: { id: true, nombreUsuario: true, foto: true } } },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    skip: (pagina - 1) * limite,
    take: limite,
  });

  return seguimientos.map((seguimiento) => seguimiento.seguidor);
}

module.exports = {
  seguir,
  dejarDeSeguir,
  sigueA,
  listarSeguidoresIds,
  contarSeguidores,
  listarSeguidores,
};