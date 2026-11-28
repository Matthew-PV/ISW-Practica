// Acceso a experiencias. Los datos llegan validados desde el servicio.
// Capa: repositorios (repositories).
// Lo usa: services/experienciaService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL) y repositories/shared/camposPublicos.js.
const prisma = require('./shared/prisma');
const { USUARIO_PUBLICO } = require('./shared/camposPublicos');
const { esAmigoDe } = require('./shared/condicionesAmistad');

const INCLUIR_PLAN = {
  ciudad: true,
  lugares: {
    orderBy: { orden: 'asc' },
    select: {
      id: true,
      proveedorId: true,
      nombre: true,
      tipo: true,
      direccion: true,
      lat: true,
      lon: true,
      imagen: true,
      web: true,
      nota: true,
    },
  },
};
const INCLUIR_DETALLE = {
  ...INCLUIR_PLAN,
  autor: { select: USUARIO_PUBLICO },
};

function datosLugar(lugar, experienciaId, orden) {
  return {
    experienciaId,
    proveedorId: lugar.proveedorId,
    nombre: lugar.nombre,
    tipo: lugar.tipo,
    direccion: lugar.direccion,
    lat: lugar.lat,
    lon: lugar.lon,
    imagen: lugar.imagen ?? null,
    web: lugar.web ?? null,
    nota: lugar.nota ?? null,
    orden,
  };
}

// Guarda una experiencia nueva y la devuelve junto con los datos de su ciudad.
// Se nombran los campos uno a uno para que nunca se guarde nada que no esté en esta lista.
// Si la ciudad o el autor no existen, Prisma lanza un error con código P2003.

async function crear({
  titulo,
  descripcion,
  ciudadId,
  tipo,
  momentoAdecuado,
  duracionMinutos,
  tarifa,
  visibilidad,
  autorId,
  lugares = [],
}) {
  return prisma.$transaction(async (tx) => {
    const creada = await tx.experiencia.create({
      data: {
        titulo,
        descripcion,
        ciudadId,
        tipo,
        momentoAdecuado,
        duracionMinutos,
        tarifa,
        visibilidad,
        autorId,
      },
    });

    if (lugares.length) {
      await tx.lugarExperiencia.createMany({
        data: lugares.map((lugar, orden) => datosLugar(lugar, creada.id, orden)),
      });
    }

    return tx.experiencia.findUnique({
      where: { id: creada.id },
      include: INCLUIR_PLAN,
    });
  });
}


// Busca una experiencia por su id, con su ciudad y los datos públicos de su autor
// (nunca su email ni el hash de su contraseña, que llegarían a la respuesta de la API).
async function buscarPorId(id) {
  return prisma.experiencia.findUnique({
    where: { id },
    include: INCLUIR_DETALLE,
  });
}

// Actualiza una experiencia existente.
async function actualizar(id, datos) {
  const { lugares, ...cambios } = datos;
  const sustituirLugares = Object.hasOwn(datos, 'lugares');

  return prisma.$transaction(async (tx) => {
    if (Object.keys(cambios).length) {
      await tx.experiencia.update({
        where: { id },
        data: cambios,
      });
    }

    if (sustituirLugares) {
      await tx.lugarExperiencia.deleteMany({ where: { experienciaId: id } });
      if (lugares.length) {
        await tx.lugarExperiencia.createMany({
          data: lugares.map((lugar, orden) => datosLugar(lugar, id, orden)),
        });
      }
    }

    return tx.experiencia.findUnique({
      where: { id },
      include: INCLUIR_PLAN,
    });
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

// Condición de Prisma: el autor de la experiencia es amigo de `usuarioId`.
const autorAmigoDe = (usuarioId) => ({ OR: esAmigoDe(usuarioId) });

// CS-10: hasta `cantidad` experiencias que puede ver `usuarioId` y cumplen los `filtros`, de la más
// reciente a la más antigua y anteriores al id `despuesDe` si se indica. Con su ciudad y los datos
// públicos de su autor. La visibilidad es la de services/shared/visibilidad.js, pero dentro de la
// propia consulta: las públicas, las suyas y las de amigos cuyo autor es su amigo.
// - `filtros`: { texto, ciudadId, categoria, momento, soloAmigos, minimo, tarifaMax, duracionMax };
//   null o false = sin filtro. `texto` se busca en el título y la descripción; `minimo` es la media
//   mínima de valoraciones; `tarifaMax` y `duracionMax` incluyen el límite y dejan fuera los planes
//   sin ese dato.
async function buscar(usuarioId, { texto, ciudadId, categoria, momento, soloAmigos, minimo, tarifaMax, duracionMax }, despuesDe, cantidad) {
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
  if (tarifaMax !== null) condiciones.push({ tarifa: { lte: tarifaMax } });
  if (duracionMax !== null) condiciones.push({ duracionMinutos: { lte: duracionMax } });
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
