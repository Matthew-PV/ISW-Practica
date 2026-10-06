// Router principal de la API, montado en /api. Cada grupo de rutas va en su propio archivo.
// Capa: rutas (routes).
// Lo usa: app.js, que lo monta en /api.
// Usa: authRoutes.js, perfilRoutes.js, experienciaRoutes.js, ciudadRoutes.js, usuarioRoutes.js,
//      amistadRoutes.js y seguimientoRoutes.js.
//
// Aquí solo se decide qué archivo atiende cada prefijo. Por ejemplo, una petición a
// /api/perfil/foto llega a perfilRoutes.js, que la ve como /foto.
// Para añadir un grupo nuevo: crear `xRoutes.js` y montarlo aquí con router.use.
const express = require('express');
const authRoutes = require('./authRoutes');
const perfilRoutes = require('./perfilRoutes');
const experienciaRoutes = require('./experienciaRoutes');
const ciudadRoutes = require('./ciudadRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const amistadRoutes = require('./amistadRoutes');
const seguimientoRoutes = require('./seguimientoRoutes');

const router = express.Router();

router.use('/auth', authRoutes); // /api/auth/...: registro, login, logout, usuario actual
router.use('/perfil', perfilRoutes); // /api/perfil/...: consultar y editar el perfil propio
router.use('/experiencias', experienciaRoutes); // /api/experiencias/...: listar, crear y editar experiencias
router.use('/ciudades', ciudadRoutes); // /api/ciudades: catálogo de ciudades
router.use('/usuarios', usuarioRoutes); // /api/usuarios: búsqueda de usuarios
router.use('/amistades', amistadRoutes); // /api/amistades: solicitudes y amistades
router.use('/seguimientos', seguimientoRoutes); // /api/seguimientos: seguir y dejar de seguir

module.exports = router;
