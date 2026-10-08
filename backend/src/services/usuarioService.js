// Lógica de búsqueda de usuarios (CS-61).
// Capa: servicios (services).
// Lo usa: routes/usuarioRoutes.js.
// Usa: repositories/usuarioRepository.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');

// Busca usuarios por una parte de su nombre, sin los espacios de los extremos, y excluye
// siempre a quien realiza la consulta. Sin texto responde 400: si no, la búsqueda devolvería
// usuarios cualesquiera.
async function buscarUsuarios(usuarioId, texto) {
  const buscado = typeof texto === 'string' ? texto.trim() : '';
  if (buscado === '') {
    throw crearError('Escribe un nombre de usuario para buscar', 400);
  }
  return usuarioRepository.buscarPorNombre(buscado, usuarioId);
}

module.exports = { buscarUsuarios };
