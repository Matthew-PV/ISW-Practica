/**
 * @jest-environment jsdom
 */

// CS-73: mapa de los lugares de un plan, en su detalle y en el formulario.
// jsdom no pinta mapas: Leaflet (`L`) se sustituye por un doble que anota lo que se le pide.

const { leer, cargarScripts } = require('../helpers/pantalla');

const COMUNES = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/lugares.js', 'js/shared/mapa.js'];

const lugar = (clave, nombre, lat) => ({
  proveedorId: clave, nombre, tipo: 'Plaza', direccion: nombre, lat, lon: -3.7, imagen: null, web: null,
});
const MAYOR = lugar('m', 'Plaza Mayor', 40.41);
const SOL = lugar('s', 'Puerta del <b>', 40.42);

const CIUDAD = { id: 3, nombre: 'Madrid', pais: 'España' };
const PLAN = {
  id: 7, titulo: 'Paseo', descripcion: 'Andando', autorId: 2, autor: { id: 2, nombreUsuario: 'bea' },
  ciudadId: 3, ciudad: CIUDAD, visibilidad: 'PUBLICA',
};

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = async () => {
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};
const boton = (raiz, texto) => [...raiz.querySelectorAll('button')].find((b) => b.textContent === texto);

// Doble de Leaflet: `marcadores` son los que hay ahora mismo en el mapa
function dobleLeaflet() {
  const doble = { marcadores: [], teselas: null, mapa: null };
  doble.L = {
    map: jest.fn(() => {
      doble.mapa = { setView: jest.fn(), fitBounds: jest.fn(), invalidateSize: jest.fn() };
      return doble.mapa;
    }),
    tileLayer: jest.fn((url, opciones) => {
      const eventos = {};
      doble.teselas = { url, opciones, eventos, on: (nombre, f) => { eventos[nombre] = f; }, addTo: jest.fn() };
      return doble.teselas;
    }),
    layerGroup: jest.fn(() => ({
      addTo() { return this; },
      clearLayers: () => { doble.marcadores = []; },
    })),
    marker: jest.fn((posicion, opciones) => ({
      posicion,
      opciones,
      eventos: {},
      bindPopup(contenido) { this.globo = contenido; return this; },
      on(nombre, f) { this.eventos[nombre] = f; return this; },
      addTo() { doble.marcadores.push(this); return this; },
    })),
  };
  return doble;
}

const titulos = (doble) => doble.marcadores.map((m) => m.opciones.title);

async function abrirDetalle(lugares) {
  window.history.replaceState({}, '', '/paginas/experiencias/experiencia.html?id=7');
  document.documentElement.innerHTML = leer('paginas/experiencias/experiencia.html');
  window.fetch = jest.fn((ruta) => {
    if (ruta === '/api/experiencias/7') return respuesta(200, { ...PLAN, lugares });
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1, nombreUsuario: 'ana' });
    if (ruta.startsWith('/api/experiencias/7/valoraciones')) return respuesta(200, { valoraciones: [], siguiente: null });
    if (ruta === '/api/experiencias/7/valoracion') return respuesta(200, null);
    return respuesta(500, { error: 'no simulada' });
  });
  cargarScripts([...COMUNES, 'js/shared/pestanas.js', 'js/experiencias/experiencia.js']);
  await terminar();
}

async function abrirFormulario() {
  window.history.replaceState({}, '', '/paginas/cuenta/mis-planes.html');
  document.documentElement.innerHTML = leer('paginas/cuenta/mis-planes.html');
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn();
    dialogo.close = jest.fn();
  }
  window.fetch = jest.fn((ruta) => {
    if (ruta === '/datos/lugares-madrid.json') return respuesta(200, { ciudad: CIUDAD, lugares: [MAYOR, SOL] });
    if (ruta === '/api/perfil') return respuesta(200, { nombreUsuario: 'ana', ciudad: 'Madrid' });
    if (ruta === '/api/ciudades') return respuesta(200, [CIUDAD]);
    if (ruta === '/api/experiencias/opciones') return respuesta(200, { categorias: ['Cultura'], momentos: [] });
    return respuesta(200, { experiencias: [], siguiente: null });
  });
  cargarScripts([...COMUNES, 'js/shared/planes.js', 'js/cuenta/mis-planes.js']);
  await terminar();
  $('#boton-nueva').click();
}

async function buscar(texto) {
  $('#buscar-lugar').value = texto;
  $('#boton-buscar-lugar').click();
  await terminar();
}

