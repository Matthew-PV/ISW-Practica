// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
const express = require('express');
const authRoutes = require('./authRoutes');
const perfilRoutes = require('./perfilRoutes');
const experienciaRoutes = require('./experienciaRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);
router.use('/experiencias', experienciaRoutes);

module.exports = router;
