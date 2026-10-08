// Reglas de negocio de los seguimientos.
// Capa: servicios (services).
// Lo usa: routes/seguimientoRoutes.js.
// Usa: repositories/usuarioRepository.js, repositories/seguimientoRepository.js,
//      services/shared/identificadores.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const seguimientoRepository = require('../repositories/seguimientoRepository');
const { leerId } = require('./shared/identificadores');
const { crearError } = require('../errores');



// Comprueba que la persona a seguir o dejar de seguir existe.
async function comprobarUsuarioDestino(usuarioId) {
  leerId(usuarioId, 'del usuario');
  if (!(await usuarioRepository.buscarPorId(usuarioId))) {
    throw crearError('El usuario no existe', 404);
  }
}

// Crea un seguimiento entre dos usuarios diferentes si no existía antes.
async function seguirUsuario(seguidorId, seguidoId) {
  if (seguidorId === seguidoId) {
    throw crearError('No puedes seguirte a ti mismo', 400);
  }
  await comprobarUsuarioDestino(seguidoId);
  if (await seguimientoRepository.sigueA(seguidorId, seguidoId)) {
    throw crearError('Ya sigues a este usuario', 400);
  }
  // null: otra petición creó el mismo seguimiento entre la comprobación anterior y este momento
  const seguimiento = await seguimientoRepository.seguir(seguidorId, seguidoId);
  if (!seguimiento) {
    throw crearError('Ya sigues a este usuario', 400);
  }
  return seguimiento;
}

// Elimina un seguimiento existente entre dos usuarios diferentes.
async function dejarDeSeguir(seguidorId, seguidoId) {
  if (seguidorId === seguidoId) {
    throw crearError('No puedes dejar de seguirte a ti mismo', 400);
  }
  await comprobarUsuarioDestino(seguidoId);
  if (!(await seguimientoRepository.sigueA(seguidorId, seguidoId))) {
    throw crearError('No sigues a este usuario', 404);
  }
  // null: otra petición lo borró mientras tanto
  const borrado = await seguimientoRepository.dejarDeSeguir(seguidorId, seguidoId);
  if (!borrado) {
    throw crearError('No sigues a este usuario', 404);
  }
  return borrado;
}

module.exports = { seguirUsuario, dejarDeSeguir };
