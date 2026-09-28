// Se simula el repositorio para decidir si la base de datos «responde» o no
jest.mock('../src/repositories/saludRepository');

const request = require('supertest');
const app = require('../src/app');
const saludRepository = require('../src/repositories/saludRepository');

describe('GET /api/health', () => {
  test('con la base de datos disponible responde 200 con status ok', async () => {
    saludRepository.comprobarBaseDeDatos.mockResolvedValue();

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('si la base de datos no responde, responde 503', async () => {
    saludRepository.comprobarBaseDeDatos.mockRejectedValue(new Error('sin conexión'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error');
  });
});

describe('ruta de la API inexistente', () => {
  test('responde 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('cabeceras de seguridad', () => {
  test('las páginas llevan CSP y protección contra marcos, y no anuncian Express', async () => {
    const res = await request(app).get('/');

    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
