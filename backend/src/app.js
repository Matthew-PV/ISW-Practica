// Configuración de Express: sesiones, API REST y páginas del frontend.
// Se exporta sin arrancar el servidor para que las pruebas la usen directamente.
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const apiRouter = require('./routes');

const app = express();

app.use(express.json());

// Sesiones: la cookie solo guarda el identificador de sesión y JavaScript no puede leerla (httpOnly)
app.use(
  session({
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

// Errores: los que traen `status` (p. ej. de crearError en los servicios) se devuelven con su mensaje;
// el resto son fallos inesperados, se registran en consola y no se muestra su detalle al usuario.
app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
