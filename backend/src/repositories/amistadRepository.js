// Acceso a las solicitudes de amistad en MySQL.
// Capa: repositorios (repositories).
// Lo usan: services/amistadService.js, services/perfilService.js, services/usuarioService.js
//          y services/shared/visibilidad.js (a través de amistadService.sonAmigos).
// Usa: repositories/shared/prisma.js (la conexión con MySQL), repositories/shared/carreras.js y
//      repositories/shared/camposPublicos.js.
//
// Los datos llegan validados desde el servicio. Este archivo solo consulta o
// modifica la tabla Amistad.
const prisma = require('./shared/prisma');
const { nullSi } = require('./shared/carreras');
const { USUARIO_PUBLICO } = require('./shared/camposPublicos');

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

// Condición «amistades de este usuario», la enviara él o la recibiera.
function deUsuario(usuarioId) {
  return { OR: [{ solicitanteId: usuarioId }, { destinatarioId: usuarioId }] };
}

// Busca la única relación que puede haber entre dos usuarios, sin importar quién la inició (por
// su clave de pareja, que es única). El servicio decidirá si el estado permite la acción.
async function buscarEntreUsuarios(usuarioAId, usuarioBId) {
  return prisma.amistad.findUnique({ where: { parejaClave: claveDePareja(usuarioAId, usuarioBId) } });
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
      solicitante: { select: USUARIO_PUBLICO },
    },
    orderBy: { fecha: 'desc' },
  });
}

// Cuenta las amistades aceptadas de un usuario, sea quien sea el que envió la solicitud.
// Las pendientes no cuentan.
async function contarAmigos(usuarioId) {
  return prisma.amistad.count({ where: { estado: 'ACEPTADA', ...deUsuario(usuarioId) } });
}

// CS-45: hasta `cantidad` amistades aceptadas de un usuario, de la más reciente a la más antigua,
// como { id, persona }: `id` es el de la amistad (el cursor de «Cargar más») y `persona`, los
// datos públicos del amigo (nunca el email). Con `despuesDe` (el id de una amistad) empieza
// justo después de ella (ver services/shared/paginacion.js).
async function listarAmigos(usuarioId, despuesDe, cantidad) {
  const where = { estado: 'ACEPTADA', ...deUsuario(usuarioId) };
  if (despuesDe !== null) {
    where.id = { lt: despuesDe };
  }
  const amistades = await prisma.amistad.findMany({
    where,
    select: {
      id: true,
      solicitanteId: true,
      solicitante: { select: USUARIO_PUBLICO },
      destinatario: { select: USUARIO_PUBLICO },
    },
    orderBy: { id: 'desc' },
    take: cantidad,
  });

  // El amigo es «la otra persona» de cada amistad
  return amistades.map((amistad) => ({
    id: amistad.id,
    persona: amistad.solicitanteId === usuarioId ? amistad.destinatario : amistad.solicitante,
  }));
}


module.exports = {
  crear,
  buscarEntreUsuarios,
  buscarPorId,
  aceptar,
  borrar,
  listarSolicitudesRecibidas,
  contarAmigos,
  listarAmigos,
};