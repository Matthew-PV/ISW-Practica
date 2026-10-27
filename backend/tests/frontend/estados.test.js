/**
 * @jest-environment jsdom
 */
// CS-65, objetivo 5 (lagunas del inventario de pantallas): los estados que toda pantalla debe tener.
// Cargando, vacío y ayuda antes de buscar en las pantallas que no los tenían, y avisos de error que
// se anuncian a lectores de pantalla en las nueve páginas. Se simula el servidor con fetch.
const { leer, cargarScripts } = require('../helpers/pantalla');

const PAGINAS = [
  'index', 'iniciar-sesion', 'registro', 'recuperar', 'restablecer', 'bienvenida', 'perfil', 'personas', 'usuario', 'experiencia',
];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const oculto = (selector) => $(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

// Una respuesta que se resuelve cuando la prueba lo decide, para ver qué se muestra «mientras tanto»
function pendiente() {
  let resolver;
  const promesa = new Promise((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

// Scripts de una página, en el orden en que los carga su HTML
const scriptsDe = (pagina) => [...leer(`${pagina}.html`).matchAll(/src="(js\/[^"]+)"/g)].map((m) => m[1]);

describe('avisos de error: se anuncian a lectores de pantalla', () => {
  test.each(PAGINAS)('%s.html: todo aviso de error lleva role="alert"', (pagina) => {
    document.documentElement.innerHTML = leer(`${pagina}.html`);

    const sinRol = [...document.querySelectorAll('[id^="error-"]')]
      .filter((aviso) => aviso.getAttribute('role') !== 'alert')
      .map((aviso) => aviso.id);

    expect(sinRol).toEqual([]);
  });
});

describe('personas.html', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = leer('personas.html');
    window.fetch = jest.fn();
    cargarScripts(scriptsDe('personas'));
  });

  const buscar = (texto) => {
    $('#texto-busqueda').value = texto;
    $('#form-busqueda').dispatchEvent(new Event('submit'));
  };

  test('antes de buscar explica qué escribir y no muestra «Cargando…»', () => {
    expect(oculto('#ayuda-busqueda')).toBe(false);
    expect($('#ayuda-busqueda').textContent).toBe('Escribe parte de un nombre.');
    expect(oculto('#cargando')).toBe(true);
  });

  test('mientras busca muestra «Cargando…» y al terminar lo quita', async () => {
    const { promesa, resolver } = pendiente();
    window.fetch.mockReturnValueOnce(promesa);

    buscar('ana');
    await terminar();

    expect(oculto('#cargando')).toBe(false);
    expect($('#cargando').textContent).toBe('Cargando…');
    expect(oculto('#ayuda-busqueda')).toBe(true);

    resolver({ ok: true, status: 200, json: async () => [{ id: 2, nombreUsuario: 'ana_m' }] });
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect(document.querySelectorAll('#resultados a')).toHaveLength(1);
  });

  test('si la búsqueda falla también se quita «Cargando…» y se muestra el error', async () => {
    window.fetch.mockReturnValueOnce(respuesta(500, { error: 'Error interno del servidor' }));

    buscar('ana');
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect($('#error-busqueda').textContent).toBe('Error interno del servidor');
  });

  test('tras una búsqueda sin resultados la ayuda no vuelve a aparecer', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, []));

    buscar('zzzz');
    await terminar();

    expect(oculto('#ayuda-busqueda')).toBe(true);
    expect(oculto('#sin-resultados')).toBe(false);
  });
});

