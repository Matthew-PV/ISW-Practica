/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 12: búsqueda de personas y enlaces al perfil público.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('/social/personas.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/planes.js', 'js/personas.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

function buscar(texto) {
  $('#texto-busqueda').value = texto;
  $('#form-busqueda').dispatchEvent(new Event('submit'));
}

// Promesa que se resuelve a mano, para ver el estado «pendiente» de una petición
function diferida() {
  let resolver;
  const promesa = new Promise((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

const plan = (id, extra = {}) => ({
  id, titulo: `Plan ${id}`, descripcion: 'Descripción', tipo: 'Cultura', visibilidad: 'PUBLICA',
  ciudad: { id: 3, nombre: 'Sevilla', pais: 'España' }, autor: { id: 2, nombreUsuario: 'lucia', foto: null }, ...extra,
});
const paginaDePlanes = (experiencias = [], siguiente = null) => ({ experiencias, siguiente });

// Sin más indicaciones, la búsqueda de planes no encuentra nada; los tests de personas encolan solo su respuesta
const sinPlanes = (ruta) => (ruta.startsWith('/api/experiencias?') ? respuesta(200, paginaDePlanes()) : undefined);

beforeEach(() => {
  window.history.pushState({}, '', '/social/personas.html');
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn(sinPlanes);
  cargarScripts(SCRIPTS);
});

test('busca personas y cada resultado enlaza a su perfil público sin insertar HTML', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, [
    { id: 2, nombreUsuario: 'ana maría', email: 'no-debe-mostrarse@ejemplo.com' },
    { id: 3, nombreUsuario: '<b>luis</b>', email: 'tampoco@ejemplo.com' },
  ]));

  buscar('ana');
  await terminar();

  expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana', expect.any(Object));
  const enlaces = [...document.querySelectorAll('#resultados a')];
  expect(enlaces).toHaveLength(2);
  expect(enlaces[0].getAttribute('href')).toBe('/social/usuario.html?nombre=ana%20mar%C3%ADa');
  expect(enlaces[0].textContent).toBe('ana maría');
  expect(enlaces[1].textContent).toBe('<b>luis</b>');
  expect(enlaces[1].querySelector('b')).toBeNull();
  expect(document.body.textContent).not.toContain('no-debe-mostrarse@ejemplo.com');
});

test('indica cuando la búsqueda no encuentra personas', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, []));

  buscar('nadie');
  await terminar();

  expect($('#sin-resultados').classList.contains('d-none')).toBe(false);
  expect($('#resultados').children).toHaveLength(0);
});

test('muestra el mensaje del servidor si la búsqueda falla', async () => {
  window.fetch.mockReturnValueOnce(respuesta(500, { error: 'No se ha podido buscar ahora' }));

  buscar('ana');
  await terminar();

  expect($('#error-busqueda').textContent).toBe('No se ha podido buscar ahora');
  expect($('#error-busqueda').classList.contains('d-none')).toBe(false);
});

