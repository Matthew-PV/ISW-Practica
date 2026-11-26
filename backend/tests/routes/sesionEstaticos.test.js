// La sesión solo se consulta en la API: los archivos del frontend no pasan por la base de datos.
const request = require('supertest');
const store = require('../../src/repositories/shared/sesionStore');
const app = require('../../src/app');

test('un archivo estático no lee la sesión y la API sí', async () => {
  const get = jest.spyOn(store, 'get');
  const firmada = `connect.sid=s%3A${require('cookie-signature').sign('abc', process.env.SESSION_SECRET).replace(/\+/g, '%2B').replace(/\//g, '%2F')}`;

  await request(app).get('/js/shared/api.js').set('Cookie', firmada).expect(200);
  expect(get).not.toHaveBeenCalled();

  await request(app).get('/api/no-existe').set('Cookie', firmada).expect(404);
  expect(get).toHaveBeenCalled();
});
