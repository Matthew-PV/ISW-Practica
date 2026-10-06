/**
 * @jest-environment jsdom
 */

// CS-48: las valoraciones de amigos y seguidores aparecen en una sección
// propia dentro del detalle de una experiencia y se pueden paginar.
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

      if (
        ruta === '/api/experiencias/10/valoracion' ||
        ruta === '/api/experiencias/10/valoracion?pagina=2&limite=10'
      ) {
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

  expect(
    visible('#paginacion-valoraciones')
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

test('permite avanzar a la página siguiente y volver a la anterior', async () => {
  // Primera página: hay 12 valoraciones en total,
  // por tanto existen 2 páginas con límite 10.
  respuestaValoraciones = {
    valoraciones: [
      {
        id: 20,
        usuarioId: 3,
        experienciaId: 10,
        puntuacion: 5,
        comentario: 'Primera página',
        usuario: {
          id: 3,
          nombreUsuario: 'carlos',
          foto: null,
        },
      },
    ],
    total: 12,
    pagina: 1,
    limite: 10,
  };

  $('.tarjeta-experiencia .boton-ver').click();

  await terminar();

  expect(
    visible('#paginacion-valoraciones')
  ).not.toBeNull();

  expect(
    $('#pagina-valoraciones').textContent
  ).toBe('Página 1 de 2');

  expect(
    $('#boton-pagina-anterior').disabled
  ).toBe(true);

  expect(
    $('#boton-pagina-siguiente').disabled
  ).toBe(false);

  // Preparamos la respuesta que devolverá el servidor para la página 2.
  respuestaValoraciones = {
    valoraciones: [
      {
        id: 30,
        usuarioId: 4,
        experienciaId: 10,
        puntuacion: 4,
        comentario: 'Segunda página',
        usuario: {
          id: 4,
          nombreUsuario: 'lucia',
          foto: null,
        },
      },
    ],
    total: 12,
    pagina: 2,
    limite: 10,
  };

  $('#boton-pagina-siguiente').click();

  await terminar();

  expect(window.fetch).toHaveBeenCalledWith(
    '/api/experiencias/10/valoracion?pagina=2&limite=10',
    expect.anything()
  );

  expect(
    $('#pagina-valoraciones').textContent
  ).toBe('Página 2 de 2');

  expect(
    $('#lista-valoraciones strong').textContent
  ).toBe('lucia');

  expect(
    $('#lista-valoraciones p').textContent
  ).toBe('Segunda página');

  expect(
    $('#boton-pagina-anterior').disabled
  ).toBe(false);

  expect(
    $('#boton-pagina-siguiente').disabled
  ).toBe(true);

  // Ahora volvemos a preparar la primera página.
  respuestaValoraciones = {
    valoraciones: [
      {
        id: 20,
        usuarioId: 3,
        experienciaId: 10,
        puntuacion: 5,
        comentario: 'Primera página',
        usuario: {
          id: 3,
          nombreUsuario: 'carlos',
          foto: null,
        },
      },
    ],
    total: 12,
    pagina: 1,
    limite: 10,
  };

  $('#boton-pagina-anterior').click();

  await terminar();

  expect(
    $('#pagina-valoraciones').textContent
  ).toBe('Página 1 de 2');

  expect(
    $('#lista-valoraciones strong').textContent
  ).toBe('carlos');

  expect(
    $('#lista-valoraciones p').textContent
  ).toBe('Primera página');

  expect(
    $('#boton-pagina-anterior').disabled
  ).toBe(true);

  expect(
    $('#boton-pagina-siguiente').disabled
  ).toBe(false);
});

test('una valoración nueva aparece al volver a cargar el detalle', async () => {
  // Primera consulta: todavía nadie relacionado ha valorado la experiencia.
  respuestaValoraciones = {
    valoraciones: [],
    total: 0,
    pagina: 1,
    limite: 10,
  };

  $('.tarjeta-experiencia .boton-ver').click();

  await terminar();

  expect(
    visible('#sin-valoraciones')
  ).toContain(
    'Ningún amigo o seguidor ha valorado esta experiencia.'
  );

  expect(
    $('#lista-valoraciones').children.length
  ).toBe(0);

  // Después un amigo/seguidor añade una valoración.
  respuestaValoraciones = {
    valoraciones: [
      {
        id: 40,
        usuarioId: 5,
        experienciaId: 10,
        puntuacion: 4,
        comentario: 'La acabo de valorar',
        usuario: {
          id: 5,
          nombreUsuario: 'maria',
          foto: null,
        },
      },
    ],
    total: 1,
    pagina: 1,
    limite: 10,
  };

  // Cerramos y volvemos a abrir el detalle:
  // debe hacerse una nueva petición al backend.
  $('#boton-cerrar-detalle').click();
  $('.tarjeta-experiencia .boton-ver').click();

  await terminar();

  expect(
    $('#lista-valoraciones strong').textContent
  ).toBe('maria');

  expect(
    $('#lista-valoraciones span').textContent
  ).toBe('4/5');

  expect(
    $('#lista-valoraciones p').textContent
  ).toBe('La acabo de valorar');

  expect(
    visible('#sin-valoraciones')
  ).toBeNull();

  const peticionesValoraciones =
    window.fetch.mock.calls.filter(
      ([ruta]) =>
        ruta === '/api/experiencias/10/valoracion'
    );

  expect(peticionesValoraciones).toHaveLength(2);
});