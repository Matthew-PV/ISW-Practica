// CS-61, objetivo 6: reglas para enviar solicitudes de amistad.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/amistadRepository', () => ({
  buscarEntreUsuarios: jest.fn(), crear: jest.fn(),
}));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const { enviarSolicitud } = require('../src/services/amistadService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 ? { id } : null));
  amistadRepository.buscarEntreUsuarios.mockResolvedValue(null);
});

test('crea una solicitud si ambos usuarios existen y no tienen relación previa', async () => {
  amistadRepository.crear.mockResolvedValue({ id: 10, solicitanteId: 1, destinatarioId: 2, estado: 'PENDIENTE' });

  await expect(enviarSolicitud(1, 2)).resolves.toMatchObject({ id: 10, estado: 'PENDIENTE' });
  expect(amistadRepository.crear).toHaveBeenCalledWith(1, 2);
});

test('rechaza una sesión que ya no pertenece a un usuario', async () => {
  await expect(enviarSolicitud(99, 2)).rejects.toMatchObject({ status: 401 });
  expect(amistadRepository.crear).not.toHaveBeenCalled();
});

test('rechaza una solicitud a un usuario inexistente', async () => {
  await expect(enviarSolicitud(1, 99)).rejects.toMatchObject({ status: 404 });
  expect(amistadRepository.crear).not.toHaveBeenCalled();
});

test('rechaza enviarse una solicitud a sí mismo', async () => {
  await expect(enviarSolicitud(1, 1)).rejects.toMatchObject({ status: 400 });
  expect(amistadRepository.crear).not.toHaveBeenCalled();
});

test.each(['PENDIENTE', 'ACEPTADA'])('rechaza una relación previa en estado %s, incluso en el otro sentido', async (estado) => {
  amistadRepository.buscarEntreUsuarios.mockResolvedValue({
    solicitanteId: 2, destinatarioId: 1, estado,
  });

  await expect(enviarSolicitud(1, 2)).rejects.toMatchObject({ status: 400 });
  expect(amistadRepository.crear).not.toHaveBeenCalled();
});
