/**
 * @jest-environment jsdom
 */

// Inicio (/paginas/cuenta/bienvenida.html): saludo y tiras de planes reales con «Ver más» hacia Explorar.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/paginas/cuenta/bienvenida.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/planes.js', 'js/cuenta/bienvenida.js'];

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

const plan = (id, extra = {}) => ({
  id, titulo: `Plan ${id}`, descripcion: 'Descripción', tipo: 'Gastronomía', visibilidad: 'PUBLICA',
  ciudad: { id: 3, nombre: 'Sevilla', pais: 'España' }, autor: { id: 2, nombreUsuario: 'lucia', foto: null }, ...extra,
});
const lista = (...planes) => () => respuesta(200, { experiencias: planes, siguiente: null });

// Rutas de una sesión con perfil en Sevilla y una tira con planes en cada petición
const rutasBase = (extra = {}) => ({
  ...SESION,
  '/api/perfil': () => respuesta(200, { ciudad: 'Sevilla' }),
  '/api/ciudades': () => respuesta(200, [{ id: 1, nombre: 'Madrid', pais: 'España' }, { id: 3, nombre: 'Sevilla', pais: 'España' }]),
  '/api/experiencias?ciudadId=3&limite=8': lista(plan(1), plan(2)),
  '/api/experiencias?limite=8': lista(plan(3)),
  '/api/experiencias?amigos=true&limite=8': lista(plan(4)),
  ...extra,
});

test('muestra tres tiras con planes reales y un «Ver más» al explorador', async () => {
  await abrir(rutasBase());

  const tiras = [...document.querySelectorAll('.tira')];
  expect(tiras).toHaveLength(3);
  expect(tiras.map((t) => t.querySelectorAll('.tarjeta-plan').length)).toEqual([2, 1, 1]);
  expect(tiras.map((t) => t.querySelector('.tira-ver-mas').getAttribute('href'))).toEqual([
    '/paginas/experiencias/explorar.html?tira=ciudad',
    '/paginas/experiencias/explorar.html?tira=nuevos',
    '/paginas/experiencias/explorar.html?tira=amigos',
  ]);
});

test('cada tarjeta abre el detalle de su plan y muestra su ciudad real', async () => {
  await abrir(rutasBase({ '/api/experiencias?limite=8': lista(plan(7, { ciudad: { id: 9, nombre: 'Viena', pais: 'Austria' } })) }));

  const tarjeta = document.querySelectorAll('.tira')[1].querySelector('.tarjeta-plan');
  expect(tarjeta.getAttribute('href')).toBe('/paginas/experiencias/experiencia.html?id=7');
  expect(tarjeta.textContent).toContain('Viena');
  expect(tarjeta.textContent).toContain('lucia');
  expect(document.body.textContent).not.toContain('Tapas por La Latina');
});

test('cada fila de tarjetas se puede enfocar y desplazar con teclado, con el título de su tira por nombre', async () => {
  await abrir(rutasBase());

  for (const tira of document.querySelectorAll('.tira')) {
    const fila = tira.querySelector('.tira-fila');
    expect(fila.getAttribute('tabindex')).toBe('0');
    expect(fila.getAttribute('role')).toBe('group');
    expect(fila.getAttribute('aria-labelledby')).toBe(tira.querySelector('h2').id);
  }
});

test('la tira de la ciudad lleva la ciudad del perfil debajo del título y pide solo sus planes', async () => {
  await abrir(rutasBase());

  expect($('.tira .tira-subtitulo').textContent).toBe('Sevilla');
  expect(window.fetch.mock.calls.map(([ruta]) => ruta)).toContain('/api/experiencias?ciudadId=3&limite=8');
});

test('encuentra la ciudad del perfil aunque difieran las mayúsculas y los acentos', async () => {
  await abrir(rutasBase({ '/api/perfil': () => respuesta(200, { ciudad: ' sevilla ' }) }));

  expect($('.tira .tarjeta-plan')).not.toBeNull();
});

test('sin ciudad en el perfil, la tira de la ciudad pide indicarla y no inventa planes', async () => {
  await abrir(rutasBase({ '/api/perfil': () => respuesta(200, { ciudad: null }) }));

  const tira = $('.tira');
  expect(tira.querySelectorAll('.tarjeta-plan')).toHaveLength(0);
  expect(tira.querySelector('.tira-vacia').textContent).toContain('perfil');
  expect(window.fetch.mock.calls.map(([ruta]) => ruta).filter((r) => r.includes('ciudadId'))).toHaveLength(0);
});

test('una tira sin planes lo dice, y si una tira falla las demás se siguen viendo', async () => {
  await abrir(rutasBase({
    '/api/experiencias?amigos=true&limite=8': lista(),
    '/api/experiencias?limite=8': () => respuesta(500, { error: 'fallo' }),
  }));

  const tiras = [...document.querySelectorAll('.tira')];
  expect(tiras[2].querySelector('.tira-vacia').textContent).toMatch(/amigos/);
  expect(tiras[1].querySelector('.tira-vacia')).not.toBeNull();
  expect(tiras[0].querySelectorAll('.tarjeta-plan')).toHaveLength(2);
});

test('sin sesión vuelve al inicio de sesión', async () => {
  const locationReal = window.location;
  Object.defineProperty(window, 'location', { value: { search: '', href: '' }, configurable: true, writable: true });
  await abrir({ '/api/auth/yo': () => respuesta(401, { error: 'No autenticado' }) });

  expect(window.location.href).toBe('/paginas/acceso/iniciar-sesion.html');
  Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
});
