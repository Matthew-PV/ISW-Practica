process.env.SESSION_SECRET = 'test';

// Se simula el repositorio para no depender de MySQL en las pruebas
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');

const DATOS_PUBLICOS = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com' };
let usuario;

beforeAll(async () => {
  usuario = { ...DATOS_PUBLICOS, passwordHash: await bcrypt.hash('secreta123', 4) };
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

describe('POST /api/auth/registro', () => {
  test('sin todos los datos responde 400', async () => {
    const res = await request(app).post('/api/auth/registro').send({ email: 'ana@ejemplo.com' });

    expect(res.status).toBe(400);
  });

  test('con un email ya registrado responde 400', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombreUsuario: 'otra', email: usuario.email, password: 'secreta123' });

    expect(res.status).toBe(400);
    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });

  test('crea el usuario, guarda la contraseña cifrada y no la devuelve', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(null);
    usuarioRepository.crear.mockResolvedValue(usuario);

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombreUsuario: 'ana', email: 'ana@ejemplo.com', password: 'secreta123' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(DATOS_PUBLICOS);
    const { passwordHash } = usuarioRepository.crear.mock.calls[0][0];
    expect(await bcrypt.compare('secreta123', passwordHash)).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  test('sin todos los datos responde 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ana@ejemplo.com' });

    expect(res.status).toBe(400);
  });

  test('con un email que no existe responde 401', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: 'secreta123' });

    expect(res.status).toBe(401);
  });

  test('con la contraseña incorrecta responde 401', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: 'otra-cosa' });

    expect(res.status).toBe(401);
  });

  test('con los datos correctos devuelve el usuario sin la contraseña', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: usuario.email, password: 'secreta123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(DATOS_PUBLICOS);
  });
});

describe('GET /api/auth/yo', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/api/auth/yo');

    expect(res.status).toBe(401);
  });

  test('con sesión devuelve el usuario', async () => {
    const agente = await agenteConSesion();

    const res = await agente.get('/api/auth/yo');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(DATOS_PUBLICOS);
  });

  test('si el usuario de la sesión ya no existe responde 401', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.buscarPorId.mockResolvedValue(null);

    const res = await agente.get('/api/auth/yo');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('cierra la sesión', async () => {
    const agente = await agenteConSesion();

    const res = await agente.post('/api/auth/logout');
    const yo = await agente.get('/api/auth/yo');

    expect(res.status).toBe(204);
    expect(yo.status).toBe(401);
  });
});
