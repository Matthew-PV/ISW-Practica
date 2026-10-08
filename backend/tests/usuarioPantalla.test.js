/**
 * @jest-environment jsdom
 */
// CS-62, objetivo 5: la pantalla del perfil de otro usuario (frontend/usuario.html y js/usuario.js)
// en un navegador simulado (jsdom). Se simula el servidor (fetch), así que no hace falta arrancar nada.
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('usuario.html');
const SCRIPTS = leer('js/shared/api.js') + leer('js/shared/experiencias.js') + leer('js/usuario.js');
const FOTO = 'https://res.cloudinary.com/demo/image/upload/v1/planb/perfiles/usuario-2.png';
const PERFIL = {
  id: 2, nombreUsuario: 'ana', foto: FOTO, ciudad: 'Madrid',
  amigos: 3, seguidores: 5, esPropio: false, relacion: { amistad: 'ninguna', siguiendo: false },
};

// Respuesta de fetch con el código y el JSON indicados
const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
// Deja que terminen las promesas pendientes (la llamada a fetch y lo que viene después)
const terminar = () => new Promise((r) => setTimeout(r, 0));

// Abre la página como si el navegador estuviera en usuario.html?nombre=...
// `siguientes` son las respuestas que dará el servidor a las peticiones posteriores a la carga.
async function abrirPagina(nombre, perfil = PERFIL, siguientes = []) {
  window.history.pushState({}, '', `/usuario.html?nombre=${encodeURIComponent(nombre)}`);
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn().mockReturnValueOnce(respuesta(200, perfil));
  // CS-44: al mostrarse el perfil, la página pide también sus experiencias (petición 2)
  if (!perfil.esPropio) {
    window.fetch.mockReturnValueOnce(respuesta(200, { experiencias: [], siguiente: null }));
  }
  siguientes.forEach((r) => window.fetch.mockReturnValueOnce(r));
  (0, eval)(SCRIPTS);
  await terminar();
}

test('pide al servidor el perfil del usuario indicado en la dirección', async () => {
  await abrirPagina('ana');

  expect(window.fetch.mock.calls[0][0]).toBe('/api/usuarios/ana');
});

test('muestra nombre, ciudad, foto y contadores de amigos y seguidores', async () => {
  await abrirPagina('ana');

  expect($('#nombre-usuario').textContent).toBe('ana');
  expect($('#ciudad').textContent).toBe('Madrid');
  expect($('#foto-usuario').getAttribute('src')).toBe(FOTO);
  expect($('#amigos').textContent).toBe('3');
  expect($('#seguidores').textContent).toBe('5');
});

test('un usuario sin ciudad no muestra la palabra null', async () => {
  await abrirPagina('ana', { ...PERFIL, ciudad: null });

  expect($('#ciudad').textContent).toBe('');
});

test('un nombre con caracteres especiales se envía codificado', async () => {
  await abrirPagina('ana maría');

  expect(window.fetch.mock.calls[0][0]).toBe('/api/usuarios/ana%20mar%C3%ADa');
});

test('el texto del usuario se inserta como texto, nunca como HTML', async () => {
  await abrirPagina('ana', { ...PERFIL, nombreUsuario: '<b>ana</b>' });

  expect($('#nombre-usuario').textContent).toBe('<b>ana</b>');
  expect($('#nombre-usuario').querySelector('b')).toBeNull();
});

// ---- Objetivo 6: botón de amistad según la relación ----
const conRelacion = (amistad, amistadId = null, extra = {}) =>
  ({ ...PERFIL, ...extra, relacion: { amistad, amistadId, siguiendo: false } });
const textosBotones = () => [...document.querySelectorAll('#botones-amistad button')].map((b) => b.textContent);
const boton = (texto) => [...document.querySelectorAll('#botones-amistad button')].find((b) => b.textContent === texto);

