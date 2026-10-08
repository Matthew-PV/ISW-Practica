// CS-64: la recuperación de contraseña tiene límite de peticiones, con el limitador real
// (setup.js lo desactiva en el resto de pruebas).
jest.unmock('../../src/middlewares/limitesMiddleware');
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');

test('pedir el enlace 11 veces seguidas desde la misma IP responde 429', async () => {
  usuarioRepository.buscarPorEmail.mockResolvedValue(null);
  const intento = () => request(app).post('/api/auth/recuperar').send({ email: 'nadie@ejemplo.com' });

  for (let i = 0; i < 10; i++) {
    expect((await intento()).status).toBe(200);
  }
  const res = await intento();

  expect(res.status).toBe(429);
});
