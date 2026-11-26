/**
 * @jest-environment jsdom
 */
// Funciones comunes del frontend: «Cargar más» sin mezclar respuestas antiguas y plazo máximo de api().
const { cargarScripts } = require('../../helpers/pantalla');

beforeEach(() => {
  document.body.innerHTML = '<ul id="lista"></ul><button id="mas"></button>';
  cargarScripts(['js/shared/api.js', 'js/shared/pantalla.js']);
});

afterEach(() => {
  delete global.fetch;
});

test('listaConCargarMas: una respuesta anterior a reiniciar no se pinta', async () => {
  const pendientes = [];
  const pedir = () => new Promise((resolve) => pendientes.push(resolve));
  const lista = document.getElementById('lista');
  const { cargar, reiniciar } = window.listaConCargarMas({
    lista, botonMas: document.getElementById('mas'), pedir,
    crear: (e) => Object.assign(document.createElement('li'), { textContent: e.nombre }),
    alFallar: () => {},
  });

  const primera = cargar();
  const segunda = reiniciar();
  pendientes[1]({ elementos: [{ id: 2, nombre: 'nueva' }], siguiente: null });
  await segunda;
  pendientes[0]({ elementos: [{ id: 1, nombre: 'vieja' }], siguiente: null });
  await primera;

  expect([...lista.children].map((li) => li.textContent)).toEqual(['nueva']);
});

test('api: la petición lleva un plazo máximo', async () => {
  const fetch = global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

  await window.api('/auth/yo');

  expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});

test('api: si quien llama pasa su propia señal, se respeta', async () => {
  const fetch = global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
  const control = new AbortController();

  await window.api('/auth/yo', { signal: control.signal });

  expect(fetch.mock.calls[0][1].signal).toBe(control.signal);
});

test('api: el plazo también cubre la lectura del cuerpo', async () => {
  jest.useFakeTimers();
  try {
    // Cabeceras recibidas, pero el cuerpo no llega nunca salvo que la petición se aborte
    global.fetch = jest.fn((url, { signal }) => Promise.resolve({
      ok: true,
      status: 200,
      json: () => new Promise((_, rechazar) => signal.addEventListener('abort', () => rechazar(new Error('abortada')))),
    }));

    const llamada = window.api('/auth/yo');
    const resultado = expect(llamada).rejects.toThrow();
    await jest.advanceTimersByTimeAsync(30000);

    await resultado;
  } finally {
    jest.useRealTimers();
  }
});

test('listaConCargarMas: mientras llega la primera página hay huecos de carga y no se ve el vacío', async () => {
  document.body.innerHTML = '<ul id="lista"></ul><p id="vacio"></p><button id="mas"></button>';
  const pendientes = [];
  const lista = document.getElementById('lista');
  const vacio = document.getElementById('vacio');
  const { reiniciar } = window.listaConCargarMas({
    lista, vacio, botonMas: document.getElementById('mas'), alFallar: () => {},
    pedir: () => new Promise((resolve, reject) => pendientes.push({ resolve, reject })),
    crear: () => document.createElement('li'),
  });

  const primera = reiniciar();
  expect(lista.querySelectorAll('.hueco-carga').length).toBeGreaterThan(0);
  expect(vacio.classList.contains('d-none')).toBe(true);
  pendientes[0].resolve({ elementos: [], siguiente: null });
  await primera;
  expect(lista.children).toHaveLength(0);
  expect(vacio.classList.contains('d-none')).toBe(false);

  const segunda = reiniciar();
  pendientes[1].reject(new Error('fallo'));
  await segunda;
  expect(lista.children).toHaveLength(0);
  expect(vacio.classList.contains('d-none')).toBe(true);
});
