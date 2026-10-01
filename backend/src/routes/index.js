// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
// Capa: rutas (routes).
// Lo usa: app.js, que lo monta en /api.
// Usa: authRoutes.js, perfilRoutes.js y experienciaRoutes.js.
//
// Aquí solo se decide qué archivo atiende cada prefijo. Por ejemplo, una petición a
// /api/perfil/foto llega a perfilRoutes.js, que la ve como /foto.
// Para añadir un grupo nuevo: crear `xRoutes.js` y montarlo aquí con router.use.
const express = require('express');
const authRoutes = require('./authRoutes');
const perfilRoutes = require('./perfilRoutes');
const experienciaRoutes = require('./experienciaRoutes');

const router = express.Router();

router.use('/auth', authRoutes); // /api/auth/...: registro, login, logout, usuario actual
router.use('/perfil', perfilRoutes); // /api/perfil/...: consultar y editar el perfil propio
router.use('/experiencias', experienciaRoutes); // /api/experiencias/...: crear experiencias

module.exports = router;
