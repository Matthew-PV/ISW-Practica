// Lógica de negocio de la autenticación: registro, inicio de sesión y usuario actual.
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');

// Coste del cifrado con bcrypt: más alto es más seguro pero más lento
const SALT_ROUNDS = 10;

// Nombre de usuario: de 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`.
// Deja fuera espacios, emojis, caracteres invisibles y de control.
const NOMBRE_USUARIO = /^[\p{L}\p{N}_.-]{3,30}$/u;
// Email: algo@algo.algo, sin espacios ni caracteres invisibles o de control
const EMAIL = /^[^\s@\p{C}]+@[^\s@\p{C}]+\.[^\s@\p{C}]+$/u;
const EMAIL_MAX = 191; // tamaño de la columna en MySQL
const PASSWORD_MIN = 8;
// bcrypt solo usa los primeros 72 bytes: una contraseña más larga se confundiría con otra
const PASSWORD_MAX_BYTES = 72;

// Datos del usuario que se pueden enviar al frontend (nunca la contraseña cifrada)
function datosPublicos(usuario) {
  return { id: usuario.id, nombreUsuario: usuario.nombreUsuario, email: usuario.email };
}

// Comprueba que llegan todos los campos como texto no vacío y los devuelve normalizados a NFC,
// para que un mismo texto escrito de dos formas (é o e + ´) sea siempre igual.
function leerTextos(datos, campos) {
  const textos = {};
  for (const campo of campos) {
    const valor = datos[campo];
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw crearError('Faltan datos obligatorios', 400);
    }
    textos[campo] = valor.normalize('NFC');
  }
  return textos;
}

// El email se guarda y se busca sin espacios alrededor y en minúsculas
function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

function passwordDemasiadoLarga(password) {
  return Buffer.byteLength(password) > PASSWORD_MAX_BYTES;
}

// Crea un usuario nuevo con la contraseña cifrada.
// Los duplicados los detecta MySQL con los índices únicos de email y nombre de usuario.
async function registrar(datos) {
  const { nombreUsuario, password, ...resto } = leerTextos(datos, ['nombreUsuario', 'email', 'password']);
  const email = normalizarEmail(resto.email);

  if (!NOMBRE_USUARIO.test(nombreUsuario)) {
    throw crearError('El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -', 400);
  }
  if (email.length > EMAIL_MAX || !EMAIL.test(email)) {
    throw crearError('El email no es válido', 400);
  }
  if (password.length < PASSWORD_MIN || passwordDemasiadoLarga(password)) {
    throw crearError('La contraseña debe tener entre 8 y 72 caracteres', 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const usuario = await usuarioRepository.crear({ nombreUsuario, email, passwordHash });
    return datosPublicos(usuario);
  } catch (err) {
    // P2002 es el código de Prisma para «valor duplicado en un campo único»
    if (err.code === 'P2002') {
      throw String(err.meta?.target).includes('email')
        ? crearError('El email ya está registrado', 400)
        : crearError('El nombre de usuario ya está en uso', 400);
    }
    throw err;
  }
}

// Comprueba email y contraseña. El mensaje de error es el mismo en todos los casos
// para no revelar qué emails están registrados.
async function iniciarSesion(datos) {
  const { email, password } = leerTextos(datos, ['email', 'password']);
  const incorrectos = crearError('Email o contraseña incorrectos', 401);

  // Ninguna contraseña válida supera los 72 bytes (ver PASSWORD_MAX_BYTES)
  if (passwordDemasiadoLarga(password)) {
    throw incorrectos;
  }

  const usuario = await usuarioRepository.buscarPorEmail(normalizarEmail(email));
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw incorrectos;
  }
  return datosPublicos(usuario);
}

// Devuelve el usuario de la sesión. Falla si ya no existe (por ejemplo, si se ha vaciado la base de datos).
async function obtenerUsuario(id) {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw crearError('No hay sesión iniciada', 401);
  }
  return datosPublicos(usuario);
}

module.exports = { registrar, iniciarSesion, obtenerUsuario };
