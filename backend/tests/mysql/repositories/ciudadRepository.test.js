// ciudadRepository con MySQL real: el catálogo que usa el formulario de experiencias.
// La carga del catálogo (cargarCapitales) solo se usa en `npm run db:seed`.
const { prisma } = require('../../helpers/datosMysql');
const ciudadRepository = require('../../../src/repositories/ciudadRepository');

afterAll(() => prisma.$disconnect());

test('listar devuelve el catálogo y buscarPorId encuentra cada ciudad (null si no existe)', async () => {
  const ciudades = await ciudadRepository.listar();

  expect(ciudades.length).toBeGreaterThan(0);
  expect((await ciudadRepository.buscarPorId(ciudades[0].id)).nombre).toBe(ciudades[0].nombre);
  expect(await ciudadRepository.buscarPorId(2147483647)).toBeNull();
});
