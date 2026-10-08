/**
 * @jest-environment jsdom
 */
// CS-64, objetivo 7: formulario «Cambiar contraseña» de perfil.html (js/perfil.js), con jsdom y
// un servidor simulado que responde según el método y la ruta.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('perfil.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/experiencias.js', 'js/shared/password.js', 'js/perfil.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const visible = (selector) => !$(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

const SERVIDOR = {
  'GET /api/perfil': [200, { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', ciudad: null, foto: null }],
  'GET /api/amistades/solicitudes': [200, []],
  'GET /api/perfil/resumen': [200, { amigos: 0, seguidores: 0 }],
  'GET /api/perfil/amigos?limite=20': [200, { personas: [], siguiente: null }],
  'GET /api/perfil/seguidores?limite=20': [200, { personas: [], siguiente: null }],
  'GET /api/experiencias?autor=ana': [200, { experiencias: [], siguiente: null }],
};

async function abrir(rutas = {}) {
  const servidor = { ...SERVIDOR, ...rutas };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    return respuesta(...(servidor[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }]));
  });
  cargarScripts(SCRIPTS);
  await terminar();
}

function rellenar(actual, nueva, repetida) {
  for (const [id, valor] of [['#password-actual', actual], ['#password-nueva', nueva], ['#password-repetida', repetida]]) {
    $(id).value = valor;
    $(id).dispatchEvent(new Event('input'));
  }
}
const enviar = async () => {
  $('#form-password').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();
};
const peticionesPut = () => window.fetch.mock.calls.filter(([, opciones = {}]) => opciones.method === 'PUT');

test('los requisitos se marcan mientras se escribe, con el nombre de usuario del perfil', async () => {
  await abrir();

  rellenar('', 'Ana12345X', '');

  const requisito = [...document.querySelectorAll('#requisitos-password li')].find((li) => li.textContent.includes('nombre de usuario'));
  expect(requisito.dataset.cumple).toBe('false');
});

test('si las dos contraseñas nuevas no coinciden se avisa y no se envía nada', async () => {
  await abrir();
  rellenar('Antigua123', 'Nueva12345', 'Nueva12346');

  await enviar();

  expect(visible('#error-password')).toBe(true);
  expect($('#error-password').textContent).toBe('Las dos contraseñas nuevas no coinciden');
  expect(peticionesPut()).toHaveLength(0);
});

test('al cambiarla se envían la actual y la nueva, se confirma y se vacía el formulario', async () => {
  await abrir({ 'PUT /api/perfil/password': [204, null] });
  rellenar('Antigua123', 'Nueva12345', 'Nueva12345');

  await enviar();

  const [[ruta, opciones]] = peticionesPut();
  expect(ruta).toBe('/api/perfil/password');
  expect(JSON.parse(opciones.body)).toEqual({ actual: 'Antigua123', nueva: 'Nueva12345' });
  expect($('#exito-password').textContent).toBe('Contraseña cambiada.');
  expect($('#password-actual').value).toBe('');
  expect($('#password-nueva').value).toBe('');
});

test('si el servidor la rechaza se muestra su mensaje y no se borra lo escrito', async () => {
  await abrir({ 'PUT /api/perfil/password': [400, { error: 'La contraseña actual no es correcta' }] });
  rellenar('Equivocada1', 'Nueva12345', 'Nueva12345');

  await enviar();

  expect($('#error-password').textContent).toBe('La contraseña actual no es correcta');
  expect($('#password-nueva').value).toBe('Nueva12345');
  expect(visible('#exito-password')).toBe(false);
});
