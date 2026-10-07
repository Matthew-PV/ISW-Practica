// CS-62, objetivo 2: contadores de amigos y de seguidores en los repositorios.
jest.mock('../src/repositories/shared/prisma', () => ({
  amistad: { count: jest.fn() },
  seguimiento: { count: jest.fn() },
}));

const prisma = require('../src/repositories/shared/prisma');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');

beforeEach(() => jest.resetAllMocks());

test('contarAmigos cuenta solo las amistades aceptadas del usuario, en cualquier sentido', async () => {
  prisma.amistad.count.mockResolvedValue(3);

  const total = await amistadRepository.contarAmigos(7);

  expect(prisma.amistad.count).toHaveBeenCalledWith({
    where: {
      estado: 'ACEPTADA',
      OR: [{ solicitanteId: 7 }, { destinatarioId: 7 }],
    },
  });
  expect(total).toBe(3);
});

test('contarSeguidores cuenta los seguimientos que apuntan al usuario', async () => {
  prisma.seguimiento.count.mockResolvedValue(5);

  const total = await seguimientoRepository.contarSeguidores(7);

  expect(prisma.seguimiento.count).toHaveBeenCalledWith({ where: { seguidoId: 7 } });
  expect(total).toBe(5);
});