describe('botón de amistad', () => {
  test('sin relación muestra «Añadir amigo»', async () => {
    await abrirPagina('ana', conRelacion('ninguna'));

    expect(textosBotones()).toEqual(['Añadir amigo']);
  });

  test('con una solicitud enviada muestra «Solicitud enviada», desactivado', async () => {
    await abrirPagina('ana', conRelacion('enviada', 10));

    expect(textosBotones()).toEqual(['Solicitud enviada']);
    expect(boton('Solicitud enviada').disabled).toBe(true);
  });

  test('con una solicitud recibida muestra «Aceptar» y «Rechazar»', async () => {
    await abrirPagina('ana', conRelacion('recibida', 10));

    expect(textosBotones()).toEqual(['Aceptar', 'Rechazar']);
  });

  test('siendo amigos muestra «Eliminar amigo»', async () => {
    await abrirPagina('ana', conRelacion('amigos', 10));

    expect(textosBotones()).toEqual(['Eliminar amigo']);
  });

  test('«Añadir amigo» envía la solicitud y la página se actualiza sin recargar', async () => {
    await abrirPagina('ana', conRelacion('ninguna'), [
      respuesta(201, { id: 10 }),
      respuesta(200, conRelacion('enviada', 10)),
    ]);

    boton('Añadir amigo').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/amistades');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({ destinatarioId: 2 });
    expect(window.fetch.mock.calls[3][0]).toBe('/api/usuarios/ana');
    expect(textosBotones()).toEqual(['Solicitud enviada']);
  });

  test('«Aceptar» acepta la solicitud, sube el contador y pasa a «Eliminar amigo»', async () => {
    await abrirPagina('ana', conRelacion('recibida', 10), [
      respuesta(200, { id: 10, estado: 'ACEPTADA' }),
      respuesta(200, conRelacion('amigos', 10, { amigos: 4 })),
    ]);

    boton('Aceptar').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/amistades/10');
    expect(opciones.method).toBe('PATCH');
    expect(JSON.parse(opciones.body)).toEqual({ aceptar: true });
    expect($('#amigos').textContent).toBe('4');
    expect(textosBotones()).toEqual(['Eliminar amigo']);
  });

  test('«Rechazar» rechaza la solicitud y vuelve a «Añadir amigo»', async () => {
    await abrirPagina('ana', conRelacion('recibida', 10), [
      respuesta(200, null),
      respuesta(200, conRelacion('ninguna')),
    ]);

    boton('Rechazar').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/amistades/10');
    expect(JSON.parse(opciones.body)).toEqual({ aceptar: false });
    expect(textosBotones()).toEqual(['Añadir amigo']);
  });

  test('«Eliminar amigo» no hace nada si el usuario no confirma', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    await abrirPagina('ana', conRelacion('amigos', 10));

    boton('Eliminar amigo').click();
    await terminar();

    expect(window.confirm).toHaveBeenCalled();
    // Solo las dos peticiones de la carga (perfil y experiencias): ninguna para borrar
    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(textosBotones()).toEqual(['Eliminar amigo']);
  });

  test('«Eliminar amigo» borra la amistad si el usuario confirma', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    await abrirPagina('ana', conRelacion('amigos', 10), [
      respuesta(204, null),
      respuesta(200, conRelacion('ninguna', null, { amigos: 2 })),
    ]);

    boton('Eliminar amigo').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/amistades/10');
    expect(opciones.method).toBe('DELETE');
    expect($('#amigos').textContent).toBe('2');
    expect(textosBotones()).toEqual(['Añadir amigo']);
  });

  test('si el servidor rechaza la acción se muestra su mensaje y la página sigue', async () => {
    await abrirPagina('ana', conRelacion('ninguna'), [respuesta(400, { error: 'Ya existe una solicitud o amistad entre estos usuarios' })]);

    boton('Añadir amigo').click();
    await terminar();

    expect($('#error-usuario').classList.contains('d-none')).toBe(false);
    expect($('#error-usuario').textContent).toBe('Ya existe una solicitud o amistad entre estos usuarios');
    expect($('#nombre-usuario').textContent).toBe('ana');
  });
});

// ---- Objetivo 7: botón Seguir / Dejar de seguir ----
const conSeguimiento = (siguiendo, extra = {}) =>
  ({ ...PERFIL, ...extra, relacion: { amistad: 'ninguna', amistadId: null, siguiendo } });
const textoSeguir = () => [...document.querySelectorAll('#boton-seguir button')].map((b) => b.textContent);
const botonSeguir = () => document.querySelector('#boton-seguir button');

