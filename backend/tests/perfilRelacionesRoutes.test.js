// CS-45, objetivos 1 y 5: rutas GET /api/perfil/resumen, /amigos y /seguidores (perfil propio).
jest.mock('../src/services/perfilService', () => ({
  obtenerResumenRelaciones: jest.fn(),
  listarAmigosPropios: jest.fn(),
  listarSeguidoresPropios: jest.fn(),
}));
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const perfilService = require('../src/services/perfilService');
const { crearError } = require('../src/errores');

const USUARIO = { id: 1, email: 'luis@ejemplo.com' };
const ANA = { id: 2, nombreUsuario: 'ana', foto: '/img/foto-por-defecto.svg' };
const PAGINA_AMIGOS = { pagina: 2, limite: 10, total: 11, personas: [ANA] };
const PAGINA_SEGUIDORES = { pagina: 1, limite: 20, total: 1, personas: [ANA] };

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
  '/api/perfil/resumen',
  '/api/perfil/amigos',
  '/api/perfil/seguidores',
])('sin sesión, %s responde 401', async (ruta) => {
  const res = await request(app).get(ruta);

  expect(res.status).toBe(401);
  expect(perfilService.obtenerResumenRelaciones).not.toHaveBeenCalled();
  expect(perfilService.listarAmigosPropios).not.toHaveBeenCalled();
  expect(perfilService.listarSeguidoresPropios).not.toHaveBeenCalled();
});

test('el resumen devuelve los contadores del usuario de la sesión', async () => {
  perfilService.obtenerResumenRelaciones.mockResolvedValue({ amigos: 2, seguidores: 5 });
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/resumen');

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ amigos: 2, seguidores: 5 });
  expect(perfilService.obtenerResumenRelaciones).toHaveBeenCalledWith(1);
});

test('los amigos se piden con la página y el límite de la dirección', async () => {
  perfilService.listarAmigosPropios.mockResolvedValue(PAGINA_AMIGOS);
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/amigos?pagina=2&limite=10');

  expect(res.status).toBe(200);
  expect(res.body).toEqual(PAGINA_AMIGOS);
  expect(perfilService.listarAmigosPropios).toHaveBeenCalledWith(1, '2', '10');
});

test('sin página ni límite, el servicio decide los valores por defecto', async () => {
  perfilService.listarAmigosPropios.mockResolvedValue(PAGINA_AMIGOS);
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/amigos');

  expect(res.status).toBe(200);
  expect(perfilService.listarAmigosPropios).toHaveBeenCalledWith(1, undefined, undefined);
});

test('los seguidores se piden con la página y el límite de la dirección', async () => {
  perfilService.listarSeguidoresPropios.mockResolvedValue(PAGINA_SEGUIDORES);
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/seguidores?pagina=1&limite=20');

  expect(res.status).toBe(200);
  expect(res.body).toEqual(PAGINA_SEGUIDORES);
  expect(perfilService.listarSeguidoresPropios).toHaveBeenCalledWith(1, '1', '20');
});

test('si la paginación no es válida responde 400 con el mensaje del servicio', async () => {
  perfilService.listarAmigosPropios.mockRejectedValue(
    crearError('La página debe ser un número entero mayor que 0', 400)
  );
  const agente = await agenteConSesion();

  const res = await agente.get('/api/perfil/amigos?pagina=0');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: 'La página debe ser un número entero mayor que 0' });
});