// leerId (services/shared/identificadores.js): los identificadores que llegan en la URL o en el
// cuerpo de una petición son enteros positivos que caben en una columna Int de MySQL.
const { leerId } = require('../../../src/services/shared/identificadores');

test.each([1, 42, 2147483647])('acepta el entero positivo %p', (valor) => {
  expect(leerId(valor, 'de la amistad')).toBe(valor);
});

test.each([0, -1, 1.5, NaN, '5', null, undefined, 2147483648])('rechaza %p con 400', (valor) => {
  expect(() => leerId(valor, 'de la amistad')).toThrow(
    expect.objectContaining({ status: 400, message: 'El identificador de la amistad no es válido' })
  );
});
