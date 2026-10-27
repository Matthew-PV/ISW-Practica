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

describe('páginas de entrada', () => {
  test('GET / responde la portada, con un título h1', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1');
  });

  test('GET /acceso/iniciar-sesion.html responde el formulario de inicio de sesión', async () => {
    const res = await request(app).get('/acceso/iniciar-sesion.html');

    expect(res.status).toBe(200);
    expect(res.text).toContain('id="form-login"');
  });

  test('/ y /index.html son la misma página', async () => {
    const raiz = await request(app).get('/');
    const indice = await request(app).get('/index.html');

    expect(indice.status).toBe(200);
    expect(indice.text).toBe(raiz.text);
  });
});
