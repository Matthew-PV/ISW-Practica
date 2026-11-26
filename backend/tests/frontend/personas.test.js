/**
 * @jest-environment jsdom
 */
// CS-61 y CS-10: la búsqueda vive en Explorar, con las pestañas Planes y Personas (?q=texto).
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/paginas/experiencias/explorar.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/planes.js',
  'js/social/personas.js', 'js/experiencias/explorar.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));
const oculto = (selector) => $(selector).classList.contains('d-none');

const plan = (id) => ({
  id, titulo: `Plan ${id}`, descripcion: 'Descripción', tipo: 'Cultura', visibilidad: 'PUBLICA',
  ciudad: { id: 3, nombre: 'Sevilla', pais: 'España' }, autor: { id: 2, nombreUsuario: 'lucia', foto: null },
});

function servidor({ personas = () => respuesta(200, []), planes = [], siguiente = null } = {}) {
  return jest.fn((ruta) => {
    if (ruta.startsWith('/api/usuarios?')) return personas();
    if (ruta.startsWith('/api/experiencias?')) return respuesta(200, { experiencias: planes, siguiente });
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1 });
    if (ruta === '/api/experiencias/opciones') return respuesta(200, { categorias: [], momentos: [] });
    if (ruta === '/api/ciudades') return respuesta(200, []);
    return respuesta(404, { error: 'No encontrado' });
  });
}

async function abrir(busqueda = '?q=a', opciones = {}) {
  window.history.pushState({}, '', `/paginas/experiencias/explorar.html${busqueda}`);
  document.documentElement.innerHTML = HTML;
  window.fetch = servidor(opciones);
  cargarScripts(SCRIPTS);
  for (let i = 0; i < 6; i += 1) await terminar();
}

const filas = () => [...document.querySelectorAll('#resultados-personas .fila-resultado')];
const seleccionada = () => $('[role="tab"][aria-selected="true"]').id;

describe('Buscar en Explorar', () => {
  test('?q= rellena la cabecera y busca planes y personas con el texto escapado', async () => {
    await abrir('?q=ana%20b%26c', { planes: [plan(8)], personas: () => respuesta(200, [{ id: 2, nombreUsuario: 'ana' }]) });

    expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana%20b%26c', expect.any(Object));
    expect(window.fetch).toHaveBeenCalledWith('/api/experiencias?texto=ana+b%26c&limite=12', expect.any(Object));
    expect($('.cabecera-busqueda input').value).toBe('ana b&c');
    expect($('#busqueda-activa').textContent).toContain('Resultados para «ana b&c»');
    expect($('#busqueda-activa a').getAttribute('href')).toBe('/paginas/experiencias/explorar.html');
    expect($('#pestana-planes').textContent).toBe('Planes (1)');
    expect($('#pestana-personas').textContent).toBe('Personas (1)');
    expect($('#recuento-personas').textContent).toBe('1 persona');
    expect(seleccionada()).toBe('pestana-planes');
  });

  test('sin texto no pide personas y la pestaña explica cómo buscarlas', async () => {
    await abrir('');

    expect(window.fetch.mock.calls.some(([ruta]) => ruta.startsWith('/api/usuarios'))).toBe(false);
    expect(oculto('#ayuda-personas')).toBe(false);
    expect(oculto('#busqueda-activa')).toBe(true);
    expect($('#pestana-personas').textContent).toBe('Personas');
  });

  test('cada persona enlaza a su perfil sin insertar HTML ni mostrar el correo', async () => {
    await abrir('?q=a', { personas: () => respuesta(200, [
      { id: 2, nombreUsuario: 'ana maría', email: 'no-debe-mostrarse@ejemplo.com' },
      { id: 3, nombreUsuario: '<b>luis</b>' },
    ]) });

    const [primera, segunda] = filas();
    expect(primera.querySelector('a').getAttribute('href')).toBe('/paginas/social/usuario.html?nombre=ana%20mar%C3%ADa');
    expect(segunda.textContent).toBe('<b>luis</b>');
    expect(segunda.querySelector('b')).toBeNull();
    expect(document.body.textContent).not.toContain('no-debe-mostrarse@ejemplo.com');
  });

  test('si no hay planes pero sí personas, se abre Personas', async () => {
    await abrir('?q=luis', { personas: () => respuesta(200, [{ id: 3, nombreUsuario: 'luis' }]) });

    expect(seleccionada()).toBe('pestana-personas');
  });

  test('sin personas lo dice', async () => {
    await abrir();

    expect(oculto('#sin-personas')).toBe(false);
    expect($('#pestana-personas').textContent).toBe('Personas (0)');
  });

  test('con las 20 personas que da como máximo el servidor, el contador avisa de que puede haber más', async () => {
    const veinte = Array.from({ length: 20 }, (_, i) => ({ id: i + 2, nombreUsuario: `a${i}` }));
    await abrir('?q=a', { personas: () => respuesta(200, veinte) });

    expect($('#pestana-personas').textContent).toBe('Personas (20+)');
  });

  test('un fallo al buscar personas no afecta a los planes y se puede reintentar', async () => {
    let intentos = 0;
    await abrir('?q=a', {
      planes: [plan(1)],
      personas: () => {
        intentos += 1;
        return intentos === 1 ? respuesta(500, { error: 'No se ha podido buscar' }) : respuesta(200, [{ id: 2, nombreUsuario: 'ana' }]);
      },
    });
    expect(document.querySelectorAll('#resultados .tarjeta-plan')).toHaveLength(1);
    expect($('#error-personas').textContent).toContain('No se ha podido buscar');

    $('#error-personas button').click();
    await terminar();

    expect(filas()).toHaveLength(1);
    expect(oculto('#error-personas')).toBe(true);
  });
});

