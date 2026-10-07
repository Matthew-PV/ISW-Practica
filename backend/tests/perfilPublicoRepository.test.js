// CS-62, objetivo 1: el repositorio devuelve el perfil público de un usuario sin su email.
jest.mock('../src/repositories/shared/prisma', () => ({
  usuario: { findUnique: jest.fn() },
}));

const prisma = require('../src/repositories/shared/prisma');
const usuarioRepository = require('../src/repositories/usuarioRepository');

beforeEach(() => jest.resetAllMocks());

test('busca por nombre de usuario y pide solo los campos públicos, sin email', async () => {
  prisma.usuario.findUnique.mockResolvedValue({ id: 2, nombreUsuario: 'ana', foto: null, ciudad: 'Madrid' });

  const perfil = await usuarioRepository.obtenerPerfilPublico('ana');

  expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
    where: { nombreUsuario: 'ana' },
    select: { id: true, nombreUsuario: true, foto: true, ciudad: true },
  });
  expect(perfil).toEqual({ id: 2, nombreUsuario: 'ana', foto: null, ciudad: 'Madrid' });
});

test('devuelve null si el usuario no existe', async () => {
  prisma.usuario.findUnique.mockResolvedValue(null);

  expect(await usuarioRepository.obtenerPerfilPublico('nadie')).toBeNull();
});
