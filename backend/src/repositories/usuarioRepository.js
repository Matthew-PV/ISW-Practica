// Acceso a la tabla Usuario en MySQL. Cada función devuelve el usuario completo
// (incluida la contraseña cifrada), o null si no existe.
const prisma = require('./prisma');

// Campos del perfil que se pueden mostrar (nunca la contraseña cifrada)
const CAMPOS_PERFIL = { id: true, nombreUsuario: true, email: true, foto: true, ciudad: true };

// Crea un usuario. La contraseña debe llegar ya cifrada.
async function crear({ nombreUsuario, email, passwordHash }) {
  return prisma.usuario.create({
    data: { nombreUsuario, email, passwordHash },
  });
}

async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function buscarPorId(id) {
  return prisma.usuario.findUnique({ where: { id } });
}

// Devuelve solo los campos seguros de mostrar (nunca la contraseña).
async function obtenerPerfil(id) {
  return prisma.usuario.findUnique({
    where: { id },
    select: CAMPOS_PERFIL,
  });
}

// Actualiza nombreUsuario y/o ciudad. Devuelve solo los campos seguros de mostrar.
async function actualizarPerfil(id, { nombreUsuario, ciudad }) {
  return prisma.usuario.update({
    where: { id },
    data: { nombreUsuario, ciudad },
    select: CAMPOS_PERFIL,
  });
}

module.exports = { crear, buscarPorEmail, buscarPorId, obtenerPerfil, actualizarPerfil };
