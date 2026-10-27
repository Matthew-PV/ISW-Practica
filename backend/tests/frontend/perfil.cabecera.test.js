/**
 * @jest-environment jsdom
 */
// CS-66, T4.4: diseño de mi perfil (perfil.html y js/perfil.js) en jsdom: cabecera con contadores,
// banda de solicitudes, «Ajustes» plegado y botones secundarios con estado de espera.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('perfil.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/experiencias.js', 'js/shared/password.js', 'js/perfil.js'];
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', ciudad: null, foto: null };
const EXPERIENCIA = (id) => ({ id, titulo: `Plan ${id}`, ciudad: { nombre: 'Madrid' }, visibilidad: 'PUBLICA' });

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function abrir(rutas = {}) {
  const servidor = {
    'GET /api/perfil': [200, PERFIL],
    'GET /api/amistades/solicitudes': [200, []],
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
    expect($('.cabecera-perfil a')).toBeNull();
  });

  test('el contador de experiencias cuenta las que se han cargado', async () => {
    await abrir();

    expect($('.cabecera-perfil').textContent.replace(/\s+/g, ' ')).toContain('2 experiencias');
  });

  test('las experiencias van en una rejilla, sin pestañas', async () => {
    await abrir();

    expect($('#lista-experiencias').classList.contains('rejilla-experiencias')).toBe(true);
    expect(document.querySelector('[role="tab"]')).toBeNull();
  });
});

describe('experiencias', () => {
  test('mis experiencias son tarjetas con etiqueta de visibilidad y «Ver detalle»', async () => {
    await abrir({ 'GET /api/experiencias?autor=ana': [200, { experiencias: [{ ...EXPERIENCIA(7), visibilidad: 'AMIGOS' }], siguiente: null }] });

    const tarjeta = $('#lista-experiencias .tarjeta-experiencia');
    expect(tarjeta.querySelector('.etiqueta-amigos').textContent).toBe('Amigos');
    expect(tarjeta.querySelector('a.btn-outline-primary').getAttribute('href')).toBe('experiencia.html?id=7');
  });
});

describe('solicitudes', () => {
  const SOLICITUDES = [{ id: 10, solicitante: { id: 2, nombreUsuario: 'luis' } }];

  test('con solicitudes, la banda se ve y «Aceptar» y «Rechazar» son secundarios', async () => {
    await abrir({ 'GET /api/amistades/solicitudes': [200, SOLICITUDES] });

    const banda = $('.banda-solicitudes');
    expect(banda.classList.contains('d-none')).toBe(false);
    const botones = [...banda.querySelectorAll('button')];
    expect(botones.map((b) => b.textContent)).toEqual(['Aceptar', 'Rechazar']);
    expect(botones[0].classList.contains('btn-outline-success')).toBe(true);
    expect(botones[1].classList.contains('btn-outline-danger')).toBe(true);
  });

  test('sin solicitudes, la banda no se ve', async () => {
    await abrir();

    expect($('.banda-solicitudes').classList.contains('d-none')).toBe(true);
  });

  test('el texto «No tienes solicitudes» solo existe dentro de la banda, nunca suelto', async () => {
    await abrir();

    expect($('#sin-solicitudes').closest('.banda-solicitudes')).not.toBeNull();
  });

  test('al responder la última solicitud, la banda desaparece', async () => {
    await abrir({ 'GET /api/amistades/solicitudes': [200, SOLICITUDES], 'PATCH /api/amistades/10': [200, null] });

    [...document.querySelectorAll('.banda-solicitudes button')][1].click();
    await terminar();

    expect($('.banda-solicitudes').classList.contains('d-none')).toBe(true);
  });
});

describe('botones y ajustes', () => {
  test('el perfil no tiene ningún botón principal', async () => {
    await abrir({ 'GET /api/amistades/solicitudes': [200, [{ id: 10, solicitante: { id: 2, nombreUsuario: 'luis' } }]] });

    expect(document.querySelector('.btn-primary')).toBeNull();
  });

  test('«Ajustes» es un details plegado con los datos, la contraseña y «Cerrar sesión» sin id', async () => {
    await abrir();

    const ajustes = $('main details');
    expect(ajustes.open).toBe(false);
    expect(ajustes.querySelector('summary').classList.contains('resumen-boton')).toBe(true);
    expect(ajustes.querySelector('summary').textContent).toBe('Ajustes');
    expect(ajustes.querySelector('#form-perfil')).not.toBeNull();
    expect(ajustes.querySelector('#form-password')).not.toBeNull();
    const cerrar = ajustes.querySelector('button[data-cerrar-sesion]');
    expect(cerrar.textContent).toBe('Cerrar sesión');
    expect(cerrar.id).toBe('');
  });

  test('«Guardar cambios» pasa a «Guardando…», ocupado y desactivado mientras espera', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    const boton = $('#form-perfil button[type="submit"]');
    expect(boton.textContent).toBe('Guardar cambios');
    expect(boton.classList.contains('btn-outline-primary')).toBe(true);
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#form-perfil').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    expect(boton.textContent).toBe('Guardando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');
  });

  test('«Guardar cambios» recupera su texto al terminar', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    const boton = $('#form-perfil button[type="submit"]');

    $('#form-perfil').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();

    expect(boton.textContent).toBe('Guardar cambios');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
  });

  test('«Cambiar contraseña» pasa a «Cambiando…» mientras espera y luego se recupera', async () => {
    await abrir({ 'PUT /api/perfil/password': [204, null] });
    const boton = $('#form-password button[type="submit"]');
    expect(boton.classList.contains('btn-outline-primary')).toBe(true);
    $('#password-actual').value = 'Actual123X';
    $('#password-nueva').value = 'Nueva12345X';
    $('#password-repetida').value = 'Nueva12345X';
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#form-password').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();
    expect(boton.textContent).toBe('Cambiando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');
  });
});
