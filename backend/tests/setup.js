// Se ejecuta antes de cada archivo de pruebas (ver "jest" en package.json).
// En las pruebas no se lee .env, así que se da un secreto de sesión cualquiera.
process.env.SESSION_SECRET = 'test';
