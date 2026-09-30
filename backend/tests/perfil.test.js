// Se simula el repositorio para no depender de MySQL en las pruebas
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');

const DATOS_LOGIN = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com' };
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: null, ciudad: null };
let usuario;

beforeAll(async () => {
  usuario = { ...DATOS_LOGIN, passwordHash: await bcrypt.hash('secreta123', 4) };
});

beforeEach(() => {
  jest.resetAllMocks();
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return agente;
}

describe('GET /api/perfil', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/api/perfil');

    expect(res.status).toBe(401);
  });

  test('con sesión devuelve el perfil sin la contraseña', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.obtenerPerfil.mockResolvedValue(PERFIL);

    const res = await agente.get('/api/perfil');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(PERFIL);
    expect(res.body.passwordHash).toBeUndefined();
  });

  test('si el usuario de la sesión ya no existe responde 401', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.obtenerPerfil.mockResolvedValue(null);

    const res = await agente.get('/api/perfil');

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/perfil', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app).put('/api/perfil').send({ nombreUsuario: 'ana', ciudad: 'Madrid' });

    expect(res.status).toBe(401);
  });

  test('con un nombre de usuario demasiado corto responde 400', async () => {
    const agente = await agenteConSesion();

    const res = await agente.put('/api/perfil').send({ nombreUsuario: 'ab', ciudad: 'Madrid' });

    expect(res.status).toBe(400);
    expect(usuarioRepository.actualizarPerfil).not.toHaveBeenCalled();
  });

  test('con un nombre de usuario ya en uso responde 400', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.actualizarPerfil.mockRejectedValue({
      code: 'P2002',
      meta: { target: 'Usuario_nombreUsuario_key' },
    });

    const res = await agente.put('/api/perfil').send({ nombreUsuario: 'otra', ciudad: 'Madrid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre de usuario ya está en uso');
  });

  test('con datos válidos actualiza el perfil y lo devuelve', async () => {
    const agente = await agenteConSesion();
    const actualizado = { ...PERFIL, ciudad: 'Madrid' };
    usuarioRepository.actualizarPerfil.mockResolvedValue(actualizado);

    const res = await agente.put('/api/perfil').send({ nombreUsuario: 'ana', ciudad: 'Madrid' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(actualizado);
  });
});
