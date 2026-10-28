/**
 * @jest-environment jsdom
 */

// Pantalla Mis planes: selector de visibilidad del formulario (CS-22),
// enlace al detalle de cada experiencia (CS-63) y edición.
// Se simula el navegador con jsdom y el servidor con fetch.

const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');

const leer = (archivo) =>
  fs.readFileSync(
    path.join(FRONTEND, archivo),
    'utf8'
  );

const HTML = leer('/cuenta/mis-planes.html');

const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/mis-planes.js'];

const USUARIO = {
  id: 1,
  nombreUsuario: 'ana',
};

const CIUDADES = [
  {
    id: 1,
    nombre: 'Madrid',
    pais: 'España',
  },
];

const EXPERIENCIA = {
  id: 10,
  titulo: 'Tarde cultural',
  descripcion: 'Visita a varios museos',
  ciudadId: 1,
  ciudad: {
    id: 1,
    nombre: 'Madrid',
  },
  tipo: 'Cultural',
  momentoAdecuado: 'Por la tarde',
  visibilidad: 'AMIGOS',
};

const respuesta = (status, cuerpo) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: async () => cuerpo,
  });

const $ = (selector) =>
  document.querySelector(selector);

const terminar = () =>
  new Promise((resolve) =>
    setTimeout(resolve, 0)
  );

// Cursor que devuelve el servidor tras la primera página (null: no hay más)
let paginaSiguiente = null;

beforeEach(async () => {
  document.documentElement.innerHTML = HTML;

  // jsdom no implementa completamente <dialog>.
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn();
    dialogo.close = jest.fn();
  }

  window.fetch = jest.fn(
    (ruta) => {
      if (ruta === '/api/auth/yo') {
        return respuesta(
          200,
          USUARIO
        );
      }

      if (ruta === '/api/ciudades') {
        return respuesta(
          200,
          CIUDADES
        );
      }

      // CS-44: mis experiencias, por páginas
      if (ruta === '/api/experiencias?autor=ana') {
        return respuesta(200, { experiencias: [EXPERIENCIA], siguiente: paginaSiguiente });
      }

      if (ruta === '/api/experiencias?autor=ana&despuesDe=10') {
        return respuesta(200, { experiencias: [EXPERIENCIA, { ...EXPERIENCIA, id: 4, titulo: 'Ruta antigua' }], siguiente: null });
      }

      if (ruta === '/api/experiencias') {
        return respuesta(
          201,
          {
            id: 99,
            titulo: 'Nueva experiencia',
            descripcion: 'Creada desde el formulario',
            ciudadId: 1,
            tipo: null,
            momentoAdecuado: null,
            visibilidad: 'AMIGOS',
            autorId: 1,
            ciudad: CIUDADES[0],
          }
        );
      }

      throw new Error(
        `Petición inesperada: ${ruta}`
      );
    }
  );

  // Ejecuta api.js y bienvenida.js como lo haría el navegador.
  cargarScripts(SCRIPTS);

  await terminar();
  await terminar();
});

test('el formulario de experiencia incluye el selector de visibilidad con las tres opciones', () => {
  $('#boton-nueva').click();

  const selector = $('#visibilidad');

  expect(selector).not.toBeNull();
  expect(selector.value).toBe('PUBLICA');
  expect([...selector.options].map((op) => op.value)).toEqual([
    'PRIVADA',
    'AMIGOS',
    'PUBLICA',
  ]);
});

test('al editar una experiencia, el selector de visibilidad conserva su valor actual', () => {
  $('.tarjeta-experiencia .boton-editar').click();

  const selector = $('#visibilidad');

  expect(selector).not.toBeNull();
  expect(selector.value).toBe('AMIGOS');
});

test('debajo del selector se describe la visibilidad elegida y cambia al elegir otra (CS-22)', () => {
  $('#boton-nueva').click();

  expect($('#descripcion-visibilidad').textContent).toBe('Cualquier usuario puede verla.');

  $('#visibilidad').value = 'PRIVADA';
  $('#visibilidad').dispatchEvent(new Event('change'));

  expect($('#descripcion-visibilidad').textContent).toBe('Solo tú puedes verla.');
});

test('al editar, la descripción corresponde a la visibilidad actual de la experiencia (CS-22)', () => {
  $('.tarjeta-experiencia .boton-editar').click();

  expect($('#descripcion-visibilidad').textContent).toBe('Solo la ven tus amigos (con la amistad aceptada) y tú.');
});

test('al enviar el formulario se incluye la visibilidad elegida', async () => {
  $('#boton-nueva').click();

  $('#titulo').value = 'Nueva experiencia';
  $('#descripcion').value = 'Descripción de prueba';
  $('#ciudadId').value = '1';
  $('#visibilidad').value = 'AMIGOS';

  $('#form-experiencia').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true })
  );

  await terminar();

  expect(window.fetch).toHaveBeenCalledWith(
    '/api/experiencias',
    expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"visibilidad":"AMIGOS"'),
    })
  );
});

test('Ver detalle es un enlace a la página de la experiencia (CS-63)', () => {
  const enlace = $('.tarjeta-experiencia .boton-ver');

  expect(enlace.tagName).toBe('A');
  expect(enlace.getAttribute('href')).toBe('/experiencias/experiencia.html?id=10');
});

test('el botón Editar sigue abriendo el formulario de edición', () => {
  $('.tarjeta-experiencia .boton-editar').click();

  expect(
    $('#dialogo-experiencia').showModal
  ).toHaveBeenCalled();

  expect(
    $('#titulo-dialogo').textContent
  ).toBe('Editar experiencia');

  expect(
    $('#titulo').value
  ).toBe('Tarde cultural');

  expect(
    $('#descripcion').value
  ).toBe('Visita a varios museos');
});


