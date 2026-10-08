// Rutas de las valoraciones de una experiencia, bajo /api/experiencias/:id.
// CS-01: crear o modificar mi valoración. CS-63: consultar la mía y todas.
// CS-48: consultar las de amigos y seguidores.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/valoracionService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const valoracionService = require('../services/valoracionService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

// mergeParams: permite leer el :id de la experiencia, que está en la ruta de montaje (index.js).
const router = express.Router({ mergeParams: true });

router.use(requiereSesion);

// GET /api/experiencias/:id/valoracion → valoracionService.obtenerMiValoracion
// Mi valoración de la experiencia, o null si todavía no la he valorado.
router.get('/valoracion', async (req, res) => {
  res.json(await valoracionService.obtenerMiValoracion(req.session.usuarioId, Number(req.params.id)));
});

// PUT /api/experiencias/:id/valoracion → valoracionService.valorarExperiencia
// Crea mi valoración (201) o actualiza la que ya tenía (200). Cuerpo: { puntuacion, comentario? }.
router.put('/valoracion', async (req, res) => {
  const { valoracion, creada } = await valoracionService.valorarExperiencia(
    req.session.usuarioId,
    Number(req.params.id),
    req.body
  );
  res.status(creada ? 201 : 200).json(valoracion);
});

// GET /api/experiencias/:id/valoraciones?despuesDe=&limite= → valoracionService.listarValoraciones
// Todas las valoraciones, por páginas: { valoraciones, siguiente }.
router.get('/valoraciones', async (req, res) => {
  const { despuesDe, limite } = req.query;
  res.json(await valoracionService.listarValoraciones(
    req.session.usuarioId, Number(req.params.id), { despuesDe, limite }
  ));
});

// GET /api/experiencias/:id/valoraciones/amigos?despuesDe=&limite= → valoracionService.listarValoracionesRelacionadas
// Las de mis amigos y mis seguidores, por páginas: { valoraciones, siguiente }.
router.get('/valoraciones/amigos', async (req, res) => {
  const { despuesDe, limite } = req.query;
  res.json(await valoracionService.listarValoracionesRelacionadas(
    req.session.usuarioId, Number(req.params.id), { despuesDe, limite }
  ));
});

module.exports = router;
