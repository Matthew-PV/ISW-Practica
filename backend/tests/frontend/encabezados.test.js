/**
 * @jest-environment jsdom
 */

// Jerarquía de encabezados: las tarjetas de experiencia llevan h3, así que la lista que las contiene
// debe ir precedida por un h2 (WCAG 1.3.1; si no, axe avisa de «heading-order»).
const { leer } = require('../helpers/pantalla');

// Pantalla y contenedor donde se pintan las tarjetas
const LISTAS = [
  ['experiencias/explorar.html', '#resultados'],
  ['cuenta/mis-planes.html', '#rejilla'],
  ['cuenta/perfil.html', '#lista-experiencias'],
];

test.each(LISTAS)('%s: el encabezado anterior a la lista de tarjetas es un h2', (pagina, selector) => {
  document.documentElement.innerHTML = leer(pagina);
  const lista = document.querySelector(selector);
  const anteriores = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(
    (h) => h.compareDocumentPosition(lista) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

  expect(anteriores.at(-1).tagName).toBe('H2');
});
