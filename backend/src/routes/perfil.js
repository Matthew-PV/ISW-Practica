// Rutas del perfil de usuario, bajo /api/perfil.
const express = require('express');
const perfilService = require('../services/perfilService');

const router = express.Router();

// Devuelve el perfil del usuario con la sesión iniciada, o 401 si no hay sesión
router.get('/', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }

  const perfil = await perfilService.obtenerPerfilPropio(req.session.usuarioId);
  res.json(perfil);
});

module.exports = router;
