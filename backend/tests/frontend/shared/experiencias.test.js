/**
 * @jest-environment jsdom
 */
// CS-44 y CS-62 (objetivo 8): listado de las experiencias de un usuario en su perfil
// («Sus experiencias» en usuario.html) y en el mío («Mis experiencias» en perfil.html), con
// «Cargar más». Se simula el servidor con un fetch que responde según la ruta pedida.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const COMUNES = ['js/shared/api.js', 'js/shared/experiencias.js', 'js/shared/password.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));
const visible = (selector) => !$(selector).classList.contains('d-none');

const PERFIL_ANA = {
  id: 2, nombreUsuario: 'ana', foto: 'img/foto-por-defecto.svg', ciudad: null,
  amigos: 0, seguidores: 0, esPropio: false, relacion: { amistad: 'ninguna', amistadId: null, siguiendo: false },
};
const experiencia = (id, titulo, visibilidad = 'PUBLICA') => ({ id, titulo, visibilidad, ciudad: { nombre: 'Madrid' } });

// Abre la página con un servidor simulado: `rutas` asocia cada ruta con [status, cuerpo].
async function abrir(pagina, script, rutas, direccion) {
  window.history.pushState({}, '', direccion);
  document.documentElement.innerHTML = leer(pagina);
  window.fetch = jest.fn((ruta) => {
    const [status, cuerpo] = rutas[ruta] ?? [404, { error: `Ruta no simulada: ${ruta}` }];
    return respuesta(status, cuerpo);
  });
  cargarScripts([...COMUNES, script]);
  await terminar();
}

const abrirPerfilDeAna = (rutas) => abrir('usuario.html', 'js/usuario.js', {
  '/api/usuarios/ana': [200, PERFIL_ANA], ...rutas,
}, '/usuario.html?nombre=ana');

test('en el perfil de otra persona se ven sus experiencias, enlazadas a su página', async () => {
  await abrirPerfilDeAna({
    '/api/experiencias?autor=ana': [200, { experiencias: [experiencia(7, 'Ruta de tapas', 'AMIGOS'), experiencia(3, 'Museos')], siguiente: null }],
  });

  const enlaces = $$('#lista-experiencias a');
  expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual(['experiencia.html?id=7', 'experiencia.html?id=3']);
  expect(enlaces[0].textContent).toContain('Ruta de tapas');
  expect(enlaces[0].textContent).toContain('Madrid · Amigos');
  expect(visible('#mas-experiencias')).toBe(false);
  expect(visible('#sin-experiencias')).toBe(false);
});

test('un título con HTML se muestra como texto', async () => {
  await abrirPerfilDeAna({
    '/api/experiencias?autor=ana': [200, { experiencias: [experiencia(7, '<img src=x onerror=alert(1)>')], siguiente: null }],
  });

  expect($('#lista-experiencias img')).toBeNull();
  expect($('#lista-experiencias a').textContent).toContain('<img src=x onerror=alert(1)>');
});

test('«Cargar más» pide la página siguiente, la añade sin repetir y desaparece al final', async () => {
  await abrirPerfilDeAna({
    '/api/experiencias?autor=ana': [200, { experiencias: [experiencia(9, 'Nueve'), experiencia(8, 'Ocho')], siguiente: 8 }],
    // La segunda página repite la 8 (por ejemplo, si cambió algo entre medias): no debe duplicarse
    '/api/experiencias?autor=ana&despuesDe=8': [200, { experiencias: [experiencia(8, 'Ocho'), experiencia(5, 'Cinco')], siguiente: null }],
  });
  expect(visible('#mas-experiencias')).toBe(true);

  $('#mas-experiencias').click();
  await terminar();

  expect($$('#lista-experiencias a').map((enlace) => enlace.dataset.experienciaId)).toEqual(['9', '8', '5']);
  expect(visible('#mas-experiencias')).toBe(false);
});

test('sin experiencias se indica la lista vacía, sin error', async () => {
  await abrirPerfilDeAna({ '/api/experiencias?autor=ana': [200, { experiencias: [], siguiente: null }] });

  expect(visible('#sin-experiencias')).toBe(true);
  expect(visible('#error-experiencias')).toBe(false);
});

