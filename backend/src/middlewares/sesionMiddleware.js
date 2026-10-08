// Protege las rutas que necesitan sesión iniciada: sin ella, o si su usuario ya no existe, responde
// 401 y la petición no llega a la ruta.
// Capa: middlewares (se ejecutan antes de la ruta, dentro de la capa de rutas).
// Lo usan: todas las rutas que necesitan sesión (authRoutes.js GET /yo, y perfilRoutes.js,
//          experienciaRoutes.js, valoracionRoutes.js, usuarioRoutes.js, amistadRoutes.js y
//          seguimientoRoutes.js enteras).
// Usa: services/authService.js (obtenerUsuario).
//
// Un middleware es una función que Express ejecuta antes de la ruta. Recibe la petición
// (req), la respuesta (res) y `next`: si llama a next() la petición sigue hacia la ruta;
// si responde él mismo, la ruta no llega a ejecutarse.
const authService = require('../services/authService');

// Deja pasar solo si la sesión tiene un usuario y ese usuario sigue existiendo (la sesión podría
// ser de una cuenta borrada, por ejemplo tras vaciar la base de datos). `req.session.usuarioId`
// lo guarda el login o el registro (routes/authRoutes.js) y llega en cada petición con la cookie.
// Así los servicios pueden dar por bueno el usuario de la sesión sin volver a comprobarlo.
async function requiereSesion(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }
  // Si el usuario ya no existe, lanza el error 401 y app.js lo responde (Express 5 recoge los
  // errores de los middlewares async)
  await authService.obtenerUsuario(req.session.usuarioId);
  next();
}

module.exports = { requiereSesion };
