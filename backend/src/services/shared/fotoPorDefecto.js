// Foto de perfil por defecto: la que se muestra de cualquier usuario que todavía no ha subido una.
// Capa: servicios (services/shared).
// Lo usan: services/perfilService.js (perfil propio, amigos y seguidores) y
//          services/usuarioService.js (perfil público de otro usuario).
// La imagen la sirve el frontend (frontend/img/foto-por-defecto.svg).

const FOTO_POR_DEFECTO = '/img/foto-por-defecto.svg';

// Devuelve los datos de un usuario con `foto` rellena: la suya o, si no tiene, la de por defecto.
function conFotoPorDefecto(usuario) {
  return { ...usuario, foto: usuario.foto || FOTO_POR_DEFECTO };
}

module.exports = { FOTO_POR_DEFECTO, conFotoPorDefecto };
