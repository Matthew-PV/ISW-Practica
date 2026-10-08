// Reglas de negocio de las solicitudes de amistad.
// Capa: servicios (services).
// Lo usarán las rutas de amistad cuando se implementen.
// Usa: repositories/usuarioRepository.js, repositories/amistadRepository.js,
//      services/shared/identificadores.js, services/shared/fotoPorDefecto.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const amistadRepository = require('../repositories/amistadRepository');
const { leerId } = require('./shared/identificadores');
const { conFotoPorDefecto } = require('./shared/fotoPorDefecto');
const { crearError } = require('../errores');

// Envía una solicitud pendiente si los dos usuarios existen y no tienen ninguna
// solicitud o amistad previa entre sí. El solicitante procede siempre de sesión.
async function enviarSolicitud(solicitanteId, destinatarioId) {
  leerId(destinatarioId, 'del usuario');

  if (solicitanteId === destinatarioId) {
    throw crearError('No puedes enviarte una solicitud de amistad', 400);
  }

  if (!(await usuarioRepository.buscarPorId(destinatarioId))) {
    throw crearError('El usuario no existe', 404);
  }

  if (await amistadRepository.buscarEntreUsuarios(solicitanteId, destinatarioId)) {
    throw crearError('Ya existe una solicitud o amistad entre estos usuarios', 400);
  }

  // null: otra petición creó la relación entre la comprobación anterior y este momento
  const amistad = await amistadRepository.crear(solicitanteId, destinatarioId);
  if (!amistad) {
    throw crearError('Ya existe una solicitud o amistad entre estos usuarios', 400);
  }
  return amistad;
}

// Acepta o rechaza una solicitud pendiente. Solo puede responder quien la recibió.
// `aceptar` tiene que ser exactamente true o false: cualquier otro valor ("si", 1 o la
// ausencia del campo) responde 400 en lugar de aceptar o borrar la solicitud por error.
async function responderSolicitud(usuarioId, solicitudId, aceptar) {
  leerId(solicitudId, 'de la solicitud de amistad');
  if (typeof aceptar !== 'boolean') {
    throw crearError('Indica si aceptas la solicitud con true o false', 400);
  }

  const solicitud = await amistadRepository.buscarPorId(solicitudId);
  if (!solicitud) {
    throw crearError('La solicitud de amistad no existe', 404);
  }
  if (solicitud.estado !== 'PENDIENTE') {
    throw crearError('La solicitud de amistad ya no está pendiente', 400);
  }
  if (solicitud.destinatarioId !== usuarioId) {
    throw crearError('Solo puedes responder tus solicitudes de amistad', 403);
  }

  // null: otra petición la borró mientras tanto
  const resultado = aceptar
    ? await amistadRepository.aceptar(solicitudId)
    : await amistadRepository.borrar(solicitudId);
  if (!resultado) {
    throw crearError('La solicitud de amistad no existe', 404);
  }
  return resultado;
}

// Elimina una amistad ya aceptada. Puede hacerlo cualquiera de sus dos participantes.
async function eliminarAmistad(usuarioId, amistadId) {
  leerId(amistadId, 'de la amistad');

  const amistad = await amistadRepository.buscarPorId(amistadId);
  if (!amistad) {
    throw crearError('La amistad no existe', 404);
  }
  if (amistad.estado !== 'ACEPTADA') {
    throw crearError('La relación todavía no es una amistad', 400);
  }
  if (amistad.solicitanteId !== usuarioId && amistad.destinatarioId !== usuarioId) {
    throw crearError('No puedes eliminar una amistad de otra persona', 403);
  }

  // null: otra petición la borró mientras tanto
  const borrada = await amistadRepository.borrar(amistadId);
  if (!borrada) {
    throw crearError('La amistad no existe', 404);
  }
  return borrada;
}

// Devuelve true solo cuando existe una amistad aceptada entre ambos usuarios.
// La usan otros servicios para decidir visibilidad y permisos sin duplicar esta regla.
async function sonAmigos(usuarioAId, usuarioBId) {
  const amistad = await amistadRepository.buscarEntreUsuarios(usuarioAId, usuarioBId);
  return amistad?.estado === 'ACEPTADA';
}

// Devuelve las solicitudes pendientes que el usuario de la sesión debe responder.
async function listarSolicitudesRecibidas(usuarioId) {
  const solicitudes = await amistadRepository.listarSolicitudesRecibidas(usuarioId);
  return solicitudes.map((solicitud) => ({ ...solicitud, solicitante: conFotoPorDefecto(solicitud.solicitante) }));
}

module.exports = {
  enviarSolicitud, responderSolicitud, eliminarAmistad, sonAmigos, listarSolicitudesRecibidas,
};
