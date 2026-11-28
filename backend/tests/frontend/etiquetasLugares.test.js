/** @jest-environment jsdom */
const { cargarScripts } = require('../helpers/pantalla');

beforeEach(() => cargarScripts(['js/shared/lugares.js']));

test.each([
  ['highway', 'bus_stop', 'Parada de autobús'],
  ['railway', 'stop', 'Punto de parada de tren o metro'],
  ['highway', 'stop', 'Señal de STOP'],
  ['tourism', 'apartment', 'Apartamento turístico'],
  ['building', 'apartments', 'Edificio de viviendas'],
  ['tourism', 'museum', 'Museo'],
  ['amenity', 'restaurant', 'Restaurante'],
  ['shop', 'bakery', 'Panadería'],
  ['shop', 'desconocido', 'Comercio'],
  ['desconocida', 'stop', 'Lugar'],
])('%s/%s se presenta como %s', (categoria, tipo, etiqueta) => {
  const ficha = window.crearFichaLugar({ proveedorId: `osm:N1:${categoria}`, tipo,
    nombre: 'La Latina', direccion: 'Madrid' });
  expect(ficha.querySelector('.ficha-lugar-detalle').textContent).toBe(`${etiqueta} · Madrid`);
});

test('mantiene las etiquetas del catálogo anterior y trata el texto como texto', () => {
  const ficha = window.crearFichaLugar({ proveedorId: 'demo-plaza', tipo: 'Plaza',
    nombre: '<img src=x>', direccion: 'Madrid' });
  expect(ficha.querySelector('.ficha-lugar-detalle').textContent).toBe('Plaza · Madrid');
  expect(ficha.querySelector('img')).toBeNull();
});
