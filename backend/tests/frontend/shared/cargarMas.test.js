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
