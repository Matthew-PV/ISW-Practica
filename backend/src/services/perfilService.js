// Lógica de negocio del perfil de usuario: consulta y edición de los propios datos.
// Capa: servicios (services).
// Lo usa: routes/perfilRoutes.js.
// Usa: repositories/usuarioRepository.js (leer y guardar el perfil),
//      repositories/fotoRepository.js (subir la foto a Cloudinary),
//      services/shared/nombreUsuario.js (reglas del nombre) y errores.js.
//
// Todas las funciones reciben el `id` del usuario de la sesión: un usuario solo puede
// ver y cambiar su propio perfil.
const usuarioRepository = require('../repositories/usuarioRepository');
const fotoRepository = require('../repositories/fotoRepository');
const { crearError } = require('../errores');
const { validarNombreUsuario } = require('./shared/nombreUsuario');

const CIUDAD_MAX = 191; // tamaño de la columna en MySQL

// La ciudad del perfil es texto libre y opcional: null o un texto vacío la dejan sin ciudad.
// Cuenta caracteres Unicode (un emoji ocupa dos posiciones en String.length).
// Devuelve la ciudad limpia (sin espacios exteriores, en NFC) o null; error 400 si no es válida.
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

// Firmas (primeros bytes) de los formatos admitidos. Se mira el contenido y no la extensión
// ni el tipo que declara el navegador, que se pueden falsear.
// - `contenido`: el archivo completo (Buffer).
// Devuelve true si empieza como un JPG, un PNG o un WebP.
function esFormatoPermitido(contenido) {
  // Lee un trozo del archivo como texto, para las firmas que son letras (RIFF, WEBP)
  const ascii = (inicio, fin) => contenido.subarray(inicio, fin).toString('latin1');
  const jpg = contenido.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const png = contenido.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  return jpg || png || webp;
}

// Devuelve el perfil del usuario de la sesión (nunca la contraseña cifrada).
// Falla si ya no existe (por ejemplo, si se ha vaciado la base de datos).
// Devuelve { id, nombreUsuario, email, foto, ciudad }, o error 401.
async function obtenerPerfilPropio(id) {
  const perfil = await usuarioRepository.obtenerPerfil(id);
  if (!perfil) {
    throw crearError('No hay sesión iniciada', 401);
  }
  return perfil;
}

// Actualiza nombreUsuario y/o ciudad del usuario de la sesión.
// El email no es editable desde aquí.
// - `datos`: { nombreUsuario?, ciudad? }. Cualquier otro campo se ignora.
// Devuelve el perfil actualizado. Error 400 si un dato no es válido o el nombre ya está en uso.
async function actualizarPerfilPropio(id, datos) {
  // Un campo que no llega no se cambia (Prisma ignora los campos que valen undefined)
  const nombreUsuario = datos?.nombreUsuario === undefined ? undefined : validarNombreUsuario(datos.nombreUsuario);
  const ciudad = datos?.ciudad === undefined ? undefined : leerCiudad(datos.ciudad);

  try {
    return await usuarioRepository.actualizarPerfil(id, { nombreUsuario, ciudad });
  } catch (err) {
    // P2002 es el código de Prisma para «valor duplicado en un campo único»
    if (err.code === 'P2002') {
      throw crearError('El nombre de usuario ya está en uso', 400);
    }
    // Cualquier otro fallo es inesperado: app.js responde 500
    throw err;
  }
}

// Sube la foto del usuario de la sesión a Cloudinary y guarda en el perfil solo su URL.
// `archivo` es el que deja el middleware recibirFoto (el tamaño ya está comprobado).
// Si la foto no es válida no se sube nada y el perfil conserva la anterior.
// Devuelve el perfil con la URL nueva en `foto`.
async function actualizarFotoPropia(id, archivo) {
  if (!archivo) {
    throw crearError('Falta la foto', 400);
  }
  if (!esFormatoPermitido(archivo.buffer)) {
    throw crearError('La foto debe ser JPG, PNG o WebP', 400);
  }

  let url;
  try {
    url = await fotoRepository.subirFotoPerfil(id, archivo.buffer);
  } catch (err) {
    // Cloudinary responde 400 si el archivo empieza como una imagen pero está dañado
    if (err.http_code === 400) {
      throw crearError('La foto no es una imagen válida', 400);
    }
    throw err;
  }
  // Solo si la subida ha ido bien se guarda la URL en MySQL
  return usuarioRepository.actualizarFoto(id, url);
}

module.exports = { obtenerPerfilPropio, actualizarPerfilPropio, actualizarFotoPropia };
