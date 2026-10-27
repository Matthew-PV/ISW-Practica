/**
 * @jest-environment jsdom
 */
// CS-66: la cabecera común de las pantallas con sesión (HTML idéntico en las cinco) y su
// comportamiento (js/shared/cabecera.js): cerrar sesión, menú de cuenta y buscador.
// Sustituye a navegacion.test.js, que comprobaba la barra anterior.
const { leer, cargarScripts } = require('../helpers/pantalla');

const PAGINAS = ['bienvenida', 'perfil', 'personas', 'usuario', 'experiencia'];
// Enlace de la cabecera que lleva aria-current="page" en cada página (ninguno en el resto)
const ACTUAL = { bienvenida: 'Inicio', perfil: 'Mi perfil', personas: null, usuario: null, experiencia: null };

const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));
const cargar = (pagina) => {
  document.documentElement.innerHTML = leer(`${pagina}.html`);
};

describe.each(PAGINAS)('cabecera de %s.html', (pagina) => {
  beforeEach(() => cargar(pagina));

  test('tiene la navegación principal con la marca y «Inicio»', () => {
    const enlaces = [...document.querySelectorAll('header.cabecera nav[aria-label="Principal"] a')].map((a) => [
      a.textContent.trim(),
      a.getAttribute('href'),
    ]);

    expect(enlaces).toEqual([
      ['PlanB', 'bienvenida.html'],
      ['Inicio', 'bienvenida.html'],
    ]);
  });

  test('tiene el buscador de personas', () => {
    const formulario = $('header.cabecera form[role="search"][action="personas.html"][method="get"]');
    expect(formulario).not.toBeNull();

    const campo = formulario.querySelector('input[type="search"][name="q"]');
    expect(campo).not.toBeNull();
    expect(campo.getAttribute('aria-label')).toBe('Buscar personas');

    const boton = formulario.querySelector('button[type="submit"]');
    expect(boton).not.toBeNull();
    expect(boton.textContent.trim()).toBe('Buscar');
  });

  test('tiene el menú de cuenta con «Mi perfil» y «Cerrar sesión»', () => {
    const menu = $('header.cabecera details.menu-cuenta');
    expect(menu).not.toBeNull();
    expect(menu.querySelector('summary').textContent).toContain('Cuenta');

    const perfil = menu.querySelector('a[href="perfil.html"]');
    expect(perfil.textContent.trim()).toBe('Mi perfil');

    const cerrar = menu.querySelector('button#cerrar-sesion[data-cerrar-sesion]');
    expect(cerrar).not.toBeNull();
    expect(cerrar.textContent.trim()).toBe('Cerrar sesión');
  });

  test('tiene el enlace «Saltar al contenido» y el contenido principal', () => {
    const saltar = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Saltar al contenido');
    expect(saltar.getAttribute('href')).toBe('#contenido');
    expect(document.querySelector('main#contenido')).not.toBeNull();
  });

  test('marca la sección actual con aria-current="page" solo donde corresponde', () => {
    const marcados = [...document.querySelectorAll('header.cabecera [aria-current]')];

    expect(marcados.every((e) => e.getAttribute('aria-current') === 'page')).toBe(true);
    expect(marcados.map((e) => e.textContent.trim())).toEqual(ACTUAL[pagina] ? [ACTUAL[pagina]] : []);
  });

  test('solo personas.html lleva la clase pagina-buscar en el body', () => {
    expect(document.body.classList.contains('pagina-buscar')).toBe(pagina === 'personas');
  });
});

test('la cabecera es idéntica en las cinco pantallas (salvo aria-current)', () => {
  const cabeceras = PAGINAS.map((pagina) => {
    cargar(pagina);
    const cabecera = $('header.cabecera');
    expect(cabecera).not.toBeNull();
    return cabecera.outerHTML.replace(/\s+aria-current="[^"]*"/g, '').replace(/\s+/g, ' ');
  });

  for (const cabecera of cabeceras) {
    expect(cabecera).toBe(cabeceras[0]);
  }
});

