// CS-61, objetivo 10: búsqueda de usuarios por una parte de su nombre.
jest.mock('../../src/repositories/usuarioRepository', () => ({ buscarPorNombre: jest.fn() }));
jest.mock('../../src/repositories/amistadRepository', () => ({ listarEntreUsuarios: jest.fn() }));
jest.mock('../../src/repositories/seguimientoRepository', () => ({ filtrarSeguidos: jest.fn() }));

const usuarioRepository = require('../../src/repositories/usuarioRepository');
const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');
const { buscarUsuarios } = require('../../src/services/usuarioService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorNombre.mockResolvedValue([]);
  amistadRepository.listarEntreUsuarios.mockResolvedValue([]);
  seguimientoRepository.filtrarSeguidos.mockResolvedValue([]);
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

// B3: cada resultado trae su ciudad y la relación de quien busca con él, pedida en bloque
test('cada resultado incluye ciudad y relación con quien busca', async () => {
  usuarioRepository.buscarPorNombre.mockResolvedValue([
    { id: 2, nombreUsuario: 'ana', foto: null, ciudad: 'Madrid' },
    { id: 3, nombreUsuario: 'ana2', foto: null, ciudad: null },
    { id: 4, nombreUsuario: 'ana3', foto: null, ciudad: 'Lugo' },
    { id: 5, nombreUsuario: 'ana4', foto: null, ciudad: null },
  ]);
  amistadRepository.listarEntreUsuarios.mockResolvedValue([
    { id: 10, solicitanteId: 1, destinatarioId: 2, estado: 'ACEPTADA' },
    { id: 11, solicitanteId: 1, destinatarioId: 3, estado: 'PENDIENTE' },
    { id: 12, solicitanteId: 4, destinatarioId: 1, estado: 'PENDIENTE' },
  ]);
  seguimientoRepository.filtrarSeguidos.mockResolvedValue([3]);

  const resultado = await buscarUsuarios(1, 'ana');

  expect(amistadRepository.listarEntreUsuarios).toHaveBeenCalledWith(1, [2, 3, 4, 5]);
  expect(seguimientoRepository.filtrarSeguidos).toHaveBeenCalledWith(1, [2, 3, 4, 5]);
  expect(resultado.map((u) => [u.ciudad, u.relacion])).toEqual([
    ['Madrid', { amistad: 'amigos', amistadId: 10, siguiendo: false }],
    [null, { amistad: 'enviada', amistadId: 11, siguiendo: true }],
    ['Lugo', { amistad: 'recibida', amistadId: 12, siguiendo: false }],
    [null, { amistad: 'ninguna', amistadId: null, siguiendo: false }],
  ]);
});

test('sin resultados no consulta amistades ni seguimientos', async () => {
  await expect(buscarUsuarios(1, 'zzz')).resolves.toEqual([]);
  expect(amistadRepository.listarEntreUsuarios).not.toHaveBeenCalled();
  expect(seguimientoRepository.filtrarSeguidos).not.toHaveBeenCalled();
});
