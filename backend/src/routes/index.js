// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
const express = require('express');
const authRoutes = require('./auth');

const router = express.Router();

router.use('/auth', authRoutes);

// Comprobación de que el servidor responde (no consulta MySQL)
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
