// CS-01: crear y modificar una valoración por HTTP (PUT /api/experiencias/:id/valoracion).
// Se simulan los repositorios, sin necesitar MySQL. El de valoraciones guarda en memoria
// para comprobar que volver a valorar actualiza la misma valoración y no crea otra.
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/experienciaRepository');
jest.mock('../src/repositories/valoracionRepository', () => ({ buscar: jest.fn(), guardar: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const valoracionRepository = require('../src/repositories/valoracionRepository');

let usuario;
// Valoraciones «guardadas», con la clave `usuarioId-experienciaId` (como el índice único)
let valoraciones;

beforeAll(async () => {
  usuario = {
    id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com',
    passwordHash: await bcrypt.hash('secreta123', 4),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  valoraciones = new Map();
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  // Experiencia pública de otro autor: ana puede verla y valorarla
  experienciaRepository.buscarPorId.mockImplementation(async (id) => (
    id === 10 ? { id: 10, titulo: 'Tarde cultural', autorId: 2, visibilidad: 'PUBLICA' } : null
  ));
  valoracionRepository.buscar.mockImplementation(async (usuarioId, experienciaId) => (
    valoraciones.get(`${usuarioId}-${experienciaId}`) ?? null
  ));
  // Igual que el upsert de Prisma: crea si no existe y si existe sustituye sus datos
  valoracionRepository.guardar.mockImplementation(async (datos) => {
    const clave = `${datos.usuarioId}-${datos.experienciaId}`;
    const anterior = valoraciones.get(clave);
    const guardada = { id: anterior?.id ?? valoraciones.size + 1, ...datos };
    valoraciones.set(clave, guardada);
    return { ...guardada };
  });
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return agente;
}

describe('crear una valoración', () => {
  test('responde 201 con la valoración asociada al usuario de la sesión y a la experiencia', async () => {
    const agente = await agenteConSesion();

    const res = await agente.put('/api/experiencias/10/valoracion').send({ puntuacion: 4, comentario: 'Muy recomendable' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable' });
    expect(valoraciones.size).toBe(1);
  });

  test('el usuario sale de la sesión: un usuarioId en el cuerpo se ignora', async () => {
    const agente = await agenteConSesion();

    const res = await agente.put('/api/experiencias/10/valoracion').send({ puntuacion: 4, usuarioId: 99 });

    expect(res.status).toBe(201);
    expect(res.body.usuarioId).toBe(1);
  });
});

describe('modificar una valoración', () => {
  test('volver a valorar responde 200, actualiza la existente y sigue habiendo una sola', async () => {
    const agente = await agenteConSesion();
    const primera = await agente.put('/api/experiencias/10/valoracion').send({ puntuacion: 4, comentario: 'Muy recomendable' });

    const res = await agente.put('/api/experiencias/10/valoracion').send({ puntuacion: 2, comentario: 'Ha empeorado' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: primera.body.id, puntuacion: 2, comentario: 'Ha empeorado' });
    expect(valoraciones.size).toBe(1);
  });
});
