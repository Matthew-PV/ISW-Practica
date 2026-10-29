/**
 * @jest-environment jsdom
 */

// Landing pública (index.html): estructura estática; su único script lleva a Inicio si hay sesión.
// Se comprueba su estructura leyendo el HTML con jsdom.

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');

const leer = (archivo) =>
  fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = leer('index.html');
});

describe('landing', () => {
  test('tiene exactamente un h1 con texto', () => {
    const titulos = document.querySelectorAll('h1');
    expect(titulos).toHaveLength(1);
    expect(titulos[0].textContent.trim()).toBe(
      'Comparte y descubre planes por tu ciudad'
    );
  });

  test('enlaza a iniciar sesión y a crear cuenta', () => {
    expect(
      document.querySelectorAll('a[href="/paginas/acceso/iniciar-sesion.html"]').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      document.querySelectorAll('a[href="/paginas/acceso/registro.html"]').length
    ).toBeGreaterThanOrEqual(1);
  });

  test('muestra la ilustración de portada con su descripción', () => {
    const imagen = document.querySelector('.landing-ilustracion img');
    expect(imagen).not.toBeNull();
    expect(imagen.getAttribute('src')).toBe('/img/ilustracion-portada.svg');
    expect(imagen.getAttribute('alt')).not.toBe('');
    expect(document.querySelector('.marco-captura')).toBeNull();
  });

  test('tiene tres bloques con h2 y párrafo', () => {
    const bloques = document.querySelectorAll('.bloque-landing');
    expect(bloques).toHaveLength(3);
    bloques.forEach((bloque) => {
      expect(bloque.querySelector('h2').textContent.trim()).not.toBe('');
      expect(bloque.querySelector('p').textContent.trim()).not.toBe('');
      expect(bloque.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });
  });

  test('explica cómo funciona en tres pasos de una lista ordenada', () => {
    const pasos = document.querySelectorAll('main ol > li');
    expect(pasos).toHaveLength(3);
  });

  test('la capa de movimiento es decorativa: oculta a lectores y sin texto ni enlaces', () => {
    const decorativos = document.querySelectorAll('.landing-fondo, .landing-mancha, .landing-cierre-pin');
    expect(decorativos.length).toBeGreaterThanOrEqual(3);
    decorativos.forEach((el) => {
      expect(el.getAttribute('aria-hidden')).toBe('true');
      expect(el.textContent.trim()).toBe('');
      expect(el.querySelector('a, button, input')).toBeNull();
    });
  });

  test('cada paso de «Cómo funciona» lleva su dibujo decorativo', () => {
    const pasos = document.querySelectorAll('main ol > li');
    pasos.forEach((paso) => {
      const dibujo = paso.querySelector('svg.paso-dibujo');
      expect(dibujo).not.toBeNull();
      expect(dibujo.getAttribute('aria-hidden')).toBe('true');
      expect(dibujo.querySelector('text')).toBeNull();
    });
  });

  test('solo incluye los scripts de la sesión y de la pausa del movimiento', () => {
    const scripts = [...document.querySelectorAll('script')].map((s) => s.getAttribute('src'));
    expect(scripts).toEqual(['js/shared/api.js', 'js/landing.js', 'js/shared/movimiento.js']);
  });

  test('no incluye cifras inventadas', () => {
    const texto = document.body.textContent;
    expect(texto).not.toMatch(/\d\s*[%+]/);
    expect(texto).not.toMatch(/\d/);
  });

  test('solo hay un botón principal', () => {
    expect(document.querySelectorAll('.btn-primary')).toHaveLength(1);
  });

  test('la cabecera no tiene buscador ni menú de cuenta', () => {
    expect(document.querySelector('header.cabecera form')).toBeNull();
    expect(document.querySelector('.menu-cuenta')).toBeNull();
  });
});

// E3: con la sesión iniciada la landing lleva a Inicio; sin sesión se queda como está
describe('landing con sesión', () => {
  const { cargarScripts } = require('../helpers/pantalla');
  const locationReal = window.location;
  const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

  async function abrir(estado) {
    Object.defineProperty(window, 'location', { value: { href: '', replace: jest.fn() }, configurable: true, writable: true });
    window.fetch = jest.fn(() => Promise.resolve({ ok: estado < 400, status: estado, json: async () => ({ id: 1 }) }));
    cargarScripts(['js/shared/api.js', 'js/landing.js']);
    await terminar();
  }

  afterEach(() => Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true }));

  test('con sesión redirige a Inicio', async () => {
    await abrir(200);

    expect(window.fetch).toHaveBeenCalledWith('/api/auth/yo', expect.anything());
    expect(window.location.replace).toHaveBeenCalledWith('/paginas/cuenta/bienvenida.html');
  });

  test('sin sesión se queda en la landing', async () => {
    await abrir(401);

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  test('la landing carga api.js y landing.js', () => {
    expect(leer('index.html')).toMatch(/js\/shared\/api\.js[\s\S]*js\/landing\.js/);
  });
});
