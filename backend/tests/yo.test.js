process.env.SESSION_SECRET = 'test';

// Se simula el repositorio para no depender de MySQL en las pruebas
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');

describe('GET /api/auth/yo', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/api/auth/yo');

    expect(res.status).toBe(401);
  });

  test('con sesión devuelve el nombre del usuario', async () => {
    const usuario = {
      id: 1,
      nombreUsuario: 'ana',
      email: 'ana@ejemplo.com',
      passwordHash: await bcrypt.hash('secreta123', 4),
    };
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
    usuarioRepository.buscarPorId.mockResolvedValue(usuario);

    // El agente guarda la cookie de sesión entre peticiones
    const agente = request.agent(app);
    await agente.post('/api/auth/login').send({ email: 'ana@ejemplo.com', password: 'secreta123' });
    const res = await agente.get('/api/auth/yo');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com' });
  });
});
