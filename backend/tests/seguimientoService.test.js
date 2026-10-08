// CS-61, objetivo 8: reglas de negocio de seguir y dejar de seguir.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/seguimientoRepository', () => ({
  seguir: jest.fn(), dejarDeSeguir: jest.fn(), sigueA: jest.fn(),
}));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');
const { seguirUsuario, dejarDeSeguir } = require('../src/services/seguimientoService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 ? { id } : null));
  seguimientoRepository.sigueA.mockResolvedValue(false);
});

test('crea un seguimiento entre dos usuarios distintos', async () => {
  seguimientoRepository.seguir.mockResolvedValue({ id: 10, seguidorId: 1, seguidoId: 2 });

  await expect(seguirUsuario(1, 2)).resolves.toMatchObject({ id: 10 });
  expect(seguimientoRepository.seguir).toHaveBeenCalledWith(1, 2);
});

test('rechaza seguirse a uno mismo', async () => {
  await expect(seguirUsuario(1, 1)).rejects.toMatchObject({ status: 400 });
  expect(seguimientoRepository.seguir).not.toHaveBeenCalled();
});

test('rechaza seguir a un usuario inexistente', async () => {
  await expect(seguirUsuario(1, 99)).rejects.toMatchObject({ status: 404 });
  expect(seguimientoRepository.seguir).not.toHaveBeenCalled();
});

test('rechaza repetir un seguimiento existente', async () => {
  seguimientoRepository.sigueA.mockResolvedValue(true);

  await expect(seguirUsuario(1, 2)).rejects.toMatchObject({ status: 400 });
  expect(seguimientoRepository.seguir).not.toHaveBeenCalled();
});

test('elimina un seguimiento existente', async () => {
  seguimientoRepository.sigueA.mockResolvedValue(true);
  seguimientoRepository.dejarDeSeguir.mockResolvedValue({ id: 10 });

  await expect(dejarDeSeguir(1, 2)).resolves.toMatchObject({ id: 10 });
  expect(seguimientoRepository.dejarDeSeguir).toHaveBeenCalledWith(1, 2);
});

test('rechaza dejar de seguir si no existe la relación', async () => {
  await expect(dejarDeSeguir(1, 2)).rejects.toMatchObject({ status: 404 });
  expect(seguimientoRepository.dejarDeSeguir).not.toHaveBeenCalled();
});

// Peticiones simultáneas: el repositorio devuelve null cuando otra petición se adelantó.
test('si otra petición crea antes el mismo seguimiento, responde 400', async () => {
  seguimientoRepository.seguir.mockResolvedValue(null);

  await expect(seguirUsuario(1, 2)).rejects.toMatchObject({ status: 400, message: 'Ya sigues a este usuario' });
});

test('si el seguimiento desaparece mientras se deja de seguir, responde 404', async () => {
  seguimientoRepository.sigueA.mockResolvedValue(true);
  seguimientoRepository.dejarDeSeguir.mockResolvedValue(null);

  await expect(dejarDeSeguir(1, 2)).rejects.toMatchObject({ status: 404, message: 'No sigues a este usuario' });
});
