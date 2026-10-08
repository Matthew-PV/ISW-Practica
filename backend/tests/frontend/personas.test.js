/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 12: búsqueda de personas y enlaces al perfil público.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('personas.html');
const SCRIPTS = ['js/shared/api.js', 'js/personas.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

function buscar(texto) {
  $('#texto-busqueda').value = texto;
  $('#form-busqueda').dispatchEvent(new Event('submit'));
}

beforeEach(() => {
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn();
  cargarScripts(SCRIPTS);
});

test('busca personas y cada resultado enlaza a su perfil público sin insertar HTML', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, [
    { id: 2, nombreUsuario: 'ana maría', email: 'no-debe-mostrarse@ejemplo.com' },
    { id: 3, nombreUsuario: '<b>luis</b>', email: 'tampoco@ejemplo.com' },
  ]));

  buscar('ana');
  await terminar();

  expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana', expect.any(Object));
  const enlaces = [...document.querySelectorAll('#resultados a')];
  expect(enlaces).toHaveLength(2);
  expect(enlaces[0].getAttribute('href')).toBe('usuario.html?nombre=ana%20mar%C3%ADa');
  expect(enlaces[0].textContent).toBe('ana maría');
  expect(enlaces[1].textContent).toBe('<b>luis</b>');
  expect(enlaces[1].querySelector('b')).toBeNull();
  expect(document.body.textContent).not.toContain('no-debe-mostrarse@ejemplo.com');
});

test('indica cuando la búsqueda no encuentra personas', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, []));

  buscar('nadie');
  await terminar();

  expect($('#sin-resultados').classList.contains('d-none')).toBe(false);
  expect($('#resultados').children).toHaveLength(0);
});

test('muestra el mensaje del servidor si la búsqueda falla', async () => {
  window.fetch.mockReturnValueOnce(respuesta(500, { error: 'No se ha podido buscar ahora' }));

  buscar('ana');
  await terminar();

  expect($('#error-busqueda').textContent).toBe('No se ha podido buscar ahora');
  expect($('#error-busqueda').classList.contains('d-none')).toBe(false);
});
