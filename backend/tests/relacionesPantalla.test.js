/**
 * @jest-environment jsdom
 */
// CS-45, objetivo 7: contadores y listados de amigos y seguidores en la pantalla de mi perfil
// (frontend/perfil.html y js/perfil.js) en un navegador simulado (jsdom).
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('perfil.html');
const SCRIPTS = leer('js/shared/api.js') + leer('js/shared/experiencias.js') + leer('js/shared/password.js') + leer('js/perfil.js');
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: null, ciudad: null };

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const oculto = (selector) => $(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

// Personas de ejemplo con ids consecutivos: personas(2, 4) son los usuarios 2, 3 y 4.
const persona = (id) => ({ id, nombreUsuario: `usuario_${id}`, foto: '/img/foto-por-defecto.svg' });
const personas = (desde, hasta) => Array.from({ length: hasta - desde + 1 }, (_, i) => persona(desde + i));
// Respuesta de un listado paginado por cursor, como la devuelve el backend: `siguiente` es el
// valor para pedir la página siguiente, o null si no hay más.
const listado = (lista, siguiente = null) => ({ personas: lista, siguiente });

const RESUMEN = '/api/perfil/resumen';
const AMIGOS = '/api/perfil/amigos?limite=20';
const SEGUIDORES = '/api/perfil/seguidores?limite=20';
const SEGUIDORES_2 = '/api/perfil/seguidores?limite=20&despuesDe=23';

// Lo que responde el servidor simulado si la prueba no indica otra cosa: un perfil sin relaciones.
const SIN_RELACIONES = {
  '/api/perfil': [200, PERFIL],
  '/api/amistades/solicitudes': [200, []],
  [RESUMEN]: [200, { amigos: 0, seguidores: 0 }],
  [AMIGOS]: [200, listado([])],
  [SEGUIDORES]: [200, listado([])],
};

// Abre la página con un servidor simulado que responde según la dirección pedida,
// sin depender del orden de las llamadas.
async function abrirPerfil(rutas = {}) {
  const servidor = { ...SIN_RELACIONES, ...rutas };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta) => {
    const [status, cuerpo] = servidor[ruta] ?? [404, { error: `Ruta no simulada: ${ruta}` }];
    return respuesta(status, cuerpo);
  });
  (0, eval)(SCRIPTS);
  await terminar();
}

test('muestra el número de amigos y de seguidores', async () => {
  await abrirPerfil({ [RESUMEN]: [200, { amigos: 2, seguidores: 25 }] });

  expect($('#total-amigos').textContent).toBe('2');
  expect($('#total-seguidores').textContent).toBe('25');
});

test('lista a los amigos y a los seguidores por su nombre', async () => {
  await abrirPerfil({
    [AMIGOS]: [200, listado(personas(2, 3))],
    [SEGUIDORES]: [200, listado(personas(4, 4))],
  });

  expect($('#lista-amigos').children).toHaveLength(2);
  expect($('#lista-amigos').textContent).toContain('usuario_2');
  expect($('#lista-amigos').textContent).toContain('usuario_3');
  expect($('#lista-seguidores').children).toHaveLength(1);
  expect($('#lista-seguidores').textContent).toContain('usuario_4');
  expect(oculto('#sin-amigos')).toBe(true);
  expect(oculto('#sin-seguidores')).toBe(true);
});

test('el nombre se escribe como texto y nunca se interpreta como HTML', async () => {
  const conEtiquetas = { id: 2, nombreUsuario: '<b>ana</b>', foto: '/img/foto-por-defecto.svg' };
  await abrirPerfil({ [AMIGOS]: [200, listado([conEtiquetas])] });

  expect($('#lista-amigos').textContent).toContain('<b>ana</b>');
  expect($('#lista-amigos b')).toBeNull();
});

