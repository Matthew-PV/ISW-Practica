/**
 * @jest-environment jsdom
 */
// Página de una experiencia (frontend/experiencias/experiencia.html y js/experiencia.js): criterio de CS-63
// (valoraciones y comentarios), sección de CS-48 (amigos y seguidores) y objetivo 9 de CS-30
// («Contenido no disponible» sin datos). Navegador simulado con jsdom y servidor simulado con un
// fetch que responde según el método y la ruta.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('/experiencias/experiencia.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/experiencia.js'];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const visible = (selector) => !$(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const YO = { id: 1, nombreUsuario: 'ana' };
const BEA = { id: 2, nombreUsuario: 'bea', foto: null };
const CARLOS = { id: 3, nombreUsuario: 'carlos', foto: null };
const LUIS = { id: 4, nombreUsuario: 'luis', foto: null };
const EXPERIENCIA = {
  id: 7, titulo: 'Ruta de tapas', descripcion: 'Por el centro', autorId: 2, autor: BEA,
  ciudad: { nombre: 'Sevilla' }, visibilidad: 'PUBLICA',
};
const valoracion = (id, usuario, extra = {}) => ({
  id, puntuacion: 4, comentario: `Comentario ${id}`, creadaEn: '2026-10-08T10:00:00.000Z',
  usuarioId: usuario.id, usuario, ...extra,
});
const pagina = (valoraciones, siguiente = null) => ({ valoraciones, siguiente });
const RESUMEN_VACIO = { media: null, total: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, comentarios: 0 };

const BASE = '/api/experiencias/7';
const SERVIDOR = {
  [`GET ${BASE}`]: [200, EXPERIENCIA],
  'GET /api/auth/yo': [200, YO],
  [`GET ${BASE}/valoracion`]: [200, null],
  [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, CARLOS), valoracion(29, LUIS)])],
  [`GET ${BASE}/valoraciones/amigos`]: [200, pagina([])],
  [`GET ${BASE}/resumen`]: [200, RESUMEN_VACIO],
};

// Abre /experiencias/experiencia.html?id=7 con el servidor simulado; `rutas` cambia o añade respuestas.
// Una respuesta puede ser [status, cuerpo] o una función que la devuelve (para simular la red).
async function abrir(rutas = {}) {
  const servidor = { ...SERVIDOR, ...rutas };
  window.history.pushState({}, '', '/experiencias/experiencia.html?id=7');
  document.documentElement.innerHTML = HTML;
  // jsdom no implementa del todo <dialog>
  const dialogo = document.getElementById('dialogo-reporte');
  dialogo.showModal = jest.fn();
  dialogo.close = jest.fn();
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    const definida = servidor[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }];
    if (typeof definida === 'function') return definida();
    return respuesta(...definida);
  });
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
}

const peticiones = (metodo, ruta) => window.fetch.mock.calls
  .filter(([r, opciones = {}]) => r === ruta && (opciones.method ?? 'GET') === metodo);
const enviarValoracion = async () => {
  $('#form-valoracion').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();
  await terminar();
};

