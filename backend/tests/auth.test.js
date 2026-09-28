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

// Deshace los jest.spyOn para que no afecten al siguiente test
afterEach(() => {
  jest.restoreAllMocks();
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

  // MySQL rechaza los duplicados por los índices únicos; Prisma lo indica con el código P2002
  test('con un email ya registrado responde 400', async () => {
    usuarioRepository.crear.mockRejectedValue({ code: 'P2002', meta: { target: 'Usuario_email_key' } });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombreUsuario: 'otra', email: usuario.email, password: 'secreta123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email ya está registrado');
  });

  test('con un nombre de usuario ya en uso responde 400', async () => {
    usuarioRepository.crear.mockRejectedValue({ code: 'P2002', meta: { target: 'Usuario_nombreUsuario_key' } });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombreUsuario: 'ana', email: 'otra@ejemplo.com', password: 'secreta123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre de usuario ya está en uso');
  });

  test('crea el usuario, guarda la contraseña cifrada y no la devuelve', async () => {
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

  // Si con un email inexistente no se ejecutara bcrypt, la respuesta sería más rápida
  // y delataría qué emails están registrados
  test('con un email que no existe también ejecuta bcrypt', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(null);
    const compare = jest.spyOn(bcrypt, 'compare');

    await request(app).post('/api/auth/login').send({ email: 'nadie@ejemplo.com', password: 'secreta123' });

    expect(compare).toHaveBeenCalledTimes(1);
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

// Id de la sesión que viene en la cookie de una respuesta
function idDeSesion(res) {
  const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('connect.sid='));
  return cookie?.split(';')[0];
}

describe('seguridad de la sesión', () => {
  test('iniciar sesión crea un id de sesión nuevo (evita la fijación de sesión)', async () => {
    const agente = await agenteConSesion();
    const antes = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
    const despues = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });

    expect(idDeSesion(antes)).toBeDefined();
    expect(idDeSesion(despues)).toBeDefined();
    expect(idDeSesion(despues)).not.toBe(idDeSesion(antes));
  });
});

describe('POST /api/auth/logout', () => {
  test('cierra la sesión y borra la cookie', async () => {
    const agente = await agenteConSesion();

    const res = await agente.post('/api/auth/logout');
    const yo = await agente.get('/api/auth/yo');

    expect(res.status).toBe(204);
    expect(res.headers['set-cookie']?.[0]).toMatch(/^connect\.sid=;.*Expires=Thu, 01 Jan 1970/);
    expect(yo.status).toBe(401);
  });
});
