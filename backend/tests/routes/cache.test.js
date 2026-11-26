// Cabeceras de caché: archivos estáticos y catálogos que no dependen del usuario.
jest.mock('../../src/repositories/ciudadRepository');
const request = require('supertest');
const app = require('../../src/app');
const ciudadRepository = require('../../src/repositories/ciudadRepository');

const cache = async (ruta) => (await request(app).get(ruta)).headers['cache-control'];

test('las librerías e imágenes se guardan una semana y el CSS y JS cinco minutos', async () => {
  expect(await cache('/vendor/leaflet/leaflet.js')).toBe('public, max-age=604800');
  expect(await cache('/img/logo-pin.svg')).toBe('public, max-age=604800');
  expect(await cache('/js/shared/api.js')).toBe('public, max-age=300');
  expect(await cache('/css/nucleo/base.css')).toBe('public, max-age=300');
  expect(await cache('/index.html')).toBe('public, max-age=0');
});

test('los catálogos se pueden guardar y las ciudades se consultan una sola vez', async () => {
  ciudadRepository.listar.mockResolvedValue([{ id: 1, nombre: 'Madrid', pais: 'España' }]);
  expect(await cache('/api/ciudades')).toBe('public, max-age=3600');
  expect(await cache('/api/ciudades')).toBe('public, max-age=3600');
  expect(ciudadRepository.listar).toHaveBeenCalledTimes(1);
  expect(await cache('/api/experiencias/opciones')).toBe('public, max-age=3600');
});
