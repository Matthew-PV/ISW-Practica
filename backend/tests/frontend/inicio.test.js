/**
 * @jest-environment jsdom
 */

// Inicio (/cuenta/bienvenida.html): saludo y tiras de planes de ejemplo con «Ver más» hacia Explorar.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/cuenta/bienvenida.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/ejemplos.js', 'js/bienvenida.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));

async function abrir(rutas) {
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta) => (rutas[ruta] ? rutas[ruta]() : respuesta(404, { error: 'No encontrado' })));
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

const SESION = { '/api/auth/yo': () => respuesta(200, { id: 1, nombreUsuario: 'ana' }) };

test('saluda por el nombre y no muestra los planes del usuario', async () => {
  await abrir({ ...SESION, '/api/perfil': () => respuesta(200, { ciudad: 'Sevilla' }) });

  expect($('#nombre-usuario').textContent).toBe('ana');
  expect(window.fetch.mock.calls.map(([ruta]) => ruta)).not.toContain('/api/experiencias?autor=ana');
});

test('muestra tres tiras con tarjetas y un «Ver más» al explorador', async () => {
  await abrir({ ...SESION, '/api/perfil': () => respuesta(200, { ciudad: 'Sevilla' }) });

  const tiras = [...document.querySelectorAll('.tira')];
  expect(tiras).toHaveLength(3);
  for (const tira of tiras) expect(tira.querySelectorAll('.tarjeta-plan').length).toBeGreaterThan(0);
  expect(tiras.map((t) => t.querySelector('.tira-ver-mas').getAttribute('href'))).toEqual([
    '/experiencias/explorar.html?tira=ciudad',
    '/experiencias/explorar.html?tira=nuevos',
    '/experiencias/explorar.html?tira=amigos',
  ]);
});

test('cada fila de tarjetas se puede enfocar y desplazar con teclado, con el título de su tira por nombre', async () => {
  await abrir({ ...SESION, '/api/perfil': () => respuesta(200, { ciudad: 'Sevilla' }) });

  for (const tira of document.querySelectorAll('.tira')) {
    const fila = tira.querySelector('.tira-fila');
    expect(fila.getAttribute('tabindex')).toBe('0');
    expect(fila.getAttribute('role')).toBe('group');
    expect(fila.getAttribute('aria-labelledby')).toBe(tira.querySelector('h2').id);
  }
});

test('la tira de la ciudad lleva la ciudad del perfil debajo del título', async () => {
  await abrir({ ...SESION, '/api/perfil': () => respuesta(200, { ciudad: 'Sevilla' }) });

  expect($('.tira .tira-subtitulo').textContent).toBe('Sevilla');
  expect($('.tira .card-subtitle').textContent).toContain('Sevilla');
});

test('sin ciudad en el perfil o si falla, usa Madrid', async () => {
  await abrir({ ...SESION, '/api/perfil': () => respuesta(500, { error: 'x' }) });

  expect($('.tira .tira-subtitulo').textContent).toBe('Madrid');
});

test('sin sesión vuelve al inicio de sesión', async () => {
  const locationReal = window.location;
  Object.defineProperty(window, 'location', { value: { search: '', href: '' }, configurable: true, writable: true });
  await abrir({ '/api/auth/yo': () => respuesta(401, { error: 'No autenticado' }) });

  expect(window.location.href).toBe('/acceso/iniciar-sesion.html');
  Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
});
