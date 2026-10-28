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

  test('el perfil no tiene botón de guardar: se guarda solo', async () => {
    await abrir();

    expect($('#form-perfil button')).toBeNull();
    expect($('#form-perfil [type="submit"]')).toBeNull();
    expect($('#estado-guardado').getAttribute('role')).toBe('status');
  });

  test.each(['nombreUsuario', 'ciudad'])('al cambiar %s se guarda solo con nombre y ciudad', async (campo) => {
    await abrir({ 'PUT /api/perfil': [200, { ...PERFIL, nombreUsuario: 'ana2', ciudad: 'Leon' }] });
    $('#nombreUsuario').value = 'ana2';
    $('#ciudad').value = 'Leon';

    $(`#${campo}`).dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    const [[, opciones]] = window.fetch.mock.calls.filter(([r, o]) => r === '/api/perfil' && o?.method === 'PUT');
    expect(JSON.parse(opciones.body)).toEqual({ nombreUsuario: 'ana2', ciudad: 'Leon' });
    expect($('#estado-guardado').textContent).toBe('Guardado');
  });

  test('mientras guarda el estado dice «Guardando…»', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect($('#estado-guardado').textContent).toBe('Guardando…');
  });

  test('si el servidor rechaza el cambio se muestra su error y no «Guardado»', async () => {
    await abrir({ 'PUT /api/perfil': [400, { error: 'Ese nombre de usuario ya existe' }] });

    $('#nombreUsuario').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect($('#error-perfil').classList.contains('d-none')).toBe(false);
    expect($('#error-perfil').textContent).toBe('Ese nombre de usuario ya existe');
    expect($('#estado-guardado').textContent).toBe('');
  });

  test('con el nombre de usuario vacío no se envía', async () => {
    await abrir();
    $('#nombreUsuario').value = '';

    $('#nombreUsuario').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect(window.fetch.mock.calls.filter(([, o]) => o?.method === 'PUT')).toHaveLength(0);
  });

  test('la foto es un avatar grande que se pulsa para cambiarla (sin selector de archivo a la vista)', async () => {
    await abrir();

    const etiqueta = $('label.foto-editable[for="foto"]');
    expect(etiqueta).not.toBeNull();
    expect(etiqueta.querySelector('#foto-perfil')).not.toBeNull();
    expect(etiqueta.querySelector('svg.foto-editable-icono')).not.toBeNull();
    expect($('#foto').classList.contains('visually-hidden')).toBe(true);
    expect($('#foto').classList.contains('form-control')).toBe(false);
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
