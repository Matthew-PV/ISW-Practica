// CS-01: reglas de negocio para crear y modificar una valoración.
// Se simulan los repositorios, sin necesitar MySQL.
jest.mock('../src/repositories/usuarioRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/experienciaRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../src/repositories/valoracionRepository', () => ({ buscar: jest.fn(), guardar: jest.fn() }));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const valoracionRepository = require('../src/repositories/valoracionRepository');
const { valorarExperiencia } = require('../src/services/valoracionService');

// Experiencia pública de otro autor (id 2): el usuario 1 puede verla y valorarla.
const EXPERIENCIA = { id: 10, autorId: 2, visibilidad: 'PUBLICA' };

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === 1 || id === 2 ? { id } : null));
  experienciaRepository.buscarPorId.mockImplementation(async (id) => (id === EXPERIENCIA.id ? { ...EXPERIENCIA } : null));
  // Igual que el upsert de Prisma: devuelve la valoración guardada
  valoracionRepository.guardar.mockImplementation(async (datos) => ({ id: 50, ...datos }));
});

describe('crear una valoración', () => {
  test('si aún no había valorado la experiencia, se guarda una valoración nueva asociada a ambos', async () => {
    valoracionRepository.buscar.mockResolvedValue(null);

    const resultado = await valorarExperiencia(1, 10, { puntuacion: 4, comentario: 'Muy recomendable' });

    expect(resultado.creada).toBe(true);
    expect(resultado.valoracion).toMatchObject({ usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable' });
    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable',
    });
  });

  test('el comentario es opcional: sin él se guarda como null', async () => {
    valoracionRepository.buscar.mockResolvedValue(null);

    const resultado = await valorarExperiencia(1, 10, { puntuacion: 3 });

    expect(resultado.creada).toBe(true);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 3, comentario: null,
    });
  });
});

describe('modificar una valoración', () => {
  test('si ya la había valorado, se actualiza la existente con los nuevos datos y no se crea otra', async () => {
    valoracionRepository.buscar.mockResolvedValue({
      id: 50, usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable',
    });

    const resultado = await valorarExperiencia(1, 10, { puntuacion: 2, comentario: 'Ha empeorado' });

    expect(resultado.creada).toBe(false);
    expect(resultado.valoracion).toMatchObject({ id: 50, puntuacion: 2, comentario: 'Ha empeorado' });
    expect(valoracionRepository.buscar).toHaveBeenCalledWith(1, 10);
    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);
    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1, experienciaId: 10, puntuacion: 2, comentario: 'Ha empeorado',
    });
  });
});
