// Rutas de autenticación, bajo /api/auth. La sesión guarda solo el id del usuario (req.session.usuarioId).
// Express 5 pasa al manejador de errores de app.js cualquier error de una ruta async, sin try/catch.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/authService.js (la lógica), middlewares/limitesMiddleware.js (límite de intentos)
//      y middlewares/sesionMiddleware.js (exigir sesión).
//
// Las rutas solo traducen HTTP ↔ servicio: sacan los datos de la petición, llaman al servicio
// y devuelven su resultado como JSON. Las comprobaciones de datos están en el servicio.
// Lo único propio de esta capa es la sesión (abrirla y cerrarla), porque es cosa de HTTP.
const express = require('express');
const authService = require('../services/authService');
const { limiteLogin, limiteRegistro, limiteRecuperacion } = require('../middlewares/limitesMiddleware');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

// Deja la sesión iniciada para el usuario. Antes crea una sesión nueva (con otro id) para que
// nadie que conociera el id anterior pueda usarlo: así se evita la «fijación de sesión».
// express-session usa callbacks; se envuelve en una promesa para poder usar await en las rutas.
function abrirSesion(req, usuarioId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.usuarioId = usuarioId;
      resolve();
    });
  });
}

// POST /api/auth/registro → authService.registrar
// Crea la cuenta y deja la sesión iniciada.
// Cuerpo: { nombreUsuario, email, password, captcha }. Responde 201 con el usuario creado.
// Los datos los valida el servicio; req.body es undefined si la petición no trae JSON.
router.post('/registro', limiteRegistro, async (req, res) => {
  const usuario = await authService.registrar(req.body ?? {}, req.ip);
  await abrirSesion(req, usuario.id);
  res.status(201).json(usuario);
});

// GET /api/auth/captcha → sin servicio (lee TURNSTILE_SITE_KEY de .env)
// Clave pública del CAPTCHA, que el formulario de registro necesita
// para mostrarlo. Es pública a propósito: la secreta (TURNSTILE_SECRET_KEY) nunca sale del servidor.
router.get('/captcha', (req, res) => {
  res.json({ siteKey: process.env.TURNSTILE_SITE_KEY });
});

// POST /api/auth/login → authService.iniciarSesion
// Inicia la sesión con email y contraseña.
// Cuerpo: { email, password }. Responde 200 con el usuario, o 401 si los datos no coinciden.
router.post('/login', limiteLogin, async (req, res) => {
  const usuario = await authService.iniciarSesion(req.body ?? {});
  await abrirSesion(req, usuario.id);
  res.json(usuario);
});

// POST /api/auth/logout → sin servicio (solo cierra la sesión)
// Cierra la sesión en el servidor y borra la cookie del navegador.
// Responde 204 (sin contenido). Funciona también si no había sesión.
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    // connect.sid es el nombre por defecto de la cookie de express-session
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

// GET /api/auth/yo → authService.obtenerUsuario
// Devuelve el usuario con la sesión iniciada, o 401 si no hay sesión.
// La usa el frontend para saber quién está conectado (por ejemplo, en bienvenida.html).
router.get('/yo', requiereSesion, async (req, res) => {
  const usuario = await authService.obtenerUsuario(req.session.usuarioId);
  res.json(usuario);
});

// POST /api/auth/recuperar → authService.solicitarRecuperacion
// CS-64: pide el enlace para restablecer la contraseña. Cuerpo: { email }.
// Responde siempre lo mismo, exista o no el email, para no revelar qué emails están registrados.
router.post('/recuperar', limiteRecuperacion, async (req, res) => {
  await authService.solicitarRecuperacion(req.body);
  res.json({ mensaje: 'Si el email está registrado, te hemos enviado un enlace para restablecer la contraseña.' });
});

// POST /api/auth/restablecer → authService.restablecerPassword
// CS-64: cambia la contraseña con el enlace. Cuerpo: { token, nueva }.
// 400 si el enlace no es válido, ya se usó o ha caducado, o si la contraseña no cumple los requisitos.
router.post('/restablecer', limiteRecuperacion, async (req, res) => {
  await authService.restablecerPassword(req.body);
  res.json({ mensaje: 'Contraseña cambiada. Ya puedes iniciar sesión con la nueva.' });
});

module.exports = router;
