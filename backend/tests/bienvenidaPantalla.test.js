/**
 * @jest-environment jsdom
 */

// CS-48: las valoraciones de amigos y seguidores aparecen en una sección
// propia dentro del detalle de una experiencia.
// Se simula el navegador con jsdom y el servidor con fetch.

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');

const leer = (archivo) =>
  fs.readFileSync(
    path.join(FRONTEND, archivo),
    'utf8'
  );

const HTML = leer('bienvenida.html');

const SCRIPTS =
  leer('js/shared/api.js') +
  leer('js/bienvenida.js');

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
};

let respuestaValoraciones;

const respuesta = (status, cuerpo) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: async () => cuerpo,
  });

const $ = (selector) =>
  document.querySelector(selector);

const visible = (selector) =>
  $(selector).classList.contains('d-none')
    ? null
    : $(selector).textContent;

const terminar = () =>
  new Promise((resolve) =>
    setTimeout(resolve, 0)
  );

beforeEach(async () => {
  document.documentElement.innerHTML = HTML;

  // jsdom no implementa completamente <dialog>.
  // Simulamos únicamente los métodos que usa bienvenida.js.
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn();
    dialogo.close = jest.fn();
  }

  respuestaValoraciones = {
    valoraciones: [
      {
        id: 20,
        usuarioId: 3,
        experienciaId: 10,
        puntuacion: 5,
        comentario: 'Muy recomendable',
        usuario: {
          id: 3,
          nombreUsuario: 'carlos',
          foto: null,
        },
      },
    ],
    total: 1,
    pagina: 1,
    limite: 10,
  };

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

      if (ruta === '/api/experiencias/mias') {
        return respuesta(
          200,
          [EXPERIENCIA]
        );
      }

      if (ruta === '/api/experiencias/10/valoracion') {
        return respuesta(
          200,
          respuestaValoraciones
        );
      }

      throw new Error(
        `Petición inesperada: ${ruta}`
      );
    }
  );

  // Ejecuta api.js y bienvenida.js como lo haría el navegador.
  (0, eval)(SCRIPTS);

  // Esperamos a que termine la carga inicial.
  await terminar();
  await terminar();
});

test('al pulsar Ver detalle muestra las valoraciones de amigos y seguidores', async () => {
  const botonVer =
    $('.tarjeta-experiencia .boton-ver');

  expect(botonVer).not.toBeNull();

  botonVer.click();

  await terminar();

  expect(
    $('#dialogo-detalle').showModal
  ).toHaveBeenCalled();

  expect(
    $('#titulo-detalle').textContent
  ).toBe('Tarde cultural');

  expect(
    $('#descripcion-detalle').textContent
  ).toBe('Visita a varios museos');

  expect(window.fetch).toHaveBeenCalledWith(
    '/api/experiencias/10/valoracion',
    expect.anything()
  );

  expect(
    $('#lista-valoraciones strong').textContent
  ).toBe('carlos');

  expect(
    $('#lista-valoraciones span').textContent
  ).toBe('5/5');

  expect(
    $('#lista-valoraciones p').textContent
  ).toBe('Muy recomendable');

  expect(
    visible('#sin-valoraciones')
  ).toBeNull();
});

test('si no hay valoraciones relacionadas muestra la sección vacía sin error', async () => {
  respuestaValoraciones = {
    valoraciones: [],
    total: 0,
    pagina: 1,
    limite: 10,
  };

  $('.tarjeta-experiencia .boton-ver').click();

  await terminar();

  expect(
    $('#lista-valoraciones').children.length
  ).toBe(0);

  expect(
    visible('#sin-valoraciones')
  ).toContain(
    'Ningún amigo o seguidor ha valorado esta experiencia.'
  );

  expect(
    visible('#error-valoraciones')
  ).toBeNull();
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