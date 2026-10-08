// CS-61, objetivo 10: búsqueda de usuarios por una parte de su nombre.
jest.mock('../../src/repositories/usuarioRepository', () => ({ buscarPorNombre: jest.fn() }));

const usuarioRepository = require('../../src/repositories/usuarioRepository');
const { buscarUsuarios } = require('../../src/services/usuarioService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorNombre.mockResolvedValue([]);
});

test('busca el texto sin los espacios de los extremos y excluye al usuario de la sesión', async () => {
  await buscarUsuarios(1, '  ana ');

  expect(usuarioRepository.buscarPorNombre).toHaveBeenCalledWith('ana', 1);
});

test.each([['vacío', ''], ['solo con espacios', '   '], ['que no es texto', ['a', 'b']], ['ausente', undefined]])(
  'un texto %s responde 400 sin consultar la base de datos',
  async (_descripcion, texto) => {
    await expect(buscarUsuarios(1, texto)).rejects.toMatchObject({
      status: 400, message: 'Escribe un nombre de usuario para buscar',
    });
    expect(usuarioRepository.buscarPorNombre).not.toHaveBeenCalled();
  }
);
