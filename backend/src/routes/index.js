// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
const express = require('express');
const authRoutes = require('./auth');
const perfilRoutes = require('./perfil');
const experienciasRoutes = require('./experiencias');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);
router.use('/experiencias', experienciasRoutes);

module.exports = router;
