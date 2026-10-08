// amistadRepository con MySQL real (CS-61, CS-45 y CS-62): lo que devuelve cada consulta.
// Sustituye a las pruebas que solo repetían la consulta de Prisma. Se ejecuta con `npm run test:mysql`.
const { prisma, crearUsuarios, crearAmistad, borrarUsuarios } = require('../../helpers/datosMysql');
const amistadRepository = require('../../../src/repositories/amistadRepository');

let u;

beforeEach(async () => {
  u = await crearUsuarios(['ana', 'bea', 'carlos', 'dani']);
});

afterEach(() => borrarUsuarios(u));
afterAll(() => prisma.$disconnect());

test('una solicitud nueva queda PENDIENTE, con fecha y con la clave de la pareja', async () => {
  const solicitud = await amistadRepository.crear(u.ana.id, u.bea.id);

  expect(solicitud).toMatchObject({ estado: 'PENDIENTE', parejaClave: `${Math.min(u.ana.id, u.bea.id)}-${Math.max(u.ana.id, u.bea.id)}` });
  expect(solicitud.fecha).toEqual(expect.any(Date));
});

test('buscarEntreUsuarios encuentra la relación en los dos sentidos, y null si no hay', async () => {
  const solicitud = await amistadRepository.crear(u.ana.id, u.bea.id);

  expect((await amistadRepository.buscarEntreUsuarios(u.bea.id, u.ana.id)).id).toBe(solicitud.id);
  expect((await amistadRepository.buscarEntreUsuarios(u.ana.id, u.bea.id)).id).toBe(solicitud.id);
  expect(await amistadRepository.buscarEntreUsuarios(u.ana.id, u.carlos.id)).toBeNull();
});

test('aceptar pasa la solicitud a ACEPTADA y borrar la elimina', async () => {
  const solicitud = await amistadRepository.crear(u.ana.id, u.bea.id);

  expect((await amistadRepository.aceptar(solicitud.id)).estado).toBe('ACEPTADA');
  expect((await amistadRepository.buscarPorId(solicitud.id)).estado).toBe('ACEPTADA');
  await amistadRepository.borrar(solicitud.id);
  expect(await amistadRepository.buscarPorId(solicitud.id)).toBeNull();
});

test('las solicitudes recibidas: solo las pendientes, de la más reciente a la más antigua y sin el email del solicitante', async () => {
  await amistadRepository.crear(u.bea.id, u.ana.id);
  await amistadRepository.crear(u.carlos.id, u.ana.id);
  await crearAmistad(u.dani, u.ana); // aceptada: no es una solicitud

  const recibidas = await amistadRepository.listarSolicitudesRecibidas(u.ana.id);

  expect(recibidas.map((s) => s.solicitante.id)).toEqual([u.carlos.id, u.bea.id]);
  expect(Object.keys(recibidas[0].solicitante).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
});

test('contarAmigos y listarAmigos: solo las aceptadas, en cualquier sentido, con la otra persona y sin email', async () => {
  await crearAmistad(u.ana, u.bea); // Ana la envió
  await crearAmistad(u.carlos, u.ana); // Ana la recibió
  await amistadRepository.crear(u.dani.id, u.ana.id); // pendiente: no cuenta

  expect(await amistadRepository.contarAmigos(u.ana.id)).toBe(2);
  const amigos = await amistadRepository.listarAmigos(u.ana.id, null, 10);
  expect(amigos.map((fila) => fila.persona.id)).toEqual([u.carlos.id, u.bea.id]);
  expect(Object.keys(amigos[0].persona).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
  // El cursor es el id de la amistad: después de la primera, solo queda la segunda
  expect((await amistadRepository.listarAmigos(u.ana.id, amigos[0].id, 10)).map((f) => f.persona.id)).toEqual([u.bea.id]);
});
