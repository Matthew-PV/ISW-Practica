// Acceso a la tabla Usuario en MySQL. Cada función devuelve el usuario completo
// (incluida la contraseña cifrada), o null si no existe.
const prisma = require('./prisma');

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

module.exports = { crear, buscarPorEmail, buscarPorId };
