// Acceso a la tabla Usuario en MySQL. Cada función devuelve el usuario completo
// (incluida la contraseña cifrada), o null si no existe.
// Las de perfil (obtenerPerfil, actualizarPerfil, actualizarFoto) son la excepción:
// devuelven solo los campos de CAMPOS_PERFIL.
// Capa: repositorios (repositories).
// Lo usan: services/authService.js, services/perfilService.js y services/experienciaService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
//
// Los repositorios solo leen y escriben datos: no comprueban nada. Los datos llegan
// ya validados desde el servicio.
const prisma = require('./shared/prisma');

// Campos del perfil que se pueden mostrar (nunca la contraseña cifrada)
const CAMPOS_PERFIL = { id: true, nombreUsuario: true, email: true, foto: true, ciudad: true };

// Campos del perfil que puede ver otra persona: nunca el email
const CAMPOS_PERFIL_PUBLICO = { id: true, nombreUsuario: true, foto: true, ciudad: true };

// Crea un usuario. La contraseña debe llegar ya cifrada.
// Si el email o el nombre ya existen, Prisma lanza un error con código P2002.
async function crear({ nombreUsuario, email, passwordHash }) {
  return prisma.usuario.create({
    data: { nombreUsuario, email, passwordHash },
  });
}

// Busca por email (ya normalizado por el servicio). Lo usa el login.
async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

// Busca por id. Lo usan los servicios para comprobar que el usuario de la sesión sigue existiendo.
async function buscarPorId(id) {
  return prisma.usuario.findUnique({ where: { id } });
}

// Busca como máximo 20 usuarios cuyo nombre contiene el texto indicado. La
// intercalación utf8mb4_unicode_ci de MySQL no distingue mayúsculas y minúsculas.
// Solo selecciona campos seguros para que la búsqueda nunca devuelva emails.
async function buscarPorNombre(texto, usuarioExcluidoId) {
  return prisma.usuario.findMany({
    where: {
      nombreUsuario: { contains: texto },
      id: { not: usuarioExcluidoId },
    },
    select: { id: true, nombreUsuario: true, foto: true },
    take: 20,
  });
}

// Devuelve solo los campos seguros de mostrar (nunca la contraseña).
async function obtenerPerfil(id) {
  return prisma.usuario.findUnique({
    where: { id },
    select: CAMPOS_PERFIL,
  });
}

// Devuelve el perfil público de un usuario (sin email) buscándolo por su nombre de usuario,
// o null si no existe.
async function obtenerPerfilPublico(nombreUsuario) {
  return prisma.usuario.findUnique({
    where: { nombreUsuario },
    select: CAMPOS_PERFIL_PUBLICO,
  });
}

// Actualiza nombreUsuario y/o ciudad. Devuelve solo los campos seguros de mostrar.
// Un campo que llega como undefined no se modifica.
async function actualizarPerfil(id, { nombreUsuario, ciudad }) {
  return prisma.usuario.update({
    where: { id },
    data: { nombreUsuario, ciudad },
    select: CAMPOS_PERFIL,
  });
}

// Guarda la URL de la foto de perfil. Devuelve solo los campos seguros de mostrar.
async function actualizarFoto(id, foto) {
  return prisma.usuario.update({
    where: { id },
    data: { foto },
    select: CAMPOS_PERFIL,
  });
}

module.exports = { crear, buscarPorEmail, buscarPorId, buscarPorNombre, obtenerPerfil, obtenerPerfilPublico, actualizarPerfil, actualizarFoto };
