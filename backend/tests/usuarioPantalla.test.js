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
const SCRIPTS = leer('js/shared/api.js') + leer('js/usuario.js');
const FOTO = 'https://res.cloudinary.com/demo/image/upload/v1/planb/perfiles/usuario-2.png';
const PERFIL = {
  id: 2, nombreUsuario: 'ana', foto: FOTO, ciudad: 'Madrid',
  amigos: 3, seguidores: 5, relacion: { amistad: 'ninguna', siguiendo: false },
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

    const [ruta, opciones] = window.fetch.mock.calls[1];
    expect(ruta).toBe('/api/amistades');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual({ destinatarioId: 2 });
    expect(window.fetch.mock.calls[2][0]).toBe('/api/usuarios/ana');
    expect(textosBotones()).toEqual(['Solicitud enviada']);
  });

  test('«Aceptar» acepta la solicitud, sube el contador y pasa a «Eliminar amigo»', async () => {
    await abrirPagina('ana', conRelacion('recibida', 10), [
      respuesta(200, { id: 10, estado: 'ACEPTADA' }),
      respuesta(200, conRelacion('amigos', 10, { amigos: 4 })),
    ]);

    boton('Aceptar').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls[1];
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

    const [ruta, opciones] = window.fetch.mock.calls[1];
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
    expect(window.fetch).toHaveBeenCalledTimes(1);
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

    const [ruta, opciones] = window.fetch.mock.calls[1];
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
