/**
 * @jest-environment jsdom
 */
// CS-59, objetivo 7: la pantalla de registro (frontend/registro.html y js/registro.js) en un
// navegador simulado (jsdom). Se simulan el servidor (fetch) y el CAPTCHA (window.turnstile),
// así que no hace falta arrancar nada.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('registro.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/password.js', 'js/registro.js'];
const ERROR_RED = 'No se ha podido conectar con el servidor. Inténtalo de nuevo.';
const ERROR_CARGA_CAPTCHA = 'No se ha podido cargar el CAPTCHA. Revisa tu conexión y recarga la página.';

// Respuesta de fetch con el código y el JSON indicados
const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const boton = () => $('#form-registro button[type="submit"]');
const cajaError = () => $('#error-registro');
const errorVisible = () => (cajaError().classList.contains('d-none') ? null : cajaError().textContent);
// Deja que terminen las promesas pendientes (la llamada a fetch y lo que viene después)
const terminar = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  // Página nueva en cada prueba: el HTML de registro.html (sus <script> no se ejecutan así)
  // y después api.js y registro.js en el ámbito global, como los carga el navegador
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn();
  window.turnstile = { render: jest.fn(), getResponse: jest.fn(() => 'token-captcha'), reset: jest.fn() };
  cargarScripts(SCRIPTS);
  $('#nombreUsuario').value = 'ana';
  $('#email').value = 'ana@ejemplo.com';
  $('#password').value = 'secreta123';
});

describe('envío del formulario', () => {
  test('registro correcto: envía los datos con la respuesta del CAPTCHA y no muestra errores', async () => {
    window.fetch.mockReturnValue(respuesta(201, { id: 1, nombreUsuario: 'ana' }));
    // jsdom no sabe navegar a bienvenida.html y lo avisa por consola; aquí se silencia
    jest.spyOn(console, 'error').mockImplementation(() => {});

    boton().click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledTimes(1);
    const [ruta, opciones] = window.fetch.mock.calls[0];
    expect(ruta).toBe('/api/auth/registro');
    expect(JSON.parse(opciones.body)).toEqual({
      nombreUsuario: 'ana', email: 'ana@ejemplo.com', password: 'secreta123', captcha: 'token-captcha',
    });
    expect(errorVisible()).toBeNull();
    console.error.mockRestore();
  });

  test('mientras se envía, el botón indica que el registro está en curso y no deja enviar otra vez', async () => {
    window.fetch.mockReturnValue(new Promise(() => {})); // el servidor no contesta todavía

    boton().click();
    await terminar();
    boton().click();
    await terminar();

    expect(boton().disabled).toBe(true);
    expect(boton().textContent).toBe('Creando cuenta...');
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['datos inválidos', 'La contraseña debe tener entre 8 y 72 caracteres'],
    ['un email duplicado', 'El email ya está registrado'],
    ['un nombre duplicado', 'El nombre de usuario ya está en uso'],
    ['el CAPTCHA rechazado', 'No se ha podido verificar el CAPTCHA'],
  ])('con %s muestra el mensaje del servidor, reactiva el botón y reinicia el CAPTCHA', async (_, mensaje) => {
    window.fetch.mockReturnValue(respuesta(400, { error: mensaje }));

    boton().click();
    await terminar();

    expect(errorVisible()).toBe(mensaje);
    expect(boton().disabled).toBe(false);
    expect(boton().textContent).toBe('Crear cuenta');
    expect(window.turnstile.reset).toHaveBeenCalled();
  });

  test('fallo de red: muestra un mensaje claro y el reintento funciona', async () => {
    window.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    boton().click();
    await terminar();

    expect(errorVisible()).toBe(ERROR_RED);
    expect(boton().disabled).toBe(false);

    // Reintento: esta vez el servidor responde bien y el mensaje anterior desaparece
    window.fetch.mockReturnValue(respuesta(201, { id: 1, nombreUsuario: 'ana' }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    boton().click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(errorVisible()).toBeNull();
    console.error.mockRestore();
  });
});

describe('carga del CAPTCHA', () => {
  test('pinta el CAPTCHA con la clave pública que da el servidor', async () => {
    window.fetch.mockReturnValue(respuesta(200, { siteKey: 'clave-publica' }));

    await window.iniciarCaptcha();

    expect(window.fetch.mock.calls[0][0]).toBe('/api/auth/captcha');
    expect(window.turnstile.render).toHaveBeenCalledWith('#captcha', expect.objectContaining({ sitekey: 'clave-publica' }));
    expect(errorVisible()).toBeNull();
  });

  test('si el script de Turnstile no carga, avisa al usuario', () => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=iniciarCaptcha';
    document.body.append(script);

    script.dispatchEvent(new Event('error'));

    expect(errorVisible()).toBe(ERROR_CARGA_CAPTCHA);
  });

  test('si falla otro recurso de la página, no habla del CAPTCHA', () => {
    const img = document.createElement('img');
    document.body.append(img);

    img.dispatchEvent(new Event('error'));

    expect(errorVisible()).toBeNull();
  });

  test('si no se puede pedir la clave al servidor (sin red), avisa y no pinta el CAPTCHA', async () => {
    window.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await window.iniciarCaptcha();

    expect(errorVisible()).toBe(ERROR_CARGA_CAPTCHA);
    expect(window.turnstile.render).not.toHaveBeenCalled();
  });

  test('si el servidor no tiene configurada la clave, avisa y no pinta el CAPTCHA', async () => {
    window.fetch.mockReturnValue(respuesta(200, {}));

    await window.iniciarCaptcha();

    expect(errorVisible()).toBe(ERROR_CARGA_CAPTCHA);
    expect(window.turnstile.render).not.toHaveBeenCalled();
  });

  test('si Turnstile informa de un error, se muestra un mensaje', async () => {
    window.fetch.mockReturnValue(respuesta(200, { siteKey: 'clave-publica' }));
    await window.iniciarCaptcha();
    const opciones = window.turnstile.render.mock.calls[0][1];

    opciones['error-callback']('110200');

    expect(errorVisible()).toBe('No se ha podido verificar el CAPTCHA. Inténtalo de nuevo.');

    // Reintento: al resolverse el CAPTCHA, el aviso desaparece
    opciones.callback('token-nuevo');
    expect(errorVisible()).toBeNull();
  });

  test('al resolverse el CAPTCHA tras un error del servidor, el mensaje del servidor se mantiene', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, { siteKey: 'clave-publica' }));
    await window.iniciarCaptcha();
    const opciones = window.turnstile.render.mock.calls[0][1];
    window.fetch.mockReturnValue(respuesta(400, { error: 'El email ya está registrado' }));
    boton().click();
    await terminar();

    // Tras el error se reinicia el CAPTCHA y Turnstile lo vuelve a resolver
    opciones.callback('token-nuevo');

    expect(errorVisible()).toBe('El email ya está registrado');
  });
});


