// CS-01: reglas de negocio para crear y modificar una valoración.
// Se simulan los repositorios, sin necesitar MySQL.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/experienciaRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/valoracionRepository', () => ({ guardar: jest.fn() }));
jest.mock('../src/services/amistadService', () => ({ sonAmigos: jest.fn() }));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const valoracionRepository = require('../src/repositories/valoracionRepository');
const amistadService = require('../src/services/amistadService');
const { valorarExperiencia } = require('../src/services/valoracionService');

// Experiencia pública de otro autor (id 2): el usuario 1 puede verla y valorarla.
const EXPERIENCIA = { id: 10, autorId: 2, visibilidad: 'PUBLICA' };
// Experiencias de otro autor que el usuario 1 no puede ver (no son amigos)
const PRIVADA = { id: 11, autorId: 2, visibilidad: 'PRIVADA' };
const DE_AMIGOS = { id: 12, autorId: 2, visibilidad: 'AMIGOS' };
const EXPERIENCIAS = { 10: EXPERIENCIA, 11: PRIVADA, 12: DE_AMIGOS };

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 ? { id } : null));
  experienciaRepository.buscarPorId.mockImplementation(async (id) => (EXPERIENCIAS[id] ? { ...EXPERIENCIAS[id] } : null));
  amistadService.sonAmigos.mockResolvedValue(false);
  // Por defecto el repositorio la crea: devuelve la valoración guardada y creada: true
  valoracionRepository.guardar.mockImplementation(async (datos) => ({ valoracion: { id: 50, ...datos }, creada: true }));
});

describe('crear una valoración', () => {
  test('si aún no había valorado la experiencia, se guarda una valoración nueva asociada a ambos', async () => {
    const resultado = await valorarExperiencia(1, 10, { puntuacion: 4, comentario: 'Muy recomendable' });

    expect(resultado.creada).toBe(true);
    expect(resultado.valoracion).toMatchObject({ usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable' });
    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable',
    });
  });

  test('el comentario es opcional: sin él se guarda como null', async () => {
    const resultado = await valorarExperiencia(1, 10, { puntuacion: 3 });

    expect(resultado.creada).toBe(true);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 3, comentario: null,
    });
  });
});

describe('modificar una valoración', () => {
  test('si ya la había valorado, se actualiza la existente con los nuevos datos y no se crea otra', async () => {
    // El repositorio encontró la pareja ya guardada y la actualizó
    valoracionRepository.guardar.mockImplementation(async (datos) => ({ valoracion: { id: 50, ...datos }, creada: false }));

    const resultado = await valorarExperiencia(1, 10, { puntuacion: 2, comentario: 'Ha empeorado' });

    expect(resultado.creada).toBe(false);
    expect(resultado.valoracion).toMatchObject({ id: 50, puntuacion: 2, comentario: 'Ha empeorado' });
    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 2, comentario: 'Ha empeorado',
    });
  });
});

describe('la puntuación es un entero del 1 al 5', () => {
  test.each([1, 5])('acepta los límites del rango (%p)', async (puntuacion) => {
    await expect(valorarExperiencia(1, 10, { puntuacion })).resolves.toMatchObject({ creada: true });
  });

  test.each([
    ['por debajo del rango', 0],
    ['por encima del rango', 6],
    ['decimal', 4.5],
    ['texto', '4'],
    ['ausente', undefined],
  ])('rechaza una puntuación %s con 400 y no guarda nada', async (_caso, puntuacion) => {
    await expect(valorarExperiencia(1, 10, { puntuacion })).rejects.toMatchObject({ status: 400 });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });
});

describe('el comentario, si se envía, es texto', () => {
  test.each([[123], [{ texto: 'hola' }]])('rechaza un comentario que no es texto (%p) con 400', async (comentario) => {
    await expect(valorarExperiencia(1, 10, { puntuacion: 4, comentario })).rejects.toMatchObject({ status: 400 });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });
});

describe('quién puede valorar', () => {
  test('si el usuario de la sesión ya no existe responde 401', async () => {
    await expect(valorarExperiencia(99, 10, { puntuacion: 4 })).rejects.toMatchObject({ status: 401 });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('un identificador de experiencia no válido responde 400', async () => {
    await expect(valorarExperiencia(1, NaN, { puntuacion: 4 })).rejects.toMatchObject({ status: 400 });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia inexistente responde 404', async () => {
    await expect(valorarExperiencia(1, 999, { puntuacion: 4 })).rejects.toMatchObject({
      status: 404, message: 'La experiencia no existe',
    });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia privada de otro usuario responde 404, igual que si no existiera', async () => {
    await expect(valorarExperiencia(1, 11, { puntuacion: 4 })).rejects.toMatchObject({
      status: 404, message: 'La experiencia no existe',
    });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia de amigos sin ser amigos del autor responde 404', async () => {
    await expect(valorarExperiencia(1, 12, { puntuacion: 4 })).rejects.toMatchObject({ status: 404 });
    expect(amistadService.sonAmigos).toHaveBeenCalledWith(1, 2);
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia de amigos siendo amigo del autor sí se puede valorar', async () => {
    amistadService.sonAmigos.mockResolvedValue(true);
    await expect(valorarExperiencia(1, 12, { puntuacion: 4 })).resolves.toMatchObject({ creada: true });
  });

  test('el autor no puede valorar su propia experiencia: 403', async () => {
    await expect(valorarExperiencia(2, 10, { puntuacion: 5 })).rejects.toMatchObject({
      status: 403, message: 'No puedes valorar tu propia experiencia',
    });
    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });
});
