/**
 * @jest-environment jsdom
 */
// CS-66: la cabecera común de las pantallas con sesión (HTML idéntico en todas) y su
// comportamiento (js/shared/cabecera.js): cerrar sesión, menú de cuenta y buscador.
// Sustituye a navegacion.test.js, que comprobaba la barra anterior.
const { leer, cargarScripts } = require('../helpers/pantalla');

const PAGINAS = ['bienvenida', 'explorar', 'mis-planes', 'amigos', 'perfil', 'ajustes', 'personas', 'usuario', 'experiencia'];
// Enlace de la cabecera que lleva aria-current="page" en cada página (ninguno en el resto)
const ACTUAL = {
  bienvenida: 'Inicio', explorar: 'Explorar', 'mis-planes': 'Mis planes', amigos: 'Amigos', perfil: 'Mi perfil', ajustes: 'Ajustes', personas: null, usuario: null, experiencia: null,
};

const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((r) => setTimeout(r, 0));
const cargar = (pagina) => {
  document.documentElement.innerHTML = leer(`${pagina}.html`);
};

describe.each(PAGINAS)('cabecera de %s.html', (pagina) => {
  beforeEach(() => cargar(pagina));

  test('tiene la navegación principal con la marca, «Inicio», «Explorar», «Mis planes» y «Amigos»', () => {
    const enlaces = [...document.querySelectorAll('header.cabecera nav[aria-label="Principal"] a')].map((a) => [
      a.textContent.trim() || a.querySelector('img')?.getAttribute('alt'),
      a.getAttribute('href'),
    ]);

    expect(enlaces).toEqual([
      ['PlanB', '/cuenta/bienvenida.html'],
      ['Inicio', '/cuenta/bienvenida.html'],
      ['Explorar', '/experiencias/explorar.html'],
      ['Mis planes', '/cuenta/mis-planes.html'],
      ['Amigos', '/social/amigos.html'],
    ]);
  });

  test('tiene el buscador de personas', () => {
    const formulario = $('header.cabecera form[role="search"][action="/social/personas.html"][method="get"]');
    expect(formulario).not.toBeNull();

    const campo = formulario.querySelector('input[type="search"][name="q"]');
    expect(campo).not.toBeNull();
    expect(campo.getAttribute('aria-label')).toBe('Buscar planes y personas');

    const boton = formulario.querySelector('button[type="submit"]');
    expect(boton).not.toBeNull();
    expect(boton.textContent.trim()).toBe('Buscar');
  });

  test('tiene el menú de cuenta con «Mi perfil», «Ajustes» y «Cerrar sesión»', () => {
    const menu = $('header.cabecera details.menu-cuenta');
    expect(menu).not.toBeNull();
    expect(menu.querySelector('summary').textContent).toContain('Cuenta');

    const perfil = menu.querySelector('a[href="/cuenta/perfil.html"]');
    expect(perfil.textContent.trim()).toBe('Mi perfil');

    const ajustes = menu.querySelector('a[href="/cuenta/ajustes.html"]');
    expect(ajustes.textContent.trim()).toBe('Ajustes');

    const cerrar = menu.querySelector('button#cerrar-sesion[data-cerrar-sesion]');
    expect(cerrar).not.toBeNull();
    expect(cerrar.textContent.trim()).toBe('Cerrar sesión');
  });

  test('el menú de cuenta lleva el avatar como imagen decorativa de 32 px con la foto por defecto', () => {
    const avatar = $('details.menu-cuenta summary img.menu-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('src')).toBe('/img/foto-por-defecto.svg');
    expect(avatar.getAttribute('alt')).toBe('');
    expect(avatar.getAttribute('width')).toBe('32');
    expect(avatar.getAttribute('height')).toBe('32');
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

  test('solo /social/personas.html lleva la clase pagina-buscar en el body', () => {
    expect(document.body.classList.contains('pagina-buscar')).toBe(pagina === 'personas');
  });
});

test('la cabecera es idéntica en todas las pantallas con sesión (salvo aria-current)', () => {
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
      value: { search: '', href: 'http://localhost/cuenta/bienvenida.html' },
      configurable: true,
      writable: true,
    });
    cargarScripts(['js/shared/api.js', 'js/shared/cabecera.js']);
    window.fetch.mockClear(); // la petición del avatar al cargar no es lo que miden las pruebas de abajo
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
    window.fetch.mockClear();
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

  test('con éxito, se va a /acceso/iniciar-sesion.html', async () => {
    window.fetch.mockReturnValue(respuesta204());

    cerrar().click();
    await terminar();

    expect(window.location.href).toBe('/acceso/iniciar-sesion.html');
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
    expect(window.location.href).toBe('http://localhost/cuenta/bienvenida.html');
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

describe('avatar del menú de cuenta', () => {
  const avatar = () => $('summary img.menu-avatar');
  const cargarCon = async (respuesta) => {
    cargar('bienvenida');
    window.fetch = jest.fn().mockImplementation(respuesta);
    cargarScripts(['js/shared/api.js', 'js/shared/cabecera.js']);
    await terminar();
  };
  const json = (datos) => () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(datos) });

  test('pide el perfil propio al cargar y muestra su foto', async () => {
    await cargarCon(json({ foto: 'https://cdn.example/ana.jpg' }));

    expect(window.fetch.mock.calls[0][0]).toBe('/api/perfil');
    expect(avatar().getAttribute('src')).toBe('https://cdn.example/ana.jpg');
  });

  test('sin foto en el perfil deja la foto por defecto', async () => {
    await cargarCon(json({ foto: null }));

    expect(avatar().getAttribute('src')).toBe('/img/foto-por-defecto.svg');
  });

  test('si falla la petición deja la foto por defecto y no rompe la cabecera', async () => {
    await cargarCon(() => Promise.reject(new TypeError('Failed to fetch')));

    expect(avatar().getAttribute('src')).toBe('/img/foto-por-defecto.svg');
  });
});

describe('campana de notificaciones', () => {
  const json = (datos) => () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(datos) });
  const SOLICITUDES = [{ id: 3, solicitante: { id: 5, nombreUsuario: 'luis', foto: '/img/foto-por-defecto.svg' } }];
  const cargarCon = async (respuesta) => {
    cargar('bienvenida');
    window.fetch = jest.fn().mockImplementation((ruta) => (ruta === '/api/amistades/solicitudes' ? respuesta() : json({})()));
    cargarScripts(['js/shared/api.js', 'js/shared/cabecera.js']);
    await terminar();
  };

  test('muestra cada solicitud pendiente como notificación con el contador', async () => {
    await cargarCon(json(SOLICITUDES));

    expect($('#contador-notificaciones').textContent).toBe('1');
    expect($('#contador-notificaciones').classList.contains('d-none')).toBe(false);
    expect($('#lista-notificaciones a').getAttribute('href')).toBe('/social/usuario.html?nombre=luis');
    expect($('#lista-notificaciones').textContent).toContain('luis quiere ser tu amigo');
    expect($('#sin-notificaciones').classList.contains('d-none')).toBe(true);
  });

  test('sin solicitudes oculta el contador y avisa de que no hay nada', async () => {
    await cargarCon(json([]));

    expect($('#contador-notificaciones').classList.contains('d-none')).toBe(true);
    expect($('#sin-notificaciones').classList.contains('d-none')).toBe(false);
  });

  test('si falla la petición la cabecera sigue funcionando', async () => {
    await cargarCon(() => Promise.reject(new TypeError('Failed to fetch')));

    expect($('#contador-notificaciones').classList.contains('d-none')).toBe(true);
  });

  test('un clic fuera cierra el desplegable', async () => {
    await cargarCon(json([]));
    $('details.menu-notificaciones').open = true;

    document.body.click();

    expect($('details.menu-notificaciones').open).toBe(false);
  });

  test('Escape cierra el desplegable y devuelve el foco al resumen', async () => {
    await cargarCon(json([]));
    const resumen = $('details.menu-notificaciones summary');
    $('details.menu-notificaciones').open = true;

    resumen.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect($('details.menu-notificaciones').open).toBe(false);
    expect(document.activeElement).toBe(resumen);
  });
});
