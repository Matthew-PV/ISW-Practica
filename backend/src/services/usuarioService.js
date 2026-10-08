// Lógica de los usuarios vistos por otros: búsqueda por nombre (CS-61) y perfil público de otro
// usuario (CS-62).
// Capa: servicios (services).
// Lo usa: routes/usuarioRoutes.js.
// Usa: repositories/usuarioRepository.js, repositories/amistadRepository.js y
//      repositories/seguimientoRepository.js (contadores y relación con quien consulta),
//      services/shared/fotoPorDefecto.js y errores.js.
const usuarioRepository = require('../repositories/usuarioRepository');
const amistadRepository = require('../repositories/amistadRepository');
const seguimientoRepository = require('../repositories/seguimientoRepository');
const { conFotoPorDefecto } = require('./shared/fotoPorDefecto');
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

// Devuelve el perfil público de otro usuario (nunca su email), con sus contadores de amigos y
// seguidores y la relación de quien consulta con él.
// - `usuarioId`: el usuario de la sesión, que consulta el perfil.
// - `nombreUsuario`: el usuario cuyo perfil se consulta.
// Devuelve { id, nombreUsuario, foto, ciudad, amigos, seguidores, esPropio, relacion }, o error 404.
// `esPropio` es true cuando el perfil consultado es el del propio usuario de la sesión.
// `relacion.amistad` es 'ninguna', 'enviada' (la envié yo), 'recibida' o 'amigos'; `relacion.amistadId`
// es el id de esa solicitud o amistad (null si no hay), que las pantallas necesitan para responderla.
async function obtenerPerfilPublico(usuarioId, nombreUsuario) {
  const perfil = await usuarioRepository.obtenerPerfilPublico(nombreUsuario);
  if (!perfil) {
    throw crearError('Usuario no encontrado', 404);
  }

  // Las cuatro consultas son independientes: se lanzan a la vez
  const [amigos, seguidores, amistad, siguiendo] = await Promise.all([
    amistadRepository.contarAmigos(perfil.id),
    seguimientoRepository.contarSeguidores(perfil.id),
    amistadRepository.buscarEntreUsuarios(usuarioId, perfil.id),
    seguimientoRepository.sigueA(usuarioId, perfil.id),
  ]);

  let estadoAmistad = 'ninguna';
  if (amistad?.estado === 'ACEPTADA') {
    estadoAmistad = 'amigos';
  } else if (amistad?.estado === 'PENDIENTE') {
    estadoAmistad = amistad.solicitanteId === usuarioId ? 'enviada' : 'recibida';
  }

  return {
    ...conFotoPorDefecto(perfil),
    amigos,
    seguidores,
    esPropio: perfil.id === usuarioId,
    relacion: { amistad: estadoAmistad, amistadId: amistad?.id ?? null, siguiendo },
  };
}

module.exports = { buscarUsuarios, obtenerPerfilPublico };
