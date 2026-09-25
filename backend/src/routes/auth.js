const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/registro', async (req, res, next) => {
  try {
    const { nombreUsuario, email, password } = req.body;

    if (!nombreUsuario || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const usuario = await authService.registrar({ nombreUsuario, email, password });

    req.session.usuarioId = usuario.id;

    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const usuario = await authService.iniciarSesion({ email, password });

    req.session.usuarioId = usuario.id;

    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(204).send();
  });
});

router.get('/yo', (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No hay sesión iniciada' });
  }
  res.json({ id: req.session.usuarioId });
});

module.exports = router;
