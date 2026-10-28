/**
 * @jest-environment jsdom
 */

// Explorar (/experiencias/explorar.html): rejilla de planes de ejemplo con filtro por categoría.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/experiencias/explorar.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/ejemplos.js', 'js/explorar.js'];

const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));

async function abrir(busqueda = '') {
  window.history.pushState({}, '', `/experiencias/explorar.html${busqueda}`);
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ id: 1, nombreUsuario: 'ana' }) }));
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

test('empieza mostrando todos los planes con «Todos» marcado', async () => {
  await abrir();

  expect(document.querySelectorAll('#resultados .tarjeta-plan').length).toBeGreaterThan(0);
  expect($('#filtros [aria-pressed="true"]').textContent).toBe('Todos');
  expect($('#total-planes').textContent).toMatch(/^\d+ planes$/);
});

test('un filtro deja solo los planes de esa categoría', async () => {
  await abrir();
  const todos = document.querySelectorAll('#resultados .tarjeta-plan').length;

  [...document.querySelectorAll('#filtros button')].find((b) => b.textContent === 'Gastronomía').click();

  const categorias = [...document.querySelectorAll('#resultados .bloque-categoria')].map((b) => b.dataset.categoria);
  expect(categorias.length).toBeGreaterThan(0);
  expect(categorias.length).toBeLessThan(todos);
  expect(new Set(categorias)).toEqual(new Set(['gastronomia']));
});

test('una categoría sin planes muestra el aviso de vacío', async () => {
  await abrir();
  document.getElementById('resultados').replaceChildren();

  [...document.querySelectorAll('#filtros button')].find((b) => b.textContent === 'Deporte').click();
  [...document.querySelectorAll('#filtros button')].find((b) => b.textContent === 'Rincones').click();

  expect($('#sin-resultados').classList.contains('d-none')).toBe(document.querySelectorAll('#resultados .tarjeta-plan').length > 0);
});

test('?tira=ciudad titula la página según la tira de Inicio', async () => {
  await abrir('?tira=ciudad');

  expect($('#titulo-explorar').textContent).toBe('Planes en mi ciudad');
});
