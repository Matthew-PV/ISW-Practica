// seguimientoRepository con MySQL real (CS-61 y CS-45). Se ejecuta con `npm run test:mysql`.
const { prisma, crearUsuarios, borrarUsuarios } = require('../../helpers/datosMysql');
const seguimientoRepository = require('../../../src/repositories/seguimientoRepository');

let u;

beforeEach(async () => {
  u = await crearUsuarios(['ana', 'bea', 'carlos']);
});

afterEach(() => borrarUsuarios(u));
afterAll(() => prisma.$disconnect());

test('seguir, comprobar y dejar de seguir: el seguimiento es en un solo sentido', async () => {
  await seguimientoRepository.seguir(u.ana.id, u.bea.id);

  expect(await seguimientoRepository.sigueA(u.ana.id, u.bea.id)).toBe(true);
  expect(await seguimientoRepository.sigueA(u.bea.id, u.ana.id)).toBe(false);
  await seguimientoRepository.dejarDeSeguir(u.ana.id, u.bea.id);
  expect(await seguimientoRepository.sigueA(u.ana.id, u.bea.id)).toBe(false);
});

test('contarSeguidores y listarSeguidores: quienes siguen al usuario, del más reciente al más antiguo y sin email', async () => {
  await seguimientoRepository.seguir(u.bea.id, u.ana.id);
  await seguimientoRepository.seguir(u.carlos.id, u.ana.id);
  await seguimientoRepository.seguir(u.ana.id, u.carlos.id); // a quien sigue Ana: no es seguidor suyo

  expect(await seguimientoRepository.contarSeguidores(u.ana.id)).toBe(2);
  const seguidores = await seguimientoRepository.listarSeguidores(u.ana.id, null, 10);
  expect(seguidores.map((fila) => fila.persona.id)).toEqual([u.carlos.id, u.bea.id]);
  expect(Object.keys(seguidores[0].persona).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
});