test('sin amigos ni seguidores se ven ceros y un aviso en cada lista', async () => {
  await abrirPerfil();

  expect($('#total-amigos').textContent).toBe('0');
  expect($('#total-seguidores').textContent).toBe('0');
  expect($('#lista-amigos').children).toHaveLength(0);
  expect($('#lista-seguidores').children).toHaveLength(0);
  expect(oculto('#sin-amigos')).toBe(false);
  expect(oculto('#sin-seguidores')).toBe(false);
  expect(oculto('#mas-amigos')).toBe(true);
  expect(oculto('#mas-seguidores')).toBe(true);
  expect(oculto('#error-relaciones')).toBe(true);
});

test('«Cargar más» solo aparece si quedan personas por mostrar', async () => {
  await abrirPerfil({
    [AMIGOS]: [200, listado(personas(2, 3))],
    [SEGUIDORES]: [200, listado(personas(4, 23), 23)],
  });

  expect(oculto('#mas-amigos')).toBe(true);
  expect(oculto('#mas-seguidores')).toBe(false);
});

test('al pulsar «Cargar más» se pide la página siguiente y se añade sin repetir a nadie', async () => {
  await abrirPerfil({
    [SEGUIDORES]: [200, listado(personas(4, 23), 23)],
    // La página siguiente repite al usuario 23, ya mostrado, y trae a los cinco que faltan.
    [SEGUIDORES_2]: [200, listado(personas(23, 28))],
  });

  $('#mas-seguidores').click();
  await terminar();

  const nombres = [...$('#lista-seguidores').children].map((fila) => fila.textContent.trim());
  expect(window.fetch.mock.calls.at(-1)[0]).toBe(SEGUIDORES_2);
  expect(nombres).toHaveLength(25);
  expect(new Set(nombres).size).toBe(25);
  expect(oculto('#mas-seguidores')).toBe(true);
});

test('si el servidor falla se muestra su mensaje y el resto del perfil sigue funcionando', async () => {
  await abrirPerfil({ [RESUMEN]: [500, { error: 'No se han podido cargar tus relaciones' }] });

  expect(oculto('#error-relaciones')).toBe(false);
  expect($('#error-relaciones').textContent).toBe('No se han podido cargar tus relaciones');
  expect($('#nombreUsuario').value).toBe('ana');
});

test('si falla «Cargar más» se avisa y el botón sigue disponible para reintentar', async () => {
  await abrirPerfil({
    [SEGUIDORES]: [200, listado(personas(4, 23), 23)],
    [SEGUIDORES_2]: [500, { error: 'Error temporal' }],
  });

  $('#mas-seguidores').click();
  await terminar();

  expect(oculto('#error-relaciones')).toBe(false);
  expect($('#error-relaciones').textContent).toBe('Error temporal');
  expect($('#lista-seguidores').children).toHaveLength(20);
  expect(oculto('#mas-seguidores')).toBe(false);
  expect($('#mas-seguidores').disabled).toBe(false);
});
test('al aceptar una solicitud en la misma página sube el contador y el amigo aparece en la lista', async () => {
  const SOLICITUD = { id: 10, estado: 'PENDIENTE', solicitante: persona(2) };
  await abrirPerfil({ '/api/amistades/solicitudes': [200, [SOLICITUD]] });
  expect($('#total-amigos').textContent).toBe('0');

  // A partir de aquí el servidor ya tiene la amistad aceptada
  const despues = {
    ...SIN_RELACIONES,
    '/api/amistades/10': [200, { ...SOLICITUD, estado: 'ACEPTADA' }],
    [RESUMEN]: [200, { amigos: 1, seguidores: 0 }],
    [AMIGOS]: [200, listado([persona(2)])],
  };
  window.fetch.mockImplementation((ruta) => {
    const [status, cuerpo] = despues[ruta] ?? [404, { error: `Ruta no simulada: ${ruta}` }];
    return respuesta(status, cuerpo);
  });
  [...document.querySelectorAll('#solicitudes-recibidas button')]
    .find((boton) => boton.textContent === 'Aceptar')
    .click();
  await terminar();

  expect($('#total-amigos').textContent).toBe('1');
  expect([...$('#lista-amigos').children].map((fila) => fila.textContent.trim())).toEqual(['usuario_2']);
  expect(oculto('#sin-amigos')).toBe(true);
});
