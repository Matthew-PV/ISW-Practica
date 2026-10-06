// Reglas de negocio de los seguimientos.
// Capa: servicios (services).
// Lo usarán las rutas de seguimiento cuando se implementen.
// Usa: repositories/usuarioRepository.js, repositories/seguimientoRepository.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const seguimientoRepository = require('../repositories/seguimientoRepository');
const { crearError } = require('../errores');

// Comprueba que el usuario que actúa sigue existiendo.
async function comprobarSesion(usuarioId) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('No hay sesión iniciada', 401);
  }
}

// Comprueba que la persona a seguir o dejar de seguir existe.
async function comprobarUsuarioDestino(usuarioId) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('El usuario no existe', 404);
  }
}

// Crea un seguimiento entre dos usuarios diferentes si no existía antes.
async function seguirUsuario(seguidorId, seguidoId) {
  await comprobarSesion(seguidorId);
  if (seguidorId === seguidoId) {
    throw crearError('No puedes seguirte a ti mismo', 400);
  }
  await comprobarUsuarioDestino(seguidoId);
  if (await seguimientoRepository.sigueA(seguidorId, seguidoId)) {
    throw crearError('Ya sigues a este usuario', 400);
  }
  return seguimientoRepository.seguir(seguidorId, seguidoId);
}

// Elimina un seguimiento existente entre dos usuarios diferentes.
async function dejarDeSeguir(seguidorId, seguidoId) {
  await comprobarSesion(seguidorId);
  if (seguidorId === seguidoId) {
    throw crearError('No puedes dejar de seguirte a ti mismo', 400);
  }
  await comprobarUsuarioDestino(seguidoId);
  if (!(await seguimientoRepository.sigueA(seguidorId, seguidoId))) {
    throw crearError('No sigues a este usuario', 404);
  }
  return seguimientoRepository.dejarDeSeguir(seguidorId, seguidoId);
}

module.exports = { seguirUsuario, dejarDeSeguir };
