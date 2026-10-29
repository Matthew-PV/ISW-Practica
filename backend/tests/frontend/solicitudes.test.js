/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 13: la página Amigos (/social/amigos.html): solicitudes recibidas arriba (con «Aceptar» y
// «Rechazar») y la lista de amigos debajo.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('/social/amigos.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/solicitudes.js'];
const SOLICITUDES = [{
  id: 10,
  solicitante: { id: 2, nombreUsuario: 'luis', foto: '/img/foto-por-defecto.svg' },
}];
const AMIGOS = [{ id: 7, nombreUsuario: 'marta', foto: '/img/foto-por-defecto.svg' }];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));
const boton = (texto) => [...document.querySelectorAll('#solicitudes-recibidas button')].find((b) => b.textContent === texto);
const llamadas = (ruta) => window.fetch.mock.calls.filter(([r]) => r.startsWith(ruta));

// `respuestaPatch`: qué contesta el servidor al aceptar o rechazar
async function abrir({ solicitudes = SOLICITUDES, amigos = AMIGOS, respuestaPatch = () => respuesta(200, null) } = {}) {
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn().mockImplementation((ruta, opciones) => {
    if (ruta === '/api/amistades/solicitudes') return respuesta(200, solicitudes);
    if (ruta.startsWith('/api/perfil/amigos')) return respuesta(200, { personas: amigos, siguiente: null });
    if (opciones?.method === 'PATCH') return respuestaPatch();
    return respuesta(200, {});
  });
  cargarScripts(SCRIPTS);
  await terminar();
}

describe('solicitudes recibidas', () => {
  beforeEach(() => abrir());

  test('carga las solicitudes recibidas y muestra botones para responderlas', () => {
    expect(window.fetch.mock.calls[0][0]).toBe('/api/amistades/solicitudes');
    expect($('#solicitudes-recibidas').textContent).toContain('luis');
    expect([...document.querySelectorAll('#solicitudes-recibidas button')].map((b) => b.textContent))
      .toEqual(['Aceptar', 'Rechazar']);
  });

  test('cada solicitud muestra la foto del solicitante y enlaza a su perfil', () => {
    const enlace = $('#solicitudes-recibidas a');
    expect(enlace.getAttribute('href')).toBe('/social/usuario.html?nombre=luis');
    expect(enlace.querySelector('img').getAttribute('src')).toBe('/img/foto-por-defecto.svg');
  });

  test('«Aceptar» y «Rechazar» son botones secundarios', () => {
    expect(boton('Aceptar').classList.contains('btn-outline-success')).toBe(true);
    expect(boton('Rechazar').classList.contains('btn-outline-danger')).toBe(true);
    expect(document.querySelector('.btn-primary')).toBeNull();
  });

  test('aceptar confirma «Ahora sois amigos» con enlace al perfil y da el foco al mensaje', async () => {
    boton('Aceptar').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls.find(([, o]) => o?.method === 'PATCH');
    expect(ruta).toBe('/api/amistades/10');
    expect(JSON.parse(opciones.body)).toEqual({ aceptar: true });
    expect($('#solicitudes-recibidas').textContent).toContain('Ahora sois amigos de luis');
    expect($('#solicitudes-recibidas a[href="/social/usuario.html?nombre=luis"]')).not.toBeNull();
    expect($('#solicitudes-recibidas button')).toBeNull();
    expect(document.activeElement.textContent).toContain('Ahora sois amigos');
    // Ya no queda ninguna pendiente
    expect($('#sin-solicitudes').classList.contains('d-none')).toBe(false);
  });

  test('aceptar vuelve a pedir la lista de amigos y avisa a la campana', async () => {
    const avisos = [];
    document.addEventListener('solicitud-respondida', (e) => avisos.push(e.detail.id));

    boton('Aceptar').click();
    await terminar();

    expect(llamadas('/api/perfil/amigos')).toHaveLength(2);
    expect(avisos).toEqual([10]);
  });

  test('rechazar usa la misma ruta con aceptar a false y avisa de que se ha rechazado', async () => {
    boton('Rechazar').click();
    await terminar();

    const [ruta, opciones] = window.fetch.mock.calls.find(([, o]) => o?.method === 'PATCH');
    expect(ruta).toBe('/api/amistades/10');
    expect(JSON.parse(opciones.body)).toEqual({ aceptar: false });
    expect($('#solicitudes-recibidas').textContent).toContain('Solicitud rechazada');
    expect(llamadas('/api/perfil/amigos')).toHaveLength(1);
  });

  test('si el servidor rechaza la respuesta muestra el error y reactiva los botones', async () => {
    await abrir({ respuestaPatch: () => respuesta(400, { error: 'La solicitud de amistad ya no está pendiente' }) });

    boton('Aceptar').click();
    await terminar();

    expect($('#error-solicitudes').textContent).toBe('La solicitud de amistad ya no está pendiente');
    expect(boton('Aceptar').disabled).toBe(false);
  });

  test('si la campana responde una solicitud, la fila desaparece', () => {
    document.dispatchEvent(new CustomEvent('solicitud-respondida', { detail: { id: 10 } }));

    expect($('#solicitudes-recibidas').children).toHaveLength(0);
    expect($('#sin-solicitudes').classList.contains('d-none')).toBe(false);
  });
});

describe('lista de amigos', () => {
  test('las solicitudes van antes que los amigos', async () => {
    await abrir();

    const encabezados = [...document.querySelectorAll('main h2')].map((h) => h.textContent);
    expect(encabezados).toEqual(['Solicitudes recibidas', 'Tus amigos']);
  });

  test('muestra a los amigos con su foto y un enlace a su perfil', async () => {
    await abrir();

    expect(window.fetch.mock.calls.map(([r]) => r)).toContain('/api/perfil/amigos?limite=20');
    const enlace = $('#lista-amigos a');
    expect(enlace.textContent).toContain('marta');
    expect(enlace.getAttribute('href')).toBe('/social/usuario.html?nombre=marta');
    expect(enlace.querySelector('img')).not.toBeNull();
    expect($('#sin-amigos').classList.contains('d-none')).toBe(true);
  });

  test('sin amigos muestra el estado vacío', async () => {
    await abrir({ amigos: [] });

    expect($('#sin-amigos').classList.contains('d-none')).toBe(false);
  });
});
