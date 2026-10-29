// CS-10: reglas del servicio que busca experiencias con filtros. El repositorio se simula; la
// consulta real (visibilidad, filtros y cursor) se prueba con MySQL (tests/mysql/busquedaExperiencias).
jest.mock('../../src/repositories/experienciaRepository');

const experienciaRepository = require('../../src/repositories/experienciaRepository');
const { buscar } = require('../../src/services/experienciaService');
const { FOTO_POR_DEFECTO } = require('../../src/services/shared/fotoPorDefecto');

const SIN_FILTROS = { texto: null, ciudadId: null, categoria: null, momento: null, soloAmigos: false, minimo: null };

beforeEach(() => {
  jest.resetAllMocks();
  experienciaRepository.buscar.mockResolvedValue([]);
});

test('sin filtros pide la primera página con una fila de más', async () => {
  await buscar(1, {});

  expect(experienciaRepository.buscar).toHaveBeenCalledWith(1, SIN_FILTROS, null, 11);
});

test('pasa al repositorio los filtros ya leídos y el cursor', async () => {
  await buscar(1, {
    texto: '  tapas ', ciudadId: '3', categoria: 'Gastronomía', momento: 'Atardecer',
    amigos: 'true', minimo: '4', despuesDe: '30', limite: '5',
  });

  expect(experienciaRepository.buscar).toHaveBeenCalledWith(1, {
    texto: 'tapas', ciudadId: 3, categoria: 'Gastronomía', momento: 'Atardecer', soloAmigos: true, minimo: 4,
  }, 30, 6);
});

test('los filtros vacíos (un formulario sin rellenar) no filtran', async () => {
  await buscar(1, { texto: '  ', ciudadId: '', categoria: '', momento: '', amigos: 'false', minimo: '' });

  expect(experienciaRepository.buscar).toHaveBeenCalledWith(1, SIN_FILTROS, null, 11);
});

test('devuelve la página, el cursor de la siguiente y la foto por defecto del autor', async () => {
  experienciaRepository.buscar.mockResolvedValue([
    { id: 9, autor: { id: 2, nombreUsuario: 'bea', foto: null } },
    { id: 8, autor: null },
    { id: 7, autor: null },
  ]);

  await expect(buscar(1, { limite: '2' })).resolves.toEqual({
    experiencias: [
      { id: 9, autor: { id: 2, nombreUsuario: 'bea', foto: FOTO_POR_DEFECTO } },
      { id: 8, autor: null },
    ],
    siguiente: 8,
  });
});

test.each([
  ['una categoría fuera de la lista', { categoria: 'Compras' }],
  ['un momento fuera de la lista', { momento: 'En invierno' }],
  ['una ciudad que no es un id', { ciudadId: 'madrid' }],
  ['una valoración mínima fuera de 1 a 5', { minimo: '6' }],
  ['una valoración mínima con decimales', { minimo: '3.5' }],
  ['un filtro de amigos que no es true ni false', { amigos: 'si' }],
  ['un texto de más de 191 caracteres', { texto: 'a'.repeat(192) }],
  ['un texto repetido en la URL', { texto: ['a', 'b'] }],
  ['una paginación no válida', { limite: '51' }],
])('%s responde 400 sin consultar la base de datos', async (_caso, filtros) => {
  await expect(buscar(1, filtros)).rejects.toMatchObject({ status: 400 });
  expect(experienciaRepository.buscar).not.toHaveBeenCalled();
});
