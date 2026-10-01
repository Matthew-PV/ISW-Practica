// Límites de intentos de login y registro, con los limitadores reales (setup.js los desactiva)
jest.unmock('../src/middlewares/limitesMiddleware');
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');

test('el login fallido 11 veces seguidas responde 429', async () => {
  usuarioRepository.buscarPorEmail.mockResolvedValue(null);
  const intento = () => request(app).post('/api/auth/login').send({ email: 'ana@ejemplo.com', password: 'mala1234' });

  for (let i = 0; i < 10; i++) {
    expect((await intento()).status).toBe(401);
  }
  const res = await intento();

  expect(res.status).toBe(429);
  expect(res.body.error).toMatch(/Demasiados intentos/);
});

test('el registro 21 veces seguidas responde 429', async () => {
  const intento = () => request(app).post('/api/auth/registro').send({});

  for (let i = 0; i < 20; i++) {
    expect((await intento()).status).toBe(400);
  }
  const res = await intento();

  expect(res.status).toBe(429);
});
