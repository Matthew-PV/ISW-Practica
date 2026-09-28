// Configuración de Express: sesiones, API REST y páginas del frontend.
// Se exporta sin arrancar el servidor para que las pruebas la usen directamente.
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const apiRouter = require('./routes');
const sesionStore = require('./repositories/sesionStore');

const app = express();

app.use(express.json());

// Sesiones: se guardan en MySQL (sobreviven a los reinicios). La cookie solo lleva el
// identificador de sesión y JavaScript no puede leerla (httpOnly)
app.use(
  session({
    store: sesionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// API REST (y 404 en JSON para cualquier ruta /api que no exista)
app.use('/api', apiRouter);
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Páginas del frontend
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Errores:
// - los de express.json (JSON roto, cuerpo demasiado grande...) traen `type`: mensaje genérico en español;
// - los de crearError (src/errores.js) se devuelven con su código y su mensaje;
// - el resto son fallos inesperados: se registran en consola y no se muestra su detalle al usuario.
app.use((err, req, res, next) => {
  if (err.type && err.status < 500) {
    return res.status(err.status).json({ error: 'La petición no es válida' });
  }
  if (err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
