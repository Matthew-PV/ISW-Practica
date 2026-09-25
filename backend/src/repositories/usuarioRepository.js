const prisma = require('../prismaClient');

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
