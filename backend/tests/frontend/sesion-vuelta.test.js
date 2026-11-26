/**
 * @jest-environment jsdom
 */
// Sesión: se vuelve a donde se iba tras entrar, un guardado sin sesión no tira lo escrito y el
// botón atrás no restaura una pantalla congelada.
const { leer, cargarScripts } = require('../helpers/pantalla');

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const aviso = () => document.querySelector('.aviso-sesion');
const ir = (ruta) => window.history.pushState(null, '', ruta);

beforeAll(() => {
  document.documentElement.innerHTML = leer('/paginas/acceso/iniciar-sesion.html');
  window.fetch = jest.fn();
  cargarScripts(['js/shared/api.js']);
});
beforeEach(() => {
  document.body.innerHTML = '';
  window.fetch.mockReset();
});

test('el destino tras entrar es la pantalla que se pedía', () => {
  ir('/paginas/acceso/iniciar-sesion.html?volver=%2Fpaginas%2Fexperiencias%2Fexperiencia.html%3Fid%3D7');
  expect(window.destinoTrasAcceso()).toBe('/paginas/experiencias/experiencia.html?id=7');
});

test.each(['', 'https://malo.test/', '//malo.test/x.html', '/paginas/acceso/registro.html', '/paginas/../x.html'])(
  'una vuelta no válida («%s») lleva a Inicio', (volver) => {
    ir(`/paginas/acceso/iniciar-sesion.html?volver=${encodeURIComponent(volver)}`);
    expect(window.destinoTrasAcceso()).toBe('/paginas/cuenta/bienvenida.html');
  });

test('guardar sin sesión avisa una sola vez con un enlace en otra pestaña', async () => {
  ir('/paginas/cuenta/mis-planes.html');
  window.fetch.mockReturnValue(respuesta(401, { error: 'Debes iniciar sesión' }));
  await expect(window.api('/experiencias', { method: 'POST' })).rejects.toThrow();
  await expect(window.api('/experiencias', { method: 'POST' })).rejects.toThrow();
  expect(document.querySelectorAll('.aviso-sesion')).toHaveLength(1);
  expect(aviso().querySelector('a').target).toBe('_blank');
});

test.each([
  ['/paginas/cuenta/mis-planes.html', undefined],
  ['/paginas/acceso/iniciar-sesion.html', 'POST'],
])('sin aviso al leer o en las pantallas de acceso (%s)', async (ruta, method) => {
  ir(ruta);
  window.fetch.mockReturnValue(respuesta(401, {}));
  await expect(window.api('/x', { method })).rejects.toThrow();
  expect(aviso()).toBeNull();
});
