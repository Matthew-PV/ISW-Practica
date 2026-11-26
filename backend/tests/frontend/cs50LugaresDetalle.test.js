/**
 * @jest-environment jsdom
 */

// CS-50: fichas de los lugares de un plan en su página de detalle.
// Navegador simulado con jsdom; el servidor y los ficheros de datos, con fetch.

const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('paginas/experiencias/experiencia.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/pestanas.js', 'js/shared/lugares.js', 'js/shared/mapa.js', 'js/experiencias/experiencia.js'];

const EXPERIENCIA = {
  id: 7, titulo: 'Ruta de tapas', descripcion: 'Por el centro', autorId: 2,
  autor: { id: 2, nombreUsuario: 'bea', foto: null }, ciudad: { nombre: 'Madrid' }, visibilidad: 'PUBLICA',
};

const LUGARES = [
  { id: 1, nombre: 'Plaza Mayor', tipo: 'Plaza', direccion: 'Plaza Mayor', lat: 40.4, lon: -3.7, imagen: null, web: null, nota: 'Quedamos aquí' },
  { id: 2, nombre: 'Mercado <b>', tipo: 'Mercado', direccion: 'Plaza de San Miguel', lat: 40.4, lon: -3.7, imagen: null, web: 'https://mercadodesanmiguel.es', nota: '' },
];

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const fichas = () => [...document.querySelectorAll('#lista-lugares .ficha-lugar')];
const terminar = async () => {
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

async function abrir({ experiencia = EXPERIENCIA, fichero = [200, { 'Ruta de tapas': LUGARES }], estado = 200, lectura } = {}) {
  window.history.replaceState({}, '', '/paginas/experiencias/experiencia.html?id=7');
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn((ruta) => {
    if (ruta === '/datos/lugares-planes.json') return lectura ? lectura() : respuesta(...fichero);
    if (ruta === '/api/experiencias/7') return respuesta(estado, estado === 200 ? experiencia : { error: 'Contenido no disponible' });
    if (ruta === '/api/auth/yo') return respuesta(200, { id: 1, nombreUsuario: 'ana' });
    if (ruta.startsWith('/api/experiencias/7/valoraciones')) return respuesta(200, { valoraciones: [], siguiente: null });
    if (ruta === '/api/experiencias/7/valoracion') return respuesta(200, null);
    if (ruta === '/api/experiencias/7/resumen') return respuesta(500, { error: 'Sin resumen' });
    throw new Error(`Petición inesperada: ${ruta}`);
  });
  cargarScripts(SCRIPTS);
  await terminar();
}

describe('CS-50: lugares en el detalle del plan', () => {
  test('muestra una ficha por lugar, en el orden del autor y con su nota', async () => {
    await abrir();

    expect($('#seccion-lugares').hidden).toBe(false);
    expect(fichas().map((f) => f.querySelector('.ficha-lugar-nombre').textContent)).toEqual(['Plaza Mayor', 'Mercado <b>']);
    expect(fichas()[0].textContent).toContain('Quedamos aquí');
    expect(fichas()[1].querySelector('a').getAttribute('href')).toBe('https://mercadodesanmiguel.es');
    expect(fichas()[1].querySelector('b')).toBeNull();
    expect(fichas()[1].querySelector('.ficha-lugar-nota')).toBeNull();
  });

  test('si la experiencia ya trae sus lugares, no se lee el fichero', async () => {
    await abrir({ experiencia: { ...EXPERIENCIA, lugares: [LUGARES[1]] } });

    expect(fichas()).toHaveLength(1);
    expect(window.fetch.mock.calls.map(([ruta]) => ruta)).not.toContain('/datos/lugares-planes.json');
  });

  test('un plan sin lugares no muestra el apartado', async () => {
    await abrir({ fichero: [200, {}] });

    expect($('#seccion-lugares').hidden).toBe(true);
  });

  test('si no se pueden cargar, avisa y el resto del plan se ve', async () => {
    await abrir({ fichero: [500, null] });

    expect($('#seccion-lugares').hidden).toBe(false);
    expect($('#mensaje-lugares').textContent).toBe('No se han podido cargar los lugares.');
    expect($('#detalle-titulo').textContent).toBe('Ruta de tapas');
  });

  test('un plan titulado como una propiedad de Object no tiene lugares', async () => {
    await abrir({ experiencia: { ...EXPERIENCIA, titulo: 'constructor' } });

    expect($('#seccion-lugares').hidden).toBe(true);
  });

  test.each([
    ['falla la red', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['el fichero llega roto', () => Promise.resolve({ ok: true, json: () => Promise.reject(new SyntaxError('roto')) })],
  ])('si %s, avisa con el mismo mensaje', async (_caso, fallo) => {
    await abrir({ lectura: fallo });

    expect($('#mensaje-lugares').textContent).toBe('No se han podido cargar los lugares.');
  });

  test('un plan no disponible no pide ni muestra lugares', async () => {
    await abrir({ estado: 404 });

    expect($('#seccion-lugares').hidden).toBe(true);
    expect(window.fetch.mock.calls.map(([ruta]) => ruta)).not.toContain('/datos/lugares-planes.json');
  });
});
