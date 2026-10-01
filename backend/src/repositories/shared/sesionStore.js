// Almacén de sesiones de express-session en la tabla Session de MySQL.
// Cada sesión caduca tras un día sin actividad; las caducadas se borran cada 10 minutos.
// Capa: repositorios (repositories), en shared/ porque no es de ninguna funcionalidad concreta.
// Lo usa: app.js, al configurar las sesiones.
// Usa: la librería @quixo3/prisma-session-store y shared/prisma.js.
//
// Por defecto express-session guarda las sesiones en memoria y se pierden al reiniciar
// el servidor. Guardándolas en MySQL, los usuarios siguen conectados tras un reinicio.
// En las pruebas se sustituye por un almacén en memoria (tests/setup.js).
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./prisma');

module.exports = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000, // cada 10 minutos (en ms) borra las sesiones caducadas
  dbRecordIdIsSessionId: true, // usa el id de la sesión como clave de la fila
});