let doble;
beforeEach(() => {
  doble = dobleLeaflet();
  window.L = doble.L;
});
afterEach(() => {
  delete window.L;
});

describe('CS-73: mapa en el detalle', () => {
  test('hay un marcador por lugar, en sus coordenadas, y el mapa los abarca', async () => {
    await abrirDetalle([MAYOR, SOL]);

    expect($('#mapa-lugares').hidden).toBe(false);
    expect(doble.marcadores.map((m) => m.posicion)).toEqual([[40.41, -3.7], [40.42, -3.7]]);
    expect(doble.mapa.fitBounds).toHaveBeenCalledWith([[40.41, -3.7], [40.42, -3.7]], expect.any(Object));
  });

  test('con un solo lugar se centra en él', async () => {
    await abrirDetalle([MAYOR]);

    expect(doble.mapa.setView).toHaveBeenCalledWith([40.41, -3.7], 16);
  });

  test('al pulsar un marcador se ve el nombre, escrito como texto', async () => {
    await abrirDetalle([SOL]);

    const [marcador] = doble.marcadores;
    expect(marcador.globo.textContent).toBe(SOL.nombre);
    expect(marcador.globo.querySelector('b')).toBeNull();
  });

  test('las teselas son de OpenStreetMap, con atribución y enviando solo el origen', async () => {
    await abrirDetalle([MAYOR]);

    expect(doble.teselas.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(doble.teselas.opciones.referrerPolicy).toBe('origin');
    expect(doble.teselas.opciones.attribution).toContain('OpenStreetMap');
  });
});

describe('CS-73: mapa en el formulario', () => {
  beforeEach(abrirFormulario);

  test('sin resultados ni elegidos no se muestra', () => {
    expect($('#mapa-lugares').hidden).toBe(true);
  });

  test('muestra los resultados de la búsqueda atenuados', async () => {
    await buscar('p');

    expect(titulos(doble)).toEqual([MAYOR.nombre, SOL.nombre]);
    expect(doble.marcadores.every((m) => m.opciones.opacity < 1)).toBe(true);
  });

  test('el lugar elegido sigue en el mapa, una sola vez, aunque cambie la búsqueda', async () => {
    await buscar('mayor');
    boton($('#resultados-lugares'), 'Añadir').click();
    expect(titulos(doble)).toEqual([MAYOR.nombre]);
    await buscar('sol');

    await buscar('puerta');
    expect(titulos(doble)).toEqual([MAYOR.nombre, SOL.nombre]);
    expect(doble.marcadores[0].opciones.opacity).toBe(1);
    boton($('#lugares-elegidos'), 'Quitar').click();
    expect(titulos(doble)).toEqual([SOL.nombre]);
  });

  test('pulsar un resultado en el mapa lo selecciona en la lista', async () => {
    await buscar('p');

    doble.marcadores[1].eventos.click();

    const fichas = [...document.querySelectorAll('#resultados-lugares .ficha-lugar')];
    expect(fichas.map((f) => f.classList.contains('ficha-lugar-seleccionada'))).toEqual([false, true]);
    expect(document.activeElement).toBe(boton(fichas[1], 'Añadir'));
  });

  test('el mapa se crea una sola vez', async () => {
    await buscar('p');
    await buscar('mayor');

    expect(doble.L.map).toHaveBeenCalledTimes(1);
  });
});

describe('CS-73: el mapa falla sin romper la página', () => {
  test('sin Leaflet avisa y la lista de lugares se ve igual', async () => {
    delete window.L;
    await abrirDetalle([MAYOR]);

    expect($('#mapa-lugares').textContent).toBe('El mapa no está disponible.');
    expect(document.querySelectorAll('#lista-lugares .ficha-lugar')).toHaveLength(1);
  });

  test('sin Leaflet se pueden buscar y añadir lugares', async () => {
    delete window.L;
    await abrirFormulario();
    await buscar('mayor');
    boton($('#resultados-lugares'), 'Añadir').click();

    expect(document.querySelectorAll('#lugares-elegidos .ficha-lugar')).toHaveLength(1);
  });

  test('si no llega el fondo del mapa lo avisa, y lo retira cuando llega', async () => {
    await abrirDetalle([MAYOR]);

    doble.teselas.eventos.tileerror();
    expect($('#mapa-lugares [role="status"]').textContent).toBe('No se ha podido cargar el fondo del mapa.');
    doble.teselas.eventos.tileload();
    expect($('#mapa-lugares [role="status"]').textContent).toBe('');
  });
});
