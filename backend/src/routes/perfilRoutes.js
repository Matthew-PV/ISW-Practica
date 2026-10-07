// Rutas del perfil de usuario, bajo /api/perfil.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/perfilService.js (la lógica), middlewares/sesionMiddleware.js (exigir sesión)
//      y middlewares/fotoMiddleware.js (recibir el archivo de la foto).
//
// Todas trabajan sobre el perfil propio: el id del usuario sale siempre de la sesión, nunca
// de la petición, así que nadie puede consultar ni cambiar el perfil de otro.
// Los errores de las rutas async los recoge el manejador de errores de app.js (Express 5).
const express = require('express');
const perfilService = require('../services/perfilService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');
const { recibirFoto } = require('../middlewares/fotoMiddleware');

const router = express.Router();

// Todas las rutas del perfil exigen sesión iniciada
router.use(requiereSesion);

// GET /api/perfil — devuelve el perfil del usuario con la sesión iniciada:
// { id, nombreUsuario, email, foto, ciudad }, o 401 si no hay sesión
router.get('/', async (req, res) => {
  const perfil = await perfilService.obtenerPerfilPropio(req.session.usuarioId);
  res.json(perfil);
});

// PUT /api/perfil — actualiza nombreUsuario y/o ciudad del usuario con la sesión iniciada.
// Cuerpo: { nombreUsuario?, ciudad? } (los campos que no llegan no cambian).
// Responde con el perfil ya actualizado, o 400 si algún dato no es válido.
router.put('/', async (req, res) => {
  const perfil = await perfilService.actualizarPerfilPropio(req.session.usuarioId, req.body ?? {});
  res.json(perfil);
});

// PUT /api/perfil/foto — sube la foto de perfil (formulario multipart, campo `foto`: JPG, PNG
// o WebP de hasta 5 MB) y devuelve el perfil con la URL nueva.
// Primero recibirFoto deja el archivo en req.file; después el servicio lo valida y lo sube.
router.put('/foto', recibirFoto, async (req, res) => {
  const perfil = await perfilService.actualizarFotoPropia(req.session.usuarioId, req.file);
  res.json(perfil);
});

// GET /api/perfil/resumen — número de amigos y de seguidores del usuario de la sesión:
// { amigos, seguidores }.
router.get('/resumen', async (req, res) => {
  const resumen = await perfilService.obtenerResumenRelaciones(req.session.usuarioId);
  res.json(resumen);
});

// GET /api/perfil/amigos?pagina=1&limite=20 — una página de los amigos del usuario de la sesión:
// { pagina, limite, total, personas }. Sin `pagina` ni `limite` se usan 1 y 20; 400 si no son válidos.
router.get('/amigos', async (req, res) => {
  const { pagina, limite } = req.query;
  const amigos = await perfilService.listarAmigosPropios(req.session.usuarioId, pagina, limite);
  res.json(amigos);
});

// GET /api/perfil/seguidores?pagina=1&limite=20 — igual que /amigos, con quienes siguen al usuario.
router.get('/seguidores', async (req, res) => {
  const { pagina, limite } = req.query;
  const seguidores = await perfilService.listarSeguidoresPropios(req.session.usuarioId, pagina, limite);
  res.json(seguidores);
});

module.exports = router;
