// Búsqueda del catálogo de lugares para CS-50.
// Capa: rutas (routes). Lo usa: routes/index.js.
const express = require('express');
const lugarService = require('../services/lugarService');

const router = express.Router();

router.get('/buscar', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(await lugarService.buscar(req.query));
});

module.exports = router;
