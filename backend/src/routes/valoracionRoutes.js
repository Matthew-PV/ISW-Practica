// Rutas de la valoración de una experiencia, bajo /api/experiencias/:id/valoracion (CS-01).
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/valoracionService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const valoracionService = require('../services/valoracionService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

// mergeParams: permite leer el :id de la experiencia, que está en la ruta de montaje (index.js).
const router = express.Router({ mergeParams: true });

router.use(requiereSesion);

// PUT /api/experiencias/:id/valoracion — crea la valoración del usuario de la sesión (201)
// o actualiza la que ya tenía (200). Cuerpo: { puntuacion, comentario? }.
router.put('/', async (req, res) => {
  const { valoracion, creada } = await valoracionService.valorarExperiencia(
    req.session.usuarioId,
    Number(req.params.id),
    req.body
  );
  res.status(creada ? 201 : 200).json(valoracion);
});

module.exports = router;
