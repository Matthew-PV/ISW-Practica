/**
 * @jest-environment jsdom
 */
// Resiliencia con red lenta o caída: sin dobles envíos, sin cambios perdidos y con reintento.
const { leer, cargarScripts } = require('../helpers/pantalla');

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));

test('reiniciar una lista oculta «Cargar más» y el aviso de vacío mientras llega la primera página', async () => {
  document.body.innerHTML = '<div id="l"></div><p id="v"></p><button id="m"></button>';
  cargarScripts(['js/shared/pantalla.js']);
  const lista = window.listaConCargarMas({
    lista: $('#l'), vacio: $('#v'), botonMas: $('#m'), pedir: () => new Promise(() => {}), crear: () => null,
  });
  lista.reiniciar();
  expect($('#m').classList.contains('d-none')).toBe(true);
  expect($('#v').classList.contains('d-none')).toBe(true);
});

test('doble clic en «Seguir» envía una sola petición', async () => {
  window.history.pushState({}, '', '/paginas/social/usuario.html?nombre=ana');
  document.documentElement.innerHTML = leer('/paginas/social/usuario.html');
  const perfil = { id: 2, nombreUsuario: 'ana', amigos: 0, seguidores: 0, esPropio: false, relacion: { amistad: 'ninguna', siguiendo: false } };
  window.fetch = jest.fn((ruta, opciones = {}) => {
    if (opciones.method === 'POST') return new Promise(() => {});
    if (ruta.startsWith('/api/usuarios')) return respuesta(200, perfil);
    return respuesta(200, { experiencias: [], siguiente: null });
  });
  cargarScripts(['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/planes.js', 'js/shared/experiencias.js', 'js/social/usuario.js']);
  await terminar();
  $('#boton-seguir button').click();
  $('#boton-seguir button').click();
  $('#botones-amistad button').click();
  expect(window.fetch.mock.calls.filter(([, o]) => o?.method === 'POST')).toHaveLength(1);
});

test('una ciudad cambiada mientras se guarda no se pisa con la respuesta antigua', async () => {
  document.documentElement.innerHTML = leer('/paginas/cuenta/ajustes.html');
  const perfil = { id: 1, nombreUsuario: 'ana', email: 'a@b.com', ciudad: null, foto: null };
  let contestar;
  window.fetch = jest.fn((ruta, opciones = {}) => {
    if (opciones.method === 'PUT') return new Promise((r) => { contestar = r; });
    return respuesta(200, ruta === '/api/perfil' ? perfil : []);
  });
  cargarScripts(['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/password.js', 'js/shared/movimiento.js', 'js/cuenta/ajustes.js']);
  await terminar();
  const enviar = () => $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
  $('#ciudad').value = 'Madrid';
  enviar();
  $('#ciudad').value = 'Lima';
  enviar();
  contestar(await respuesta(200, { ...perfil, ciudad: 'Madrid' }));
  await terminar();
  const cuerpos = window.fetch.mock.calls.filter(([, o]) => o?.method === 'PUT').map(([, o]) => JSON.parse(o.body).ciudad);
  expect(cuerpos).toEqual(['Madrid', 'Lima']);
  expect($('#ciudad').value).toBe('Lima');
});

test('si no se puede saber mi ciudad, la tira lo dice y deja reintentar', async () => {
  document.documentElement.innerHTML = leer('/paginas/cuenta/bienvenida.html');
  window.fetch = jest.fn((ruta) => {
    if (ruta === '/api/perfil') return respuesta(500, { error: 'fallo' });
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1, nombreUsuario: 'ana' });
    return respuesta(200, ruta === '/api/ciudades' ? [] : { experiencias: [], siguiente: null });
  });
  cargarScripts(['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/planes.js', 'js/cuenta/bienvenida.js']);
  await terminar();
  await terminar();
  const tira = $('.tira .tira-vacia');
  expect(tira.textContent).toContain('No se han podido cargar');
  expect(tira.querySelector('button').textContent).toBe('Reintentar');
});
