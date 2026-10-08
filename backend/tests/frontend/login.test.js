/**
 * @jest-environment jsdom
 */
// CS-59: la pantalla de inicio de sesión (frontend/index.html y js/index.js) en un navegador
// simulado (jsdom). Se simula el servidor (fetch), así que no hace falta arrancar nada.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('index.html');
const SCRIPTS = ['js/shared/api.js', 'js/index.js'];

// Respuesta de fetch con el código y el JSON indicados
const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const boton = () => $('#form-login button[type="submit"]');
const cajaError = () => $('#error-login');
const errorVisible = () => (cajaError().classList.contains('d-none') ? null : cajaError().textContent);
// Deja que terminen las promesas pendientes (la llamada a fetch y lo que viene después)
const terminar = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn();
  cargarScripts(SCRIPTS);
  $('#email').value = 'ana@ejemplo.com';
  $('#password').value = 'Secreta123';
});

test('login correcto: envía el email y la contraseña y no muestra errores', async () => {
  window.fetch.mockReturnValue(respuesta(200, { id: 1, nombreUsuario: 'ana' }));
  // jsdom no sabe navegar a bienvenida.html y lo avisa por consola; aquí se silencia
  jest.spyOn(console, 'error').mockImplementation(() => {});

  boton().click();
  await terminar();

  expect(window.fetch).toHaveBeenCalledTimes(1);
  const [ruta, opciones] = window.fetch.mock.calls[0];
  expect(ruta).toBe('/api/auth/login');
  expect(opciones.method).toBe('POST');
  expect(JSON.parse(opciones.body)).toEqual({ email: 'ana@ejemplo.com', password: 'Secreta123' });
  expect(errorVisible()).toBeNull();
  console.error.mockRestore();
});

test('mientras se envía, el botón está desactivado para no enviar dos veces', async () => {
  window.fetch.mockReturnValue(new Promise(() => {})); // el servidor no contesta todavía

  boton().click();
  await terminar();

  expect(boton().disabled).toBe(true);
});

test('datos incorrectos: muestra el mensaje del servidor y deja reintentar', async () => {
  window.fetch.mockReturnValue(respuesta(401, { error: 'Email o contraseña incorrectos' }));

  boton().click();
  await terminar();

  expect(errorVisible()).toBe('Email o contraseña incorrectos');
  expect(boton().disabled).toBe(false);
});

test('al reintentar se oculta el error del intento anterior', async () => {
  window.fetch.mockReturnValueOnce(respuesta(429, { error: 'Demasiados intentos' }));
  boton().click();
  await terminar();
  expect(errorVisible()).toBe('Demasiados intentos');

  window.fetch.mockReturnValueOnce(new Promise(() => {}));
  boton().click();
  await terminar();

  expect(errorVisible()).toBeNull();
});
