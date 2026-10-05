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

module.exports = { seguir, dejarDeSeguir, sigueA };
