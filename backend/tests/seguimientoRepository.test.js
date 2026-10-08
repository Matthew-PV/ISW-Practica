// CS-61, objetivo 4: contrato de acceso a la tabla Seguimiento.
jest.mock('../src/repositories/shared/prisma', () => ({
  seguimiento: {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require('../src/repositories/shared/prisma');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');

beforeEach(() => jest.resetAllMocks());

test('crea un seguimiento', async () => {
  prisma.seguimiento.create.mockResolvedValue({ id: 10 });

  await seguimientoRepository.seguir(1, 2);

  expect(prisma.seguimiento.create).toHaveBeenCalledWith({
    data: { seguidorId: 1, seguidoId: 2 },
  });
});

test('elimina un seguimiento por su pareja de usuarios', async () => {
  prisma.seguimiento.delete.mockResolvedValue({ id: 10 });

  await seguimientoRepository.dejarDeSeguir(1, 2);

  expect(prisma.seguimiento.delete).toHaveBeenCalledWith({
    where: { seguidorId_seguidoId: { seguidorId: 1, seguidoId: 2 } },
  });
});

test('indica si un usuario sigue a otro', async () => {
  prisma.seguimiento.findUnique.mockResolvedValue({ id: 10 });

  await expect(seguimientoRepository.sigueA(1, 2)).resolves.toBe(true);
  expect(prisma.seguimiento.findUnique).toHaveBeenCalledWith({
    where: { seguidorId_seguidoId: { seguidorId: 1, seguidoId: 2 } },
  });
});

test('indica que no hay seguimiento cuando no existe el registro', async () => {
  prisma.seguimiento.findUnique.mockResolvedValue(null);

  await expect(seguimientoRepository.sigueA(1, 2)).resolves.toBe(false);
});
