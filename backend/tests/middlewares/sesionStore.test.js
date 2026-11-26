// El almacén de sesiones distingue «no hay sesión» (401) de «la base ha fallado» (500).
jest.mock('../../src/repositories/shared/prisma', () => ({
  session: { findUnique: jest.fn(), findMany: jest.fn(async () => []), delete: jest.fn(), deleteMany: jest.fn(), update: jest.fn() },
  $connect: jest.fn(async () => {}),
  $disconnect: jest.fn(async () => {}),
}));

const prisma = require('../../src/repositories/shared/prisma');
const store = jest.requireActual('../../src/repositories/shared/sesionStore');

const leer = () => new Promise((resolver) => store.get('abc', (err, sesion) => resolver({ err, sesion })));
const MANANA = new Date(Date.now() + 86400000);

beforeEach(() => jest.clearAllMocks());
afterAll(() => store.shutdown?.());

test('devuelve la sesión guardada', async () => {
  prisma.session.findUnique.mockResolvedValue({ sid: 'abc', data: '{"usuarioId":7}', expiresAt: MANANA });
  expect(await leer()).toEqual({ err: null, sesion: { usuarioId: 7 } });
});

test('si no existe, no hay sesión ni error', async () => {
  prisma.session.findUnique.mockResolvedValue(null);
  expect(await leer()).toEqual({ err: undefined, sesion: undefined });
});

test('si la base falla, propaga el error en vez de responder «sin sesión»', async () => {
  const fallo = new Error('sin conexión');
  prisma.session.findUnique.mockRejectedValue(fallo);
  expect((await leer()).err).toBe(fallo);
});

test('una sesión caducada se borra sin fallar aunque otra petición ya la haya borrado', async () => {
  prisma.session.findUnique.mockResolvedValue({ sid: 'abc', data: '{}', expiresAt: new Date(0) });
  prisma.session.deleteMany.mockResolvedValue({ count: 0 });
  expect(await leer()).toEqual({ err: undefined, sesion: undefined });
  expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { sid: 'abc' } });
});

test('la caducidad se renueva como mucho una vez cada 10 minutos', async () => {
  prisma.session.findUnique.mockResolvedValue({ sid: 'xyz', data: '{}', expiresAt: MANANA });
  const tocar = () => new Promise((resolver) => store.touch('xyz', { cookie: {} }, resolver));

  await tocar();
  await tocar();

  expect(prisma.session.update).toHaveBeenCalledTimes(1);
});
