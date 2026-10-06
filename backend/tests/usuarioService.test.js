// CS-61, objetivo 10: la búsqueda conserva la separación servicio → repositorio.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorNombre: jest.fn() }));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const { buscarUsuarios } = require('../src/services/usuarioService');

test('busca usuarios excluyendo al usuario de la sesión', async () => {
  usuarioRepository.buscarPorNombre.mockResolvedValue([]);

  await buscarUsuarios(1, 'ana');

  expect(usuarioRepository.buscarPorNombre).toHaveBeenCalledWith('ana', 1);
});
