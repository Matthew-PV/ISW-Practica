/**
 * @jest-environment jsdom
 */

// Jerarquía de encabezados: las tarjetas de experiencia llevan h3, así que la lista que las contiene
// debe ir precedida por un h2 (WCAG 1.3.1; si no, axe avisa de «heading-order»).
const { leer } = require('../helpers/pantalla');

// Pantalla y contenedor donde se pintan las tarjetas
const LISTAS = [
  ['paginas/experiencias/explorar.html', '#resultados'],
  ['paginas/cuenta/mis-planes.html', '#rejilla'],
  ['paginas/cuenta/perfil.html', '#lista-experiencias'],
];

test.each(LISTAS)('%s: el encabezado anterior a la lista de tarjetas es un h2', (pagina, selector) => {
  document.documentElement.innerHTML = leer(pagina);
  const lista = document.querySelector(selector);
  const anteriores = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(
    (h) => h.compareDocumentPosition(lista) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

  expect(anteriores.at(-1).tagName).toBe('H2');
});

// E2: «plan» en la marca y en lo que se crea, se busca y se gestiona; «experiencia» solo en lo que se sugiere para descubrir
describe('E2: vocabulario de la interfaz', () => {
  const { leer } = require('../helpers/pantalla');
  const texto = (archivo) => leer(archivo).replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');

  test('el detalle, el formulario y los perfiles hablan de planes', () => {
    expect(leer('paginas/experiencias/experiencia.html')).toContain('<title>PlanB · Detalle del plan</title>');
    expect(leer('paginas/experiencias/experiencia.html')).toContain('aria-label="Ficha del plan"');
    expect(texto('paginas/cuenta/mis-planes.html')).toMatch(/Nuevo plan/);
    expect(texto('paginas/cuenta/mis-planes.html')).not.toMatch(/xperiencia/);
    expect(texto('paginas/social/usuario.html')).toContain('Sus planes');
    expect(texto('paginas/cuenta/perfil.html')).not.toMatch(/Experiencias/);
  });

  test('Explorar habla de experiencias para descubrir', () => {
    const explorar = texto('paginas/experiencias/explorar.html');
    expect(explorar).toContain('Experiencias de otras personas para inspirarte.');
    expect(explorar).toContain('Solo experiencias de mis amigos');
    expect(explorar).toContain('No hay experiencias con estos filtros.');
  });
});
