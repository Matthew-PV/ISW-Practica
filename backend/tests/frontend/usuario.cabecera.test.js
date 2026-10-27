/**
 * @jest-environment jsdom
 */
// CS-66, T4.4: diseño del perfil de otra persona (usuario.html y js/usuario.js) en jsdom:
// cabecera centrada con contadores y una sola acción principal según la relación.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('usuario.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/experiencias.js', 'js/usuario.js'];
const PERFIL = {
  id: 2, nombreUsuario: 'ana', foto: '/img/foto-por-defecto.svg', ciudad: 'Madrid',
  amigos: 3, seguidores: 5, esPropio: false, relacion: { amistad: 'ninguna', amistadId: null, siguiendo: false },
};

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function abrir(perfil = PERFIL) {
  window.history.pushState({}, '', '/usuario.html?nombre=ana');
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta) => (
    ruta === '/api/usuarios/ana' ? respuesta(200, perfil) : respuesta(200, { experiencias: [], siguiente: null })
  ));
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}
const conRelacion = (amistad, siguiendo = false) => ({ ...PERFIL, relacion: { amistad, amistadId: 10, siguiendo } });

describe('cabecera de otra persona', () => {
  test('es la cabecera de perfil en su variante centrada', async () => {
    await abrir();

    expect($('#perfil-usuario .cabecera-perfil.cabecera-perfil-otra')).not.toBeNull();
  });

  test('los botones de amistad y de seguir comparten una sola fila', async () => {
    await abrir();

    expect($('#botones-amistad').parentElement).toBe($('#boton-seguir').parentElement);
    expect($('#botones-amistad').parentElement.classList.contains('acciones-perfil')).toBe(true);
  });

  test('el nombre de usuario se ve como texto, nunca como HTML', async () => {
    await abrir({ ...PERFIL, nombreUsuario: '<img src=x onerror=1>' });

    const cabecera = $('.cabecera-perfil');
    expect(cabecera.textContent).toContain('<img src=x onerror=1>');
    expect(cabecera.querySelector('img[src="x"]')).toBeNull();
  });

  test('los contadores dicen «3 amigos» y «5 seguidores»', async () => {
    await abrir();

    const texto = $('.cabecera-perfil').textContent.replace(/\s+/g, ' ');
    expect(texto).toContain('3 amigos');
    expect(texto).toContain('5 seguidores');
  });

  test('sus experiencias van en una rejilla', async () => {
    await abrir();

    expect($('#lista-experiencias').classList.contains('rejilla-experiencias')).toBe(true);
  });
});

describe('una sola acción principal', () => {
  const principales = () => [...document.querySelectorAll('.btn-primary')].map((b) => b.textContent);

  test.each([
    ['ninguna', ['Añadir amigo']],
    ['enviada', []],
    ['recibida', ['Aceptar']],
    ['amigos', []],
  ])('con la relación «%s» hay como mucho un botón principal', async (amistad, esperado) => {
    await abrir(conRelacion(amistad));

    expect(principales()).toEqual(esperado);
  });

  test('«Seguir» y «Dejar de seguir» nunca son principales', async () => {
    await abrir(conRelacion('amigos', true));

    expect($('#boton-seguir button').textContent).toBe('Dejar de seguir');
    expect(principales()).toEqual([]);
  });
});
