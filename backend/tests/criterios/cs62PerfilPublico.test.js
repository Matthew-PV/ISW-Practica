// CS-62, objetivo 4: criterio de validación del perfil de otro usuario por HTTP (GET /api/usuarios/:nombreUsuario).
// La ruta y el servicio son los reales; se simulan solo los repositorios (MySQL).
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/amistadRepository');
jest.mock('../../src/repositories/seguimientoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');
const { FOTO_POR_DEFECTO } = require('../../src/services/shared/fotoPorDefecto');

const YO = { id: 1, nombreUsuario: 'luis', email: 'luis@ejemplo.com' };
const ANA = { id: 2, nombreUsuario: 'ana', foto: null, ciudad: 'Madrid' };

beforeAll(async () => {
  YO.passwordHash = await bcrypt.hash('secreta123', 4);
});

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue(YO);
  usuarioRepository.buscarPorId.mockResolvedValue(YO);
  // Como MySQL: solo existe «ana»; cualquier otro nombre devuelve null
  usuarioRepository.obtenerPerfilPublico.mockImplementation(async (nombre) => (nombre === 'ana' ? { ...ANA } : null));
  amistadRepository.contarAmigos.mockResolvedValue(3);
  seguimientoRepository.contarSeguidores.mockResolvedValue(5);
  // Por defecto no hay relación alguna entre los dos
  amistadRepository.buscarEntreUsuarios.mockResolvedValue(null);
  seguimientoRepository.sigueA.mockResolvedValue(false);
});

async function agenteConSesion() {
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: YO.email, password: 'secreta123' });
  return agente;
}

test('sin sesión responde 401 y no consulta ningún dato', async () => {
  const res = await request(app).get('/api/usuarios/ana');

  expect(res.status).toBe(401);
  expect(usuarioRepository.obtenerPerfilPublico).not.toHaveBeenCalled();
});

test('muestra nombre, foto por defecto, ciudad y contadores, y nunca el email', async () => {
  const agente = await agenteConSesion();

  const res = await agente.get('/api/usuarios/ana');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    id: 2, nombreUsuario: 'ana', foto: FOTO_POR_DEFECTO, ciudad: 'Madrid',
    amigos: 3, seguidores: 5, esPropio: false,
    relacion: { amistad: 'ninguna', amistadId: null, siguiendo: false },
  });
  expect(res.body).not.toHaveProperty('email');
  expect(JSON.stringify(res.body)).not.toContain('@');
});

test('un usuario que no existe responde 404 «Usuario no encontrado»', async () => {
  const agente = await agenteConSesion();

  const res = await agente.get('/api/usuarios/nadie');

  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: 'Usuario no encontrado' });
});

test('al consultar mi propio nombre, aunque sea con otras mayúsculas, el perfil se marca como propio', async () => {
  usuarioRepository.obtenerPerfilPublico.mockResolvedValue({ id: 1, nombreUsuario: 'luis', foto: null, ciudad: null });
  const agente = await agenteConSesion();

  const res = await agente.get('/api/usuarios/LUIS');

  expect(res.status).toBe(200);
  expect(res.body.esPropio).toBe(true);
});

describe('relación con quien consulta', () => {
  test('ninguna: no hay solicitud ni amistad, y no la sigo', async () => {
    const agente = await agenteConSesion();

    const res = await agente.get('/api/usuarios/ana');

    expect(res.body.relacion).toEqual({ amistad: 'ninguna', amistadId: null, siguiendo: false });
  });

  test('enviada: le envié una solicitud que sigue pendiente', async () => {
    amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, solicitanteId: 1, destinatarioId: 2, estado: 'PENDIENTE' });
    const agente = await agenteConSesion();

    const res = await agente.get('/api/usuarios/ana');

    expect(res.body.relacion).toEqual({ amistad: 'enviada', amistadId: 10, siguiendo: false });
  });

  test('recibida: ella me envió una solicitud pendiente', async () => {
    amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, solicitanteId: 2, destinatarioId: 1, estado: 'PENDIENTE' });
    const agente = await agenteConSesion();

    const res = await agente.get('/api/usuarios/ana');

    expect(res.body.relacion).toEqual({ amistad: 'recibida', amistadId: 10, siguiendo: false });
  });

  test.each([
    ['la envié yo', { solicitanteId: 1, destinatarioId: 2 }],
    ['la envió ella', { solicitanteId: 2, destinatarioId: 1 }],
  ])('amigos: la amistad está aceptada (%s)', async (_quien, quien) => {
    amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, ...quien, estado: 'ACEPTADA' });
    const agente = await agenteConSesion();

    const res = await agente.get('/api/usuarios/ana');

    expect(res.body.relacion).toEqual({ amistad: 'amigos', amistadId: 10, siguiendo: false });
  });

  test('siguiendo: la sigo, aunque no seamos amigos', async () => {
    seguimientoRepository.sigueA.mockResolvedValue(true);
    const agente = await agenteConSesion();

    const res = await agente.get('/api/usuarios/ana');

    expect(res.body.relacion).toEqual({ amistad: 'ninguna', amistadId: null, siguiendo: true });
  });
});
