/**
 * @jest-environment jsdom
 */

// Explorar (/paginas/experiencias/explorar.html): planes reales con filtros de categoría, momento, ciudad y amigos.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/paginas/experiencias/explorar.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/planes.js', 'js/experiencias/explorar.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));

const plan = (id, extra = {}) => ({
  id, titulo: `Plan ${id}`, descripcion: 'Descripción', tipo: 'Gastronomía', visibilidad: 'PUBLICA',
  ciudad: { id: 3, nombre: 'Sevilla', pais: 'España' }, autor: { id: 2, nombreUsuario: 'lucia', foto: null }, ...extra,
});

const OPCIONES = {
  categorias: ['Gastronomía', 'Cultura'],
  momentos: [{ grupo: 'Franja del día', valores: ['Mañana', 'Noche'] }, { grupo: 'Estación', valores: ['Verano'] }],
};
const CIUDADES = [{ id: 1, nombre: 'Madrid', pais: 'España' }, { id: 3, nombre: 'Sevilla', pais: 'España' }];

// Servidor simulado: cada petición a /experiencias se responde con `planes(parametros)`
function servidor(planes = () => ({ experiencias: [plan(1), plan(2)], siguiente: null }), perfil = { ciudad: 'Sevilla' }) {
  return jest.fn((ruta) => {
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1, nombreUsuario: 'ana' });
    if (ruta === '/api/perfil') return respuesta(200, perfil);
    if (ruta === '/api/ciudades') return respuesta(200, CIUDADES);
    if (ruta === '/api/experiencias/opciones') return respuesta(200, OPCIONES);
    if (ruta.startsWith('/api/experiencias?')) return respuesta(200, planes(new URLSearchParams(ruta.split('?')[1])));
    return respuesta(404, { error: 'No encontrado' });
  });
}

const peticionesDePlanes = () => window.fetch.mock.calls.map(([ruta]) => ruta).filter((r) => r.startsWith('/api/experiencias?'));

async function abrir(busqueda = '', fetchSimulado = servidor()) {
  window.history.pushState({}, '', `/paginas/experiencias/explorar.html${busqueda}`);
  document.documentElement.innerHTML = HTML;
  window.fetch = fetchSimulado;
  cargarScripts(SCRIPTS);
  for (let i = 0; i < 6; i += 1) await terminar();
}

const botonCategoria = (texto) => [...document.querySelectorAll('#filtros button')].find((b) => b.textContent === texto);

test('empieza con los planes reales, cada tarjeta enlaza a su detalle y «Todos» está marcado', async () => {
  await abrir();

  const tarjetas = [...document.querySelectorAll('#resultados .tarjeta-plan')];
  expect(tarjetas.map((t) => t.getAttribute('href'))).toEqual([
    '/paginas/experiencias/experiencia.html?id=1', '/paginas/experiencias/experiencia.html?id=2',
  ]);
  expect($('#filtros [aria-pressed="true"]').textContent).toBe('Todos');
  expect($('#total-planes').textContent).toBe('2 planes');
  expect(peticionesDePlanes()).toEqual(['/api/experiencias?limite=12']);
});

test('los botones de categoría salen de las opciones del backend', async () => {
  await abrir();

  expect([...document.querySelectorAll('#filtros button')].map((b) => b.textContent)).toEqual(['Todos', 'Gastronomía', 'Cultura']);
});

test('elegir una categoría vuelve a pedir los planes con ese filtro', async () => {
  await abrir();

  botonCategoria('Cultura').click();
  await terminar();
  await terminar();

  expect(peticionesDePlanes().at(-1)).toBe('/api/experiencias?categoria=Cultura&limite=12');
  expect(botonCategoria('Cultura').getAttribute('aria-pressed')).toBe('true');
  expect(botonCategoria('Todos').getAttribute('aria-pressed')).toBe('false');
});

test('el momento, la ciudad y «solo amigos» se combinan en la misma petición', async () => {
  await abrir();

  $('#filtro-momento').value = 'Verano';
  $('#filtro-momento').dispatchEvent(new Event('change'));
  $('#filtro-ciudad').value = '3';
  $('#filtro-ciudad').dispatchEvent(new Event('change'));
  $('#filtro-amigos').checked = true;
  $('#filtro-amigos').dispatchEvent(new Event('change'));
  await terminar();
  await terminar();

  expect(peticionesDePlanes().at(-1)).toBe('/api/experiencias?ciudadId=3&momento=Verano&amigos=true&limite=12');
});

test('«Cargar más» pide la página siguiente con el cursor y el contador avisa de que hay más', async () => {
  const fetchSimulado = servidor((params) => (params.get('despuesDe')
    ? { experiencias: [plan(3)], siguiente: null }
    : { experiencias: [plan(5), plan(4)], siguiente: 4 }));
  await abrir('', fetchSimulado);
  expect($('#total-planes').textContent).toBe('2 planes o más');
  expect($('#mas-planes').classList.contains('d-none')).toBe(false);

  $('#mas-planes').click();
  await terminar();
  await terminar();

  expect(peticionesDePlanes().at(-1)).toBe('/api/experiencias?despuesDe=4&limite=12');
  expect(document.querySelectorAll('#resultados .tarjeta-plan')).toHaveLength(3);
  expect($('#total-planes').textContent).toBe('3 planes');
  expect($('#mas-planes').classList.contains('d-none')).toBe(true);
});

test('sin planes para los filtros muestra el aviso de vacío', async () => {
  await abrir('', servidor(() => ({ experiencias: [], siguiente: null })));

  expect($('#sin-resultados').classList.contains('d-none')).toBe(false);
  expect($('#total-planes').textContent).toBe('0 planes');
});

test('si falla la petición muestra el error con «Reintentar»', async () => {
  await abrir('', jest.fn((ruta) => {
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1 });
    if (ruta.startsWith('/api/experiencias?')) return respuesta(500, { error: 'No se pudo cargar' });
    return respuesta(200, ruta === '/api/experiencias/opciones' ? OPCIONES : []);
  }));

  expect($('#error-planes').textContent).toContain('No se pudo cargar');
  expect($('#error-planes').classList.contains('d-none')).toBe(false);
});

test('?tira=ciudad titula la página y filtra por la ciudad del perfil', async () => {
  await abrir('?tira=ciudad');

  expect($('#titulo-explorar').textContent).toBe('Experiencias en mi ciudad');
  expect($('#filtro-ciudad').value).toBe('3');
  expect(peticionesDePlanes()).toEqual(['/api/experiencias?ciudadId=3&limite=12']);
});

test('?tira=amigos marca «solo amigos» desde el principio', async () => {
  await abrir('?tira=amigos');

  expect($('#filtro-amigos').checked).toBe(true);
  expect(peticionesDePlanes()).toEqual(['/api/experiencias?amigos=true&limite=12']);
});

test('?texto= viene de la búsqueda y se envía como filtro', async () => {
  await abrir('?texto=tapas');

  expect(peticionesDePlanes()).toEqual(['/api/experiencias?texto=tapas&limite=12']);
});

test('sin sesión vuelve al inicio de sesión', async () => {
  const locationReal = window.location;
  Object.defineProperty(window, 'location', { value: { search: '', href: '' }, configurable: true, writable: true });
  await abrir('', jest.fn(() => respuesta(401, { error: 'No autenticado' })));

  expect(window.location.href).toBe('/paginas/acceso/iniciar-sesion.html');
  Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
});
