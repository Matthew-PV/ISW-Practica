// Rutas de usuarios, bajo /api/usuarios: búsqueda y perfil público de otro usuario.
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

// GET /api/usuarios/ana — perfil público de otro usuario (nunca su email), con sus contadores de
// amigos y seguidores y la relación del usuario de la sesión con él. Responde 404 si no existe.
router.get('/:nombreUsuario', async (req, res) => {
  const perfil = await usuarioService.obtenerPerfilPublico(req.session.usuarioId, req.params.nombreUsuario);
  res.json(perfil);
});

module.exports = router;
