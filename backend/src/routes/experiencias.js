// Creación de experiencias, bajo /api/experiencias.
const express = require('express');
const experienciaService = require('../services/experienciaService');

const router = express.Router();

// Crea una experiencia cuyo autor es el usuario de la sesión (201), o 400 si los datos no son válidos
router.post('/', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }
  const experiencia = await experienciaService.crearExperiencia(req.session.usuarioId, req.body);
  res.status(201).json(experiencia);
});

module.exports = router;
