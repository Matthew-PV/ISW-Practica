// Reglas del nombre de usuario, comunes al registro y a la edición del perfil.
const { crearError } = require('../../errores');

// De 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`.
// Deja fuera espacios, emojis, caracteres invisibles y de control.
const NOMBRE_USUARIO = /^[\p{L}\p{N}_.-]{3,30}$/u;

// Devuelve el nombre normalizado a NFC (para que un mismo nombre escrito de dos formas,
// é o e + ´, sea siempre igual y el índice único lo detecte), o lanza un error 400.
function validarNombreUsuario(valor) {
  const nombre = typeof valor === 'string' ? valor.normalize('NFC') : null;
  if (nombre === null || !NOMBRE_USUARIO.test(nombre)) {
    throw crearError('El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -', 400);
  }
  return nombre;
}

module.exports = { validarNombreUsuario };
