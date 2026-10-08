// Lógica de negocio del perfil de usuario: consulta y edición de los propios datos.
// Capa: servicios (services).
// Lo usa: routes/perfilRoutes.js.
// Usa: repositories/usuarioRepository.js (leer y guardar el perfil),
//      repositories/fotoRepository.js (subir la foto a Cloudinary),
//      repositories/amistadRepository.js y repositories/seguimientoRepository.js (perfil público,
//      contadores y listados de CS-45), services/shared/nombreUsuario.js (reglas del nombre),
//      services/shared/paginacion.js (cursor de los listados) y errores.js.
//
// Todas las funciones reciben el `id` del usuario de la sesión: un usuario solo puede
// ver y cambiar su propio perfil.
const usuarioRepository = require('../repositories/usuarioRepository');
const fotoRepository = require('../repositories/fotoRepository');
const amistadRepository = require('../repositories/amistadRepository');
const seguimientoRepository = require('../repositories/seguimientoRepository');
const { leerPaginacion, cortarPagina } = require('./shared/paginacion');
const { crearError } = require('../errores');
const { validarNombreUsuario } = require('./shared/nombreUsuario');

const CIUDAD_MAX = 191; // tamaño de la columna en MySQL

// Imagen que se muestra mientras el usuario no ha subido ninguna foto (archivo del frontend).
const FOTO_POR_DEFECTO = '/img/foto-por-defecto.svg';

// Devuelve el perfil con la imagen por defecto en `foto` si el usuario no tiene ninguna.
// En MySQL sigue guardándose null: solo cambia lo que devuelve la API.
function conFotoPorDefecto(perfil) {
  return { ...perfil, foto: perfil.foto || FOTO_POR_DEFECTO };
}

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
    return conFotoPorDefecto(perfil);
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
    const perfil = await usuarioRepository.actualizarPerfil(id, { nombreUsuario, ciudad });
    return conFotoPorDefecto(perfil);
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
  const perfil = await usuarioRepository.actualizarFoto(id, url);
  return conFotoPorDefecto(perfil);
}

// Devuelve el perfil público de otro usuario (nunca su email), con sus contadores de amigos y
// seguidores y la relación de quien consulta con él.
// - `usuarioId`: el usuario de la sesión, que consulta el perfil.
// - `nombreUsuario`: el usuario cuyo perfil se consulta.
// Devuelve { id, nombreUsuario, foto, ciudad, amigos, seguidores, esPropio, relacion }, o error 404.
// `esPropio` es true cuando el perfil consultado es el del propio usuario de la sesión.
// `relacion.amistad` es 'ninguna', 'enviada' (la envié yo), 'recibida' o 'amigos'; `relacion.amistadId`
// es el id de esa solicitud o amistad (null si no hay), que las pantallas necesitan para responderla.
async function obtenerPerfilPublico(usuarioId, nombreUsuario) {
  const perfil = await usuarioRepository.obtenerPerfilPublico(nombreUsuario);
  if (!perfil) {
    throw crearError('Usuario no encontrado', 404);
  }

  const amigos = await amistadRepository.contarAmigos(perfil.id);
  const seguidores = await seguimientoRepository.contarSeguidores(perfil.id);
  const amistad = await amistadRepository.buscarEntreUsuarios(usuarioId, perfil.id);
  const siguiendo = await seguimientoRepository.sigueA(usuarioId, perfil.id);

  let estadoAmistad = 'ninguna';
  if (amistad?.estado === 'ACEPTADA') {
    estadoAmistad = 'amigos';
  } else if (amistad?.estado === 'PENDIENTE') {
    estadoAmistad = amistad.solicitanteId === usuarioId ? 'enviada' : 'recibida';
  }

  return {
    ...conFotoPorDefecto(perfil),
    amigos,
    seguidores,
    esPropio: perfil.id === usuarioId,
    relacion: { amistad: estadoAmistad, amistadId: amistad?.id ?? null, siguiendo },
  };
}

// Personas por página en los listados de amigos y seguidores (CS-45).
const PERSONAS_POR_PAGINA = 20;

// Convierte las filas de un listado ({ id, persona }, con una de más) en la respuesta
// { personas, siguiente } (ver services/shared/paginacion.js).
function paginaDePersonas(filas, limite) {
  const { elementos, siguiente } = cortarPagina(filas, limite);
  return { personas: elementos.map((fila) => conFotoPorDefecto(fila.persona)), siguiente };
}

// Devuelve cuántos amigos y seguidores tiene el usuario de la sesión: { amigos, seguidores }.
// Solo cuentan las amistades aceptadas; quien no tiene ninguna relación obtiene ceros.
async function obtenerResumenRelaciones(usuarioId) {
  const amigos = await amistadRepository.contarAmigos(usuarioId);
  const seguidores = await seguimientoRepository.contarSeguidores(usuarioId);
  return { amigos, seguidores };
}

// Devuelve una página de los amigos del usuario de la sesión: { personas, siguiente }, donde cada
// persona es { id, nombreUsuario, foto } y `siguiente` es el cursor de la página siguiente (null
// si no hay más). Los contadores salen de obtenerResumenRelaciones.
// - `paginacion`: { despuesDe, limite } de la URL. Error 400 si no es válida.
async function listarAmigosPropios(usuarioId, paginacion) {
  const { despuesDe, limite } = leerPaginacion(paginacion, PERSONAS_POR_PAGINA);
  const filas = await amistadRepository.listarAmigos(usuarioId, despuesDe, limite + 1);
  return paginaDePersonas(filas, limite);
}

// Igual que listarAmigosPropios, pero con las personas que siguen al usuario de la sesión.
async function listarSeguidoresPropios(usuarioId, paginacion) {
  const { despuesDe, limite } = leerPaginacion(paginacion, PERSONAS_POR_PAGINA);
  const filas = await seguimientoRepository.listarSeguidores(usuarioId, despuesDe, limite + 1);
  return paginaDePersonas(filas, limite);
}

module.exports = { obtenerPerfilPropio, actualizarPerfilPropio, actualizarFotoPropia, obtenerPerfilPublico, FOTO_POR_DEFECTO, obtenerResumenRelaciones, listarAmigosPropios, listarSeguidoresPropios};