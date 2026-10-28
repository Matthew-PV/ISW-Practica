/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 13: solicitudes de amistad recibidas en su página (/social/amigos.html).
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('/social/amigos.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/solicitudes.js'];
const SOLICITUDES = [{
  id: 10,
  solicitante: { id: 2, nombreUsuario: 'luis', foto: '/img/foto-por-defecto.svg' },
}];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn()
    .mockReturnValueOnce(respuesta(200, SOLICITUDES));
  cargarScripts(SCRIPTS);
  await terminar();
});

test('carga las solicitudes recibidas y muestra botones para responderlas', () => {
  expect(window.fetch.mock.calls[0][0]).toBe('/api/amistades/solicitudes');
  expect($('#solicitudes-recibidas').textContent).toContain('luis');
  expect([...document.querySelectorAll('#solicitudes-recibidas button')].map((boton) => boton.textContent))
    .toEqual(['Aceptar', 'Rechazar']);
});

test('cada solicitud muestra la foto del solicitante y enlaza a su perfil', () => {
  const enlace = $('#solicitudes-recibidas a');
  expect(enlace.getAttribute('href')).toBe('/social/usuario.html?nombre=luis');
  expect(enlace.querySelector('img').getAttribute('src')).toBe('/img/foto-por-defecto.svg');
});

test('aceptar una solicitud la elimina de la lista', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, { id: 10, estado: 'ACEPTADA' }));

  [...document.querySelectorAll('#solicitudes-recibidas button')].find((boton) => boton.textContent === 'Aceptar').click();
  await terminar();

  const [ruta, opciones] = window.fetch.mock.calls.at(-1);
  expect(ruta).toBe('/api/amistades/10');
  expect(opciones.method).toBe('PATCH');
  expect(JSON.parse(opciones.body)).toEqual({ aceptar: true });
  expect($('#solicitudes-recibidas').children).toHaveLength(0);
  expect($('#sin-solicitudes').classList.contains('d-none')).toBe(false);
});

test('rechazar una solicitud usa la misma ruta con aceptar a false', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, null));

  [...document.querySelectorAll('#solicitudes-recibidas button')].find((boton) => boton.textContent === 'Rechazar').click();
  await terminar();

  const [ruta, opciones] = window.fetch.mock.calls.at(-1);
  expect(ruta).toBe('/api/amistades/10');
  expect(opciones.method).toBe('PATCH');
  expect(JSON.parse(opciones.body)).toEqual({ aceptar: false });
  expect($('#solicitudes-recibidas').children).toHaveLength(0);
});

test('«Aceptar» y «Rechazar» son botones secundarios', () => {
  const botones = [...document.querySelectorAll('#solicitudes-recibidas button')];
  expect(botones[0].classList.contains('btn-outline-success')).toBe(true);
  expect(botones[1].classList.contains('btn-outline-danger')).toBe(true);
  expect(document.querySelector('.btn-primary')).toBeNull();
});
