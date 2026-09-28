// Lógica de negocio de la autenticación: registro, inicio de sesión y usuario actual.
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

// Coste del cifrado con bcrypt: más alto es más seguro pero más lento
const SALT_ROUNDS = 10;

// Error con código HTTP: el manejador de errores de app.js lo devuelve con ese código y su mensaje
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// Datos del usuario que se pueden enviar al frontend (nunca la contraseña cifrada)
function datosPublicos(usuario) {
  return { id: usuario.id, nombreUsuario: usuario.nombreUsuario, email: usuario.email };
}

// Crea un usuario nuevo con la contraseña cifrada. Falla si el email ya está registrado.
async function registrar({ nombreUsuario, email, password }) {
  if (await usuarioRepository.buscarPorEmail(email)) {
    throw crearError('El email ya está registrado', 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await usuarioRepository.crear({ nombreUsuario, email, passwordHash });
  return datosPublicos(usuario);
}

// Comprueba email y contraseña. El mensaje de error es el mismo en los dos casos
// para no revelar qué emails están registrados.
async function iniciarSesion({ email, password }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw crearError('Email o contraseña incorrectos', 401);
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
