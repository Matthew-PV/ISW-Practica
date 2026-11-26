/**
 * @jest-environment jsdom
 */

// Si falla la carga de una pantalla, solo un 401 lleva al login; en lo demás se avisa y se deja reintentar.
const { leer, cargarScripts } = require('../helpers/pantalla');

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const terminar = () => new Promise((r) => setTimeout(r, 0));

const PANTALLAS = ['cuenta/bienvenida', 'experiencias/explorar', 'cuenta/mis-planes', 'cuenta/ajustes', 'cuenta/perfil', 'social/usuario'];

// Abre la página con sus propios <script> (sin la cabecera, que pide lo suyo) y todas las peticiones respondiendo `fallo`
async function abrir(nombre, fallo) {
  const html = leer(`/paginas/${nombre}.html`);
  document.documentElement.innerHTML = html;
  Object.defineProperty(window, 'location', {
    value: { search: '?nombre=lucia', href: '', pathname: `/paginas/${nombre}.html` }, configurable: true, writable: true,
  });
  window.fetch = jest.fn(fallo);
  const scripts = [...html.matchAll(/src="\/(js\/[^"]+)"/g)].map((m) => m[1]).filter((s) => !/cabecera|movimiento/.test(s));
  window.movimientoPausado = () => true;
  window.fijarMovimiento = () => {};
  cargarScripts(scripts);
  await terminar();
  await terminar();
}

const locationReal = window.location;
afterEach(() => Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true }));

test.each(PANTALLAS)('%s: con un error del servidor se queda y ofrece reintentar', async (nombre) => {
  await abrir(nombre, () => respuesta(500, { error: 'Error interno del servidor' }));

  expect(window.location.href).not.toContain('iniciar-sesion');
  const caja = document.querySelector('#error-carga');
  expect(caja.textContent).toContain('Error interno del servidor');

  const llamadas = window.fetch.mock.calls.length;
  caja.querySelector('button').click();
  await terminar();
  expect(window.fetch.mock.calls.length).toBeGreaterThan(llamadas);
});
