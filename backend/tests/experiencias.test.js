// LUC01: creación por HTTP. Se simulan los repositorios, sin necesitar MySQL.
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/ciudadRepository');
jest.mock('../src/repositories/experienciaRepository');
jest.mock('../src/services/shared/visibilidad');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const ciudadRepository = require('../src/repositories/ciudadRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const prisma = require('../src/repositories/shared/prisma'); // Ajusta la ruta a tu instancia de Prisma
const visibilidad = require('../src/services/shared/visibilidad');

const CIUDAD = { id: 1, nombre: 'Madrid' };
const DATOS = { titulo: 'Tarde cultural', descripcion: 'Museo y paseo', ciudadId: 1 };
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
  ciudadRepository.buscarPorId.mockResolvedValue(CIUDAD);
  experienciaRepository.crear.mockImplementation(async (datos) => ({
    id: 10, ...datos, ciudad: CIUDAD,
  }));
});

afterEach(() => jest.restoreAllMocks());

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return agente;
}

test('sin sesión responde 401 y no consulta ni guarda datos', async () => {
  const res = await request(app).post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(401);
  expect(ciudadRepository.buscarPorId).not.toHaveBeenCalled();
  expect(experienciaRepository.crear).not.toHaveBeenCalled();
});

test('una sesión cuyo usuario ya no existe no permite crear', async () => {
  const agente = await agenteConSesion();
  usuarioRepository.buscarPorId.mockResolvedValue(null);
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(401);
  expect(experienciaRepository.crear).not.toHaveBeenCalled();
});

test('datos válidos: crea y devuelve 201 con una única ciudad y el autor de la sesión', async () => {
  const agente = await agenteConSesion();
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(201);
  expect(res.body).toEqual({
    id: 10, ...DATOS, tipo: null, momentoAdecuado: null, visibilidad: 'PUBLICA', autorId: 1, ciudad: CIUDAD,
  });
  expect(experienciaRepository.crear).toHaveBeenCalledTimes(1);
  expect(experienciaRepository.crear).toHaveBeenCalledWith({
    ...DATOS, tipo: null, momentoAdecuado: null, visibilidad: 'PUBLICA', autorId: 1,
  });
});

test('normaliza textos y no permite elegir otro autor ni identificador', async () => {
  const agente = await agenteConSesion();
  const res = await agente.post('/api/experiencias').send({
    ...DATOS, titulo: '  Cafe\u0301  ', tipo: ' Cultural ', momentoAdecuado: ' Tarde ',
    autorId: 999, id: 999, ciudad: { id: 2 },
  });
  expect(res.status).toBe(201);
  expect(experienciaRepository.crear).toHaveBeenCalledWith({
    ...DATOS, titulo: 'Café', tipo: 'Cultural', momentoAdecuado: 'Tarde', visibilidad: 'PUBLICA', autorId: 1,
  });
});

test.each([
  ['título ausente', { titulo: undefined }],
  ['descripción ausente', { descripcion: undefined }],
  ['ciudad ausente', { ciudadId: undefined }],
  ['título vacío', { titulo: '   ' }],
  ['descripción vacía', { descripcion: '   ' }],
  ['varias ciudades', { ciudadId: [1, 2] }],
  ['título demasiado largo', { titulo: 'x'.repeat(192) }],
])('%s: responde 400 y no guarda', async (_, cambios) => {
  const agente = await agenteConSesion();
  const res = await agente.post('/api/experiencias').send({ ...DATOS, ...cambios });
  expect(res.status).toBe(400);
  expect(res.body.error).toEqual(expect.any(String));
  expect(experienciaRepository.crear).not.toHaveBeenCalled();
});

test('sin cuerpo responde 400 y no guarda', async () => {
  const agente = await agenteConSesion();
  const res = await agente.post('/api/experiencias');
  expect(res.status).toBe(400);
  expect(experienciaRepository.crear).not.toHaveBeenCalled();
});

test('una ciudad inexistente responde 400 y no guarda', async () => {
  const agente = await agenteConSesion();
  ciudadRepository.buscarPorId.mockResolvedValue(null);
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La ciudad seleccionada no existe');
  expect(experienciaRepository.crear).not.toHaveBeenCalled();
});

test('si la ciudad desaparece antes de guardar, responde 400 en lugar de 500', async () => {
  const agente = await agenteConSesion();
  experienciaRepository.crear.mockRejectedValue({ code: 'P2003' });
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La ciudad seleccionada ya no está disponible');
});

test('si el autor desaparece antes de guardar, responde 401', async () => {
  const agente = await agenteConSesion();
  usuarioRepository.buscarPorId.mockResolvedValueOnce(usuario).mockResolvedValueOnce(null);
  experienciaRepository.crear.mockRejectedValue({ code: 'P2003' });
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(401);
});

test('un fallo inesperado al guardar responde 500 sin revelar detalles internos', async () => {
  const agente = await agenteConSesion();
  const error = new Error('Detalle interno de conexión');
  experienciaRepository.crear.mockRejectedValue(error);
  const registro = jest.spyOn(console, 'error').mockImplementation(() => {});
  const res = await agente.post('/api/experiencias').send(DATOS);
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: 'Error interno del servidor' });
  expect(registro).toHaveBeenCalledWith(error);
});

describe('GET /api/experiencias/:id (CS-63)', () => {
  // 1. Datos simulados
  const expVisible = {
    id: 1,
    titulo: 'Experiencia Visible',
    visibilidad: 'PUBLICA',
    autorId: 1, // Coincide con el id del usuario simulado en el archivo
    autor: { id: 1, nombreUsuario: 'autor_publico' },
    ciudad: CIUDAD
  };

  const expPrivada = {
    id: 2,
    titulo: 'Experiencia Privada',
    visibilidad: 'PRIVADA',
    autorId: 2, // ID diferente al usuario logueado, por lo que no tendrá permiso
    autor: { id: 2, nombreUsuario: 'autor_privado' },
    ciudad: CIUDAD
  };

  // 2. Pruebas completas
  it('debe devolver la experiencia si es visible', async () => {
      const agente = await agenteConSesion();
      experienciaRepository.buscarPorId.mockResolvedValue(expVisible);
      // Simulamos que la comprobación de visibilidad es correcta
      visibilidad.puedeVerExperiencia.mockResolvedValue(true);

      const response = await agente.get(`/api/experiencias/${expVisible.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(expVisible.id);
      expect(response.body.autor).toBeDefined();
      expect(response.body.ciudad).toBeDefined();
    });

    it('debe devolver un error si la experiencia no es visible', async () => {
      const agente = await agenteConSesion();
      experienciaRepository.buscarPorId.mockResolvedValue(expPrivada);
      // Simulamos que la comprobación de visibilidad falla
      visibilidad.puedeVerExperiencia.mockResolvedValue(false);

      const response = await agente.get(`/api/experiencias/${expPrivada.id}`);

      expect(response.status).toBe(403);
    });

    it('debe devolver un error 404 si la experiencia es inexistente', async () => {
      const agente = await agenteConSesion();
      experienciaRepository.buscarPorId.mockResolvedValue(null);

      const response = await agente.get('/api/experiencias/9999999');

      expect(response.status).toBe(404);
    });
});
