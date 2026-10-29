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

// 'ninguna', 'enviada' (la envió `usuarioId`), 'recibida' o 'amigos' según la fila de Amistad.
function estadoAmistad(amistad, usuarioId) {
  if (amistad?.estado === 'ACEPTADA') {
    return 'amigos';
  }
  if (amistad?.estado === 'PENDIENTE') {
    return amistad.solicitanteId === usuarioId ? 'enviada' : 'recibida';
  }
  return 'ninguna';
}

// Busca usuarios por una parte de su nombre, sin los espacios de los extremos, y excluye
// siempre a quien realiza la consulta. Sin texto responde 400: si no, la búsqueda devolvería
// usuarios cualesquiera. Cada resultado lleva su ciudad y `relacion` (como en el perfil público),
// calculada con dos consultas en bloque para todos los resultados.
async function buscarUsuarios(usuarioId, texto) {
  const buscado = typeof texto === 'string' ? texto.trim() : '';
  if (buscado === '') {
    throw crearError('Escribe un nombre de usuario para buscar', 400);
  }
  const usuarios = await usuarioRepository.buscarPorNombre(buscado, usuarioId);
  if (usuarios.length === 0) {
    return [];
  }

  const ids = usuarios.map((usuario) => usuario.id);
  const [amistades, seguidos] = await Promise.all([
    amistadRepository.listarEntreUsuarios(usuarioId, ids),
    seguimientoRepository.filtrarSeguidos(usuarioId, ids),
  ]);
  return usuarios.map((usuario) => {
    const amistad = amistades.find((a) => a.solicitanteId === usuario.id || a.destinatarioId === usuario.id);
    return {
      ...conFotoPorDefecto(usuario),
      relacion: {
        amistad: estadoAmistad(amistad, usuarioId),
        amistadId: amistad?.id ?? null,
        siguiendo: seguidos.includes(usuario.id),
      },
    };
  });
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

  return {
    ...conFotoPorDefecto(perfil),
    amigos,
    seguidores,
    esPropio: perfil.id === usuarioId,
    relacion: { amistad: estadoAmistad(amistad, usuarioId), amistadId: amistad?.id ?? null, siguiendo },
  };
}

module.exports = { buscarUsuarios, obtenerPerfilPublico };
