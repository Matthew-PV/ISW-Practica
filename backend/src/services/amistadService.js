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

module.exports = { enviarSolicitud };
