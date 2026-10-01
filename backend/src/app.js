// Configuración de Express: seguridad, sesiones, API REST, páginas del frontend y errores.
// Capa: configuración de la aplicación (por encima de las rutas).
// Lo usan: server.js (para arrancarla) y las pruebas de tests/ (con supertest).
// Usa: routes/index.js (todas las rutas de la API) y repositories/shared/sesionStore.js
//      (dónde se guardan las sesiones).
//
// Recorrido de una petición: Express la pasa por cada `app.use` en el orden en que aparecen
// aquí. Primero las cabeceras de seguridad, luego se lee el JSON, luego se carga la sesión,
// y después se decide si es de la API (/api/...) o una página del frontend. Si algo lanza
// un error por el camino, salta directamente al manejador de errores del final.
//
// Se exporta sin arrancar el servidor para que las pruebas la usen directamente.
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const apiRouter = require('./routes');
const sesionStore = require('./repositories/shared/sesionStore');

const app = express();

// Cabeceras de seguridad (helmet): política de contenido (CSP) que solo permite cargar scripts
// propios y los del CAPTCHA de Cloudflare, protección contra meter la web en un marco ajeno,
// y sin anunciar que usamos Express
const CLOUDFLARE_CAPTCHA = 'https://challenges.cloudflare.com';
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Scripts permitidos: los de nuestro propio servidor y el del CAPTCHA
        scriptSrc: ["'self'", CLOUDFLARE_CAPTCHA],
        // El CAPTCHA se dibuja dentro de un iframe de Cloudflare
        frameSrc: [CLOUDFLARE_CAPTCHA],
        // Fotos de perfil: las propias (imagen por defecto) y las subidas a Cloudinary
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      },
    },
  })
);

// Lee el cuerpo JSON de las peticiones y lo deja en req.body
app.use(express.json());

// Sesiones: se guardan en MySQL (sobreviven a los reinicios). La cookie solo lleva el
// identificador de sesión y JavaScript no puede leerla (httpOnly)
app.use(
  session({
    store: sesionStore,
    // Clave con la que se firma la cookie, para que nadie pueda fabricar una (de .env)
    secret: process.env.SESSION_SECRET,
    // No vuelve a guardar la sesión en cada petición si no ha cambiado
    resave: false,
    // No crea sesión (ni cookie) hasta que se guarda algo en ella, es decir, hasta el login
    saveUninitialized: false,
    // sameSite 'lax': el navegador no envía la cookie en peticiones POST desde otras webs
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// API REST (y 404 en JSON para cualquier ruta /api que no exista)
app.use('/api', apiRouter);
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Páginas del frontend: cualquier petición que no sea de la API se busca como archivo
// dentro de la carpeta frontend/ (HTML, CSS, JS). La raíz "/" sirve frontend/index.html.
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Manejador de errores: Express lo reconoce porque recibe 4 parámetros (err primero).
// Llegan aquí los errores lanzados en cualquier ruta, servicio o middleware.
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
