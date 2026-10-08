// Listados que usa la pantalla de bienvenida: mis experiencias (GET /api/experiencias/mias)
// y el catálogo de ciudades (GET /api/ciudades). Se simulan los repositorios, sin MySQL.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/ciudadRepository');
jest.mock('../../src/repositories/experienciaRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const ciudadRepository = require('../../src/repositories/ciudadRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');

const CIUDAD = { id: 1, nombre: 'Madrid', pais: 'España' };
let usuario;

beforeAll(async () => {
  usuario = {
    id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com',
    passwordHash: await bcrypt.hash('secreta123', 4),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return agente;
}

describe('GET /api/experiencias/mias', () => {
  test('sin sesión responde 401 y no consulta experiencias', async () => {
    const res = await request(app).get('/api/experiencias/mias');
    expect(res.status).toBe(401);
    expect(experienciaRepository.listarPorAutor).not.toHaveBeenCalled();
  });

  test('una sesión cuyo usuario ya no existe responde 401', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.buscarPorId.mockResolvedValue(null);
    const res = await agente.get('/api/experiencias/mias');
    expect(res.status).toBe(401);
    expect(experienciaRepository.listarPorAutor).not.toHaveBeenCalled();
  });

  test('devuelve las experiencias del autor de la sesión tal como las ordena el repositorio', async () => {
    const agente = await agenteConSesion();
    const mias = [
      { id: 2, titulo: 'Noche de tapas', descripcion: 'Bares', ciudadId: 1, autorId: 1, ciudad: CIUDAD },
      { id: 1, titulo: 'Tarde cultural', descripcion: 'Museo', ciudadId: 1, autorId: 1, ciudad: CIUDAD },
    ];
    experienciaRepository.listarPorAutor.mockResolvedValue(mias);

    const res = await agente.get('/api/experiencias/mias');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mias);
    // El autor sale de la sesión: nunca se listan las de otro usuario
    expect(experienciaRepository.listarPorAutor).toHaveBeenCalledWith(1);
  });
});

describe('GET /api/ciudades', () => {
  test('devuelve el catálogo de ciudades', async () => {
    const ciudades = [CIUDAD, { id: 2, nombre: 'París', pais: 'Francia' }];
    ciudadRepository.listar.mockResolvedValue(ciudades);

    const res = await request(app).get('/api/ciudades');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(ciudades);
  });
});
