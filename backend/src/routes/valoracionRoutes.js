// Rutas de la valoración de una experiencia.
// CS-01: crear o modificar una valoración.
// CS-48: consultar valoraciones de amigos y seguidores.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/valoracionService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const valoracionService = require('../services/valoracionService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

// mergeParams: permite leer el :id de la experiencia, que está en la ruta de montaje (index.js).
const router = express.Router({ mergeParams: true });

router.use(requiereSesion);

// GET /api/experiencias/:id/valoracion
// Devuelve las valoraciones hechas por amigos o seguidores del usuario de la sesión.
// Query opcional: ?pagina=1&limite=10
router.get('/', async (req, res) => {
  const pagina = req.query.pagina === undefined
    ? 1
    : Number(req.query.pagina);

  const limite = req.query.limite === undefined
    ? 10
    : Number(req.query.limite);

  const resultado = await valoracionService.listarValoracionesRelacionadas(
    req.session.usuarioId,
    Number(req.params.id),
    pagina,
    limite
  );

  res.status(200).json({
    ...resultado,
    pagina,
    limite,
  });
});

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

// GET /api/experiencias/:id/valoracion/mia
// Devuelve la valoración que el usuario de la sesión ha hecho de esta experiencia.
router.get('/mia', async (req, res, next) => {
  try {
    const valoracion = await valoracionService.obtenerMiValoracion(
      req.session.usuarioId,
      Number(req.params.id)
    );
    res.json(valoracion);
  } catch (error) {
    // Si da 404 (no existe), simplemente enviamos el error limpio sin colapsar el servidor
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
