// seguimientoRepository con MySQL real (CS-61, CS-45 y CS-72). Se ejecuta con `npm run test:mysql`.
const { prisma, crearUsuarios, borrarUsuarios } = require('../../helpers/datosMysql');
const seguimientoRepository = require('../../../src/repositories/seguimientoRepository');

let u;

// Más margen para preparar los usuarios con MySQL real.
jest.setTimeout(20000);

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

test('CS-72: contarSeguidos y listarSeguidos: a quienes sigue el usuario, del más reciente al más antiguo y sin email', async () => {
  await seguimientoRepository.seguir(u.ana.id, u.bea.id);
  await seguimientoRepository.seguir(u.ana.id, u.carlos.id);
  await seguimientoRepository.seguir(u.bea.id, u.ana.id); // Bea sigue a Ana: no es alguien a quien Ana sigue

  expect(await seguimientoRepository.contarSeguidos(u.ana.id)).toBe(2);
  const seguidos = await seguimientoRepository.listarSeguidos(u.ana.id, null, 10);
  expect(seguidos.map((fila) => fila.persona.id)).toEqual([u.carlos.id, u.bea.id]);
  expect(Object.keys(seguidos[0].persona).sort()).toEqual(['foto', 'id', 'nombreUsuario']);

  // Con el cursor del primero, la página siguiente empieza justo después de él
  const despues = await seguimientoRepository.listarSeguidos(u.ana.id, seguidos[0].id, 10);
  expect(despues.map((fila) => fila.persona.id)).toEqual([u.bea.id]);
});