describe('CS-63: la experiencia y sus valoraciones', () => {
  test('muestra el título, el autor enlazado a su perfil, la ciudad y la descripción', async () => {
    await abrir();

    expect($('#detalle-titulo').textContent).toBe('Ruta de tapas');
    expect($('#detalle-autor').textContent).toBe('bea');
    expect($('#detalle-autor').getAttribute('href')).toBe('/social/usuario.html?nombre=bea');
    expect($('#detalle-ciudad').textContent).toBe('Sevilla');
    expect($('#detalle-descripcion').textContent).toBe('Por el centro');
  });

  test('la cabecera lleva el bloque de color de su categoría', async () => {
    await abrir({ [`GET ${BASE}`]: [200, { ...EXPERIENCIA, tipo: 'Museo' }] });

    expect($('#detalle-categoria .bloque-categoria').dataset.categoria).toBe('cultura');
  });

  test('cada valoración muestra su autor enlazado a su perfil, la puntuación, el texto y la fecha', async () => {
    await abrir();

    const tarjeta = $('#lista-comentarios [data-valoracion-id="30"]');
    expect(tarjeta.querySelector('a').textContent).toBe('carlos');
    expect(tarjeta.querySelector('a').getAttribute('href')).toBe('/social/usuario.html?nombre=carlos');
    const estrellas = tarjeta.querySelector('.estrellas');
    expect(estrellas.getAttribute('role')).toBe('img');
    expect(estrellas.getAttribute('aria-label')).toBe('4 de 5');
    expect(estrellas.querySelectorAll('.estrella')).toHaveLength(5);
    expect(estrellas.querySelectorAll('.estrella.on')).toHaveLength(4);
    expect(tarjeta.textContent).not.toContain('/5');
    expect(tarjeta.textContent).toContain('Comentario 30');
    expect(tarjeta.textContent).toContain('8/10/2026');
  });

  test('«Cargar más» añade las siguientes sin repetir ninguna', async () => {
    await abrir({
      [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, CARLOS), valoracion(29, LUIS)], 29)],
      [`GET ${BASE}/valoraciones?despuesDe=29`]: [200, pagina([valoracion(29, LUIS), valoracion(12, BEA)])],
    });
    expect(visible('#btn-cargar-mas')).toBe(true);

    $('#btn-cargar-mas').click();
    await terminar();

    expect($$('#lista-comentarios [data-valoracion-id]').map((t) => t.dataset.valoracionId)).toEqual(['30', '29', '12']);
    expect(visible('#btn-cargar-mas')).toBe(false);
  });

  test('sin valoraciones se indica «Todavía no hay valoraciones»', async () => {
    await abrir({ [`GET ${BASE}/valoraciones`]: [200, pagina([])] });

    expect(visible('#sin-comentarios')).toBe(true);
    expect($('#sin-comentarios').textContent).toBe('Todavía no hay valoraciones');
  });

  test('un comentario con HTML se muestra como texto', async () => {
    await abrir({
      [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, CARLOS, { comentario: '<img src=x onerror=alert(1)>' })])],
    });

    expect($('#lista-comentarios img')).toBeNull();
    expect($('#lista-comentarios').textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('CS-63: el formulario de valoración', () => {
  test.each(['', '0', '6', '4.5'])('con la puntuación %p no se envía', async (valor) => {
    await abrir();
    $('#val-puntuacion').value = valor;

    await enviarValoracion();

    expect(peticiones('PUT', `${BASE}/valoracion`)).toHaveLength(0);
  });

  test('la puntuación se elige con cinco estrellas, no con un campo numérico', async () => {
    await abrir();

    const grupo = $('#form-valoracion [role="radiogroup"]');
    const estrellas = [...grupo.querySelectorAll('button[role="radio"]')];
    expect(estrellas).toHaveLength(5);
    expect(estrellas.map((e) => e.getAttribute('aria-label'))).toEqual(
      ['1 estrella', '2 estrellas', '3 estrellas', '4 estrellas', '5 estrellas']
    );
    expect($('#val-puntuacion').type).not.toBe('number');
    expect(estrellas.every((e) => e.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  test('pulsar una estrella rellena hasta ella y fija la puntuación', async () => {
    await abrir();
    const estrellas = [...document.querySelectorAll('#form-valoracion [role="radio"]')];

    estrellas[3].click();

    expect($('#val-puntuacion').value).toBe('4');
    expect(estrellas.map((e) => e.classList.contains('on'))).toEqual([true, true, true, true, false]);
    expect(estrellas.map((e) => e.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false', 'true', 'false']);
  });

  describe('estrellas con teclado (grupo de radio)', () => {
    const tecla = (estrella, key) => estrella.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    const tabindex = (estrellas) => estrellas.map((e) => e.getAttribute('tabindex'));
    const estrellasDe = () => [...document.querySelectorAll('#form-valoracion [role="radio"]')];

    test('sin puntuación solo la primera estrella entra en el orden de Tab', async () => {
      await abrir();

      expect(tabindex(estrellasDe())).toEqual(['0', '-1', '-1', '-1', '-1']);
    });

    test('con puntuación solo la elegida entra en el orden de Tab', async () => {
      await abrir();
      const estrellas = estrellasDe();

      estrellas[2].click();

      expect(tabindex(estrellas)).toEqual(['-1', '-1', '0', '-1', '-1']);
    });

    test('las flechas eligen la estrella siguiente o anterior y llevan el foco a ella', async () => {
      await abrir();
      const estrellas = estrellasDe();
      estrellas[1].click();

      tecla(estrellas[1], 'ArrowRight');
      expect($('#val-puntuacion').value).toBe('3');
      expect(document.activeElement).toBe(estrellas[2]);

      tecla(estrellas[2], 'ArrowLeft');
      tecla(estrellas[1], 'ArrowUp');
      expect($('#val-puntuacion').value).toBe('1');
      tecla(estrellas[0], 'ArrowDown');
      expect($('#val-puntuacion').value).toBe('2');
    });

    test('las flechas dan la vuelta entre la primera y la última', async () => {
      await abrir();
      const estrellas = estrellasDe();

      tecla(estrellas[0], 'ArrowLeft');
      expect($('#val-puntuacion').value).toBe('5');

      tecla(estrellas[4], 'ArrowRight');
      expect($('#val-puntuacion').value).toBe('1');
    });
  });

  test('la valoración propia ya guardada se ve en las estrellas', async () => {
    await abrir({ [`GET ${BASE}/valoracion`]: [200, { id: 50, puntuacion: 2, comentario: null }] });

    expect(document.querySelectorAll('#form-valoracion [role="radio"].on')).toHaveLength(2);
  });

  test('sin estrellas elegidas no se envía y se pide una puntuación', async () => {
    await abrir();

    await enviarValoracion();

    expect(peticiones('PUT', `${BASE}/valoracion`)).toHaveLength(0);
    expect(visible('#error-valoracion')).toBe(true);
    expect($('#error-valoracion').textContent).toBe('Elige una puntuación de 1 a 5 estrellas.');
  });

  test('con una estrella elegida se envía esa puntuación', async () => {
    await abrir({ [`PUT ${BASE}/valoracion`]: [200, { id: 1, puntuacion: 5 }] });
    document.querySelectorAll('#form-valoracion [role="radio"]')[4].click();

    await enviarValoracion();

    const [[, opciones]] = peticiones('PUT', `${BASE}/valoracion`);
    expect(JSON.parse(opciones.body)).toEqual({ puntuacion: 5 });
  });

  test('el contador muestra «n / 1000» y avisa al acercarse al límite', async () => {
    await abrir();
    expect($('#val-comentario').getAttribute('maxlength')).toBe('1000');

    $('#val-comentario').value = 'a'.repeat(985);
    $('#val-comentario').dispatchEvent(new Event('input'));

    expect($('#contador-caracteres').textContent).toBe('985 / 1000');
    expect($('#contador-caracteres').classList.contains('text-danger')).toBe(true);
  });

  test('si ya la había valorado aparece mi valoración y al guardar se actualiza esa misma', async () => {
    await abrir({
      [`GET ${BASE}/valoracion`]: [200, { id: 50, puntuacion: 3, comentario: 'Estuvo bien' }],
      [`PUT ${BASE}/valoracion`]: [200, { id: 50, puntuacion: 5, comentario: 'Mejor de lo que dije' }],
    });
    expect($('#val-puntuacion').value).toBe('3');
    expect($('#val-comentario').value).toBe('Estuvo bien');
    expect($('#btn-guardar-valoracion').textContent).toBe('Actualizar valoración');

    $('#val-puntuacion').value = '5';
    $('#val-comentario').value = 'Mejor de lo que dije';
    await enviarValoracion();

    const [[, opciones]] = peticiones('PUT', `${BASE}/valoracion`);
    expect(JSON.parse(opciones.body)).toEqual({ puntuacion: 5, comentario: 'Mejor de lo que dije' });
    // La lista se vuelve a pedir para mostrar el cambio
    expect(peticiones('GET', `${BASE}/valoraciones`).length).toBeGreaterThan(1);
  });

  test('si falla la red al guardar se muestra un error y no se pierde lo escrito', async () => {
    await abrir({ [`PUT ${BASE}/valoracion`]: () => Promise.reject(new TypeError('Failed to fetch')) });
    $('#val-puntuacion').value = '4';
    $('#val-comentario').value = 'Texto que no quiero perder';

    await enviarValoracion();

    expect(visible('#error-valoracion')).toBe(true);
    expect($('#error-valoracion').textContent).toBe('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
    expect($('#val-comentario').value).toBe('Texto que no quiero perder');
    expect($('#val-puntuacion').value).toBe('4');
  });

  test('el autor de la experiencia no ve el formulario', async () => {
    await abrir({ 'GET /api/auth/yo': [200, { id: 2, nombreUsuario: 'bea' }] });

    expect(visible('#caja-formulario-valoracion')).toBe(false);
  });

  test('el autor ve «Editar plan», que abre el formulario de Mis planes; los demás no', async () => {
    await abrir({ 'GET /api/auth/yo': [200, { id: 2, nombreUsuario: 'bea' }] });
    expect(visible('#caja-editar')).toBe(true);
    expect($('#boton-editar').getAttribute('href')).toBe('/cuenta/mis-planes.html?editar=7');

    await abrir();
    expect(visible('#caja-editar')).toBe(false);
  });
});

describe('CS-63: «Útil» y «Reportar» (solo en la pantalla hasta CS-02 y CS-04)', () => {
  const botonUtil = (id) => [...$(`[data-valoracion-id="${id}"]`).querySelectorAll('button')].find((b) => b.textContent.includes('Útil'));

  test('«Útil» se marca y se desmarca en un comentario ajeno y el contador cambia en uno', async () => {
    await abrir({ [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, CARLOS, { utiles: 2 })])] });

    botonUtil(30).click();
    await terminar();
    expect(botonUtil(30).textContent).toContain('3');

    botonUtil(30).click();
    await terminar();
    expect(botonUtil(30).textContent).toContain('2');
  });

  test('«Útil» está desactivado en mi propio comentario', async () => {
    await abrir({ [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, YO)])] });

    expect(botonUtil(30).disabled).toBe(true);
  });

  test.each([
    [false, 'Comentario reportado correctamente. Gracias por avisarnos.'],
    [true, 'Ya habías reportado este comentario anteriormente.'],
  ])('al reportar (ya reportado: %p) se elige un motivo y se ve «%s»', async (yaReportado, mensaje) => {
    await abrir({ [`GET ${BASE}/valoraciones`]: [200, pagina([valoracion(30, CARLOS, { yaReportado })])] });

    [...$('[data-valoracion-id="30"]').querySelectorAll('button')].find((b) => b.textContent.includes('Reportar')).click();
    $('#motivoSpam').checked = true;
    $('#form-reporte').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await esperar(600);

    expect($('#mensaje-reporte').textContent).toBe(mensaje);
  });
});

describe('CS-48: valoraciones de amigos y seguidores', () => {
  test('aparecen en su propia sección, con «Cargar más» sin repetir', async () => {
    await abrir({
      [`GET ${BASE}/valoraciones/amigos`]: [200, pagina([valoracion(30, CARLOS)], 30)],
      [`GET ${BASE}/valoraciones/amigos?despuesDe=30`]: [200, pagina([valoracion(29, LUIS)])],
    });
    expect($('#lista-valoraciones-amigos').textContent).toContain('carlos');

    $('#btn-mas-amigos').click();
    await terminar();

    expect($$('#lista-valoraciones-amigos [data-valoracion-id]').map((t) => t.dataset.valoracionId)).toEqual(['30', '29']);
    expect(visible('#btn-mas-amigos')).toBe(false);
  });

  test('si ningún amigo ni seguidor la ha valorado se indica, sin error', async () => {
    await abrir();

    expect(visible('#sin-valoraciones-amigos')).toBe(true);
  });
});

describe('CS-30 (objetivo 9): «Contenido no disponible»', () => {
  test('si no puedo ver la experiencia, solo aparece «Contenido no disponible», sin ningún dato', async () => {
    await abrir({ [`GET ${BASE}`]: [404, { error: 'Contenido no disponible' }] });

    expect($('#mensaje-estado').textContent).toBe('Contenido no disponible');
    expect(visible('#contenido-experiencia')).toBe(false);
    expect($('#detalle-titulo').textContent).toBe('');
    expect($('#lista-comentarios').children).toHaveLength(0);
  });

  test('si deja de estar disponible mientras la veo, se borra lo que se mostraba', async () => {
    await abrir({ [`PUT ${BASE}/valoracion`]: [404, { error: 'Contenido no disponible' }] });
    $('#val-puntuacion').value = '4';

    await enviarValoracion();

    expect($('#mensaje-estado').textContent).toBe('Contenido no disponible');
    expect($('#detalle-titulo').textContent).toBe('');
    expect($('#detalle-descripcion').textContent).toBe('');
    expect($('#lista-comentarios').children).toHaveLength(0);
    expect(visible('#contenido-experiencia')).toBe(false);
  });
});

describe('T4.3: pestañas y estado de «Publicar valoración»', () => {
  test('«De amigos y seguidores» está activa al cargar y «Todas» la sustituye al pulsarla', async () => {
    await abrir({ [`GET ${BASE}/valoraciones/amigos`]: [200, pagina([valoracion(30, CARLOS)])] });
    const [amigos, todas] = $$('[role="tablist"] [role="tab"]');
    expect(amigos.textContent.trim()).toBe('De amigos y seguidores');
    expect(todas.textContent.trim()).toBe('Todas');
    const panelAmigos = document.getElementById(amigos.getAttribute('aria-controls'));
    const panelTodas = document.getElementById(todas.getAttribute('aria-controls'));
    expect(amigos.getAttribute('aria-selected')).toBe('true');
    expect(panelAmigos.hidden).toBe(false);
    expect(panelTodas.hidden).toBe(true);
    expect(panelAmigos.contains($('#lista-valoraciones-amigos'))).toBe(true);
    expect(panelTodas.contains($('#lista-comentarios'))).toBe(true);

    todas.click();

    expect(todas.getAttribute('aria-selected')).toBe('true');
    expect(amigos.getAttribute('aria-selected')).toBe('false');
    expect(panelTodas.hidden).toBe(false);
    expect(panelAmigos.hidden).toBe(true);
  });

  test('«Publicar valoración» pasa a «Guardando…», desactivado, mientras espera y se restaura al resolver', async () => {
    let resolver;
    await abrir({ [`PUT ${BASE}/valoracion`]: () => new Promise((r) => { resolver = r; }) });
    const boton = $('#btn-guardar-valoracion');
    expect(boton.textContent).toBe('Publicar valoración');
    $('#val-puntuacion').value = '4';
    $('#form-valoracion').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await terminar();
    expect(boton.textContent).toBe('Guardando…');
    expect(boton.disabled).toBe(true);
    expect(boton.getAttribute('aria-busy')).toBe('true');

    resolver(await respuesta(200, { id: 1, puntuacion: 4 }));
    await terminar();
    await terminar();
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
    expect(boton.textContent).not.toBe('Guardando…');
  });

  test('«Publicar valoración» se restaura si la petición falla', async () => {
    await abrir({ [`PUT ${BASE}/valoracion`]: [400, { error: 'Datos no válidos' }] });
    $('#val-puntuacion').value = '4';
    await enviarValoracion();
    const boton = $('#btn-guardar-valoracion');
    expect(boton.textContent).toBe('Publicar valoración');
    expect(boton.disabled).toBe(false);
    expect(boton.hasAttribute('aria-busy')).toBe(false);
  });
});

describe('Detalle del plan (D1-D6): CS-14, CS-02, CS-32', () => {
  const CON_DATOS = { ...EXPERIENCIA, tipo: 'Gastronomía', momentoAdecuado: 'Por la noche' };
  const RESUMEN = { media: 4.3, total: 3, distribucion: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 }, comentarios: 2 };
  const antes = (a, b) => Boolean($(a).compareDocumentPosition($(b)) & Node.DOCUMENT_POSITION_FOLLOWING);

  test('D1 y D5: la ficha lateral reúne autor, ciudad, categoría, momento, visibilidad y «Editar plan»', async () => {
    await abrir({ [`GET ${BASE}`]: [200, CON_DATOS], 'GET /api/auth/yo': [200, { id: 2, nombreUsuario: 'bea' }] });

    const ficha = $('aside.ficha-experiencia');
    expect($('#detalle-tipo').textContent).toBe('Gastronomía');
    expect($('#detalle-momento').textContent).toBe('Por la noche');
    for (const id of ['#detalle-autor', '#detalle-ciudad', '#detalle-tipo', '#detalle-momento', '#detalle-visibilidad', '#caja-editar']) {
      expect(ficha.contains($(id))).toBe(true);
    }
  });

  test('D1: sin momento indicado no aparece esa fila', async () => {
    await abrir({ [`GET ${BASE}`]: [200, { ...CON_DATOS, momentoAdecuado: null }] });

    expect($('#fila-momento').hidden).toBe(true);
  });

  test('D2: el resumen muestra la media, el total, la distribución por estrellas y los comentarios', async () => {
    await abrir({ [`GET ${BASE}/resumen`]: [200, RESUMEN] });

    expect($('#resumen-media').textContent).toBe('4,3');
    expect($('#resumen-estrellas .estrellas').getAttribute('aria-label')).toBe('4,3 de 5');
    expect($('#resumen-total').textContent).toBe('3 valoraciones');
    expect($('#resumen-comentarios').textContent).toBe('2 comentarios');
    const filas = $$('#resumen-distribucion [data-estrellas]');
    expect(filas.map((f) => f.dataset.estrellas)).toEqual(['5', '4', '3', '2', '1']);
    expect(filas[0].textContent).toContain('2');
  });

  test('D2: con una sola valoración el texto va en singular', async () => {
    await abrir({ [`GET ${BASE}/resumen`]: [200, { media: 5, total: 1, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }, comentarios: 1 }] });

    expect($('#resumen-total').textContent).toBe('1 valoración');
    expect($('#resumen-comentarios').textContent).toBe('1 comentario');
  });

  test('D2: sin valoraciones el resumen lo dice y no enseña media', async () => {
    await abrir();

    expect($('#resumen-valoraciones').textContent).toContain('Todavía sin valoraciones');
    expect($('#resumen-media').textContent).toBe('');
  });

  test('D2: si el resumen no llega, el resto de la página se ve igual', async () => {
    await abrir({ [`GET ${BASE}/resumen`]: () => Promise.reject(new TypeError('Failed to fetch')) });

    expect($('#detalle-titulo').textContent).toBe('Ruta de tapas');
    expect($('#resumen-valoraciones').hidden).toBe(true);
  });

  test('D4: primero el resumen, luego las valoraciones y al final el formulario, con «Publicar valoración»', async () => {
    await abrir();

    expect(antes('#resumen-valoraciones', '[role="tablist"]')).toBe(true);
    expect(antes('[role="tablist"]', '#caja-formulario-valoracion')).toBe(true);
    expect($('#btn-guardar-valoracion').textContent).toBe('Publicar valoración');
  });

  test('D6: «Tu valoración» aparece fija encima de las listas si ya había valorado', async () => {
    await abrir({ [`GET ${BASE}/valoracion`]: [200, { id: 50, puntuacion: 3, comentario: 'Estuvo bien', creadaEn: '2026-10-08T10:00:00.000Z' }] });

    expect($('#mi-valoracion').hidden).toBe(false);
    expect($('#mi-valoracion .estrellas').getAttribute('aria-label')).toBe('3 de 5');
    expect($('#mi-valoracion').textContent).toContain('Estuvo bien');
    expect(antes('#mi-valoracion', '[role="tablist"]')).toBe(true);
  });

  test('D6: sin valoración propia no aparece «Tu valoración»', async () => {
    await abrir();

    expect($('#mi-valoracion').hidden).toBe(true);
  });

  test('D6: al publicar se ven al momento mi valoración y la cifra nueva del resumen', async () => {
    const resumenes = [RESUMEN_VACIO, { media: 5, total: 1, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 }, comentarios: 1 }];
    await abrir({
      [`GET ${BASE}/resumen`]: () => respuesta(200, resumenes.shift() ?? RESUMEN_VACIO),
      [`PUT ${BASE}/valoracion`]: [201, { id: 60, puntuacion: 5, comentario: 'Genial', creadaEn: '2026-10-29T10:00:00.000Z' }],
    });
    $$('#form-valoracion [role="radio"]')[4].click();
    $('#val-comentario').value = 'Genial';

    await enviarValoracion();
    await terminar();

    expect($('#mi-valoracion').hidden).toBe(false);
    expect($('#mi-valoracion .estrellas').getAttribute('aria-label')).toBe('5 de 5');
    expect($('#mi-valoracion').textContent).toContain('Genial');
    expect($('#resumen-media').textContent).toBe('5');
    expect($('#resumen-total').textContent).toBe('1 valoración');
    expect($('#btn-guardar-valoracion').textContent).toBe('Actualizar valoración');
  });

  test('D6: si no hay valoraciones de amigos pero sí otras, se abre «Todas»', async () => {
    await abrir();

    expect($('#pestana-todas').getAttribute('aria-selected')).toBe('true');
    expect($('#panel-todas').hidden).toBe(false);
  });

  describe('D3: «Volver» lleva a la pantalla de origen', () => {
    const conReferente = (url) => Object.defineProperty(document, 'referrer', { value: url, configurable: true });
    afterEach(() => conReferente(''));

    test('si se llegó desde otra pantalla de PlanB, vuelve a ella con su búsqueda', async () => {
      conReferente(`${window.location.origin}/social/personas.html?q=tapas`);
      await abrir();

      expect($('#enlace-volver').getAttribute('href')).toBe('/social/personas.html?q=tapas');
    });

    test.each(['', 'https://otro-sitio.example/pagina'])('sin origen de PlanB (%p) vuelve a Inicio', async (url) => {
      conReferente(url);
      await abrir();

      expect($('#enlace-volver').getAttribute('href')).toBe('/cuenta/bienvenida.html');
    });
  });
});
