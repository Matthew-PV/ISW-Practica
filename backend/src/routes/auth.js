// Rutas de autenticación, bajo /api/auth. La sesión guarda solo el id del usuario (req.session.usuarioId).
// Express 5 pasa al manejador de errores de app.js cualquier error de una ruta async, sin try/catch.
const express = require('express');
const authService = require('../services/authService');
const { limiteLogin, limiteRegistro } = require('../middlewares/limites');

const router = express.Router();

// Deja la sesión iniciada para el usuario. Antes crea una sesión nueva (con otro id) para que
// nadie que conociera el id anterior pueda usarlo: así se evita la «fijación de sesión».
function abrirSesion(req, usuarioId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.usuarioId = usuarioId;
      resolve();
    });
  });
}

// Crea la cuenta y deja la sesión iniciada.
// Los datos los valida el servicio; req.body es undefined si la petición no trae JSON.
router.post('/registro', limiteRegistro, async (req, res) => {
  const usuario = await authService.registrar(req.body ?? {}, req.ip);
  await abrirSesion(req, usuario.id);
  res.status(201).json(usuario);
});

// Clave pública del CAPTCHA, que el formulario de registro necesita para mostrarlo
router.get('/captcha', (req, res) => {
  res.json({ siteKey: process.env.TURNSTILE_SITE_KEY });
});

// Inicia la sesión con email y contraseña
router.post('/login', limiteLogin, async (req, res) => {
  const usuario = await authService.iniciarSesion(req.body ?? {});
  await abrirSesion(req, usuario.id);
  res.json(usuario);
});

// Cierra la sesión en el servidor y borra la cookie del navegador
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

// Devuelve el usuario con la sesión iniciada, o 401 si no hay sesión
router.get('/yo', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }

  const usuario = await authService.obtenerUsuario(req.session.usuarioId);
  res.json(usuario);
});

module.exports = router;
