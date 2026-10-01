// Rutas del perfil de usuario, bajo /api/perfil.
const express = require('express');
const perfilService = require('../services/perfilService');
const { requiereSesion } = require('../middlewares/sesion');

const router = express.Router();

// Todas las rutas del perfil exigen sesión iniciada
router.use(requiereSesion);

// Devuelve el perfil del usuario con la sesión iniciada, o 401 si no hay sesión
router.get('/', async (req, res) => {
  const perfil = await perfilService.obtenerPerfilPropio(req.session.usuarioId);
  res.json(perfil);
});

// Actualiza nombreUsuario y/o ciudad del usuario con la sesión iniciada
router.put('/', async (req, res) => {
  const perfil = await perfilService.actualizarPerfilPropio(req.session.usuarioId, req.body ?? {});
  res.json(perfil);
});

module.exports = router;