/**
 * @jest-environment jsdom
 */

// Pausa del movimiento decorativo (WCAG 2.2.2): un botón fijo en cada página detiene las animaciones
// que no terminan (fondo, ilustraciones) y recuerda la elección. Con «reducir movimiento» en el sistema
// arranca ya pausado.
const fs = require('node:fs');
const path = require('node:path');
const { FRONTEND, cargarScripts } = require('../helpers/pantalla');

const SCRIPT = 'js/shared/movimiento.js';

function simularPreferencia(reducir) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: reducir });
}

function cargar() {
  document.body.innerHTML = '<main></main>';
  cargarScripts([SCRIPT]);
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  document.documentElement.removeAttribute('data-movimiento');
  simularPreferencia(false);
});

afterEach(() => jest.useRealTimers());

const pausado = () => document.documentElement.dataset.movimiento === 'pausado';

test('ya no añade ningún botón flotante a las páginas', () => {
  cargar();

  expect(document.querySelector('.boton-movimiento')).toBeNull();
  expect(document.querySelector('button')).toBeNull();
});

test('el fondo se mueve al entrar y se detiene solo a los 5 segundos (WCAG 2.2.2)', () => {
  cargar();
  expect(pausado()).toBe(false);

  jest.advanceTimersByTime(4900);
  expect(pausado()).toBe(false);
  jest.advanceTimersByTime(200);
  expect(pausado()).toBe(true);
});

test('arranca pausado si la persona lo pausó en Ajustes', () => {
  localStorage.setItem('movimiento', 'pausado');

  cargar();

  expect(pausado()).toBe(true);
});

test('arranca pausado si el sistema pide reducir el movimiento, aunque no haya elección guardada', () => {
  simularPreferencia(true);

  cargar();

  expect(pausado()).toBe(true);
});

test('una elección guardada de mantener el movimiento gana a la preferencia del sistema y a los 5 segundos', () => {
  simularPreferencia(true);
  localStorage.setItem('movimiento', 'activo');

  cargar();
  jest.advanceTimersByTime(10000);

  expect(pausado()).toBe(false);
});

test('fijarMovimiento aplica la elección y la recuerda', () => {
  cargar();

  window.fijarMovimiento(true);
  expect(pausado()).toBe(true);
  expect(localStorage.getItem('movimiento')).toBe('pausado');
  expect(window.movimientoPausado()).toBe(true);

  window.fijarMovimiento(false);
  expect(pausado()).toBe(false);
  expect(localStorage.getItem('movimiento')).toBe('activo');
  expect(window.movimientoPausado()).toBe(false);
  jest.advanceTimersByTime(10000);
  expect(pausado()).toBe(false);
});

test('funciona aunque el almacenamiento del navegador no esté disponible', () => {
  const espia = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('bloqueado');
  });
  const guardar = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('bloqueado');
  });

  cargar();
  window.fijarMovimiento(true);

  expect(pausado()).toBe(true);
  espia.mockRestore();
  guardar.mockRestore();
});

test('todas las páginas cargan el script de movimiento', () => {
  const paginas = [];
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const ruta = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else if (e.name.endsWith('.html')) paginas.push(ruta);
    }
  };
  recorrer(FRONTEND);

  const sin = paginas.filter((p) => !/js\/shared\/movimiento\.js/.test(fs.readFileSync(p, 'utf8')));
  expect(sin.map((p) => path.relative(FRONTEND, p))).toEqual([]);
});
