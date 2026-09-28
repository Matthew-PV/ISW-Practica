// Límites de peticiones por IP para frenar ataques de fuerza bruta y registros masivos.
// Los contadores se guardan en memoria: se reinician al reiniciar el servidor.
const { rateLimit } = require('express-rate-limit');

const MINUTO = 60 * 1000;

const opcionesComunes = {
  standardHeaders: 'draft-8', // informa al cliente con la cabecera RateLimit
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Vuelve a intentarlo dentro de unos minutos.' },
};

// Login: 10 intentos fallidos cada 15 minutos (los correctos no cuentan)
const limiteLogin = rateLimit({
  ...opcionesComunes,
  windowMs: 15 * MINUTO,
  limit: 10,
  skipSuccessfulRequests: true,
});

// Registro: 20 intentos por hora, correctos o no
const limiteRegistro = rateLimit({
  ...opcionesComunes,
  windowMs: 60 * MINUTO,
  limit: 20,
});

module.exports = { limiteLogin, limiteRegistro };
