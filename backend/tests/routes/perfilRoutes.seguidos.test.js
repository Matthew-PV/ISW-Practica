// CS-72, objetivo 1: ruta GET /api/perfil/seguidos (personas a las que sigue el usuario de la sesión).
jest.mock('../../src/services/perfilService', () => ({
  listarSeguidosPropios: jest.fn(),
}));
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const perfilService = require('../../src/services/perfilService');
const { crearError } = require('../../src/errores');

const USUARIO = { id: 1, email: 'luis@ejemplo.com' };
const ANA = { id: 2, nombreUsuario: 'ana', foto: '/img/foto-por-defecto.svg' };
const PAGINA = { personas: [ANA], siguiente: 11 };

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

test('sin sesión responde 401 y no consulta a quién sigue nadie', async () => {
  const res = await request(app).get('/api/perfil/seguidos');

  expect(res.status).toBe(401);
  expect(perfilService.listarSeguidosPropios).not.toHaveBeenCalled();
});

test('las personas que sigo se piden con el cursor y el límite de la dirección', async () => {
  perfilService.listarSeguidosPropios.mockResolvedValue(PAGINA);
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/seguidos?despuesDe=57&limite=10');

  expect(res.status).toBe(200);
  expect(res.body).toEqual(PAGINA);
  expect(perfilService.listarSeguidosPropios).toHaveBeenCalledWith(1, { despuesDe: '57', limite: '10' });
});

test('si la paginación no es válida responde 400 con el mensaje del servicio', async () => {
  perfilService.listarSeguidosPropios.mockRejectedValue(crearError('La paginación no es válida', 400));
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/seguidos?despuesDe=0');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: 'La paginación no es válida' });
});