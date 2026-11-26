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

const store = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000, // cada 10 minutos (en ms) borra las sesiones caducadas
  dbRecordIdIsSessionId: true, // usa el id de la sesión como clave de la fila
});

// Sustituye a la lectura de la librería, que responde «sin sesión» si la base falla (y echaría al
// login a quien tiene la sesión viva). Aquí el error se propaga y la API responde 500.
store.get = async (sid, callback) => {
  let sesion;
  try {
    const fila = await prisma.session.findUnique({ where: { sid } });
    if (fila && fila.expiresAt > new Date()) {
      sesion = JSON.parse(fila.data);
    } else if (fila) {
      // deleteMany no falla si otra petición ya la ha borrado
      await prisma.session.deleteMany({ where: { sid } });
    }
  } catch (err) {
    return callback(err);
  }
  return sesion ? callback(null, sesion) : callback();
};

// Renovar la caducidad cuesta dos consultas: se hace como mucho una vez cada 10 minutos por sesión
const MS_ENTRE_RENOVACIONES = 10 * 60 * 1000;
const renovadas = new Map();
const renovar = store.touch;
store.touch = (sid, sesion, callback) => {
  if (Date.now() - (renovadas.get(sid) ?? 0) < MS_ENTRE_RENOVACIONES) return callback?.();
  if (renovadas.size >= 1000) renovadas.clear();
  renovadas.set(sid, Date.now());
  return renovar(sid, sesion, callback);
};

module.exports = store;
