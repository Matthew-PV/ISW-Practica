// Acceso a experiencias. Los datos llegan validados desde el servicio.
// Capa: repositorios (repositories).
// Lo usa: services/experienciaService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL) y repositories/shared/camposPublicos.js.
const prisma = require('./shared/prisma');
const { USUARIO_PUBLICO } = require('./shared/camposPublicos');

// Guarda una experiencia nueva y la devuelve junto con los datos de su ciudad.
// Se nombran los campos uno a uno para que nunca se guarde nada que no esté en esta lista.
// Si la ciudad o el autor no existen, Prisma lanza un error con código P2003.
async function crear({ titulo, descripcion, ciudadId, tipo, momentoAdecuado, visibilidad, autorId }) {
  return prisma.experiencia.create({
    data: { titulo, descripcion, ciudadId, tipo, momentoAdecuado, visibilidad, autorId },
    // include: añade a la respuesta la ciudad completa, no solo su id
    include: { ciudad: true },
  });
}

// Busca una experiencia por su id, con su ciudad y los datos públicos de su autor
// (nunca su email ni el hash de su contraseña, que llegarían a la respuesta de la API).
async function buscarPorId(id) {
  return prisma.experiencia.findUnique({
    where: { id },
    include: {
      ciudad: true,
      autor: { select: USUARIO_PUBLICO },
    },
  });
}

// Actualiza una experiencia existente.
async function actualizar(id, datos) {
  return prisma.experiencia.update({
    where: { id },
    data: datos,
    include: { ciudad: true },
  });
}

// CS-44: hasta `cantidad` experiencias de un autor con alguna de las `visibilidades` indicadas,
// de la más reciente a la más antigua, con su ciudad. Con `despuesDe` (un id) empieza justo
// después de ese elemento: es el cursor de «Cargar más» (ver services/shared/paginacion.js).
// El índice por autorId permite a MySQL ir directo a esas filas, sin recorrer las anteriores.
async function listarDeAutor(autorId, visibilidades, despuesDe, cantidad) {
  const where = { autorId, visibilidad: { in: visibilidades } };
  if (despuesDe !== null) {
    where.id = { lt: despuesDe };
  }
  return prisma.experiencia.findMany({
    where,
    orderBy: { id: 'desc' },
    take: cantidad,
    include: { ciudad: true },
  });
}

module.exports = { crear, buscarPorId, actualizar, listarDeAutor };
