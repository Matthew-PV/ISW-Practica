// requiereSesion (middlewares/sesionMiddleware.js): sin sesión, o con una sesión cuyo usuario ya
// no existe (por ejemplo, porque se vació la base de datos), ninguna ruta protegida llega a su
// servicio y todas responden 401. La comprobación se hace aquí, una sola vez, y no en cada servicio.
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');

const RUTAS_PROTEGIDAS = [
  ['get', '/api/auth/yo'],
  ['get', '/api/perfil'],
  ['get', '/api/perfil/resumen'],
  ['get', '/api/perfil/amigos'],
  ['get', '/api/perfil/seguidores'],
  ['get', '/api/usuarios?texto=ana'],
  ['get', '/api/amistades/solicitudes'],
  ['post', '/api/amistades'],
  ['post', '/api/seguimientos'],
  ['get', '/api/experiencias?autor=ana'],
  ['get', '/api/experiencias/1'],
  ['post', '/api/experiencias'],
  ['get', '/api/experiencias/1/valoraciones'],
  ['put', '/api/experiencias/1/valoracion'],
];

let usuario;

beforeAll(async () => {
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('Secreta123', 4) };
});

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
});

test.each(RUTAS_PROTEGIDAS)('sin sesión, %s %s responde 401', async (metodo, ruta) => {
  expect((await request(app)[metodo](ruta)).status).toBe(401);
});

test.each(RUTAS_PROTEGIDAS)('con la sesión de un usuario que ya no existe, %s %s responde 401', async (metodo, ruta) => {
  const agente = request.agent(app);
  expect((await agente.post('/api/auth/login').send({ email: usuario.email, password: 'Secreta123' })).status).toBe(200);
  usuarioRepository.buscarPorId.mockResolvedValue(null); // el usuario se borra después de iniciar sesión

  const res = await agente[metodo](ruta);

  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'No hay sesión iniciada' });
});