// CS-61 (B3): cada fila de persona muestra su relación con quien busca y el botón que corresponde.
// La fila deja de ser un solo enlace: el enlace al perfil y el botón son elementos distintos.
describe('Buscar (relación y botón en la fila)', () => {
  const persona = (id, nombre, relacion) => ({ id, nombreUsuario: nombre, foto: null, ciudad: 'Sevilla', relacion });
  const sinRelacion = { amistad: 'ninguna', amistadId: null, siguiendo: false };

  const abrirCon = (personas) => abrir('?q=a', { personas: () => respuesta(200, personas) });

  test('una persona sin relación ofrece «Añadir amigo», que envía la solicitud y pasa a «Cancelar solicitud»', async () => {
    await abrirCon([persona(5, 'bea', sinRelacion)]);
    window.fetch.mockImplementation(() => respuesta(201, { id: 77, estado: 'PENDIENTE' }));

    const boton = $('#resultados-personas .fila-resultado button');
    expect(boton.textContent).toBe('Añadir amigo');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ destinatarioId: 5 }),
    }));
    const fila = $('#resultados-personas .fila-resultado');
    expect(fila.querySelector('button').textContent).toBe('Cancelar solicitud');
    expect(fila.textContent).toContain('Solicitud enviada');
  });

  test('«Cancelar solicitud» borra la amistad pendiente y vuelve a «Añadir amigo»', async () => {
    await abrirCon([persona(5, 'bea', { amistad: 'enviada', amistadId: 9, siguiendo: false })]);
    window.fetch.mockImplementation(() => respuesta(200, { mensaje: 'ok' }));

    const boton = $('#resultados-personas .fila-resultado button');
    expect(boton.textContent).toBe('Cancelar solicitud');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades/9', expect.objectContaining({ method: 'DELETE' }));
    expect($('#resultados-personas .fila-resultado button').textContent).toBe('Añadir amigo');
  });

  test('una solicitud recibida se acepta desde la fila y la persona pasa a «Amigos»', async () => {
    await abrirCon([persona(5, 'bea', { amistad: 'recibida', amistadId: 12, siguiendo: false })]);
    window.fetch.mockImplementation(() => respuesta(200, { id: 12, estado: 'ACEPTADA' }));

    const boton = $('#resultados-personas .fila-resultado button');
    expect(boton.textContent).toBe('Aceptar');
    boton.click();
    await terminar();

    expect(window.fetch).toHaveBeenCalledWith('/api/amistades/12', expect.objectContaining({
      method: 'PATCH', body: JSON.stringify({ aceptar: true }),
    }));
    const fila = $('#resultados-personas .fila-resultado');
    expect(fila.querySelector('button')).toBeNull();
    expect(fila.textContent).toContain('Amigos');
  });

  test('un amigo no tiene botón y se indica; a quien sigues se le añade «Le sigues»', async () => {
    await abrirCon([
      persona(5, 'bea', { amistad: 'amigos', amistadId: 3, siguiendo: false }),
      persona(6, 'raul', { amistad: 'ninguna', amistadId: null, siguiendo: true }),
    ]);

    const [amigo, seguido] = document.querySelectorAll('#resultados-personas .fila-resultado');
    expect(amigo.querySelector('button')).toBeNull();
    expect(amigo.textContent).toContain('Amigos');
    expect(seguido.textContent).toContain('Le sigues');
    expect(seguido.querySelector('button').textContent).toBe('Añadir amigo');
  });

  test('si la acción falla se muestra el error en la fila y el botón queda activo', async () => {
    await abrirCon([persona(5, 'bea', sinRelacion)]);
    window.fetch.mockImplementation(() => respuesta(400, { error: 'Ya existe una solicitud' }));

    $('#resultados-personas .fila-resultado button').click();
    await terminar();

    const fila = $('#resultados-personas .fila-resultado');
    expect(fila.querySelector('[role="alert"]').textContent).toBe('Ya existe una solicitud');
    expect(fila.querySelector('button').disabled).toBe(false);
  });

  test('el enlace al perfil sigue siendo solo la persona, sin el botón dentro', async () => {
    await abrirCon([persona(5, 'bea', sinRelacion)]);

    const enlace = $('#resultados-personas .fila-resultado a');
    expect(enlace.querySelector('button')).toBeNull();
    expect(enlace.textContent).toContain('bea');
  });
});

test('con una solicitud recibida se puede aceptar o rechazar desde el buscador', () => {
  const fila = document.createElement('div');
  document.documentElement.innerHTML = '<body></body>';
  cargarScripts(['js/shared/pantalla.js']);
  fila.append(...window.crearBotonesAmistad('recibida', () => {}));
  expect([...fila.children].map((b) => b.textContent)).toEqual(['Aceptar', 'Rechazar']);
});