// CS-66 (T4.5): pantalla Buscar con pestañas, estados de espera y descarte de respuestas atrasadas.
describe('Buscar (diseño aplicado)', () => {
  test('la pantalla usa una columna ancha, no la estrecha de los formularios', () => {
    const principal = $('#contenido');
    expect(principal.classList.contains('contenedor-formulario')).toBe(false);
    expect(principal.classList.contains('contenedor-buscar')).toBe(true);
  });

  test('mientras busca, el botón dice «Buscando…» y vuelve a «Buscar» al llegar los resultados', async () => {
    const pendiente = diferida();
    window.fetch.mockReturnValueOnce(pendiente.promesa);
    const boton = $('#form-busqueda button[type="submit"]');

    buscar('ana');

    expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana', expect.any(Object));
    expect(boton.textContent).toBe('Buscando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');
    expect($('#ayuda-busqueda').classList.contains('d-none')).toBe(true);
    expect($('#cargando').classList.contains('d-none')).toBe(false);

    pendiente.resolver({ ok: true, status: 200, json: async () => [
      { id: 1, nombreUsuario: 'ana' }, { id: 2, nombreUsuario: 'ana_b' },
    ] });
    await terminar();

    expect(document.querySelectorAll('#resultados .fila-resultado')).toHaveLength(2);
    expect(boton.textContent).toBe('Buscar');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
    expect($('#texto-busqueda').value).toBe('ana');
    expect($('#cargando').classList.contains('d-none')).toBe(true);
  });

  test('sin coincidencias aparece «No se han encontrado personas.»', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, []));

    buscar('zzz');
    await terminar();

    expect($('#sin-resultados').classList.contains('d-none')).toBe(false);
    expect($('#sin-resultados').textContent).toBe('No se han encontrado personas.');
  });

  test('/social/personas.html?q=ana%20b%26c rellena el campo y busca con el texto escapado', async () => {
    window.history.pushState({}, '', '/social/personas.html?q=ana%20b%26c');
    document.documentElement.innerHTML = HTML;
    window.fetch.mockReturnValueOnce(respuesta(200, []));
    cargarScripts(SCRIPTS);
    await terminar();

    expect($('#texto-busqueda').value).toBe('ana b&c');
    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana%20b%26c', expect.any(Object));
    expect(window.fetch).toHaveBeenCalledWith('/api/experiencias?texto=ana+b%26c', expect.any(Object));
  });

  test('/social/personas.html?q= vacío no busca y deja el texto de ayuda', async () => {
    window.history.pushState({}, '', '/social/personas.html?q=');
    document.documentElement.innerHTML = HTML;
    cargarScripts(SCRIPTS);
    await terminar();

    expect(window.fetch).not.toHaveBeenCalled();
    expect($('#ayuda-busqueda').classList.contains('d-none')).toBe(false);
  });

  test('una búsqueda llena a la vez Planes y Personas con los planes reales, que enlazan a su detalle', async () => {
    window.fetch.mockImplementation((ruta) => (ruta.startsWith('/api/usuarios')
      ? respuesta(200, [{ id: 2, nombreUsuario: 'museo_fan' }])
      : respuesta(200, paginaDePlanes([plan(8, { titulo: 'Tarde en el Prado' })]))));
    const pestanas = [...document.querySelectorAll('[role="tab"]')];
    expect(pestanas.map((p) => p.textContent)).toEqual(['Planes', 'Personas']);
    expect(pestanas[0].getAttribute('aria-selected')).toBe('true');

    buscar('museo');
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/experiencias?texto=museo', expect.any(Object));
    expect(document.querySelectorAll('#resultados .fila-resultado')).toHaveLength(1);
    const tarjetas = [...document.querySelectorAll('#resultados-experiencias .tarjeta-plan')];
    expect(tarjetas.map((t) => t.querySelector('h3').textContent)).toEqual(['Tarde en el Prado']);
    expect(tarjetas[0].getAttribute('href')).toBe('/experiencias/experiencia.html?id=8');
    expect([...document.querySelectorAll('[role="tab"]')].map((p) => p.textContent)).toEqual(['Planes (1)', 'Personas (1)']);
    expect($('#ayuda-experiencias').classList.contains('d-none')).toBe(true);
    expect($('#sin-experiencias').classList.contains('d-none')).toBe(true);
  });

  test('si hay más planes de los que caben en la página, el contador lo avisa y se enlaza a Explorar', async () => {
    window.fetch.mockImplementation((ruta) => (ruta.startsWith('/api/usuarios')
      ? respuesta(200, [])
      : respuesta(200, paginaDePlanes([plan(2), plan(1)], 1))));

    buscar('tapas & vino');
    await terminar();

    expect($('#pestana-experiencias').textContent).toBe('Planes (2+)');
    const enlace = $('#ver-todos-planes');
    expect(enlace.hidden).toBe(false);
    expect(enlace.getAttribute('href')).toBe('/experiencias/explorar.html?texto=tapas%20%26%20vino');
  });

  test('si ningún plan coincide se muestra «No se han encontrado planes.»', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, []));

    buscar('zzzz');
    await terminar();

    expect(document.querySelectorAll('#resultados-experiencias .tarjeta-plan')).toHaveLength(0);
    expect($('#sin-experiencias').classList.contains('d-none')).toBe(false);
    expect($('#sin-experiencias').textContent).toBe('No se han encontrado planes.');
    expect($('#pestana-experiencias').textContent).toBe('Planes (0)');
    expect($('#ver-todos-planes').hidden).toBe(true);
  });

  test('dos búsquedas seguidas: solo se pintan los resultados de la última', async () => {
    const primera = diferida();
    const segunda = diferida();
    window.fetch.mockImplementation((ruta) => {
      if (ruta === '/api/usuarios?texto=ana') return primera.promesa;
      if (ruta === '/api/usuarios?texto=luis') return segunda.promesa;
      return sinPlanes(ruta);
    });
    const ok = (lista) => ({ ok: true, status: 200, json: async () => lista });

    buscar('ana');
    buscar('luis');
    segunda.resolver(ok([{ id: 9, nombreUsuario: 'luis' }]));
    await terminar();
    primera.resolver(ok([{ id: 1, nombreUsuario: 'ana' }]));
    await terminar();

    const nombres = [...document.querySelectorAll('#resultados .fila-resultado')].map((f) => f.textContent);
    expect(nombres).toEqual(['luis']);
    expect($('#form-busqueda button[type="submit"]').textContent).toBe('Buscar');
  });

  test('con el servidor caído el botón se restaura y aparece el aviso role="alert"', async () => {
    window.fetch.mockReturnValueOnce(Promise.reject(new TypeError('Failed to fetch')));

    buscar('ana');
    await terminar();

    const aviso = $('#error-busqueda');
    expect(aviso.getAttribute('role')).toBe('alert');
    expect(aviso.classList.contains('d-none')).toBe(false);
    expect(aviso.textContent).not.toBe('');
    const boton = $('#form-busqueda button[type="submit"]');
    expect(boton.textContent).toBe('Buscar');
    expect(boton.disabled).toBe(false);
  });

  test('un nombre <b>x</b> se ve como texto en la fila', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, [{ id: 4, nombreUsuario: '<b>x</b>' }]));

    buscar('x');
    await terminar();

    const fila = $('#resultados .fila-resultado');
    expect(fila.textContent).toBe('<b>x</b>');
    expect(fila.querySelector('b')).toBeNull();
  });
});

