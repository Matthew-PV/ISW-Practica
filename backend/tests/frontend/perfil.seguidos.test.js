/**
 * @jest-environment jsdom
 */
// CS-72, objetivo 2: contador y pestaña «Siguiendo» en la pantalla de mi perfil
// (frontend/paginas/cuenta/perfil.html y js/cuenta/perfil.js) en un navegador simulado (jsdom).
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('/paginas/cuenta/perfil.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/planes.js', 'js/shared/experiencias.js', 'js/cuenta/perfil.js'];
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: null, ciudad: null };

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const oculto = (selector) => $(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

const persona = (id) => ({ id, nombreUsuario: `usuario_${id}`, foto: '/img/foto-por-defecto.svg' });
const personas = (desde, hasta) => Array.from({ length: hasta - desde + 1 }, (_, i) => persona(desde + i));
const listado = (lista, siguiente = null) => ({ personas: lista, siguiente });

const RESUMEN = '/api/perfil/resumen';
const SEGUIDOS = '/api/perfil/seguidos?limite=20';
const SEGUIDOS_2 = '/api/perfil/seguidos?limite=20&despuesDe=23';

// Lo que responde el servidor simulado si la prueba no indica otra cosa: un perfil sin relaciones.
const SIN_RELACIONES = {
  '/api/perfil': [200, PERFIL],
  '/api/amistades/solicitudes': [200, []],
  [RESUMEN]: [200, { amigos: 0, seguidores: 0, seguidos: 0 }],
  '/api/perfil/amigos?limite=20': [200, listado([])],
  '/api/perfil/seguidores?limite=20': [200, listado([])],
  [SEGUIDOS]: [200, listado([])],
};

async function abrirPerfil(rutas = {}) {
  const servidor = { ...SIN_RELACIONES, ...rutas };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta) => {
    const [status, cuerpo] = servidor[ruta] ?? [404, { error: `Ruta no simulada: ${ruta}` }];
    return respuesta(status, cuerpo);
  });
  cargarScripts(SCRIPTS);
  await terminar();
}

test('muestra a cuántas personas sigo', async () => {
  await abrirPerfil({ [RESUMEN]: [200, { amigos: 2, seguidores: 5, seguidos: 4 }] });

  expect($('#total-seguidos').textContent).toBe('4');
  expect($('#total-seguidos').nextElementSibling.textContent).toBe('siguiendo');
});

test('hay una pestaña «Siguiendo» que abre su propio panel', async () => {
  await abrirPerfil();

  expect($('#pestana-seguidos').textContent).toBe('Siguiendo');
  expect($('#pestana-seguidos').getAttribute('aria-controls')).toBe('panel-seguidos');
  expect($('#panel-seguidos')).not.toBeNull();
});

test('lista a las personas que sigo, cada una enlazada a su perfil', async () => {
  await abrirPerfil({ [SEGUIDOS]: [200, listado(personas(2, 3))] });

  expect($('#lista-seguidos').children).toHaveLength(2);
  expect($('#lista-seguidos').textContent).toContain('usuario_2');
  expect($('#lista-seguidos a').getAttribute('href')).toBe('/paginas/social/usuario.html?nombre=usuario_2');
  expect(oculto('#sin-seguidos')).toBe(true);
});

test('quien no sigue a nadie ve un cero y un aviso, sin error', async () => {
  await abrirPerfil();

  expect($('#total-seguidos').textContent).toBe('0');
  expect($('#lista-seguidos').children).toHaveLength(0);
  expect(oculto('#sin-seguidos')).toBe(false);
  expect(oculto('#mas-seguidos')).toBe(true);
  expect(oculto('#error-relaciones')).toBe(true);
});

test('«Cargar más» pide la página siguiente y la añade sin repetir a nadie', async () => {
  await abrirPerfil({
    [SEGUIDOS]: [200, listado(personas(4, 23), 23)],
    [SEGUIDOS_2]: [200, listado(personas(23, 28))],
  });
  expect(oculto('#mas-seguidos')).toBe(false);

  $('#mas-seguidos').click();
  await terminar();

  const nombres = [...$('#lista-seguidos').children].map((fila) => fila.textContent.trim());
  expect(window.fetch.mock.calls.at(-1)[0]).toBe(SEGUIDOS_2);
  expect(nombres).toHaveLength(25);
  expect(new Set(nombres).size).toBe(25);
  expect(oculto('#mas-seguidos')).toBe(true);
});

test('si falla la lista se muestra el error y el resto del perfil sigue funcionando', async () => {
  await abrirPerfil({ [SEGUIDOS]: [500, { error: 'Error temporal' }] });

  expect(oculto('#error-relaciones')).toBe(false);
  expect($('#error-relaciones').textContent).toContain('Error temporal');
  expect($('#nombre-perfil').textContent).toBe('ana');
});