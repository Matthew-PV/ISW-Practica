// Rutas de las experiencias, bajo /api/experiencias. De momento solo la creación (LUC01).
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/experienciaService.js (la lógica) y middlewares/sesionMiddleware.js (exigir sesión).
//
// Los errores de las rutas async los recoge el manejador de errores de app.js (Express 5).
const express = require('express');
const experienciaService = require('../services/experienciaService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

// POST /api/experiencias — crea una experiencia cuyo autor es el usuario de la sesión (201),
// o 400 si los datos no son válidos.
// Cuerpo: { titulo, descripcion, ciudadId, tipo?, momentoAdecuado? }.
// Responde con la experiencia creada, incluida su ciudad.
router.post('/', requiereSesion, async (req, res) => {
  const experiencia = await experienciaService.crearExperiencia(req.session.usuarioId, req.body);
  res.status(201).json(experiencia);
});

module.exports = router;
