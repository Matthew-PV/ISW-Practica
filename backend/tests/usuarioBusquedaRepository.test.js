// CS-61, objetivo 5: contrato de búsqueda segura de usuarios.
jest.mock('../src/repositories/shared/prisma', () => ({
  usuario: { findMany: jest.fn() },
}));

const prisma = require('../src/repositories/shared/prisma');
const usuarioRepository = require('../src/repositories/usuarioRepository');

beforeEach(() => jest.resetAllMocks());

test('busca usuarios por texto, excluye al solicitante y no devuelve su email', async () => {
  prisma.usuario.findMany.mockResolvedValue([]);

  await usuarioRepository.buscarPorNombre('ana', 7);

  expect(prisma.usuario.findMany).toHaveBeenCalledWith({
    where: {
      nombreUsuario: { contains: 'ana' },
      id: { not: 7 },
    },
    select: { id: true, nombreUsuario: true, foto: true },
    take: 20,
  });
});
