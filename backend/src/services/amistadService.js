// Reglas de negocio de las solicitudes de amistad.
// Capa: servicios (services).
// Lo usarán las rutas de amistad cuando se implementen.
// Usa: repositories/usuarioRepository.js, repositories/amistadRepository.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const amistadRepository = require('../repositories/amistadRepository');
const { crearError } = require('../errores');

// Envía una solicitud pendiente si los dos usuarios existen y no tienen ninguna
// solicitud o amistad previa entre sí. El solicitante procede siempre de sesión.
async function enviarSolicitud(solicitanteId, destinatarioId) {
  if (!Number.isInteger(solicitanteId) || solicitanteId <= 0 ||
      !(await usuarioRepository.buscarPorId(solicitanteId))) {
    throw crearError('No hay sesión iniciada', 401);
  }

  if (solicitanteId === destinatarioId) {
    throw crearError('No puedes enviarte una solicitud de amistad', 400);
  }

  if (!Number.isInteger(destinatarioId) || destinatarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(destinatarioId))) {
    throw crearError('El usuario no existe', 404);
  }

  if (await amistadRepository.buscarEntreUsuarios(solicitanteId, destinatarioId)) {
    throw crearError('Ya existe una solicitud o amistad entre estos usuarios', 400);
  }

  return amistadRepository.crear(solicitanteId, destinatarioId);
}

// Acepta o rechaza una solicitud pendiente. Solo puede responder quien la recibió.
async function responderSolicitud(usuarioId, solicitudId, aceptar) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
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

  return aceptar ? amistadRepository.aceptar(solicitudId) : amistadRepository.borrar(solicitudId);
}

// Elimina una amistad ya aceptada. Puede hacerlo cualquiera de sus dos participantes.
async function eliminarAmistad(usuarioId, amistadId) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }

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

  return amistadRepository.borrar(amistadId);
}

module.exports = { enviarSolicitud, responderSolicitud, eliminarAmistad };
