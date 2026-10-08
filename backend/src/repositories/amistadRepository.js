// Acceso a las solicitudes de amistad en MySQL.
// Capa: repositorios (repositories).
// Lo usarán los servicios de amistad cuando se implementen.
// Usa: repositories/shared/prisma.js (la conexión con MySQL) y repositories/shared/carreras.js.
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Amistad.
const prisma = require('./shared/prisma');
const { nullSi } = require('./shared/carreras');

// Clave de la pareja sin orden: "3-7" tanto para 3 → 7 como para 7 → 3 (ver schema.prisma).
function claveDePareja(usuarioAId, usuarioBId) {
  return `${Math.min(usuarioAId, usuarioBId)}-${Math.max(usuarioAId, usuarioBId)}`;
}

// Crea una solicitud; el estado inicial PENDIENTE lo asigna el esquema de Prisma.
// Devuelve null si ya hay una relación entre los dos usuarios, en cualquier sentido: con dos
// solicitudes cruzadas simultáneas, la restricción única de parejaClave deja crear solo una.
async function crear(solicitanteId, destinatarioId) {
  return nullSi('P2002', () => prisma.amistad.create({
    data: { solicitanteId, destinatarioId, parejaClave: claveDePareja(solicitanteId, destinatarioId) },
  }));
}

// Busca la única relación que puede haber entre dos usuarios, sin importar quién
// la inició. El servicio decidirá si el estado permite la acción solicitada.
async function buscarEntreUsuarios(usuarioAId, usuarioBId) {
  return prisma.amistad.findFirst({
    where: {
      OR: [
        { solicitanteId: usuarioAId, destinatarioId: usuarioBId },
        { solicitanteId: usuarioBId, destinatarioId: usuarioAId },
      ],
    },
  });
}

// Busca una solicitud o amistad por su identificador.
async function buscarPorId(id) {
  return prisma.amistad.findUnique({ where: { id } });
}

// Cambia una solicitud pendiente a amistad aceptada. Devuelve null si ya no existe
// (otra petición la borró entre la comprobación del servicio y este cambio).
async function aceptar(id) {
  return nullSi('P2025', () => prisma.amistad.update({
    where: { id },
    data: { estado: 'ACEPTADA' },
  }));
}

// Elimina una solicitud rechazada o una amistad aceptada. Devuelve null si ya no existe.
async function borrar(id) {
  return nullSi('P2025', () => prisma.amistad.delete({ where: { id } }));
}

// Devuelve las solicitudes pendientes que debe revisar un usuario, de la más
// reciente a la más antigua. No incluye email ni contraseña del solicitante.
async function listarSolicitudesRecibidas(destinatarioId) {
  return prisma.amistad.findMany({
    where: { destinatarioId, estado: 'PENDIENTE' },
    include: {
      solicitante: {
        select: {
          id: true,
          nombreUsuario: true,
          foto: true,
        },
      },
    },
    orderBy: { fecha: 'desc' },
  });
}

// Devuelve los identificadores de todos los amigos aceptados de un usuario.
// Una amistad puede haberse iniciado en cualquiera de los dos sentidos.
async function listarAmigosIds(usuarioId) {
  const amistades = await prisma.amistad.findMany({
    where: {
      estado: 'ACEPTADA',
      OR: [
        { solicitanteId: usuarioId },
        { destinatarioId: usuarioId },
      ],
    },
    select: {
      solicitanteId: true,
      destinatarioId: true,
    },
  });

  return amistades.map((amistad) =>
    amistad.solicitanteId === usuarioId
      ? amistad.destinatarioId
      : amistad.solicitanteId
  );
}

// Cuenta las amistades aceptadas de un usuario, sea quien sea el que envió la solicitud.
// Las pendientes no cuentan.
async function contarAmigos(usuarioId) {
  return prisma.amistad.count({
    where: {
      estado: 'ACEPTADA',
      OR: [
        { solicitanteId: usuarioId },
        { destinatarioId: usuarioId },
      ],
    },
  });
}
// Devuelve una página de los amigos aceptados de un usuario, con sus datos públicos (nunca el email), de la amistad más reciente a la más antigua.
//limite: personas por página.
// El desempate por id mantiene el orden fijo entre páginas, para que nadie salga repetido.
async function listarAmigos(usuarioId, pagina, limite) {
  const datosPublicos = { id: true, nombreUsuario: true, foto: true };
  const amistades = await prisma.amistad.findMany({
    where: {
      estado: 'ACEPTADA',
      OR: [
        { solicitanteId: usuarioId },
        { destinatarioId: usuarioId },
      ],
    },
    select: {
      solicitanteId: true,
      solicitante: { select: datosPublicos },
      destinatario: { select: datosPublicos },
    },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    skip: (pagina - 1) * limite,
    take: limite,
  });

  // El amigo es «la otra persona» de cada amistad
  return amistades.map((amistad) =>
    amistad.solicitanteId === usuarioId ? amistad.destinatario : amistad.solicitante
  );
}


module.exports = {
  crear,
  buscarEntreUsuarios,
  buscarPorId,
  aceptar,
  borrar,
  listarSolicitudesRecibidas,
  listarAmigosIds,
  contarAmigos,
  listarAmigos,
};