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
async function abrirPagina(nombre, perfil = PERFIL) {
  window.history.pushState({}, '', `/usuario.html?nombre=${encodeURIComponent(nombre)}`);
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn().mockReturnValueOnce(respuesta(200, perfil));
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
