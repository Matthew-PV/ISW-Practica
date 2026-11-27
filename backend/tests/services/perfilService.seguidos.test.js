// CS-72, objetivo 1: el resumen del perfil dice cuántas personas sigue el usuario.
jest.mock('../../src/repositories/amistadRepository', () => ({
  contarAmigos: jest.fn(),
}));
jest.mock('../../src/repositories/seguimientoRepository', () => ({
  contarSeguidores: jest.fn(),
  contarSeguidos: jest.fn(),
}));

const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');
const perfilService = require('../../src/services/perfilService');

describe('CS-72 · resumen del perfil con las personas que sigo', () => {
  beforeEach(() => jest.clearAllMocks());

  test('el resumen incluye cuántas personas sigue el usuario', async () => {
    amistadRepository.contarAmigos.mockResolvedValue(2);
    seguimientoRepository.contarSeguidores.mockResolvedValue(5);
    seguimientoRepository.contarSeguidos.mockResolvedValue(4);

    const resumen = await perfilService.obtenerResumenRelaciones(7);

    expect(resumen).toEqual({ amigos: 2, seguidores: 5, seguidos: 4 });
    expect(seguimientoRepository.contarSeguidos).toHaveBeenCalledWith(7);
  });
});