/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 12: búsqueda de personas y enlaces al perfil público.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('personas.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/personas.js'];

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

beforeEach(() => {
  window.history.pushState({}, '', '/personas.html');
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn();
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
  expect(enlaces[0].getAttribute('href')).toBe('usuario.html?nombre=ana%20mar%C3%ADa');
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

  test('personas.html?q=ana%20b%26c rellena el campo y busca con el texto escapado', async () => {
    window.history.pushState({}, '', '/personas.html?q=ana%20b%26c');
    document.documentElement.innerHTML = HTML;
    window.fetch.mockReturnValueOnce(respuesta(200, []));
    cargarScripts(SCRIPTS);
    await terminar();

    expect($('#texto-busqueda').value).toBe('ana b&c');
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?texto=ana%20b%26c', expect.any(Object));
  });

  test('personas.html?q= vacío no busca y deja el texto de ayuda', async () => {
    window.history.pushState({}, '', '/personas.html?q=');
    document.documentElement.innerHTML = HTML;
    cargarScripts(SCRIPTS);
    await terminar();

    expect(window.fetch).not.toHaveBeenCalled();
    expect($('#ayuda-busqueda').classList.contains('d-none')).toBe(false);
  });

  test('con la pestaña Experiencias activa no se llama a fetch y se muestra «sin experiencias»', async () => {
    const pestanas = [...document.querySelectorAll('[role="tab"]')];
    expect(pestanas.map((p) => p.textContent)).toEqual(['Personas', 'Experiencias']);
    pestanas[1].click();

    buscar('museo');
    await terminar();

    expect(window.fetch).not.toHaveBeenCalled();
    expect($('#ayuda-experiencias').classList.contains('d-none')).toBe(true);
    expect($('#sin-experiencias').classList.contains('d-none')).toBe(false);
    expect($('#sin-experiencias').textContent).toBe('Todavía no hay experiencias que mostrar.');
  });

  test('dos búsquedas seguidas: solo se pintan los resultados de la última', async () => {
    const primera = diferida();
    const segunda = diferida();
    window.fetch.mockReturnValueOnce(primera.promesa).mockReturnValueOnce(segunda.promesa);
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
