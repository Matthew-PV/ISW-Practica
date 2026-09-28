// Almacén de sesiones de express-session en la tabla Session de MySQL.
// Cada sesión caduca tras un día sin actividad; las caducadas se borran cada 10 minutos.
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./prisma');

module.exports = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000,
  dbRecordIdIsSessionId: true,
});
