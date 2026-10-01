// Protege las rutas que necesitan sesión iniciada: sin ella responde 401 y no llega a la ruta.
// Capa: middlewares (se ejecutan antes de la ruta, dentro de la capa de rutas).
// Lo usan: routes/authRoutes.js (GET /yo), routes/perfilRoutes.js (todas sus rutas)
//          y routes/experienciaRoutes.js (POST /).
//
// Un middleware es una función que Express ejecuta antes de la ruta. Recibe la petición
// (req), la respuesta (res) y `next`: si llama a next() la petición sigue hacia la ruta;
// si responde él mismo, la ruta no llega a ejecutarse.

// Deja pasar solo si la sesión tiene un usuario. `req.session.usuarioId` lo guarda el login
// o el registro (routes/authRoutes.js) y llega en cada petición gracias a la cookie.
function requiereSesion(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }
  next();
}

module.exports = { requiereSesion };
