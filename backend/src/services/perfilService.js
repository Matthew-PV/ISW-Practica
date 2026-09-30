// Lógica de negocio del perfil de usuario: consulta y edición de los propios datos.
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');

// Mismo formato que en el registro (ver authService.js)
const NOMBRE_USUARIO = /^[\p{L}\p{N}_.-]{3,30}$/u;

// Devuelve el perfil del usuario de la sesión (nunca la contraseña cifrada).
// Falla si ya no existe (por ejemplo, si se ha vaciado la base de datos).
async function obtenerPerfilPropio(id) {
  const perfil = await usuarioRepository.obtenerPerfil(id);
  if (!perfil) {
    throw crearError('No hay sesión iniciada', 401);
  }
  return perfil;
}

// Actualiza nombreUsuario y/o ciudad del usuario de la sesión.
// El email no es editable desde aquí.
async function actualizarPerfilPropio(id, datos) {
  const { nombreUsuario, ciudad } = datos ?? {};

  if (nombreUsuario !== undefined && !NOMBRE_USUARIO.test(nombreUsuario)) {
    throw crearError('El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -', 400);
  }

  try {
    return await usuarioRepository.actualizarPerfil(id, { nombreUsuario, ciudad });
  } catch (err) {
    // P2002 es el código de Prisma para «valor duplicado en un campo único»
    if (err.code === 'P2002') {
      throw crearError('El nombre de usuario ya está en uso', 400);
    }
    throw err;
  }
}

module.exports = { obtenerPerfilPropio, actualizarPerfilPropio };
