
 // CS-53: duración y tarifa de las experiencias.
 // Pruebas HTTP con repositorios simulados.
 // No modifica ninguna base de datos.

jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/ciudadRepository');
jest.mock('../../src/repositories/experienciaRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');

const usuarioRepository = require('../../src/repositories/usuarioRepository');
const ciudadRepository = require('../../src/repositories/ciudadRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');

const CIUDAD = {
  id: 1,
  nombre: 'Madrid',
};

const DATOS = {
  titulo: 'Ruta cultural por Madrid',
  descripcion: 'Visita guiada por el centro histórico',
  ciudadId: 1,
};

let usuario;
let guardadas;

beforeAll(async () => {
  usuario = {
    id: 1,
    nombreUsuario: 'ana',
    email: 'ana@ejemplo.com',
    passwordHash: await bcrypt.hash('secreta123', 4),
    foto: null,
  };
});

beforeEach(() => {
  jest.resetAllMocks();

  guardadas = [];

  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);

  ciudadRepository.buscarPorId.mockResolvedValue(CIUDAD);

  experienciaRepository.crear.mockImplementation(async (datos) => {
    const experiencia = {
      id: guardadas.length + 1,
      ...datos,
      ciudad: CIUDAD,
      autor: usuario,
    };

    guardadas.push(experiencia);

    return experiencia;
  });

  experienciaRepository.buscarPorId.mockImplementation(async (id) => {
    return guardadas.find((experiencia) => experiencia.id === id) ?? null;
  });

  experienciaRepository.actualizar.mockImplementation(async (id, cambios) => {
    const experiencia = guardadas.find((item) => item.id === id);

    if (!experiencia) {
      throw new Error('Experiencia no encontrada');
    }

    Object.assign(experiencia, cambios);

    return experiencia;
  });
});

async function agenteConSesion() {
  const agente = request.agent(app);

  const respuesta = await agente
    .post('/api/auth/login')
    .send({
      email: usuario.email,
      password: 'secreta123',
    });

  expect(respuesta.status).toBe(200);

  return agente;
}

describe('CS-53: crear experiencias con duración y tarifa', () => {
  test('guarda y devuelve duración y tarifa válidas', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        duracionMinutos: 180,
        tarifa: '25.50',
      });

    expect(creada.status).toBe(201);
    expect(creada.body.duracionMinutos).toBe(180);
    expect(creada.body.tarifa).toBe('25.50');

    const consultada = await agente.get(
      `/api/experiencias/${creada.body.id}`
    );

    expect(consultada.status).toBe(200);
    expect(consultada.body.duracionMinutos).toBe(180);
    expect(consultada.body.tarifa).toBe('25.50');
  });

  test('permite una tarifa gratuita de cero euros', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        duracionMinutos: 60,
        tarifa: '0.00',
      });

    expect(creada.status).toBe(201);
    expect(creada.body.duracionMinutos).toBe(60);
    expect(Number(creada.body.tarifa)).toBe(0);
  });

  test('permite crear experiencias sin duración ni tarifa', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send(DATOS);

    expect(creada.status).toBe(201);
    expect(creada.body.duracionMinutos ?? null).toBeNull();
    expect(creada.body.tarifa ?? null).toBeNull();
  });
});

describe('CS-53: editar experiencias', () => {
  test('actualiza correctamente duración y tarifa', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        duracionMinutos: 180,
        tarifa: '25.50',
      });

    expect(creada.status).toBe(201);

    const editada = await agente
      .patch(`/api/experiencias/${creada.body.id}`)
      .send({
        duracionMinutos: 240,
        tarifa: '30.00',
      });

    expect(editada.status).toBe(200);
    expect(editada.body.duracionMinutos).toBe(240);
    expect(editada.body.tarifa).toBe('30.00');

    const consultada = await agente.get(
      `/api/experiencias/${creada.body.id}`
    );

    expect(consultada.status).toBe(200);
    expect(consultada.body.duracionMinutos).toBe(240);
    expect(consultada.body.tarifa).toBe('30.00');
  });

  test('permite quitar duración y tarifa al editar', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        duracionMinutos: 120,
        tarifa: '15.00',
      });

    expect(creada.status).toBe(201);

    const editada = await agente
      .patch(`/api/experiencias/${creada.body.id}`)
      .send({
        duracionMinutos: null,
        tarifa: null,
      });

    expect(editada.status).toBe(200);
    expect(editada.body.duracionMinutos).toBeNull();
    expect(editada.body.tarifa).toBeNull();
  });

  test('rechaza valores negativos sin modificar la experiencia', async () => {
    const agente = await agenteConSesion();

    const creada = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        duracionMinutos: 120,
        tarifa: '20.00',
      });

    expect(creada.status).toBe(201);

    const rechazada = await agente
      .patch(`/api/experiencias/${creada.body.id}`)
      .send({
        duracionMinutos: -30,
        tarifa: -10,
      });

    expect(rechazada.status).toBe(400);

    const consultada = await agente.get(
      `/api/experiencias/${creada.body.id}`
    );

    expect(consultada.body.duracionMinutos).toBe(120);
    expect(consultada.body.tarifa).toBe('20.00');
  });
});

describe('CS-53: validación de valores incorrectos', () => {
  test.each([
    ['duración negativa', { duracionMinutos: -1 }],
    ['duración cero', { duracionMinutos: 0 }],
    ['duración decimal', { duracionMinutos: 2.5 }],
    ['duración como texto', { duracionMinutos: '120' }],
    ['duración demasiado grande', { duracionMinutos: 2147483648 }],
    ['tarifa negativa', { tarifa: -1 }],
    ['tarifa con tres decimales', { tarifa: '12.999' }],
    ['tarifa no numérica', { tarifa: 'gratis' }],
    ['tarifa demasiado grande', { tarifa: '100000000' }],
    ['tarifa booleana', { tarifa: true }],
  ])('rechaza %s con HTTP 400', async (_, cambios) => {
    const agente = await agenteConSesion();

    const respuesta = await agente
      .post('/api/experiencias')
      .send({
        ...DATOS,
        ...cambios,
      });

    expect(respuesta.status).toBe(400);
    expect(experienciaRepository.crear).not.toHaveBeenCalled();
    expect(guardadas).toHaveLength(0);
  });
});
