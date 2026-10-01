// Lógica de negocio del perfil de usuario: consulta y edición de los propios datos.
const usuarioRepository = require('../repositories/usuarioRepository');
const { crearError } = require('../errores');
const { validarNombreUsuario } = require('./nombreUsuario');

const CIUDAD_MAX = 191; // tamaño de la columna en MySQL

// La ciudad del perfil es texto libre y opcional: null o un texto vacío la dejan sin ciudad.
// Cuenta caracteres Unicode (un emoji ocupa dos posiciones en String.length).
function leerCiudad(valor) {
  if (valor === null) return null;
  if (typeof valor !== 'string') {
    throw crearError('La ciudad debe ser un texto', 400);
  }
  const ciudad = valor.normalize('NFC').trim();
  if (Array.from(ciudad).length > CIUDAD_MAX) {
    throw crearError('La ciudad no puede superar los 191 caracteres', 400);
  }
  return ciudad || null;
}

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
  // Un campo que no llega no se cambia
  const nombreUsuario = datos?.nombreUsuario === undefined ? undefined : validarNombreUsuario(datos.nombreUsuario);
  const ciudad = datos?.ciudad === undefined ? undefined : leerCiudad(datos.ciudad);

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