test('mis experiencias se cargan por páginas: «Cargar más» añade las siguientes sin repetir (CS-44)', async () => {
  paginaSiguiente = 10;
  document.documentElement.innerHTML = HTML;
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn();
    dialogo.close = jest.fn();
  }
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
  expect($('#mas-experiencias').classList.contains('d-none')).toBe(false);

  $('#mas-experiencias').click();
  await terminar();

  const ids = [...document.querySelectorAll('#rejilla [data-id]')].map((columna) => columna.dataset.id);
  expect(ids).toEqual(['10', '4']);
  expect($('#mas-experiencias').classList.contains('d-none')).toBe(true);
  paginaSiguiente = null;
});

// Rediseño (CS-65): etiqueta de visibilidad en cada tarjeta, con clase y texto propios
test.each([
  ['PUBLICA', 'etiqueta-publica', 'Pública'],
  ['AMIGOS', 'etiqueta-amigos', 'Amigos'],
  ['PRIVADA', 'etiqueta-privada', 'Privada'],
])('la tarjeta de una experiencia %s lleva la etiqueta %s con el texto «%s»', async (visibilidad, clase, texto) => {
  $('.tarjeta-experiencia .boton-editar').click();
  // Se crea otra tarjeta desde el formulario de edición: la respuesta simulada trae esa visibilidad
  window.fetch.mockImplementationOnce(() => respuesta(200, { ...EXPERIENCIA, visibilidad }));
  $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();

  const etiqueta = $(`.tarjeta-experiencia .${clase}`);
  expect(etiqueta).not.toBeNull();
  expect(etiqueta.textContent).toBe(texto);
});

test('Ver detalle de una experiencia con id 7 enlaza a /experiencias/experiencia.html?id=7 con aspecto de botón secundario', async () => {
  // Una experiencia nueva con id 7 entra por el alta
  $('#boton-nueva').click();
  window.fetch.mockImplementationOnce(() => respuesta(201, { ...EXPERIENCIA, id: 7 }));
  $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();

  const enlace = $('[data-id="7"] .boton-ver');
  expect(enlace.getAttribute('href')).toBe('/experiencias/experiencia.html?id=7');
  expect(enlace.classList.contains('btn-outline-primary')).toBe(true);
});

describe('Guardar con espera (R11)', () => {
  const enviar = () => {
    $('#boton-nueva').click();
    $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  test('«Guardar» pasa a «Guardando…», desactivado, mientras espera y se restaura al resolver', async () => {
    let resolver;
    window.fetch.mockImplementationOnce(() => new Promise((r) => { resolver = r; }));
    enviar();
    const boton = $('#form-experiencia button[type="submit"]');
    expect(boton.textContent.trim()).toBe('Guardando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');

    resolver(await respuesta(201, { ...EXPERIENCIA, id: 99 }));
    await terminar();
    expect(boton.textContent.trim()).toBe('Guardar');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
  });

  test('«Guardar» se restaura también si la petición falla', async () => {
    window.fetch.mockImplementationOnce(() => respuesta(400, { error: 'Datos no válidos' }));
    enviar();
    await terminar();
    const boton = $('#form-experiencia button[type="submit"]');
    expect(boton.textContent.trim()).toBe('Guardar');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
  });
});

test('la rejilla usa .rejilla-experiencias y la tarjeta «+» es la primera con su texto', () => {
  const rejilla = $('#rejilla');
  expect(rejilla.classList.contains('rejilla-experiencias')).toBe(true);
  expect(rejilla.firstElementChild.id).toBe('columna-nueva');
  expect($('#boton-nueva .tarjeta-nueva-signo').textContent).toBe('+');
  expect($('#boton-nueva').textContent).toContain('Nueva experiencia');
});

describe('enlaces desde otras pantallas', () => {
  const abrirCon = async (busqueda) => {
    window.history.pushState({}, '', `/cuenta/mis-planes.html${busqueda}`);
    document.documentElement.innerHTML = HTML;
    const dialogo = $('dialog');
    dialogo.showModal = jest.fn();
    dialogo.close = jest.fn();
    window.fetch = jest.fn((ruta) => {
      if (ruta === '/api/auth/yo') return respuesta(200, USUARIO);
      if (ruta === '/api/ciudades') return respuesta(200, CIUDADES);
      if (ruta === `/api/experiencias/${EXPERIENCIA.id}`) return respuesta(200, EXPERIENCIA);
      if (ruta.startsWith('/api/experiencias?')) return respuesta(200, { experiencias: [], siguiente: null });
      throw new Error(`Petición inesperada: ${ruta}`);
    });
    cargarScripts(SCRIPTS);
    await terminar();
    await terminar();
    return dialogo;
  };

  test('?nuevo=1 abre el formulario vacío', async () => {
    const dialogo = await abrirCon('?nuevo=1');

    expect(dialogo.showModal).toHaveBeenCalled();
    expect($('#titulo-dialogo').textContent).toBe('Nueva experiencia');
  });

  test('?editar=<id> abre el formulario con los datos de esa experiencia', async () => {
    const dialogo = await abrirCon(`?editar=${EXPERIENCIA.id}`);

    expect(dialogo.showModal).toHaveBeenCalled();
    expect($('#titulo-dialogo').textContent).toBe('Editar experiencia');
    expect($('#titulo').value).toBe('Tarde cultural');
  });

  test('sin parámetros no se abre ningún formulario', async () => {
    const dialogo = await abrirCon('');

    expect(dialogo.showModal).not.toHaveBeenCalled();
  });
});