test('si falla la carga se muestra el error', async () => {
  await abrirPerfilDeAna({ '/api/experiencias?autor=ana': [500, { error: 'Error interno del servidor' }] });

  expect(visible('#error-experiencias')).toBe(true);
  expect($('#error-experiencias').textContent).toBe('Error interno del servidor');
});

describe('Mis experiencias (perfil.html)', () => {
  const PERFIL_PROPIO = { id: 1, nombreUsuario: 'luis', email: 'luis@ejemplo.com', ciudad: null, foto: null };
  const RUTAS_PERFIL = {
    '/api/perfil': [200, PERFIL_PROPIO],
    '/api/amistades/solicitudes': [200, []],
    '/api/perfil/resumen': [200, { amigos: 0, seguidores: 0 }],
    '/api/perfil/amigos?limite=20': [200, { personas: [], siguiente: null }],
    '/api/perfil/seguidores?limite=20': [200, { personas: [], siguiente: null }],
    '/api/experiencias?autor=luis': [200, { experiencias: [experiencia(4, 'Mi plan secreto', 'PRIVADA')], siguiente: 4 }],
  };

  test('muestra mis experiencias, también las privadas', async () => {
    await abrir('perfil.html', 'js/perfil.js', RUTAS_PERFIL, '/perfil.html');

    expect($('#lista-experiencias a').textContent).toContain('Mi plan secreto');
    expect($('#lista-experiencias a').textContent).toContain('Privada');
  });

  test('tras cambiar mi nombre, «Cargar más» pide las siguientes con el nombre nuevo', async () => {
    await abrir('perfil.html', 'js/perfil.js', {
      ...RUTAS_PERFIL,
      '/api/experiencias?autor=luisa&despuesDe=4': [200, { experiencias: [experiencia(2, 'Otra')], siguiente: null }],
    }, '/perfil.html');
    window.fetch.mockImplementationOnce(() => respuesta(200, { ...PERFIL_PROPIO, nombreUsuario: 'luisa' }));
    $('#nombreUsuario').value = 'luisa';
    $('#form-perfil').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    $('#mas-experiencias').click();
    await terminar();

    expect(window.fetch.mock.calls.at(-1)[0]).toBe('/api/experiencias?autor=luisa&despuesDe=4');
    expect($$('#lista-experiencias a').map((enlace) => enlace.dataset.experienciaId)).toEqual(['4', '2']);
  });
});

test('al aceptar desde su perfil la solicitud de amistad, aparecen sus experiencias de amigos sin recargar', async () => {
  const conSolicitud = { ...PERFIL_ANA, relacion: { amistad: 'recibida', amistadId: 10, siguiendo: false } };
  const servidor = {
    'GET /api/usuarios/ana': [200, conSolicitud],
    'GET /api/experiencias?autor=ana': [200, { experiencias: [experiencia(3, 'Museos')], siguiente: null }],
  };
  window.history.pushState({}, '', '/usuario.html?nombre=ana');
  document.documentElement.innerHTML = leer('usuario.html');
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const [status, cuerpo] = servidor[`${opciones.method ?? 'GET'} ${ruta}`] ?? [404, { error: `Ruta no simulada: ${ruta}` }];
    return respuesta(status, cuerpo);
  });
  cargarScripts([...COMUNES, 'js/usuario.js']);
  await terminar();
  expect($$('#lista-experiencias a')).toHaveLength(1);

  // Al aceptar, el servidor ya considera amigos a los dos
  servidor['PATCH /api/amistades/10'] = [200, { id: 10, estado: 'ACEPTADA' }];
  servidor['GET /api/usuarios/ana'] = [200, { ...conSolicitud, relacion: { amistad: 'amigos', amistadId: 10, siguiendo: false } }];
  servidor['GET /api/experiencias?autor=ana'] = [200, {
    experiencias: [experiencia(7, 'Cena con amigos', 'AMIGOS'), experiencia(3, 'Museos')], siguiente: null,
  }];
  [...document.querySelectorAll('#botones-amistad button')].find((b) => b.textContent === 'Aceptar').click();
  await terminar();
  await terminar();

  expect($$('#lista-experiencias a').map((a) => a.dataset.experienciaId)).toEqual(['7', '3']);
});
