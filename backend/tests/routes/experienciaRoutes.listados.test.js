// Listados que usa la pantalla de bienvenida: mis experiencias (GET /api/experiencias?autor=, CS-44)
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

describe('GET /api/experiencias?autor= (las del usuario de la sesión, CS-44)', () => {
  test('sin sesión responde 401 y no consulta experiencias', async () => {
    const res = await request(app).get('/api/experiencias?autor=ana');
    expect(res.status).toBe(401);
    expect(experienciaRepository.listarDeAutor).not.toHaveBeenCalled();
  });

  test('una sesión cuyo usuario ya no existe responde 401', async () => {
    const agente = await agenteConSesion();
    usuarioRepository.buscarPorId.mockResolvedValue(null);
    const res = await agente.get('/api/experiencias?autor=ana');
    expect(res.status).toBe(401);
    expect(experienciaRepository.listarDeAutor).not.toHaveBeenCalled();
  });

  test('el autor recibe todas las suyas, de la más reciente a la más antigua, y el cursor de la siguiente página', async () => {
    usuarioRepository.obtenerPerfilPublico.mockResolvedValue({ id: 1, nombreUsuario: 'ana', foto: null, ciudad: null });
    const mias = [
      { id: 7, titulo: 'Segunda', ciudadId: 1, ciudad: CIUDAD, autorId: 1 },
      { id: 3, titulo: 'Primera', ciudadId: 1, ciudad: CIUDAD, autorId: 1 },
    ];
    experienciaRepository.listarDeAutor.mockResolvedValue(mias);
    const agente = await agenteConSesion();

    const res = await agente.get('/api/experiencias?autor=ana');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ experiencias: mias, siguiente: null });
    expect(experienciaRepository.listarDeAutor).toHaveBeenCalledWith(1, ['PRIVADA', 'AMIGOS', 'PUBLICA'], null, 11);
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
