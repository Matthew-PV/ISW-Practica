/**
 * @jest-environment jsdom
 */
// CS-66: diseño de la página de ajustes (/cuenta/ajustes.html y js/ajustes.js) en jsdom: datos, contraseña y
// «Cerrar sesión» en su propia página, y botones secundarios con estado de espera.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/cuenta/ajustes.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/password.js', 'js/ajustes.js'];
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', ciudad: null, foto: null };

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function abrir(rutas = {}) {
  const servidor = { 'GET /api/perfil': [200, PERFIL], ...rutas };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    return respuesta(...(servidor[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }]));
  });
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

test('al cargar rellena el formulario con los datos del perfil', async () => {
  await abrir({ 'GET /api/perfil': [200, { ...PERFIL, ciudad: 'Madrid' }] });

  expect($('#nombreUsuario').value).toBe('ana');
  expect($('#email').value).toBe('ana@ejemplo.com');
  expect($('#ciudad').value).toBe('Madrid');
});

test('los ajustes se reparten en pestañas: perfil y contraseña, y solo se ve la elegida', async () => {
  await abrir();

  const pestanas = [...document.querySelectorAll('#pestanas-ajustes [role="tab"]')];
  expect(pestanas.map((p) => p.textContent)).toEqual(['Perfil', 'Contraseña']);
  expect($('#panel-datos').hidden).toBe(false);
  expect($('#panel-password').hidden).toBe(true);

  pestanas[1].click();

  expect($('#panel-password').hidden).toBe(false);
  expect($('#panel-datos').hidden).toBe(true);
  expect($('#panel-password').querySelector('#form-password')).not.toBeNull();
  // Cerrar sesión vive en el menú de la cuenta, no en una pestaña propia
  expect($('#panel-sesion')).toBeNull();
  expect(document.querySelector('.menu-cuenta [data-cerrar-sesion]')).not.toBeNull();
});

describe('botones de ajustes', () => {
  test('ajustes no tiene ningún botón principal', async () => {
    await abrir();

    expect(document.querySelector('.btn-primary')).toBeNull();
  });

  test('tiene los datos y la contraseña, sin nada plegado y sin «Cerrar sesión» (está en el menú)', async () => {
    await abrir();

    expect($('main details')).toBeNull();
    expect($('main #form-perfil')).not.toBeNull();
    expect($('main #form-password')).not.toBeNull();
    expect($('main [data-cerrar-sesion]')).toBeNull();
  });

  test('«Guardar cambios» pasa a «Guardando…», ocupado y desactivado mientras espera', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    const boton = $('#form-perfil button[type="submit"]');
    expect(boton.textContent).toBe('Guardar cambios');
    expect(boton.classList.contains('btn-outline-primary')).toBe(true);
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#form-perfil').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    expect(boton.textContent).toBe('Guardando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');
  });

  test('«Guardar cambios» recupera su texto al terminar', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    const boton = $('#form-perfil button[type="submit"]');

    $('#form-perfil').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    expect(boton.textContent).toBe('Guardar cambios');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
  });

  test('«Cambiar contraseña» pasa a «Cambiando…» mientras espera y luego se recupera', async () => {
    await abrir({ 'PUT /api/perfil/password': [204, null] });
    const boton = $('#form-password button[type="submit"]');
    expect(boton.classList.contains('btn-outline-primary')).toBe(true);
    $('#password-actual').value = 'Actual123X';
    $('#password-nueva').value = 'Nueva12345X';
    $('#password-repetida').value = 'Nueva12345X';
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#form-password').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();
    expect(boton.textContent).toBe('Cambiando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');
  });
});
