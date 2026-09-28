// Lógica de negocio del perfil de usuario: consulta de los propios datos.
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');

// Devuelve el perfil del usuario de la sesión (nunca la contraseña cifrada).
// Falla si ya no existe (por ejemplo, si se ha vaciado la base de datos).
async function obtenerPerfilPropio(id) {
  const perfil = await usuarioRepository.obtenerPerfil(id);
  if (!perfil) {
    throw crearError('No hay sesión iniciada', 401);
  }
  return perfil;
}

module.exports = { obtenerPerfilPropio };