// Menores de la revisión de T4.5: lo que ya hacía el código sin prueba y dos retoques del HTML
describe('Buscar (menores de la revisión)', () => {
  const ok = (lista) => ({ ok: true, status: 200, json: async () => lista });

  test('«Cargando…» y el aviso de error no dependen del panel de Personas: valen para cualquier pestaña', () => {
    expect($('#cargando').closest('[role="tabpanel"]')).toBeNull();
    expect($('#error-busqueda').closest('[role="tabpanel"]')).toBeNull();
  });

  test('la etiqueta del campo no habla solo de nombres de usuario', () => {
    expect($('label[for="texto-busqueda"]').textContent).not.toMatch(/nombre de usuario/i);
  });

  test('al buscar de nuevo se vacían los resultados anteriores mientras llega la respuesta', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, [{ id: 1, nombreUsuario: 'ana' }]));
    buscar('ana');
    await terminar();
    expect(document.querySelectorAll('#resultados .fila-resultado')).toHaveLength(1);

    window.fetch.mockReturnValueOnce(diferida().promesa);
    buscar('luis');

    expect(document.querySelectorAll('#resultados .fila-resultado')).toHaveLength(0);
  });

  test('el error de una búsqueda atrasada no se muestra ni toca el botón de la última', async () => {
    const primera = diferida();
    const segunda = diferida();
    window.fetch.mockImplementation((ruta) => {
      if (ruta === '/api/usuarios?texto=ana') return primera.promesa;
      if (ruta === '/api/usuarios?texto=luis') return segunda.promesa;
      return sinPlanes(ruta);
    });

    buscar('ana');
    buscar('luis');
    primera.resolver({ ok: false, status: 500, json: async () => ({ error: 'fallo viejo' }) });
    await terminar();

    expect($('#error-busqueda').classList.contains('d-none')).toBe(true);
    const boton = $('#form-busqueda button[type="submit"]');
    expect(boton.textContent).toBe('Buscando…');
    expect(boton.disabled).toBe(true);
    segunda.resolver(ok([]));
    await terminar();
    expect(boton.textContent).toBe('Buscar');
  });

  test('la clase entrando se retira de los resultados al terminar el fundido', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, [{ id: 1, nombreUsuario: 'ana' }]));
    buscar('ana');
    await terminar();
    const fila = $('#resultados .fila-resultado');
    expect(fila.classList.contains('entrando')).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(fila.classList.contains('entrando')).toBe(false);
  });
});

describe('Buscar (recuento anunciado)', () => {
  test('al terminar la búsqueda, un único aviso role="status" dice cuántas personas y planes hay', async () => {
    window.fetch.mockImplementation((ruta) => (ruta.startsWith('/api/usuarios')
      ? respuesta(200, [{ id: 2, nombreUsuario: 'museo_fan' }])
      : respuesta(200, paginaDePlanes([plan(1)]))));
    expect($('#recuento-busqueda').getAttribute('role')).toBe('status');
    expect($('#recuento-busqueda').textContent).toBe('');

    buscar('museo');
    await terminar();

    expect($('#recuento-busqueda').textContent).toBe('1 plan y 1 persona');
  });

  test('sin resultados el recuento dice 0 personas y 0 planes', async () => {
    window.fetch.mockReturnValueOnce(respuesta(200, []));

    buscar('zzzz');
    await terminar();

    expect($('#recuento-busqueda').textContent).toBe('0 planes y 0 personas');
  });

  test('las listas de resultados ya no se anuncian enteras (aria-live)', () => {
    expect($('#resultados').hasAttribute('aria-live')).toBe(false);
    expect($('#resultados-experiencias').hasAttribute('aria-live')).toBe(false);
  });
});

