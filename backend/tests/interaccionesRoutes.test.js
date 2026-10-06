// CS-61, objetivo 10: rutas protegidas para búsqueda, amistades y seguimientos.
jest.mock('../src/services/usuarioService', () => ({ buscarUsuarios: jest.fn() }));
jest.mock('../src/services/amistadService', () => ({
  enviarSolicitud: jest.fn(), responderSolicitud: jest.fn(), eliminarAmistad: jest.fn(),
  listarSolicitudesRecibidas: jest.fn(),
}));
jest.mock('../src/services/seguimientoService', () => ({
  seguirUsuario: jest.fn(), dejarDeSeguir: jest.fn(),
}));
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const usuarioService = require('../src/services/usuarioService');
const amistadService = require('../src/services/amistadService');
const seguimientoService = require('../src/services/seguimientoService');

const USUARIO = { id: 1, email: 'ana@ejemplo.com' };

beforeAll(async () => {
  USUARIO.passwordHash = await bcrypt.hash('secreta123', 4);
});

beforeEach(() => jest.resetAllMocks());

async function agenteConSesion() {
  usuarioRepository.buscarPorEmail.mockResolvedValue(USUARIO);
  usuarioRepository.buscarPorId.mockResolvedValue(USUARIO);
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: USUARIO.email, password: 'secreta123' });
  return agente;
}

test.each([
  ['GET', '/api/usuarios?texto=ana'],
  ['POST', '/api/amistades'],
  ['GET', '/api/amistades/solicitudes'],
  ['PATCH', '/api/amistades/10'],
  ['DELETE', '/api/amistades/10'],
  ['POST', '/api/seguimientos'],
  ['DELETE', '/api/seguimientos/2'],
])('sin sesión, %s %s responde 401', async (metodo, ruta) => {
  const res = await request(app)[metodo.toLowerCase()](ruta);
  expect(res.status).toBe(401);
});

test('con sesión, la búsqueda delega el texto al servicio', async () => {
  const agente = await agenteConSesion();
  usuarioService.buscarUsuarios.mockResolvedValue([{ id: 2, nombreUsuario: 'ana2' }]);

  const res = await agente.get('/api/usuarios?texto=ana');

  expect(res.status).toBe(200);
  expect(res.body).toEqual([{ id: 2, nombreUsuario: 'ana2' }]);
  expect(usuarioService.buscarUsuarios).toHaveBeenCalledWith(1, 'ana');
});

test('con sesión, las rutas de amistad delegan crear, responder y eliminar', async () => {
  const agente = await agenteConSesion();
  amistadService.enviarSolicitud.mockResolvedValue({ id: 10 });
  amistadService.responderSolicitud.mockResolvedValue({ id: 10, estado: 'ACEPTADA' });
  amistadService.listarSolicitudesRecibidas.mockResolvedValue([]);

  expect((await agente.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(201);
  expect((await agente.get('/api/amistades/solicitudes')).status).toBe(200);
  expect((await agente.patch('/api/amistades/10').send({ aceptar: true })).status).toBe(200);
  expect((await agente.delete('/api/amistades/10')).status).toBe(204);
  expect(amistadService.enviarSolicitud).toHaveBeenCalledWith(1, 2);
  expect(amistadService.listarSolicitudesRecibidas).toHaveBeenCalledWith(1);
  expect(amistadService.responderSolicitud).toHaveBeenCalledWith(1, 10, true);
  expect(amistadService.eliminarAmistad).toHaveBeenCalledWith(1, 10);
});

test('con sesión, las rutas de seguimiento delegan seguir y dejar de seguir', async () => {
  const agente = await agenteConSesion();
  seguimientoService.seguirUsuario.mockResolvedValue({ id: 10 });

  expect((await agente.post('/api/seguimientos').send({ seguidoId: 2 })).status).toBe(201);
  expect((await agente.delete('/api/seguimientos/2')).status).toBe(204);
  expect(seguimientoService.seguirUsuario).toHaveBeenCalledWith(1, 2);
  expect(seguimientoService.dejarDeSeguir).toHaveBeenCalledWith(1, 2);
});
