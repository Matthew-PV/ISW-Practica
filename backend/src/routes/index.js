// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
// Capa: rutas (routes).
// Lo usa: app.js, que lo monta en /api.
// Usa: authRoutes.js, perfilRoutes.js, experienciaRoutes.js y ciudadRoutes.js.
//
// Aquí solo se decide qué archivo atiende cada prefijo. Por ejemplo, una petición a
// /api/perfil/foto llega a perfilRoutes.js, que la ve como /foto.
// Para añadir un grupo nuevo: crear `xRoutes.js` y montarlo aquí con router.use.
const express = require('express');
const authRoutes = require('./authRoutes');
const perfilRoutes = require('./perfilRoutes');
const experienciaRoutes = require('./experienciaRoutes');
const ciudadRoutes = require('./ciudadRoutes');

const router = express.Router();

router.use('/auth', authRoutes); // /api/auth/...: registro, login, logout, usuario actual
router.use('/perfil', perfilRoutes); // /api/perfil/...: consultar y editar el perfil propio
router.use('/experiencias', experienciaRoutes); // /api/experiencias/...: listar, crear y editar experiencias
router.use('/ciudades', ciudadRoutes); // /api/ciudades: catálogo de ciudades

module.exports = router;
