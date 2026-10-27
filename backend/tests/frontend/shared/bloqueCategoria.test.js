/**
 * @jest-environment jsdom
 */
// Bloque de color con el icono de la categoría que encabeza las tarjetas de experiencia
// (crearBloqueCategoria, en js/shared/pantalla.js). Como `tipo` es texto libre, la categoría se
// deduce de palabras clave; si no encaja ninguna, se usa la genérica «rincones».
const { cargarScripts } = require('../../helpers/pantalla');

beforeEach(() => {
  document.body.innerHTML = '';
  cargarScripts(['js/shared/pantalla.js']);
});

test.each([
  ['Ruta de tapas', 'gastronomia'],
  ['Museo y arquitectura', 'cultura'],
  ['Senderismo', 'naturaleza'],
  ['Copas y música', 'noche'],
  ['Partido de fútbol', 'deporte'],
  ['Mirador secreto', 'rincones'],
  [null, 'rincones'],
])('«%s» usa la categoría %s', (tipo, categoria) => {
  const bloque = crearBloqueCategoria(tipo);
  expect(bloque.classList.contains('bloque-categoria')).toBe(true);
  expect(bloque.dataset.categoria).toBe(categoria);
});

test('lleva un icono decorativo que los lectores de pantalla ignoran', () => {
  const icono = crearBloqueCategoria('Tapas').querySelector('svg');
  expect(icono).not.toBeNull();
  expect(icono.getAttribute('aria-hidden')).toBe('true');
});
