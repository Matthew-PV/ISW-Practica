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

// Condición de Prisma: el autor de la experiencia es amigo de `usuarioId` (amistad aceptada, la
// enviara quien la enviara), como en valoracionRepository.listarDeRelacionados.
const autorAmigoDe = (usuarioId) => ({
  OR: [
    { solicitudesEnviadas: { some: { destinatarioId: usuarioId, estado: 'ACEPTADA' } } },
    { solicitudesRecibidas: { some: { solicitanteId: usuarioId, estado: 'ACEPTADA' } } },
  ],
});

// CS-10: hasta `cantidad` experiencias que puede ver `usuarioId` y cumplen los `filtros`, de la más
// reciente a la más antigua y anteriores al id `despuesDe` si se indica. Con su ciudad y los datos
// públicos de su autor. La visibilidad es la de services/shared/visibilidad.js, pero dentro de la
// propia consulta: las públicas, las suyas y las de amigos cuyo autor es su amigo.
// - `filtros`: { texto, ciudadId, categoria, momento, soloAmigos, minimo }; null o false = sin filtro.
//   `texto` se busca en el título y la descripción; `minimo` es la media mínima de valoraciones.
async function buscar(usuarioId, { texto, ciudadId, categoria, momento, soloAmigos, minimo }, despuesDe, cantidad) {
  const condiciones = [{
    OR: [
      { visibilidad: 'PUBLICA' },
      { autorId: usuarioId },
      { visibilidad: 'AMIGOS', autor: autorAmigoDe(usuarioId) },
    ],
  }];
  if (texto !== null) {
    condiciones.push({ OR: [{ titulo: { contains: texto } }, { descripcion: { contains: texto } }] });
  }
  if (ciudadId !== null) condiciones.push({ ciudadId });
  if (categoria !== null) condiciones.push({ tipo: categoria });
  if (momento !== null) condiciones.push({ momentoAdecuado: momento });
  if (soloAmigos) condiciones.push({ autor: autorAmigoDe(usuarioId) });
  if (minimo !== null) {
    // Prisma no filtra por una media en el where: primero se piden las experiencias que la alcanzan
    const conMedia = await prisma.valoracion.groupBy({
      by: ['experienciaId'],
      having: { puntuacion: { _avg: { gte: minimo } } },
    });
    condiciones.push({ id: { in: conMedia.map((fila) => fila.experienciaId) } });
  }
  if (despuesDe !== null) condiciones.push({ id: { lt: despuesDe } });

  return prisma.experiencia.findMany({
    where: { AND: condiciones },
    orderBy: { id: 'desc' },
    take: cantidad,
    include: { ciudad: true, autor: { select: USUARIO_PUBLICO } },
  });
}

module.exports = { crear, buscarPorId, actualizar, listarDeAutor, buscar };
