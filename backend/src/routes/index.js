// Router principal de la API, montado en /api. Cada prefijo lo atiende su propio archivo, que solo
// llama a su servicio:
//
//   Prefijo                        Rutas                    Servicio
//   /api/auth                      authRoutes.js            authService.js
//   /api/perfil                    perfilRoutes.js          perfilService.js
//   /api/experiencias              experienciaRoutes.js     experienciaService.js
//   /api/experiencias/:id/valor…   valoracionRoutes.js      valoracionService.js
//   /api/ciudades                  ciudadRoutes.js          ciudadService.js
//   /api/usuarios                  usuarioRoutes.js         usuarioService.js
//   /api/amistades                 amistadRoutes.js         amistadService.js
//   /api/seguimientos              seguimientoRoutes.js     seguimientoService.js
//
// Capa: rutas (routes).
// Lo usa: app.js, que lo monta en /api.
// Usa: los archivos de la tabla.
//
// Aquí solo se decide qué archivo atiende cada prefijo. Por ejemplo, una petición a
// /api/perfil/foto llega a perfilRoutes.js, que la ve como /foto. La referencia completa de cada
// ruta está en documentacion/api.md.
// Para añadir un grupo nuevo: crear `xRoutes.js` y `xService.js`, montarlo aquí con router.use y
// añadirlo a la tabla.
const express = require('express');
const authRoutes = require('./authRoutes');
const perfilRoutes = require('./perfilRoutes');
const experienciaRoutes = require('./experienciaRoutes');
const ciudadRoutes = require('./ciudadRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const amistadRoutes = require('./amistadRoutes');
const seguimientoRoutes = require('./seguimientoRoutes');
const valoracionRoutes = require('./valoracionRoutes');

const router = express.Router();

router.use('/auth', authRoutes); // /api/auth/...: registro, login, logout, usuario actual
router.use('/perfil', perfilRoutes); // /api/perfil/...: consultar y editar el perfil propio
router.use('/experiencias', experienciaRoutes); // /api/experiencias/...: listar, leer, crear y editar experiencias
router.use('/ciudades', ciudadRoutes); // /api/ciudades: catálogo de ciudades
router.use('/usuarios', usuarioRoutes); // /api/usuarios: búsqueda y perfil público de otro usuario
router.use('/amistades', amistadRoutes); // /api/amistades: solicitudes y amistades
router.use('/seguimientos', seguimientoRoutes); // /api/seguimientos: seguir y dejar de seguir
router.use('/experiencias/:id', valoracionRoutes); // /api/experiencias/:id/valoracion y /valoraciones: valorar y consultar valoraciones

module.exports = router;