describe('requisitos de la contraseña (CS-64)', () => {
  // Requisitos que se ven cumplidos, en el orden de la lista
  const cumplidos = () => [...document.querySelectorAll('#requisitos-password li')]
    .filter((li) => li.dataset.cumple === 'true')
    .map((li) => li.textContent.replace(/^\S+ /, ''));
  const escribir = (campo, valor) => {
    $(campo).value = valor;
    $(campo).dispatchEvent(new Event('input'));
  };

  test('se muestran los cinco requisitos', () => {
    expect([...document.querySelectorAll('#requisitos-password li')].map((li) => li.textContent.replace(/^\S+ /, ''))).toEqual([
      'entre 8 y 72 caracteres', 'al menos una mayúscula', 'al menos una minúscula', 'al menos un número', 'sin el nombre de usuario',
    ]);
  });

  test('se marcan mientras se escribe', () => {
    escribir('#password', 'Secreta123');
    expect(cumplidos()).toHaveLength(5);

    escribir('#password', 'secreta123');
    expect(cumplidos()).not.toContain('al menos una mayúscula');
    expect(cumplidos()).toHaveLength(4);
  });

  test('el requisito del nombre se actualiza también al cambiar el nombre de usuario', () => {
    escribir('#password', 'Ana12345X');
    expect(cumplidos()).not.toContain('sin el nombre de usuario');

    escribir('#nombreUsuario', 'luis');
    expect(cumplidos()).toContain('sin el nombre de usuario');
  });
});
