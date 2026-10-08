// Acceso a experiencias. Los datos llegan validados desde el servicio.
// Capa: repositorios (repositories).
// Lo usa: services/experienciaService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
const prisma = require('./shared/prisma');

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

// Busca una experiencia por su id.
async function buscarPorId(id) {
  return prisma.experiencia.findUnique({
    where: { id },
    include: { ciudad: true, autor: true },
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

// Devuelve las experiencias de un autor, de la más nueva a la más antigua, con su ciudad.
async function listarPorAutor(autorId) {
  return prisma.experiencia.findMany({
    where: { autorId },
    orderBy: { id: 'desc' },
    include: { ciudad: true },
  });
}

module.exports = { crear, buscarPorId, actualizar, listarPorAutor };
