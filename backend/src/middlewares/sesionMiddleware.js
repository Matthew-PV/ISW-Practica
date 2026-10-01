// Protege las rutas que necesitan sesión iniciada: sin ella responde 401 y no llega a la ruta.
function requiereSesion(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }
  next();
}

module.exports = { requiereSesion };
