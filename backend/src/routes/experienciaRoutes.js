// Creación de experiencias, bajo /api/experiencias.
const express = require('express');
const experienciaService = require('../services/experienciaService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

// Crea una experiencia cuyo autor es el usuario de la sesión (201), o 400 si los datos no son válidos
router.post('/', requiereSesion, async (req, res) => {
  const experiencia = await experienciaService.crearExperiencia(req.session.usuarioId, req.body);
  res.status(201).json(experiencia);
});

module.exports = router;
