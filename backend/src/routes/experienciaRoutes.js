// Rutas de las experiencias, bajo /api/experiencias: listar las propias, crear (LUC01) y editar (LUC09).
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/experienciaService.js (la lógica) y middlewares/sesionMiddleware.js (exigir sesión).
//
// Los errores de las rutas async los recoge el manejador de errores de app.js (Express 5).
const express = require('express');
const experienciaService = require('../services/experienciaService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

// GET /api/experiencias/mias — las experiencias del usuario de la sesión, de la más nueva
// a la más antigua, cada una con su ciudad. 401 si no hay sesión.
router.get('/mias', requiereSesion, async (req, res) => {
  res.json(await experienciaService.listarExperienciasPropias(req.session.usuarioId));
});

// GET /api/experiencias/:id — una experiencia concreta si el usuario de la sesión puede verla.
router.get('/:id', requiereSesion, async (req, res) => {
  const experienciaId = Number(req.params.id);
  const experiencia = await experienciaService.obtenerExperiencia(
    req.session.usuarioId,
    experienciaId
  );
  res.json(experiencia);
});

// POST /api/experiencias — crea una experiencia cuyo autor es el usuario de la sesión (201),
// o 400 si los datos no son válidos.
// Cuerpo: { titulo, descripcion, ciudadId, tipo?, momentoAdecuado? }.
// Responde con la experiencia creada, incluida su ciudad.
router.post('/', requiereSesion, async (req, res) => {
  const experiencia = await experienciaService.crearExperiencia(req.session.usuarioId, req.body);
  res.status(201).json(experiencia);
});

// PATCH /api/experiencias/:id — edita una experiencia existente.
// Solo puede editarla su propio autor.
router.patch('/:id', requiereSesion, async (req, res) => {
  const experienciaId = Number(req.params.id);

  const experiencia = await experienciaService.editarExperiencia(
    req.session.usuarioId,
    experienciaId,
    req.body
  );

  res.status(200).json(experiencia);
});

router.get('/:id', requiereSesion, async (req, res, next) => {
  try {
    // CORRECCIÓN: Leemos el usuario directamente de la sesión
    const usuarioId = req.session.usuarioId;

    const experiencia = await experienciaService.obtenerExperiencia(req.params.id, usuarioId);
    res.json(experiencia);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
