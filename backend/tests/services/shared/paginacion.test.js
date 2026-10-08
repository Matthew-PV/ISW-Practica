// Paginación por cursor común a los listados (services/shared/paginacion.js).
// El cliente pide «los siguientes `limite` elementos después del id `despuesDe`».
const { leerPaginacion, cortarPagina } = require('../../../src/services/shared/paginacion');

describe('leerPaginacion', () => {
  test('sin parámetros empieza por el principio con el límite por defecto', () => {
    expect(leerPaginacion({}, 10)).toEqual({ despuesDe: null, limite: 10 });
  });

  test('convierte los parámetros de la URL, que llegan como texto', () => {
    expect(leerPaginacion({ despuesDe: '57', limite: '20' }, 10)).toEqual({ despuesDe: 57, limite: 20 });
  });

  test.each(['1', '50'])('acepta el límite %s', (limite) => {
    expect(leerPaginacion({ limite }, 10).limite).toBe(Number(limite));
  });

  test.each([
    ['limite', '0'], ['limite', '51'], ['limite', 'x'], ['limite', '1.5'],
    ['despuesDe', '0'], ['despuesDe', '-1'], ['despuesDe', 'x'], ['despuesDe', ''],
  ])('rechaza %s=%p con 400', (parametro, valor) => {
    expect(() => leerPaginacion({ [parametro]: valor }, 10)).toThrow(
      expect.objectContaining({ status: 400, message: 'La paginación no es válida' })
    );
  });
});

describe('cortarPagina', () => {
  // El repositorio pide limite + 1 filas, ordenadas por id de mayor a menor
  const filas = (desde, cantidad) => Array.from({ length: cantidad }, (_, i) => ({ id: desde - i }));

  test('si llega una fila de más, hay otra página y empieza después del último elemento', () => {
    const { elementos, siguiente } = cortarPagina(filas(20, 11), 10);

    expect(elementos.map((fila) => fila.id)).toEqual([20, 19, 18, 17, 16, 15, 14, 13, 12, 11]);
    expect(siguiente).toBe(11);
  });

  test.each([[3], [10], [0]])('con %i filas y límite 10 no hay página siguiente', (cantidad) => {
    expect(cortarPagina(filas(20, cantidad), 10)).toEqual({ elementos: filas(20, cantidad), siguiente: null });
  });
});
