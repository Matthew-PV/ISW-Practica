// CS-55, criterio por HTTP: un categoría de la lista se guarda y se ve en la experiencia;
// uno fuera de la lista se rechaza. Los repositorios se simulan en memoria.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/ciudadRepository');
jest.mock('../../src/repositories/experienciaRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const ciudadRepository = require('../../src/repositories/ciudadRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');

const CIUDAD = { id: 1, nombre: 'Madrid' };
const DATOS = { titulo: 'Templo de Debod', descripcion: 'Llega media hora antes', ciudadId: 1 };
let usuario;
let guardadas;

beforeAll(async () => {
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('secreta123', 4), foto: null };
});

beforeEach(() => {
  jest.resetAllMocks();
  guardadas = [];
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  ciudadRepository.buscarPorId.mockResolvedValue(CIUDAD);
  experienciaRepository.crear.mockImplementation(async (datos) => {
    const experiencia = { id: guardadas.length + 1, ...datos, ciudad: CIUDAD, autor: usuario };
    guardadas.push(experiencia);
    return experiencia;
  });
  experienciaRepository.buscarPorId.mockImplementation(async (id) => guardadas.find((e) => e.id === id) ?? null);
  experienciaRepository.actualizar.mockImplementation(async (id, cambios) => Object.assign(guardadas.find((e) => e.id === id), cambios));
});

async function agenteConSesion() {
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return agente;
}

test('un valor de la lista se guarda y aparece al consultar la experiencia', async () => {
  const agente = await agenteConSesion();
  const creada = await agente.post('/api/experiencias').send({ ...DATOS, tipo: 'Naturaleza' });
  expect(creada.status).toBe(201);

  const res = await agente.get(`/api/experiencias/${creada.body.id}`);
  expect(res.body.tipo).toBe('Naturaleza');
});

test('un valor fuera de la lista no se acepta al crear ni al editar', async () => {
  const agente = await agenteConSesion();
  const rechazada = await agente.post('/api/experiencias').send({ ...DATOS, tipo: 'Escalada' });
  expect(rechazada.status).toBe(400);
  expect(experienciaRepository.crear).not.toHaveBeenCalled();

  const creada = await agente.post('/api/experiencias').send({ ...DATOS, tipo: 'Naturaleza' });
  const editada = await agente.patch(`/api/experiencias/${creada.body.id}`).send({ tipo: 'Escalada' });
  expect(editada.status).toBe(400);
  expect(guardadas[0].tipo).toBe('Naturaleza');
});
