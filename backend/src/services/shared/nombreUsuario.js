// Reglas del nombre de usuario, comunes al registro y a la edición del perfil.
// Capa: servicios (services), en shared/ porque no es de una funcionalidad concreta.
// Lo usan: services/authService.js (registro) y services/perfilService.js (editar el perfil).
// Usa: errores.js.
//
// Al estar en un solo sitio, el registro y la edición del perfil aceptan exactamente
// los mismos nombres. Para cambiar las reglas, basta con cambiarlas aquí.
const { crearError } = require('../../errores');

// De 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`.
// Deja fuera espacios, emojis, caracteres invisibles y de control.
// (\p{L} = cualquier letra, \p{N} = cualquier número; la `u` final activa Unicode)
const NOMBRE_USUARIO = /^[\p{L}\p{N}_.-]{3,30}$/u;

// Devuelve el nombre normalizado a NFC (para que un mismo nombre escrito de dos formas,
// é o e + ´, sea siempre igual y el índice único lo detecte), o lanza un error 400.
// - `valor`: lo que llega en la petición (si no es texto, también es error 400).
function validarNombreUsuario(valor) {
  const nombre = typeof valor === 'string' ? valor.normalize('NFC') : null;
  if (nombre === null || !NOMBRE_USUARIO.test(nombre)) {
    throw crearError('El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -', 400);
  }
  return nombre;
}

module.exports = { validarNombreUsuario };
