const path = require('node:path');
const express = require('express');
const session = require('express-session');
const apiRouter = require('./routes');

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// API REST
app.use('/api', apiRouter);
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Páginas del frontend
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Errores no controlados
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
});

module.exports = app;