describe('botón de seguir', () => {
  test('si no la sigo muestra «Seguir»', async () => {
    await abrirPagina('ana', conSeguimiento(false));

    expect(textoSeguir()).toEqual(['Seguir']);
  });

  test('si ya la sigo muestra «Dejar de seguir»', async () => {
    await abrirPagina('ana', conSeguimiento(true));

    expect(textoSeguir()).toEqual(['Dejar de seguir']);
  });

  test('«Seguir» la sigue, sube el contador de seguidores y pasa a «Dejar de seguir»', async () => {
    await abrirPagina('ana', conSeguimiento(false), [
      respuesta(201, { id: 1 }),
      respuesta(200, conSeguimiento(true, { seguidores: 6 })),
    ]);

    botonSeguir().click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/seguimientos');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({ seguidoId: 2 });
    expect(window.fetch.mock.calls[3][0]).toBe('/api/usuarios/ana');
    expect($('#seguidores').textContent).toBe('6');
    expect(textoSeguir()).toEqual(['Dejar de seguir']);
  });

  test('«Dejar de seguir» deja de seguirla, baja el contador y vuelve a «Seguir»', async () => {
    await abrirPagina('ana', conSeguimiento(true), [
      respuesta(204, null),
      respuesta(200, conSeguimiento(false, { seguidores: 4 })),
    ]);

    botonSeguir().click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[2];
    expect(ruta).toBe('/api/seguimientos/2');
    expect(opciones.method).toBe('DELETE');
    expect($('#seguidores').textContent).toBe('4');
    expect(textoSeguir()).toEqual(['Seguir']);
  });

  test('si el servidor rechaza la acción se muestra su mensaje', async () => {
    await abrirPagina('ana', conSeguimiento(false), [respuesta(400, { error: 'Ya sigues a este usuario' })]);

    botonSeguir().click();
    await terminar();

    expect($('#error-usuario').classList.contains('d-none')).toBe(false);
    expect($('#error-usuario').textContent).toBe('Ya sigues a este usuario');
  });

  test('seguir es independiente de la amistad: siendo amigos se ven los dos botones', async () => {
    await abrirPagina('ana', { ...PERFIL, relacion: { amistad: 'amigos', amistadId: 10, siguiendo: false } });

    expect(textosBotones()).toEqual(['Eliminar amigo']);
    expect(textoSeguir()).toEqual(['Seguir']);
  });
});

// ---- Objetivo 9: usuario inexistente y perfil propio ----
const locationReal = window.location;
afterEach(() => {
  Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
});

// Abre la página con un `location` simple, para ver a qué dirección intenta ir sin que jsdom navegue
async function abrirVigilandoRedireccion(nombre, primeraRespuesta) {
  window.history.pushState({}, '', `/usuario.html?nombre=${encodeURIComponent(nombre)}`);
  document.documentElement.innerHTML = HTML;
  Object.defineProperty(window, 'location', {
    value: { search: locationReal.search, href: locationReal.href },
    configurable: true,
    writable: true,
  });
  window.fetch = jest.fn().mockReturnValueOnce(primeraRespuesta);
  (0, eval)(SCRIPTS);
  await terminar();
}
const oculto = (selector) => $(selector).classList.contains('d-none');

describe('usuario inexistente y perfil propio', () => {
  test('un usuario que existe muestra su perfil y no redirige', async () => {
    await abrirVigilandoRedireccion('ana', respuesta(200, PERFIL));

    expect(oculto('#perfil-usuario')).toBe(false);
    expect(oculto('#no-encontrado')).toBe(true);
    expect(window.location.href).toBe(locationReal.href);
  });

  test('si el usuario no existe se muestra «Usuario no encontrado» y no el perfil', async () => {
    await abrirVigilandoRedireccion('nadie', respuesta(404, { error: 'Usuario no encontrado' }));

    expect(oculto('#no-encontrado')).toBe(false);
    expect($('#no-encontrado').textContent).toBe('Usuario no encontrado');
    expect(oculto('#perfil-usuario')).toBe(true);
    expect(window.location.href).toBe(locationReal.href);
  });

  test('si el perfil es el mío, se va a perfil.html', async () => {
    await abrirVigilandoRedireccion('ana', respuesta(200, { ...PERFIL, esPropio: true }));

    expect(window.location.href).toBe('perfil.html');
  });

  test('sin sesión se sigue yendo al login', async () => {
    await abrirVigilandoRedireccion('ana', respuesta(401, { error: 'No hay sesión iniciada' }));

    expect(window.location.href).toBe('/');
  });
});
