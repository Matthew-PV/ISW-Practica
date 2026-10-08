// CS-44: reglas del servicio que lista las experiencias de un autor. Los repositorios y la
// amistad se simulan; el filtro real y el cursor se prueban con MySQL (tests/mysql/experienciasAutor).
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/experienciaRepository');
jest.mock('../../src/services/amistadService', () => ({ sonAmigos: jest.fn() }));

const usuarioRepository = require('../../src/repositories/usuarioRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');
const amistadService = require('../../src/services/amistadService');
const { listarDeAutor } = require('../../src/services/experienciaService');

const AUTOR = { id: 2, nombreUsuario: 'bea', foto: null, ciudad: null };

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 ? { id } : null));
  usuarioRepository.obtenerPerfilPublico.mockImplementation(async (nombre) => (nombre === 'bea' ? AUTOR : null));
  amistadService.sonAmigos.mockResolvedValue(false);
  experienciaRepository.listarDeAutor.mockResolvedValue([]);
});

test('pide al repositorio solo los niveles visibles, una fila de más y desde el cursor', async () => {
  amistadService.sonAmigos.mockResolvedValue(true);

  await listarDeAutor(1, 'bea', { despuesDe: '30', limite: '5' });

  expect(experienciaRepository.listarDeAutor).toHaveBeenCalledWith(2, ['AMIGOS', 'PUBLICA'], 30, 6);
});

test('devuelve la página y el cursor de la siguiente', async () => {
  experienciaRepository.listarDeAutor.mockResolvedValue([{ id: 9 }, { id: 8 }, { id: 7 }]);

  await expect(listarDeAutor(1, 'bea', { limite: '2' })).resolves.toEqual({
    experiencias: [{ id: 9 }, { id: 8 }], siguiente: 8,
  });
});


test.each([['', 'vacío'], [undefined, 'ausente'], [['bea', 'ana'], 'repetido en la URL']])(
  'un autor %p (%s) responde 400 sin consultar la base de datos', async (autor) => {
    await expect(listarDeAutor(1, autor, {})).rejects.toMatchObject({
      status: 400, message: 'Indica el nombre de usuario del autor',
    });
    expect(usuarioRepository.obtenerPerfilPublico).not.toHaveBeenCalled();
  }
);

test('una paginación no válida responde 400 sin consultar la base de datos', async () => {
  await expect(listarDeAutor(1, 'bea', { limite: '51' })).rejects.toMatchObject({ status: 400 });
  expect(usuarioRepository.obtenerPerfilPublico).not.toHaveBeenCalled();
});

test('un autor que no existe responde 404', async () => {
  await expect(listarDeAutor(1, 'nadie', {})).rejects.toMatchObject({ status: 404, message: 'Usuario no encontrado' });
});
