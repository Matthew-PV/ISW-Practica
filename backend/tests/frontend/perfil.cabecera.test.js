/**
 * @jest-environment jsdom
 */
// CS-66, T4.4: diseño de mi perfil (/cuenta/perfil.html y js/perfil.js) en jsdom: cabecera con contadores
// y pestañas de experiencias, amigos y seguidores. Solicitudes y ajustes tienen su propia página.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/cuenta/perfil.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/experiencias.js', 'js/perfil.js'];
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', ciudad: null, foto: null };
const EXPERIENCIA = (id) => ({ id, titulo: `Plan ${id}`, ciudad: { nombre: 'Madrid' }, visibilidad: 'PUBLICA' });

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function abrir(rutas = {}) {
  const servidor = {
    'GET /api/perfil': [200, PERFIL],
    'GET /api/perfil/resumen': [200, { amigos: 3, seguidores: 5 }],
    'GET /api/perfil/amigos?limite=20': [200, { personas: [], siguiente: null }],
    'GET /api/perfil/seguidores?limite=20': [200, { personas: [], siguiente: null }],
    'GET /api/experiencias?autor=ana': [200, { experiencias: [EXPERIENCIA(2), EXPERIENCIA(1)], siguiente: null }],
    ...rutas,
  };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    return respuesta(...(servidor[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }]));
  });
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

describe('cabecera del perfil', () => {
  test('el nombre de usuario se ve como texto, nunca como HTML', async () => {
    await abrir({ 'GET /api/perfil': [200, { ...PERFIL, nombreUsuario: '<img src=x onerror=1>' }] });

    const cabecera = $('.cabecera-perfil');
    expect(cabecera.textContent).toContain('<img src=x onerror=1>');
    expect(cabecera.querySelector('img[src="x"]')).toBeNull();
  });

  test('los contadores son texto: «3 amigos» y «5 seguidores»', async () => {
    await abrir();

    const texto = $('.cabecera-perfil').textContent.replace(/\s+/g, ' ');
    expect(texto).toContain('3 amigos');
    expect(texto).toContain('5 seguidores');
    expect($('.cabecera-perfil-contadores a')).toBeNull();
  });

  test('muestra mi ciudad como texto y no muestra nada si no la he puesto', async () => {
    await abrir({ 'GET /api/perfil': [200, { ...PERFIL, ciudad: '<b>Madrid</b>' }] });
    expect($('#ciudad-perfil').textContent).toBe('<b>Madrid</b>');
    expect($('#ciudad-perfil b')).toBeNull();

    await abrir();
    expect($('#ciudad-perfil').textContent).toBe('');
  });

  test('«Editar perfil» lleva a los ajustes', async () => {
    await abrir();

    const enlace = $('.cabecera-perfil a.btn');
    expect(enlace.textContent).toBe('Editar perfil');
    expect(enlace.getAttribute('href')).toBe('/cuenta/ajustes.html');
  });

  test('el contador de experiencias cuenta las que se han cargado', async () => {
    await abrir();

    expect($('.cabecera-perfil').textContent.replace(/\s+/g, ' ')).toContain('2 experiencias');
  });

  test('las experiencias van en una rejilla', async () => {
    await abrir();

    expect($('#lista-experiencias').classList.contains('rejilla-experiencias')).toBe(true);
  });

  test('hay pestañas de experiencias, amigos y seguidores, y solo se ve la elegida', async () => {
    await abrir();

    const pestanas = [...document.querySelectorAll('#pestanas-perfil [role="tab"]')];
    expect(pestanas.map((p) => p.textContent)).toEqual(['Experiencias', 'Amigos', 'Seguidores']);
    expect($('#panel-experiencias').hidden).toBe(false);
    expect($('#panel-amigos').hidden).toBe(true);

    pestanas[1].click();

    expect($('#panel-amigos').hidden).toBe(false);
    expect($('#panel-experiencias').hidden).toBe(true);
  });

  test('el perfil ya no contiene solicitudes ni ajustes', async () => {
    await abrir();

    expect($('#solicitudes-recibidas')).toBeNull();
    expect($('#form-perfil')).toBeNull();
    expect($('main details')).toBeNull();
  });
});

describe('experiencias', () => {
  test('mis experiencias son tarjetas con etiqueta de visibilidad y «Ver detalle»', async () => {
    await abrir({ 'GET /api/experiencias?autor=ana': [200, { experiencias: [{ ...EXPERIENCIA(7), visibilidad: 'AMIGOS' }], siguiente: null }] });

    const tarjeta = $('#lista-experiencias .tarjeta-experiencia');
    expect(tarjeta.querySelector('.etiqueta-amigos').textContent).toBe('Amigos');
    expect(tarjeta.querySelector('a.btn-outline-primary').getAttribute('href')).toBe('/experiencias/experiencia.html?id=7');
  });
});
