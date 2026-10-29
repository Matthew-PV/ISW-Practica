// CS-14: resumen de las valoraciones de una experiencia (media, total, distribución por estrellas
// y número de comentarios). Se simulan los repositorios; el recuento real se prueba con MySQL
// (tests/mysql/busquedaExperiencias).
jest.mock('../../src/repositories/experienciaRepository', () => ({ buscarPorId: jest.fn() }));
jest.mock('../../src/repositories/valoracionRepository', () => ({ resumir: jest.fn() }));
jest.mock('../../src/services/amistadService', () => ({ sonAmigos: jest.fn() }));

const experienciaRepository = require('../../src/repositories/experienciaRepository');
const valoracionRepository = require('../../src/repositories/valoracionRepository');
const amistadService = require('../../src/services/amistadService');
const { resumirValoraciones } = require('../../src/services/valoracionService');

const EXPERIENCIAS = {
  10: { id: 10, autorId: 2, visibilidad: 'PUBLICA' },
  11: { id: 11, autorId: 2, visibilidad: 'PRIVADA' },
};

beforeEach(() => {
  jest.resetAllMocks();
  experienciaRepository.buscarPorId.mockImplementation(async (id) => EXPERIENCIAS[id] ?? null);
  amistadService.sonAmigos.mockResolvedValue(false);
});

test('calcula la media con un decimal, el total, la distribución y los comentarios', async () => {
  // Dos de 5, una de 4 y una de 2: media 16 / 4 = 4; tres de ellas con comentario
  valoracionRepository.resumir.mockResolvedValue({
    porPuntuacion: [{ puntuacion: 5, cantidad: 2 }, { puntuacion: 4, cantidad: 1 }, { puntuacion: 2, cantidad: 1 }],
    comentarios: 3,
  });

  await expect(resumirValoraciones(1, 10)).resolves.toEqual({
    media: 4, total: 4, distribucion: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 2 }, comentarios: 3,
  });
  expect(valoracionRepository.resumir).toHaveBeenCalledWith(10);
});

test('redondea la media a un decimal', async () => {
  // (5 + 4 + 4) / 3 = 4,333…
  valoracionRepository.resumir.mockResolvedValue({
    porPuntuacion: [{ puntuacion: 5, cantidad: 1 }, { puntuacion: 4, cantidad: 2 }],
    comentarios: 0,
  });

  await expect(resumirValoraciones(1, 10)).resolves.toMatchObject({ media: 4.3, total: 3 });
});

test('sin valoraciones la media es null y todo lo demás 0', async () => {
  valoracionRepository.resumir.mockResolvedValue({ porPuntuacion: [], comentarios: 0 });

  await expect(resumirValoraciones(1, 10)).resolves.toEqual({
    media: null, total: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, comentarios: 0,
  });
});

test.each([
  ['no existe', 99],
  ['no puede verla', 11],
])('si la experiencia %s responde 404 «Contenido no disponible» sin contar nada', async (_caso, id) => {
  await expect(resumirValoraciones(1, id)).rejects.toMatchObject({ status: 404, message: 'Contenido no disponible' });
  expect(valoracionRepository.resumir).not.toHaveBeenCalled();
});
