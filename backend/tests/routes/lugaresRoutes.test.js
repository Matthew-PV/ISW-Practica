// CS-50: búsqueda del catálogo desde el backend, sin depender de MySQL.
jest.mock('../../src/repositories/ciudadRepository');

const request = require('supertest');
const app = require('../../src/app');
const ciudadRepository = require('../../src/repositories/ciudadRepository');

const MADRID = { id: 1, nombre: 'Madrid', pais: 'España' };
const PARIS = { id: 2, nombre: 'Paris', pais: 'Francia' };

beforeEach(() => {
  jest.resetAllMocks();
  ciudadRepository.buscarPorId.mockImplementation(async (id) => ({ 1: MADRID, 2: PARIS }[id] ?? null));
});

test('GET /api/lugares/buscar encuentra por nombre o dirección y devuelve fichas del catálogo', async () => {
  const porNombre = await request(app)
    .get('/api/lugares/buscar')
    .query({ q: 'gran vía', ciudadId: 1 });
  const porDireccion = await request(app)
    .get('/api/lugares/buscar')
    .query({ q: 'Cava Baja', ciudadId: 1 });

  expect(porNombre.status).toBe(200);
  expect(porNombre.body).toEqual([
    expect.objectContaining({
      proveedorId: 'demo-gran-via',
      nombre: 'Gran Vía',
      direccion: 'Gran Vía',
      lat: 40.42,
      lon: -3.70361,
    }),
  ]);
  expect(porDireccion.status).toBe(200);
  expect(porDireccion.body).toEqual([
    expect.objectContaining({ proveedorId: 'demo-cava-baja', direccion: 'Calle de la Cava Baja' }),
  ]);
});

test('una ciudad válida sin lugares en el catálogo devuelve una lista vacía', async () => {
  const res = await request(app)
    .get('/api/lugares/buscar')
    .query({ q: 'museo', ciudadId: 2 });

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

test('limita la búsqueda a diez resultados', async () => {
  const res = await request(app)
    .get('/api/lugares/buscar')
    .query({ q: 'a', ciudadId: 1 });

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(10);
});

test.each([
  [{ q: 'museo' }],
  [{ ciudadId: 1 }],
  [{ q: 'museo', ciudadId: 'no-es-un-id' }],
  [{ q: 'museo', ciudadId: 999 }],
])('la búsqueda rechaza parámetros incompletos o inválidos: %j', async (query) => {
  const res = await request(app).get('/api/lugares/buscar').query(query);

  expect(res.status).toBe(400);
});
