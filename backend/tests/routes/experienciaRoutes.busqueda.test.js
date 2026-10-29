// CS-10: GET /api/experiencias con filtros. CS-14: GET /api/experiencias/:id/resumen.
// Se simulan los repositorios; la consulta real se prueba con MySQL (tests/mysql/busquedaExperiencias).
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/experienciaRepository');
jest.mock('../../src/repositories/valoracionRepository');
jest.mock('../../src/repositories/amistadRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');
const valoracionRepository = require('../../src/repositories/valoracionRepository');

let usuario;

beforeAll(async () => {
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('secreta123', 4) };
});

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  experienciaRepository.buscar.mockResolvedValue([]);
});

async function agenteConSesion() {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return agente;
}

describe('GET /api/experiencias (búsqueda, CS-10)', () => {
  test('sin sesión responde 401 y no busca', async () => {
    const res = await request(app).get('/api/experiencias?texto=tapas');
    expect(res.status).toBe(401);
    expect(experienciaRepository.buscar).not.toHaveBeenCalled();
  });

  test('sin autor busca con los filtros de la URL y responde { experiencias, siguiente }', async () => {
    const encontradas = [{ id: 5, titulo: 'Tapas', autor: null }];
    experienciaRepository.buscar.mockResolvedValue(encontradas);
    const agente = await agenteConSesion();

    const res = await agente.get('/api/experiencias?texto=tapas&categoria=Gastronom%C3%ADa&amigos=true&minimo=4');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ experiencias: encontradas, siguiente: null });
    expect(experienciaRepository.buscar).toHaveBeenCalledWith(1, {
      texto: 'tapas', ciudadId: null, categoria: 'Gastronomía', momento: null, soloAmigos: true, minimo: 4,
    }, null, 11);
    expect(experienciaRepository.listarDeAutor).not.toHaveBeenCalled();
  });

  test('un filtro no válido responde 400', async () => {
    const agente = await agenteConSesion();
    const res = await agente.get('/api/experiencias?categoria=Compras');
    expect(res.status).toBe(400);
    expect(experienciaRepository.buscar).not.toHaveBeenCalled();
  });
});

describe('GET /api/experiencias/:id/resumen (CS-14)', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app).get('/api/experiencias/10/resumen');
    expect(res.status).toBe(401);
  });

  test('devuelve el resumen de una experiencia visible', async () => {
    experienciaRepository.buscarPorId.mockResolvedValue({ id: 10, autorId: 2, visibilidad: 'PUBLICA' });
    valoracionRepository.resumir.mockResolvedValue({ porPuntuacion: [{ puntuacion: 3, cantidad: 2 }], comentarios: 1 });
    const agente = await agenteConSesion();

    const res = await agente.get('/api/experiencias/10/resumen');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ media: 3, total: 2, distribucion: { 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 }, comentarios: 1 });
  });

  test('una experiencia que no existe responde 404', async () => {
    experienciaRepository.buscarPorId.mockResolvedValue(null);
    const agente = await agenteConSesion();
    const res = await agente.get('/api/experiencias/99/resumen');
    expect(res.status).toBe(404);
  });
});
