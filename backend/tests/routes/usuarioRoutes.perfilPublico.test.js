// CS-62, objetivo 3: ruta GET /api/usuarios/:nombreUsuario (perfil público de otro usuario).
jest.mock('../../src/services/perfilService', () => ({ obtenerPerfilPublico: jest.fn() }));
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const perfilService = require('../../src/services/perfilService');
const { crearError } = require('../../src/errores');

const USUARIO = { id: 1, email: 'luis@ejemplo.com' };
const PERFIL_ANA = {
  id: 2, nombreUsuario: 'ana', foto: '/img/foto-por-defecto.svg', ciudad: 'Madrid',
  amigos: 3, seguidores: 5, relacion: { amistad: 'ninguna', siguiendo: false },
};

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

test('sin sesión responde 401', async () => {
  const res = await request(app).get('/api/usuarios/ana');

  expect(res.status).toBe(401);
  expect(perfilService.obtenerPerfilPublico).not.toHaveBeenCalled();
});

test('con sesión devuelve el perfil público que entrega el servicio', async () => {
  perfilService.obtenerPerfilPublico.mockResolvedValue(PERFIL_ANA);
  const agente = await agenteConSesion();

  const res = await agente.get('/api/usuarios/ana');

  expect(perfilService.obtenerPerfilPublico).toHaveBeenCalledWith(1, 'ana');
  expect(res.status).toBe(200);
  expect(res.body).toEqual(PERFIL_ANA);
});

test('si el usuario no existe responde 404', async () => {
  perfilService.obtenerPerfilPublico.mockRejectedValue(crearError('Usuario no encontrado', 404));
  const agente = await agenteConSesion();

  const res = await agente.get('/api/usuarios/nadie');

  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: 'Usuario no encontrado' });
});
