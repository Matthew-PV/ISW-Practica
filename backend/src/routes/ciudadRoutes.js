// Rutas del catálogo de ciudades, bajo /api/ciudades.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/ciudadService.js (la lógica).
//
// Los errores de las rutas async los recoge el manejador de errores de app.js (Express 5).
const express = require('express');
const ciudadService = require('../services/ciudadService');

const router = express.Router();

// GET /api/ciudades → ciudadService.listarCiudades
// El catálogo completo [{ id, nombre, pais }], ordenado por nombre.
// Es público: solo son nombres de ciudades.
router.get('/', async (req, res) => {
  const ciudades = await ciudadService.listarCiudades();
  res.set('Cache-Control', 'public, max-age=3600').json(ciudades);
});

module.exports = router;
