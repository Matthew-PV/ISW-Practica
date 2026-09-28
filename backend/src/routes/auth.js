// Rutas de autenticación, bajo /api/auth. La sesión guarda solo el id del usuario (req.session.usuarioId).
// Express 5 pasa al manejador de errores de app.js cualquier error de una ruta async, sin try/catch.
const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

// Crea la cuenta y deja la sesión iniciada.
// Los datos los valida el servicio; req.body es undefined si la petición no trae JSON.
router.post('/registro', async (req, res) => {
  const usuario = await authService.registrar(req.body ?? {});
  req.session.usuarioId = usuario.id;
  res.status(201).json(usuario);
});

// Inicia la sesión con email y contraseña
router.post('/login', async (req, res) => {
  const usuario = await authService.iniciarSesion(req.body ?? {});
  req.session.usuarioId = usuario.id;
  res.json(usuario);
});

// Cierra la sesión
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
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