// CS-61 (B3): cada fila de persona muestra su relación con quien busca y el botón que corresponde.
// La fila deja de ser un solo enlace: el enlace al perfil y el botón son elementos distintos.
describe('Buscar (relación y botón en la fila)', () => {
  const persona = (id, nombre, relacion) => ({ id, nombreUsuario: nombre, foto: null, ciudad: 'Sevilla', relacion });
  const sinRelacion = { amistad: 'ninguna', amistadId: null, siguiendo: false };

  async function buscarPersonas(personas) {
    window.fetch.mockImplementation((ruta) => (ruta.startsWith('/api/usuarios?')
      ? respuesta(200, personas)
      : respuesta(200, paginaDePlanes())));
    buscar('a');
    await terminar();
  }

  test('una persona sin relación ofrece «Añadir amigo», que envía la solicitud y pasa a «Cancelar solicitud»', async () => {
    await buscarPersonas([persona(5, 'bea', sinRelacion)]);
    window.fetch.mockImplementation(() => respuesta(201, { id: 77, estado: 'PENDIENTE' }));

    const boton = $('#resultados .fila-resultado button');
    expect(boton.textContent).toBe('Añadir amigo');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ destinatarioId: 5 }),
    }));
    const fila = $('#resultados .fila-resultado');
    expect(fila.querySelector('button').textContent).toBe('Cancelar solicitud');
    expect(fila.textContent).toContain('Solicitud enviada');
  });

  test('«Cancelar solicitud» borra la amistad pendiente y vuelve a «Añadir amigo»', async () => {
    await buscarPersonas([persona(5, 'bea', { amistad: 'enviada', amistadId: 9, siguiendo: false })]);
    window.fetch.mockImplementation(() => respuesta(200, { mensaje: 'ok' }));

    const boton = $('#resultados .fila-resultado button');
    expect(boton.textContent).toBe('Cancelar solicitud');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades/9', expect.objectContaining({ method: 'DELETE' }));
    expect($('#resultados .fila-resultado button').textContent).toBe('Añadir amigo');
  });

  test('una solicitud recibida se acepta desde la fila y la persona pasa a «Amigos»', async () => {
    await buscarPersonas([persona(5, 'bea', { amistad: 'recibida', amistadId: 12, siguiendo: false })]);
    window.fetch.mockImplementation(() => respuesta(200, { id: 12, estado: 'ACEPTADA' }));

    const boton = $('#resultados .fila-resultado button');
    expect(boton.textContent).toBe('Aceptar');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades/12', expect.objectContaining({
      method: 'PATCH', body: JSON.stringify({ aceptar: true }),
    }));
    const fila = $('#resultados .fila-resultado');
    expect(fila.querySelector('button')).toBeNull();
    expect(fila.textContent).toContain('Amigos');
  });

  test('un amigo no tiene botón y se indica; a quien sigues se le añade «Le sigues»', async () => {
    await buscarPersonas([
      persona(5, 'bea', { amistad: 'amigos', amistadId: 3, siguiendo: false }),
      persona(6, 'raul', { amistad: 'ninguna', amistadId: null, siguiendo: true }),
    ]);

    const [amigo, seguido] = document.querySelectorAll('#resultados .fila-resultado');
    expect(amigo.querySelector('button')).toBeNull();
    expect(amigo.textContent).toContain('Amigos');
    expect(seguido.textContent).toContain('Le sigues');
    expect(seguido.querySelector('button').textContent).toBe('Añadir amigo');
  });

  test('si la acción falla se muestra el error en la fila y el botón queda activo', async () => {
    await buscarPersonas([persona(5, 'bea', sinRelacion)]);
    window.fetch.mockImplementation(() => respuesta(400, { error: 'Ya existe una solicitud' }));

    $('#resultados .fila-resultado button').click();
    await terminar();

    const fila = $('#resultados .fila-resultado');
    expect(fila.querySelector('[role="alert"]').textContent).toBe('Ya existe una solicitud');
    expect(fila.querySelector('button').disabled).toBe(false);
  });

  test('el enlace al perfil sigue siendo solo la persona, sin el botón dentro', async () => {
    await buscarPersonas([persona(5, 'bea', sinRelacion)]);

    const enlace = $('#resultados .fila-resultado a');
    expect(enlace.querySelector('button')).toBeNull();
    expect(enlace.textContent).toContain('bea');
  });
});