describe('bienvenida.html', () => {
  const EXPERIENCIA = {
    id: 10, titulo: 'Tarde cultural', descripcion: 'Museos', ciudadId: 1, ciudad: { id: 1, nombre: 'Madrid' },
    tipo: 'Cultural', momentoAdecuado: 'Tarde', visibilidad: 'PUBLICA',
  };

  // `rutas` dice qué responde el servidor a cada dirección; lo que no figure, un 404
  function arrancar(rutas) {
    document.documentElement.innerHTML = leer('bienvenida.html');
    for (const dialogo of document.querySelectorAll('dialog')) {
      dialogo.showModal = jest.fn();
      dialogo.close = jest.fn();
    }
    window.fetch = jest.fn((ruta, opciones = {}) => {
      const clave = `${opciones.method || 'GET'} ${ruta}`;
      return rutas[clave] ? rutas[clave]() : respuesta(404, { error: 'No encontrado' });
    });
    cargarScripts(scriptsDe('bienvenida'));
  }

  const base = (experiencias) => ({
    'GET /api/auth/yo': () => respuesta(200, { id: 1, nombreUsuario: 'ana' }),
    'GET /api/ciudades': () => respuesta(200, [{ id: 1, nombre: 'Madrid', pais: 'España' }]),
    'GET /api/experiencias?autor=ana': () => respuesta(200, { experiencias, siguiente: null }),
  });

  test('mientras llegan los datos se ve «Cargando…» y después desaparece', async () => {
    const { promesa, resolver } = pendiente();
    arrancar({ ...base([]), 'GET /api/auth/yo': () => promesa });

    expect(oculto('#cargando')).toBe(false);
    expect($('#cargando').textContent).toBe('Cargando…');

    resolver({ ok: true, status: 200, json: async () => ({ id: 1, nombreUsuario: 'ana' }) });
    await terminar();
    await terminar();

    expect(oculto('#cargando')).toBe(true);
  });

  test('sin experiencias explica que todavía no hay ninguna, y la tarjeta «+» sigue ahí', async () => {
    arrancar(base([]));
    await terminar();
    await terminar();

    expect(oculto('#sin-experiencias')).toBe(false);
    expect($('#sin-experiencias').textContent).toBe('Todavía no has publicado experiencias.');
    expect($('#boton-nueva')).not.toBeNull();
  });

  test('con experiencias no aparece el mensaje de vacío', async () => {
    arrancar(base([EXPERIENCIA]));
    await terminar();
    await terminar();

    expect(oculto('#sin-experiencias')).toBe(true);
    expect(document.querySelectorAll('#rejilla [data-id]').length).toBeGreaterThan(0);
  });

  test('si falla la carga se quita «Cargando…» y se muestra el error', async () => {
    arrancar({ ...base([]), 'GET /api/experiencias?autor=ana': () => respuesta(500, { error: 'Error interno del servidor' }) });
    await terminar();
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect($('#error-lista').textContent).toBe('Error interno del servidor');
  });

  test('al crear la primera experiencia desaparece el mensaje de vacío', async () => {
    arrancar({ ...base([]), 'POST /api/experiencias': () => respuesta(201, EXPERIENCIA) });
    await terminar();
    await terminar();
    expect(oculto('#sin-experiencias')).toBe(false);

    $('#boton-nueva').click();
    $('#titulo').value = 'Tarde cultural';
    $('#descripcion').value = 'Museos';
    $('#ciudadId').value = '1';
    $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    expect(oculto('#sin-experiencias')).toBe(true);
  });
});

describe('perfil.html', () => {
  const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: null, ciudad: null };

  // Solo /perfil se controla; el resto de peticiones de la página fallan sin afectar a esta prueba
  function arrancar(perfil) {
    document.documentElement.innerHTML = leer('perfil.html');
    window.fetch = jest.fn((ruta) => (ruta === '/api/perfil' ? perfil : respuesta(500, { error: 'otro' })));
    cargarScripts(scriptsDe('perfil'));
  }

  test('mientras llegan los datos se ve «Cargando…» y después desaparece', async () => {
    const { promesa, resolver } = pendiente();
    arrancar(promesa);

    expect(oculto('#cargando')).toBe(false);
    expect($('#cargando').textContent).toBe('Cargando…');

    resolver({ ok: true, status: 200, json: async () => PERFIL });
    await terminar();
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect($('#nombreUsuario').value).toBe('ana');
  });
});

describe('usuario.html', () => {
  const PERFIL = {
    id: 2, nombreUsuario: 'ana', foto: '/img/foto-por-defecto.svg', ciudad: null, amigos: 0, seguidores: 0,
    esPropio: false, relacion: { amistad: 'ninguna', amistadId: null, siguiendo: false },
  };

  function arrancar(perfil) {
    window.history.pushState({}, '', '/usuario.html?nombre=ana');
    document.documentElement.innerHTML = leer('usuario.html');
    window.fetch = jest.fn((ruta) => (
      ruta === '/api/usuarios/ana' ? perfil : respuesta(200, { experiencias: [], siguiente: null })
    ));
    cargarScripts(scriptsDe('usuario'));
  }

  test('mientras llega el perfil se ve «Cargando…» y no los datos de relleno', async () => {
    const { promesa } = pendiente();
    arrancar(promesa);

    expect(oculto('#cargando')).toBe(false);
    expect($('#cargando').textContent).toBe('Cargando…');
    expect(oculto('#perfil-usuario')).toBe(true);
  });

  test('al llegar el perfil se quita «Cargando…» y se muestra la persona', async () => {
    arrancar(respuesta(200, PERFIL));
    await terminar();
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect(oculto('#perfil-usuario')).toBe(false);
    expect($('#nombre-usuario').textContent).toBe('ana');
  });

  test('si el usuario no existe se quita «Cargando…» y solo queda el aviso', async () => {
    arrancar(respuesta(404, { error: 'Usuario no encontrado' }));
    await terminar();
    await terminar();

    expect(oculto('#cargando')).toBe(true);
    expect(oculto('#no-encontrado')).toBe(false);
    expect(oculto('#perfil-usuario')).toBe(true);
  });
});
