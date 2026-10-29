/**
 * @jest-environment jsdom
 */
// CS-66: diseño de la página de ajustes (/paginas/cuenta/ajustes.html y js/cuenta/ajustes.js) en jsdom: datos, contraseña y
// «Cerrar sesión» en su propia página, y botones secundarios con estado de espera.
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('/paginas/cuenta/ajustes.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/password.js', 'js/shared/movimiento.js', 'js/cuenta/ajustes.js'];
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', ciudad: null, foto: null };

const CIUDADES = [{ id: 1, nombre: 'Madrid', pais: 'España' }, { id: 2, nombre: 'Lima', pais: 'Perú' }];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function abrir(rutas = {}) {
  const servidor = { 'GET /api/perfil': [200, PERFIL], 'GET /api/ciudades': [200, CIUDADES], ...rutas };
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    return respuesta(...(servidor[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }]));
  });
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

test('al cargar rellena el formulario con los datos del perfil', async () => {
  await abrir({ 'GET /api/perfil': [200, { ...PERFIL, ciudad: 'Madrid' }] });

  expect($('#nombreUsuario').value).toBe('ana');
  expect($('#email').value).toBe('ana@ejemplo.com');
  expect($('#ciudad').value).toBe('Madrid');
});

test('los ajustes se reparten en pestañas: perfil y contraseña, y solo se ve la elegida', async () => {
  await abrir();

  const pestanas = [...document.querySelectorAll('#pestanas-ajustes [role="tab"]')];
  expect(pestanas.map((p) => p.textContent)).toEqual(['Perfil', 'Contraseña']);
  expect($('#panel-datos').hidden).toBe(false);
  expect($('#panel-password').hidden).toBe(true);

  pestanas[1].click();

  expect($('#panel-password').hidden).toBe(false);
  expect($('#panel-datos').hidden).toBe(true);
  expect($('#panel-password').querySelector('#form-password')).not.toBeNull();
  // Cerrar sesión vive en el menú de la cuenta, no en una pestaña propia
  expect($('#panel-sesion')).toBeNull();
  expect(document.querySelector('.menu-cuenta [data-cerrar-sesion]')).not.toBeNull();
});

