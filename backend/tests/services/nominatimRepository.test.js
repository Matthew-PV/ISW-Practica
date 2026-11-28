/** @jest-environment node */
// CS-50. Se simula internet: las pruebas nunca consultan el servicio público.
const MADRID = { id: 1, nombre: 'Madrid', codigoPais: 'ES' };
const ciudad = {
  osm_type: 'relation', osm_id: 1, category: 'boundary', type: 'administrative',
  name: 'Madrid', namedetails: { name: 'Madrid' }, address: { country_code: 'es' },
  boundingbox: ['0', '10', '0', '10'],
  geojson: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
};
const museo = {
  osm_type: 'relation', osm_id: 2, category: 'tourism', type: 'museum',
  name: 'Museo', display_name: 'Museo, Madrid', lat: '5', lon: '5',
  address: { country_code: 'es' }, extratags: { website: 'https://example.org' },
};
let repo;
beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  global.fetch = jest.fn();
  repo = require('../../src/repositories/nominatimRepository');
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
const respuesta = (datos) => ({ ok: true, json: async () => datos });
async function completar(promesa) {
  // Avanza las esperas del límite de tráfico sin esperar tiempo real.
  const resultado = promesa.then(valor => ({ valor }), error => ({ error }));
  await jest.runAllTimersAsync();
  const fin = await resultado;
  if (fin.error) throw fin.error;
  return fin.valor;
}

test('busca fichas del municipio, conserva el contrato y descarta puntos de otra ciudad', async () => {
  fetch.mockResolvedValueOnce(respuesta([ciudad])).mockResolvedValueOnce(respuesta([
    museo, { ...museo, osm_id: 3, lon: '12' },
  ]));
  const fichas = await completar(repo.buscar('museo', MADRID));
  expect(fichas).toEqual([{
    proveedorId: 'osm:R2:tourism', nombre: 'Museo', tipo: 'museum',
    direccion: 'Museo, Madrid', lat: 5, lon: 5, imagen: null, web: 'https://example.org/',
  }]);
  const url = new URL(fetch.mock.calls[1][0]);
  expect(url.searchParams.get('countrycodes')).toBe('es');
  expect(url.searchParams.get('bounded')).toBe('1');
  expect(fetch.mock.calls[0][1].headers['User-Agent']).toContain('PlanB');
});

test('resuelve IDs en el servidor y rechaza una ficha fuera del municipio', async () => {
  fetch.mockResolvedValueOnce(respuesta([ciudad])).mockResolvedValueOnce(respuesta([
    museo, { ...museo, osm_id: 3, lat: '20' },
  ]));
  await expect(completar(repo.resolver(['osm:R2:tourism', 'osm:R3:tourism'], MADRID)))
    .rejects.toMatchObject({ status: 400 });
});

test('un fallo de red produce un error de servicio, no una lista vacía', async () => {
  fetch.mockRejectedValue(new Error('Sin red'));
  await expect(completar(repo.buscar('museo', MADRID))).rejects.toMatchObject({ status: 503 });
});

test('rechaza ciudades ambiguas o sin límite municipal verificable', async () => {
  fetch.mockResolvedValue(respuesta([ciudad, { ...ciudad, osm_id: 9 }]));
  await expect(completar(repo.buscar('museo', MADRID))).rejects.toMatchObject({ status: 400 });
});

test('rechaza una ciudad sin código de país sin consultar al proveedor', async () => {
  await expect(completar(repo.buscar('museo', { nombre: 'Madrid' }))).rejects.toMatchObject({ status: 400 });
  expect(fetch).not.toHaveBeenCalled();
});

test('reutiliza las consultas e impone al menos un segundo entre peticiones', async () => {
  const inicios = [];
  fetch.mockImplementation(async () => {
    inicios.push(Date.now());
    return respuesta(inicios.length === 1 ? [ciudad] : [museo]);
  });
  await completar(repo.buscar('museo', MADRID));
  await completar(repo.buscar('museo', MADRID));
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(inicios[1] - inicios[0]).toBeGreaterThanOrEqual(1000);
});

test('un punto en un hueco del municipio no pertenece a la ciudad', async () => {
  const conHueco = structuredClone(ciudad);
  conHueco.geojson.coordinates.push([[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]);
  fetch.mockResolvedValueOnce(respuesta([conHueco])).mockResolvedValueOnce(respuesta([museo]));
  expect(await completar(repo.buscar('museo', MADRID))).toEqual([]);
});
