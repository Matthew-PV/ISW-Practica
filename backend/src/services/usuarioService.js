// Lógica de búsqueda de usuarios.
// Capa: servicios (services).
// Lo usarán las rutas de usuarios.
// Usa: repositories/usuarioRepository.js.
const usuarioRepository = require('../repositories/usuarioRepository');

// Busca usuarios por nombre y excluye siempre a quien realiza la consulta.
async function buscarUsuarios(usuarioId, texto) {
  return usuarioRepository.buscarPorNombre(texto, usuarioId);
}

module.exports = { buscarUsuarios };
