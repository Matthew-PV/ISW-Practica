// Comportamiento general de la aplicación: rutas inexistentes y cabeceras de seguridad.
const request = require('supertest');
const app = require('../src/app');

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
