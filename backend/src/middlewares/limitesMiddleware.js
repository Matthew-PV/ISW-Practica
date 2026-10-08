// Límites de peticiones por IP para frenar ataques de fuerza bruta y registros masivos.
// Los contadores se guardan en memoria: se reinician al reiniciar el servidor.
// Capa: middlewares (se ejecutan antes de la ruta, dentro de la capa de rutas).
// Lo usan: routes/authRoutes.js (POST /login, /registro, /recuperar y /restablecer) y
//          routes/perfilRoutes.js (PUT /password, CS-64).
// Usa: la librería express-rate-limit.
//
// Cuando una IP supera el límite, responde 429 («demasiadas peticiones») con el mensaje
// de `opcionesComunes` y la petición no llega a la ruta.
// En las pruebas se desactivan (tests/setup.js), salvo en tests/limites.test.js.
const { rateLimit } = require('express-rate-limit');

const MINUTO = 60 * 1000; // en milisegundos

// Configuración que comparten los dos limitadores
const opcionesComunes = {
  standardHeaders: 'draft-8', // informa al cliente con la cabecera RateLimit
  legacyHeaders: false, // sin las cabeceras antiguas X-RateLimit-*
  message: { error: 'Demasiados intentos. Vuelve a intentarlo dentro de unos minutos.' },
};

// Login: 10 intentos fallidos cada 15 minutos (los correctos no cuentan)
const limiteLogin = rateLimit({
  ...opcionesComunes,
  windowMs: 15 * MINUTO, // duración de la ventana en la que se cuentan los intentos
  limit: 10, // intentos permitidos dentro de la ventana
  skipSuccessfulRequests: true, // un login correcto (código < 400) no suma
});

// Registro: 20 intentos por hora, correctos o no
const limiteRegistro = rateLimit({
  ...opcionesComunes,
  windowMs: 60 * MINUTO,
  limit: 20,
});

// Cambiar la contraseña (CS-64): 10 intentos fallidos cada 15 minutos, para que no se pueda
// adivinar la actual a base de probar
const limiteCambioPassword = rateLimit({
  ...opcionesComunes,
  windowMs: 15 * MINUTO,
  limit: 10,
  skipSuccessfulRequests: true,
});

// Recuperar la contraseña (CS-64): 10 peticiones cada 15 minutos entre pedir el enlace y usarlo,
// correctas o no, para que no se pueda enviar emails en masa ni probar enlaces a ciegas
const limiteRecuperacion = rateLimit({
  ...opcionesComunes,
  windowMs: 15 * MINUTO,
  limit: 10,
});

module.exports = { limiteLogin, limiteRegistro, limiteCambioPassword, limiteRecuperacion };
