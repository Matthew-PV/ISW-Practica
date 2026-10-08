// Rutas de seguimientos, bajo /api/seguimientos.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/seguimientoService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const seguimientoService = require('../services/seguimientoService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

router.use(requiereSesion);

// POST /api/seguimientos → seguimientoService.seguirUsuario
// Sigue a un usuario. Cuerpo: { seguidoId }.
router.post('/', async (req, res) => {
  const seguimiento = await seguimientoService.seguirUsuario(req.session.usuarioId, req.body?.seguidoId);
  res.status(201).json(seguimiento);
});

// DELETE /api/seguimientos/:seguidoId → seguimientoService.dejarDeSeguir
// Deja de seguir a un usuario.
router.delete('/:seguidoId', async (req, res) => {
  await seguimientoService.dejarDeSeguir(req.session.usuarioId, Number(req.params.seguidoId));
  res.status(204).send();
});

module.exports = router;
