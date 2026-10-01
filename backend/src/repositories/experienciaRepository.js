// Acceso a experiencias. Los datos llegan validados desde el servicio.
const prisma = require('./shared/prisma');

async function crear({ titulo, descripcion, ciudadId, tipo, momentoAdecuado, autorId }) {
  return prisma.experiencia.create({
    data: { titulo, descripcion, ciudadId, tipo, momentoAdecuado, autorId },
    include: { ciudad: true },
  });
}

module.exports = { crear };
