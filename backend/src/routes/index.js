// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
const express = require('express');
const authRoutes = require('./auth');
const saludRepository = require('../repositories/saludRepository');

const router = express.Router();

router.use('/auth', authRoutes);

// Comprobación de que el servidor y la base de datos responden
router.get('/health', async (req, res) => {
  try {
    await saludRepository.comprobarBaseDeDatos();
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ error: 'La base de datos no responde' });
  }
});

module.exports = router;
