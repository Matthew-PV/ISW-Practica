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
  return document.querySelector('.boton-movimiento');
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-movimiento');
  simularPreferencia(false);
});

test('añade un botón de pausa sin pulsar y el movimiento sigue activo', () => {
  const boton = cargar();

  expect(boton.type).toBe('button');
  expect(boton.getAttribute('aria-pressed')).toBe('false');
  expect(boton.textContent).toBe('Pausar animaciones');
  expect(document.documentElement.hasAttribute('data-movimiento')).toBe(false);
});

test('al pulsarlo pausa el movimiento y recuerda la elección; al volver a pulsarlo lo reanuda', () => {
  const boton = cargar();

  boton.click();
  expect(document.documentElement.dataset.movimiento).toBe('pausado');
  expect(boton.getAttribute('aria-pressed')).toBe('true');
  expect(boton.textContent).toBe('Reanudar animaciones');
  expect(localStorage.getItem('movimiento')).toBe('pausado');

  boton.click();
  expect(document.documentElement.hasAttribute('data-movimiento')).toBe(false);
  expect(boton.getAttribute('aria-pressed')).toBe('false');
  expect(localStorage.getItem('movimiento')).toBe('activo');
});

test('arranca pausado si la persona lo pausó antes', () => {
  localStorage.setItem('movimiento', 'pausado');

  const boton = cargar();

  expect(document.documentElement.dataset.movimiento).toBe('pausado');
  expect(boton.getAttribute('aria-pressed')).toBe('true');
});

test('arranca pausado si el sistema pide reducir el movimiento, aunque no haya elección guardada', () => {
  simularPreferencia(true);

  const boton = cargar();

  expect(document.documentElement.dataset.movimiento).toBe('pausado');
  expect(boton.getAttribute('aria-pressed')).toBe('true');
});

test('una elección guardada de reanudar gana a la preferencia del sistema', () => {
  simularPreferencia(true);
  localStorage.setItem('movimiento', 'activo');

  cargar();

  expect(document.documentElement.hasAttribute('data-movimiento')).toBe(false);
});

test('funciona aunque el almacenamiento del navegador no esté disponible', () => {
  const espia = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('bloqueado');
  });
  const guardar = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('bloqueado');
  });

  const boton = cargar();
  boton.click();

  expect(document.documentElement.dataset.movimiento).toBe('pausado');
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
