/**
 * @jest-environment jsdom
 */
// Esperas: sin peticiones repetidas y con señal de que algo está cargando.
const { leer, cargarScripts } = require('../helpers/pantalla');

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => { window.fetch = jest.fn(() => respuesta(200, {})); });

test('dos GET iguales a la vez comparten una sola petición', async () => {
  cargarScripts(['js/shared/api.js']);
  await Promise.all([window.api('/perfil'), window.api('/perfil')]);
  expect(window.fetch).toHaveBeenCalledTimes(1);
  await window.api('/perfil');
  expect(window.fetch).toHaveBeenCalledTimes(2);
});

test('tras guardar, un GET no reutiliza la petición anterior', () => {
  window.fetch = jest.fn(() => new Promise(() => {}));
  cargarScripts(['js/shared/api.js']);
  window.api('/perfil');
  window.api('/perfil', { method: 'PUT', body: '{}' });
  window.api('/perfil');
  expect(window.fetch).toHaveBeenCalledTimes(3);
});

test('mientras llega la página siguiente el botón dice «Cargando…»', async () => {
  document.body.innerHTML = '<div id="l"></div><button id="m">Cargar más</button>';
  cargarScripts(['js/shared/pantalla.js']);
  let llegar;
  window.listaConCargarMas({
    lista: $('#l'), botonMas: $('#m'), crear: () => null, pedir: () => new Promise((r) => { llegar = r; }),
  });
  $('#m').click();
  expect($('#m').textContent).toBe('Cargando…');
  llegar({ elementos: [], siguiente: 2 });
  await terminar();
  expect($('#m').textContent).toBe('Cargar más');
});

test('en Ajustes no se puede escribir hasta que llega el perfil', () => {
  document.documentElement.innerHTML = leer('/paginas/cuenta/ajustes.html');
  window.fetch = jest.fn(() => new Promise(() => {}));
  cargarScripts(['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/password.js', 'js/shared/movimiento.js', 'js/cuenta/ajustes.js']);
  expect([$('#nombreUsuario'), $('#ciudad'), $('#foto')].map((c) => c.disabled)).toEqual([true, true, true]);
});
