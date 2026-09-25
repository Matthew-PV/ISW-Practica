process.env.SESSION_SECRET = 'test';

const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('responde 200 con status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('ruta de la API inexistente', () => {
  test('responde 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
