// Acceso a los seguimientos en MySQL.
// Capa: repositorios (repositories).
// Lo usarán los servicios de seguimiento cuando se implementen.
// Usa: repositories/shared/prisma.js (la conexión con MySQL), repositories/shared/carreras.js y
//      repositories/shared/camposPublicos.js.
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Seguimiento.
const prisma = require('./shared/prisma');
const { nullSi } = require('./shared/carreras');
const { USUARIO_PUBLICO } = require('./shared/camposPublicos');

// Crea un seguimiento. La fecha se asigna automáticamente en el esquema.
// Devuelve null si ya existía: con dos «seguir» simultáneos, la restricción única
// [seguidorId, seguidoId] deja crear solo uno.
async function seguir(seguidorId, seguidoId) {
  return nullSi('P2002', () => prisma.seguimiento.create({
    data: { seguidorId, seguidoId },
  }));
}

// Elimina exactamente el seguimiento de un usuario a otro. Devuelve null si ya no existe.
async function dejarDeSeguir(seguidorId, seguidoId) {
  return nullSi('P2025', () => prisma.seguimiento.delete({
    where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
  }));
}

// Indica si existe el seguimiento solicitado.
async function sigueA(seguidorId, seguidoId) {
  const seguimiento = await prisma.seguimiento.findUnique({
    where: { seguidorId_seguidoId: { seguidorId, seguidoId } },
  });
  return seguimiento !== null;
}

// Cuenta cuántas personas siguen a un usuario.
async function contarSeguidores(seguidoId) {
  return prisma.seguimiento.count({
    where: { seguidoId },
  });
}

// CS-45: hasta `cantidad` personas que siguen a un usuario, del seguimiento más reciente al más
// antiguo, como { id, persona }: `id` es el del seguimiento (el cursor de «Cargar más») y
// `persona`, los datos públicos del seguidor (nunca el email). Con `despuesDe` (el id de un
// seguimiento) empieza justo después de él (ver services/shared/paginacion.js).
async function listarSeguidores(usuarioId, despuesDe, cantidad) {
  const where = { seguidoId: usuarioId };
  if (despuesDe !== null) {
    where.id = { lt: despuesDe };
  }
  const seguimientos = await prisma.seguimiento.findMany({
    where,
    select: { id: true, seguidor: { select: USUARIO_PUBLICO } },
    orderBy: { id: 'desc' },
    take: cantidad,
  });

  return seguimientos.map((seguimiento) => ({ id: seguimiento.id, persona: seguimiento.seguidor }));
}

module.exports = {
  seguir,
  dejarDeSeguir,
  sigueA,
  contarSeguidores,
  listarSeguidores,
};