describe('comportamiento de js/shared/cabecera.js', () => {
  const locationReal = window.location;
  const respuesta204 = () => Promise.resolve({ ok: true, status: 204, json: () => Promise.reject(new Error('sin cuerpo')) });
  const cerrar = () => $('#cerrar-sesion');
  const menu = () => $('details.menu-cuenta');

  beforeEach(() => {
    cargar('bienvenida');
    window.fetch = jest.fn();
    // Un `location` simple, para ver a qué dirección intenta ir sin que jsdom navegue
    Object.defineProperty(window, 'location', {
      value: { search: '', href: 'http://localhost/bienvenida.html' },
      configurable: true,
      writable: true,
    });
    cargarScripts(['js/shared/api.js', 'js/shared/cabecera.js']);
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
  });

  test('«Cerrar sesión» hace una sola llamada POST a /api/auth/logout', async () => {
    window.fetch.mockReturnValue(respuesta204());

    cerrar().click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledTimes(1);
    const [ruta, opciones] = window.fetch.mock.calls[0];
    expect(ruta).toBe('/api/auth/logout');
    expect(opciones.method).toBe('POST');
  });

  test('cualquier botón con data-cerrar-sesion cierra la sesión', async () => {
    const otro = document.createElement('button');
    otro.dataset.cerrarSesion = '';
    otro.textContent = 'Cerrar sesión';
    document.body.append(otro);
    cargarScripts(['js/shared/api.js', 'js/shared/cabecera.js']);
    window.fetch.mockReturnValue(respuesta204());

    otro.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch.mock.calls[0][0]).toBe('/api/auth/logout');
  });

  test('mientras espera, el botón dice «Cerrando sesión…» y está desactivado', async () => {
    window.fetch.mockReturnValue(new Promise(() => {})); // el servidor no contesta todavía

    cerrar().click();
    await terminar();

    expect(cerrar().textContent.trim()).toBe('Cerrando sesión…');
    expect(cerrar().disabled).toBe(true);
  });

  test('con éxito, se va a iniciar-sesion.html', async () => {
    window.fetch.mockReturnValue(respuesta204());

    cerrar().click();
    await terminar();

    expect(window.location.href).toBe('iniciar-sesion.html');
  });

  test('si falla, el botón se recupera y aparece un aviso', async () => {
    window.fetch.mockRejectedValue(new TypeError('Failed to fetch')); // servidor caído

    cerrar().click();
    await terminar();

    expect(cerrar().textContent.trim()).toBe('Cerrar sesión');
    expect(cerrar().disabled).toBe(false);
    const aviso = $('[role="alert"]');
    expect(aviso).not.toBeNull();
    expect(aviso.textContent).toContain('No se ha podido cerrar la sesión. Inténtalo de nuevo.');
    expect(window.location.href).toBe('http://localhost/bienvenida.html');
  });

  test('pulsar fuera del menú de cuenta lo cierra', () => {
    menu().open = true;

    document.body.click();

    expect(menu().open).toBe(false);
  });

  test('Escape cierra el menú y devuelve el foco al resumen', () => {
    menu().open = true;

    menu().querySelector('summary').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(menu().open).toBe(false);
    expect(document.activeElement).toBe(menu().querySelector('summary'));
  });

  test.each(['', '   '])('el buscador no se envía con el texto %j', (texto) => {
    const formulario = $('form[role="search"]');
    formulario.querySelector('input[name="q"]').value = texto;
    const envio = new Event('submit', { bubbles: true, cancelable: true });

    formulario.dispatchEvent(envio);

    expect(envio.defaultPrevented).toBe(true);
  });

  test('el buscador se envía con texto', () => {
    const formulario = $('form[role="search"]');
    formulario.querySelector('input[name="q"]').value = 'ana';
    const envio = new Event('submit', { bubbles: true, cancelable: true });

    formulario.dispatchEvent(envio);

    expect(envio.defaultPrevented).toBe(false);
  });
});
