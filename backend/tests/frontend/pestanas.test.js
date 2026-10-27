/**
 * @jest-environment jsdom
 */
// CS-66: pestañas accesibles (js/shared/pestanas.js). Se comprueban los atributos ARIA, el clic
// y el teclado: con las flechas se da la vuelta (de la última a la primera y al revés).
const { cargarScripts } = require('../helpers/pantalla');

const $ = (selector) => document.querySelector(selector);

beforeEach(() => {
  document.body.innerHTML = `
    <div role="tablist" id="lista">
      <button type="button" role="tab" id="tab-1" aria-controls="panel-1">Personas</button>
      <button type="button" role="tab" id="tab-2" aria-controls="panel-2">Experiencias</button>
    </div>
    <div role="tabpanel" id="panel-1">Uno</div>
    <div role="tabpanel" id="panel-2">Dos</div>`;
  cargarScripts(['js/shared/pestanas.js']);
  window.activarPestanas($('#lista'));
});

// Comprueba cuál de las dos pestañas está seleccionada (1 o 2)
function esperarActiva(n) {
  const otra = n === 1 ? 2 : 1;
  expect($(`#tab-${n}`).getAttribute('aria-selected')).toBe('true');
  expect($(`#tab-${n}`).getAttribute('tabindex')).toBe('0');
  expect($(`#panel-${n}`).hidden).toBe(false);
  expect($(`#tab-${otra}`).getAttribute('aria-selected')).toBe('false');
  expect($(`#tab-${otra}`).getAttribute('tabindex')).toBe('-1');
  expect($(`#panel-${otra}`).hidden).toBe(true);
}

const tecla = (elemento, key) => elemento.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

test('al inicio está seleccionada la primera pestaña y su panel es el único visible', () => {
  esperarActiva(1);
});

test('pulsar la segunda pestaña invierte la selección, y la primera la devuelve', () => {
  $('#tab-2').click();
  esperarActiva(2);

  $('#tab-1').click();
  esperarActiva(1);
});

test('flecha derecha en la última pestaña pasa a la primera y le da el foco', () => {
  $('#tab-2').click();

  tecla($('#tab-2'), 'ArrowRight');

  esperarActiva(1);
  expect(document.activeElement).toBe($('#tab-1'));
});

test('flecha izquierda en la primera pestaña pasa a la última y le da el foco', () => {
  tecla($('#tab-1'), 'ArrowLeft');

  esperarActiva(2);
  expect(document.activeElement).toBe($('#tab-2'));
});
