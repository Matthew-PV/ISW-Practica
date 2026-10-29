// CS-55 y CS-56: la categoría (`tipo`) y el momento adecuado solo admiten valores de una lista fija.
jest.mock('../../src/repositories/ciudadRepository', () => ({ buscarPorId: jest.fn() }));

const ciudadRepository = require('../../src/repositories/ciudadRepository');
const { validarCreacion, validarEdicion, listarOpciones } = require('../../src/services/experienciaService');

const VALIDA = { titulo: 'Tarde cultural', descripcion: 'Visita al museo y paseo', ciudadId: 1 };

beforeEach(() => {
  jest.resetAllMocks();
  ciudadRepository.buscarPorId.mockResolvedValue({ id: 1, nombre: 'Madrid' });
});

test('las opciones son las seis categorías y los momentos agrupados por franja, día y estación', () => {
  const { categorias, momentos } = listarOpciones();

  expect(categorias).toEqual(['Gastronomía', 'Cultura', 'Naturaleza', 'Noche', 'Deporte', 'Rincones']);
  expect(momentos.map((grupo) => grupo.grupo)).toEqual(['Franja del día', 'Día de la semana', 'Estación']);
  expect(momentos.flatMap((grupo) => grupo.valores)).toEqual(expect.arrayContaining(['Por la mañana', 'Atardecer', 'Fin de semana', 'Invierno']));
});

describe('CS-55: categoría', () => {
  test.each(['Gastronomía', 'Rincones'])('acepta la categoría permitida %s', async (tipo) => {
    await expect(validarCreacion({ ...VALIDA, tipo })).resolves.toMatchObject({ tipo });
  });

  test.each(['Escalada', 'gastronomía', 'Cultural'])('rechaza %p, que no está en la lista, sin consultar la ciudad', async (tipo) => {
    await expect(validarCreacion({ ...VALIDA, tipo })).rejects.toMatchObject({
      status: 400, message: expect.stringMatching(/categoría/i),
    });
    expect(ciudadRepository.buscarPorId).not.toHaveBeenCalled();
  });

  test('al editar también se rechaza una categoría fuera de la lista', async () => {
    await expect(validarEdicion({ tipo: 'Escalada' })).rejects.toMatchObject({ status: 400 });
  });
});

describe('CS-56: momento adecuado', () => {
  test.each(['Atardecer', 'Fin de semana', 'Invierno'])('acepta el momento permitido %s', async (momentoAdecuado) => {
    await expect(validarCreacion({ ...VALIDA, momentoAdecuado })).resolves.toMatchObject({ momentoAdecuado });
  });

  test.each(['En invierno', 'Cuando quieras'])('rechaza %p, que no está en la lista', async (momentoAdecuado) => {
    await expect(validarCreacion({ ...VALIDA, momentoAdecuado })).rejects.toMatchObject({
      status: 400, message: expect.stringMatching(/momento/i),
    });
  });

  test('al editar también se rechaza un momento fuera de la lista', async () => {
    await expect(validarEdicion({ momentoAdecuado: 'Tarde' })).rejects.toMatchObject({ status: 400 });
  });
});

test('categoría y momento siguen siendo opcionales', async () => {
  await expect(validarCreacion({ ...VALIDA, tipo: '', momentoAdecuado: null }))
    .resolves.toMatchObject({ tipo: null, momentoAdecuado: null });
});