describe('botones de ajustes', () => {
  test('ajustes no tiene ningún botón principal', async () => {
    await abrir();

    expect(document.querySelector('.btn-primary')).toBeNull();
  });

  test('tiene los datos y la contraseña, sin nada plegado y sin «Cerrar sesión» (está en el menú)', async () => {
    await abrir();

    expect($('main details')).toBeNull();
    expect($('main #form-perfil')).not.toBeNull();
    expect($('main #form-password')).not.toBeNull();
    expect($('main [data-cerrar-sesion]')).toBeNull();
  });

  test('el perfil no tiene botón de guardar: se guarda solo', async () => {
    await abrir();

    // El único botón es «Cambiar nombre», que aparece al editar el nombre de usuario
    expect([...document.querySelectorAll('#form-perfil button')].map((b) => b.id)).toEqual(['cambiar-nombre']);
    expect($('#form-perfil [type="submit"]')).toBeNull();
    expect($('#estado-guardado').getAttribute('role')).toBe('status');
  });

  test('al cambiar la ciudad se guarda sola, con el nombre que ya había', async () => {
    await abrir({ 'PUT /api/perfil': [200, { ...PERFIL, ciudad: 'Leon' }] });
    $('#ciudad').value = 'Leon';

    $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    const [[, opciones]] = window.fetch.mock.calls.filter(([r, o]) => r === '/api/perfil' && o?.method === 'PUT');
    expect(JSON.parse(opciones.body)).toEqual({ nombreUsuario: 'ana', ciudad: 'Leon' });
    expect($('#estado-guardado').textContent).toBe('Guardado');
  });

  test('P1: la ciudad propone las del catálogo, pero sigue siendo texto libre', async () => {
    await abrir();

    expect($('#ciudad').getAttribute('list')).toBe('lista-ciudades');
    expect([...document.querySelectorAll('#lista-ciudades option')].map((o) => o.value)).toEqual(['Madrid', 'Lima']);
  });

  test('P1: si el catálogo no carga, la ciudad se puede escribir igualmente', async () => {
    await abrir({ 'GET /api/ciudades': [500, { error: 'fallo' }] });

    expect(document.querySelectorAll('#lista-ciudades option')).toHaveLength(0);
    expect($('#ciudad').disabled).toBe(false);
  });

  describe('P2: el nombre de usuario se cambia con confirmación', () => {
    test('escribirlo no lo guarda: aparece «Cambiar nombre» y se avisa de que es la dirección del perfil', async () => {
      await abrir();
      expect($('#cambiar-nombre').hidden).toBe(true);

      $('#nombreUsuario').value = 'ana2';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));
      $('#nombreUsuario').dispatchEvent(new Event('change', { bubbles: true }));
      await terminar();

      expect(window.fetch.mock.calls.filter(([, o]) => o?.method === 'PUT')).toHaveLength(0);
      expect($('#cambiar-nombre').hidden).toBe(false);
      expect($('#ayuda-nombre').textContent).toMatch(/dirección de tu perfil/);
    });

    test('«Cambiar nombre» lo envía junto con la ciudad y oculta el botón', async () => {
      await abrir({ 'PUT /api/perfil': [200, { ...PERFIL, nombreUsuario: 'ana2' }] });
      $('#nombreUsuario').value = 'ana2';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));

      $('#cambiar-nombre').click();
      await terminar();

      const [[, opciones]] = window.fetch.mock.calls.filter(([r, o]) => r === '/api/perfil' && o?.method === 'PUT');
      expect(JSON.parse(opciones.body)).toEqual({ nombreUsuario: 'ana2', ciudad: '' });
      expect($('#nombreUsuario').value).toBe('ana2');
      expect($('#cambiar-nombre').hidden).toBe(true);
      expect($('#estado-guardado').textContent).toBe('Guardado');
    });

    test('guardar la ciudad no envía un nombre a medio escribir', async () => {
      await abrir({ 'PUT /api/perfil': [200, { ...PERFIL, ciudad: 'Leon' }] });
      $('#nombreUsuario').value = 'ana2';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));
      $('#ciudad').value = 'Leon';

      $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
      await terminar();

      const [[, opciones]] = window.fetch.mock.calls.filter(([r, o]) => r === '/api/perfil' && o?.method === 'PUT');
      expect(JSON.parse(opciones.body)).toEqual({ nombreUsuario: 'ana', ciudad: 'Leon' });
      expect($('#nombreUsuario').value).toBe('ana2');
    });

    test('si el servidor rechaza el nombre se muestra su error y el botón sigue a la vista', async () => {
      await abrir({ 'PUT /api/perfil': [400, { error: 'Ese nombre de usuario ya existe' }] });
      $('#nombreUsuario').value = 'luis';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));

      $('#cambiar-nombre').click();
      await terminar();

      expect($('#error-perfil').textContent).toBe('Ese nombre de usuario ya existe');
      expect($('#cambiar-nombre').hidden).toBe(false);
    });

    test('volver al nombre actual oculta el botón', async () => {
      await abrir();
      $('#nombreUsuario').value = 'ana2';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));
      $('#nombreUsuario').value = 'ana';
      $('#nombreUsuario').dispatchEvent(new Event('input', { bubbles: true }));

      expect($('#cambiar-nombre').hidden).toBe(true);
    });
  });

  test('P3: el email explica por qué no se puede editar', async () => {
    await abrir();

    expect($('#email').disabled).toBe(true);
    expect($('#email').getAttribute('aria-describedby')).toBe('ayuda-email');
    expect($('#ayuda-email').textContent).toMatch(/no se puede cambiar/i);
  });

  test('P4: el panel de contraseña avisa de que no cierra otras sesiones, sin prometer lo contrario', async () => {
    await abrir();

    const aviso = $('#aviso-password').textContent;
    expect(aviso).toMatch(/seguirás con la sesión iniciada en este y otros dispositivos/i);
    expect($('#panel-password').contains($('#aviso-password'))).toBe(true);
  });

  describe('P5: las animaciones se controlan desde Ajustes', () => {
    beforeEach(() => localStorage.clear());

    test('hay un interruptor «Pausar las animaciones del fondo» en la pestaña Perfil', async () => {
      await abrir();

      const interruptor = $('#panel-datos #pausar-animaciones');
      expect(interruptor.type).toBe('checkbox');
      expect(document.querySelector('label[for="pausar-animaciones"]').textContent).toMatch(/pausar las animaciones/i);
    });

    test('marcarlo pausa y recuerda; desmarcarlo las mantiene', async () => {
      await abrir();
      const interruptor = $('#pausar-animaciones');

      interruptor.checked = true;
      interruptor.dispatchEvent(new Event('change', { bubbles: true }));
      expect(document.documentElement.dataset.movimiento).toBe('pausado');
      expect(localStorage.getItem('movimiento')).toBe('pausado');

      interruptor.checked = false;
      interruptor.dispatchEvent(new Event('change', { bubbles: true }));
      expect(document.documentElement.hasAttribute('data-movimiento')).toBe(false);
      expect(localStorage.getItem('movimiento')).toBe('activo');
    });

    test('al abrir refleja la elección guardada', async () => {
      localStorage.setItem('movimiento', 'pausado');
      await abrir();

      expect($('#pausar-animaciones').checked).toBe(true);
    });
  });

  test('mientras guarda el estado dice «Guardando…»', async () => {
    await abrir({ 'PUT /api/perfil': [200, PERFIL] });
    window.fetch.mockImplementationOnce(() => new Promise(() => {}));

    $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect($('#estado-guardado').textContent).toBe('Guardando…');
  });

  test('si el servidor rechaza el cambio se muestra su error y no «Guardado»', async () => {
    await abrir({ 'PUT /api/perfil': [400, { error: 'Ese nombre de usuario ya existe' }] });

    $('#ciudad').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect($('#error-perfil').classList.contains('d-none')).toBe(false);
    expect($('#error-perfil').textContent).toBe('Ese nombre de usuario ya existe');
    expect($('#estado-guardado').textContent).toBe('');
  });

  test('con el nombre de usuario vacío no se envía', async () => {
    await abrir();
    $('#nombreUsuario').value = '';

    $('#nombreUsuario').dispatchEvent(new Event('change', { bubbles: true }));
    await terminar();

    expect(window.fetch.mock.calls.filter(([, o]) => o?.method === 'PUT')).toHaveLength(0);
  });

  test('la foto es un avatar grande que se pulsa para cambiarla (sin selector de archivo a la vista)', async () => {
    await abrir();

    const etiqueta = $('label.foto-editable[for="foto"]');
    expect(etiqueta).not.toBeNull();
    expect(etiqueta.querySelector('#foto-perfil')).not.toBeNull();
    expect(etiqueta.querySelector('svg.foto-editable-icono')).not.toBeNull();
    expect($('#foto').classList.contains('visually-hidden')).toBe(true);
    expect($('#foto').classList.contains('form-control')).toBe(false);
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
