// CS-61, objetivo 6: reglas para enviar solicitudes de amistad.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/amistadRepository', () => ({
  buscarEntreUsuarios: jest.fn(), buscarPorId: jest.fn(), crear: jest.fn(),
  aceptar: jest.fn(), borrar: jest.fn(), listarSolicitudesRecibidas: jest.fn(),
}));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const { enviarSolicitud, responderSolicitud, eliminarAmistad, sonAmigos, listarSolicitudesRecibidas } = require('../src/services/amistadService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 || id === 3 ? { id } : null));
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

const SOLICITUD = { id: 10, solicitanteId: 1, destinatarioId: 2, estado: 'PENDIENTE' };
const AMISTAD = { ...SOLICITUD, estado: 'ACEPTADA' };

test('el destinatario puede aceptar una solicitud pendiente', async () => {
  amistadRepository.buscarPorId.mockResolvedValue(SOLICITUD);
  amistadRepository.aceptar.mockResolvedValue(AMISTAD);

  await expect(responderSolicitud(2, 10, true)).resolves.toEqual(AMISTAD);
  expect(amistadRepository.aceptar).toHaveBeenCalledWith(10);
});

test('el destinatario puede rechazar una solicitud pendiente', async () => {
  amistadRepository.buscarPorId.mockResolvedValue(SOLICITUD);
  amistadRepository.borrar.mockResolvedValue(SOLICITUD);

  await expect(responderSolicitud(2, 10, false)).resolves.toEqual(SOLICITUD);
  expect(amistadRepository.borrar).toHaveBeenCalledWith(10);
});

test('nadie salvo el destinatario puede responder una solicitud', async () => {
  amistadRepository.buscarPorId.mockResolvedValue(SOLICITUD);

  await expect(responderSolicitud(1, 10, true)).rejects.toMatchObject({ status: 403 });
  expect(amistadRepository.aceptar).not.toHaveBeenCalled();
  expect(amistadRepository.borrar).not.toHaveBeenCalled();
});

test('no permite responder una relación que ya no está pendiente', async () => {
  amistadRepository.buscarPorId.mockResolvedValue(AMISTAD);

  await expect(responderSolicitud(2, 10, true)).rejects.toMatchObject({ status: 400 });
  expect(amistadRepository.aceptar).not.toHaveBeenCalled();
});

test.each([1, 2])('cualquiera de los participantes puede eliminar una amistad', async (usuarioId) => {
  amistadRepository.buscarPorId.mockResolvedValue(AMISTAD);
  amistadRepository.borrar.mockResolvedValue(AMISTAD);

  await expect(eliminarAmistad(usuarioId, 10)).resolves.toEqual(AMISTAD);
  expect(amistadRepository.borrar).toHaveBeenCalledWith(10);
});

test('un tercero no puede eliminar una amistad', async () => {
  amistadRepository.buscarPorId.mockResolvedValue(AMISTAD);

  await expect(eliminarAmistad(3, 10)).rejects.toMatchObject({ status: 403 });
  expect(amistadRepository.borrar).not.toHaveBeenCalled();
});

test.each([
  ['una amistad aceptada', { ...AMISTAD }, true],
  ['una solicitud pendiente', { ...SOLICITUD }, false],
  ['ninguna relación', null, false],
])('sonAmigos devuelve %s solo cuando la relación está aceptada', async (_, relacion, esperado) => {
  amistadRepository.buscarEntreUsuarios.mockResolvedValue(relacion);

  await expect(sonAmigos(1, 2)).resolves.toBe(esperado);
  expect(amistadRepository.buscarEntreUsuarios).toHaveBeenCalledWith(1, 2);
});

test('lista las solicitudes recibidas por el usuario de la sesión', async () => {
  amistadRepository.listarSolicitudesRecibidas.mockResolvedValue([]);

  await expect(listarSolicitudesRecibidas(2)).resolves.toEqual([]);
  expect(amistadRepository.listarSolicitudesRecibidas).toHaveBeenCalledWith(2);
});
