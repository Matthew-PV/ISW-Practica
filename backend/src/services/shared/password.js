// Reglas de una contraseña segura (CS-64). Son las mismas al registrarse, al cambiar la contraseña
// y al restablecerla, por eso están aquí y no en cada servicio.
// Capa: servicios (services/shared).
// Lo usan: services/authService.js y services/perfilService.js.
// Usa: la librería bcrypt y errores.js.
//
// La pantalla muestra los mismos requisitos y los marca mientras se escribe
// (frontend/js/shared/password.js), pero la comprobación que vale es la de aquí.
const bcrypt = require('bcrypt');
const { crearError } = require('../../errores');

// Coste del cifrado con bcrypt: más alto es más seguro pero más lento
const SALT_ROUNDS = 10;

const BYTES_MIN = 8;
// bcrypt solo usa los primeros 72 bytes: una contraseña más larga se confundiría con otra
const BYTES_MAX = 72;

// Cada requisito con el texto que ve el usuario. Los textos coinciden con los de la pantalla.
// La longitud se cuenta en bytes: una letra con tilde o un emoji ocupan más de uno.
const REQUISITOS = [
  ['entre 8 y 72 caracteres', (password) => {
    const bytes = Buffer.byteLength(password);
    return bytes >= BYTES_MIN && bytes <= BYTES_MAX;
  }],
  ['al menos una mayúscula', (password) => /\p{Lu}/u.test(password)],
  ['al menos una minúscula', (password) => /\p{Ll}/u.test(password)],
  ['al menos un número', (password) => /[0-9]/.test(password)],
  ['sin el nombre de usuario', (password, nombreUsuario) =>
    !nombreUsuario || !password.toLowerCase().includes(nombreUsuario.toLowerCase())],
];

// Comprueba que `password` cumple todos los requisitos. Si falla alguno, lanza un error 400 que
// los nombra todos, por ejemplo «La contraseña no cumple estos requisitos: al menos un número.».
// - `nombreUsuario`: el de la cuenta, que la contraseña no puede contener.
function validarPassword(password, nombreUsuario) {
  const fallos = REQUISITOS
    .filter(([, cumple]) => !cumple(password, nombreUsuario))
    .map(([texto]) => texto);
  if (fallos.length > 0) {
    throw crearError(`La contraseña no cumple estos requisitos: ${fallos.join(', ')}.`, 400);
  }
}

// Devuelve el hash de la contraseña, que es lo único que se guarda: ni con acceso a la base de
// datos se puede recuperar la contraseña.
function cifrarPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

module.exports = { validarPassword, cifrarPassword, SALT_ROUNDS };
