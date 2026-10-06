// CS-62, objetivo 2: servicio del perfil público (datos, contadores y relación con quien consulta).
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/amistadRepository');
jest.mock('../src/repositories/seguimientoRepository');

const usuarioRepository = require('../src/repositories/usuarioRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');
const { obtenerPerfilPublico, FOTO_POR_DEFECTO } = require('../src/services/perfilService');

const ANA = { id: 2, nombreUsuario: 'ana', foto: 'https://res.cloudinary.com/demo/ana.png', ciudad: 'Madrid' };

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.obtenerPerfilPublico.mockResolvedValue(ANA);
  amistadRepository.contarAmigos.mockResolvedValue(3);
  seguimientoRepository.contarSeguidores.mockResolvedValue(5);
  amistadRepository.buscarEntreUsuarios.mockResolvedValue(null);
  seguimientoRepository.sigueA.mockResolvedValue(false);
});

test('devuelve los datos públicos y los contadores, sin email', async () => {
  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(usuarioRepository.obtenerPerfilPublico).toHaveBeenCalledWith('ana');
  expect(amistadRepository.contarAmigos).toHaveBeenCalledWith(2);
  expect(seguimientoRepository.contarSeguidores).toHaveBeenCalledWith(2);
  expect(perfil).toEqual({
    id: 2, nombreUsuario: 'ana', foto: ANA.foto, ciudad: 'Madrid',
    amigos: 3, seguidores: 5, esPropio: false,
    relacion: { amistad: 'ninguna', amistadId: null, siguiendo: false },
  });
  expect(perfil).not.toHaveProperty('email');
});

test('muestra la imagen por defecto si no tiene foto', async () => {
  usuarioRepository.obtenerPerfilPublico.mockResolvedValue({ ...ANA, foto: null });

  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(perfil.foto).toBe(FOTO_POR_DEFECTO);
});

test('relación «enviada»: yo le envié una solicitud pendiente', async () => {
  amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, solicitanteId: 1, destinatarioId: 2, estado: 'PENDIENTE' });

  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(amistadRepository.buscarEntreUsuarios).toHaveBeenCalledWith(1, 2);
  expect(perfil.relacion).toEqual({ amistad: 'enviada', amistadId: 10, siguiendo: false });
});

test('relación «recibida»: ella me envió una solicitud pendiente', async () => {
  amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, solicitanteId: 2, destinatarioId: 1, estado: 'PENDIENTE' });

  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(perfil.relacion).toEqual({ amistad: 'recibida', amistadId: 10, siguiendo: false });
});

test('relación «amigos»: la amistad está aceptada', async () => {
  amistadRepository.buscarEntreUsuarios.mockResolvedValue({ id: 10, solicitanteId: 2, destinatarioId: 1, estado: 'ACEPTADA' });

  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(perfil.relacion).toEqual({ amistad: 'amigos', amistadId: 10, siguiendo: false });
});

test('indica si la sigo', async () => {
  seguimientoRepository.sigueA.mockResolvedValue(true);

  const perfil = await obtenerPerfilPublico(1, 'ana');

  expect(seguimientoRepository.sigueA).toHaveBeenCalledWith(1, 2);
  expect(perfil.relacion.siguiendo).toBe(true);
});

test('esPropio es true cuando consulto mi propio perfil', async () => {
  const perfil = await obtenerPerfilPublico(2, 'ana');

  expect(perfil.esPropio).toBe(true);
});

test('si el usuario no existe lanza un error 404', async () => {
  usuarioRepository.obtenerPerfilPublico.mockResolvedValue(null);

  await expect(obtenerPerfilPublico(1, 'nadie')).rejects.toMatchObject({
    status: 404,
    message: 'Usuario no encontrado',
  });
});
