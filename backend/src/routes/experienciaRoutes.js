// Rutas de las experiencias, bajo /api/experiencias: listar las de un autor (CS-44), leer
// una (CS-30), crear (CS-49) y editar (CS-57).
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/experienciaService.js (la lógica) y middlewares/sesionMiddleware.js (exigir sesión).
//
// Los errores de las rutas async los recoge el manejador de errores de app.js (Express 5).
const express = require('express');
const experienciaService = require('../services/experienciaService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

// GET /api/experiencias?autor=ana&despuesDe=57&limite=10 → experienciaService.listarDeAutor
// CS-44: las experiencias de un usuario
// que puede ver el de la sesión, por páginas: { experiencias, siguiente }.
router.get('/', requiereSesion, async (req, res) => {
  const { autor, despuesDe, limite } = req.query;
  res.json(await experienciaService.listarDeAutor(req.session.usuarioId, autor, { despuesDe, limite }));
});

// GET /api/experiencias/:id → experienciaService.obtenerExperiencia
// Una experiencia concreta si el usuario de la sesión puede verla.
router.get('/:id', requiereSesion, async (req, res) => {
  const experienciaId = Number(req.params.id);
  const experiencia = await experienciaService.obtenerExperiencia(
    req.session.usuarioId,
    experienciaId
  );
  res.json(experiencia);
});

// POST /api/experiencias → experienciaService.crearExperiencia
// Crea una experiencia cuyo autor es el usuario de la sesión (201),
// o 400 si los datos no son válidos.
// Cuerpo: { titulo, descripcion, ciudadId, tipo?, momentoAdecuado?, visibilidad? }.
// Responde con la experiencia creada, incluida su ciudad.
router.post('/', requiereSesion, async (req, res) => {
  const experiencia = await experienciaService.crearExperiencia(req.session.usuarioId, req.body);
  res.status(201).json(experiencia);
});

// PATCH /api/experiencias/:id → experienciaService.editarExperiencia
// Edita una experiencia existente.
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

module.exports = router;
