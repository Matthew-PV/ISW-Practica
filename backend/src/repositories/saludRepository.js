// Comprobaciones del estado de la base de datos.
const prisma = require('./prisma');

// Lanza un error si MySQL no responde
async function comprobarBaseDeDatos() {
  await prisma.$queryRaw`SELECT 1`;
}

module.exports = { comprobarBaseDeDatos };
