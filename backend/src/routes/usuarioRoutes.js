// Rutas de búsqueda de usuarios, bajo /api/usuarios.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/usuarioService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const usuarioService = require('../services/usuarioService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

router.use(requiereSesion);

// GET /api/usuarios?texto=ana — busca usuarios por una parte de su nombre.
router.get('/', async (req, res) => {
  const usuarios = await usuarioService.buscarUsuarios(req.session.usuarioId, req.query.texto ?? '');
  res.json(usuarios);
});

module.exports = router;
