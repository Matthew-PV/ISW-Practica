// Se ejecuta antes de cada archivo de pruebas (ver "jest" en package.json).
// En las pruebas no se lee .env, así que se da un secreto de sesión cualquiera.
process.env.SESSION_SECRET = 'test';

// Las pruebas guardan las sesiones en memoria en lugar de en MySQL
jest.mock('../src/repositories/sesionStore', () => {
  const session = require('express-session');
  return new session.MemoryStore();
});

// Los límites de intentos se desactivan (muchas pruebas hacen varios registros o logins seguidos).
// tests/limites.test.js los prueba de verdad con jest.unmock.
jest.mock('../src/middlewares/limites', () => {
  const dejarPasar = (req, res, next) => next();
  return { limiteLogin: dejarPasar, limiteRegistro: dejarPasar };
});
