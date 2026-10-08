// CS-61: con MySQL real, las amistades y los seguimientos no se duplican ni dan error 500
// aunque lleguen peticiones simultáneas.
// No se simula nada: usa la base de datos del .env (Docker en marcha). Se ejecuta con
// `npm run test:mysql`. Crea sus propios usuarios y los borra al terminar, aunque la prueba falle.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');
const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');

const PETICIONES = 10;
// Sufijo único para no chocar con datos existentes ni con otra ejecución
const sufijo = `${Date.now()}`;
let ana;
let beatriz;
let ids;

jest.setTimeout(30000);

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secreta123', 4);
  const crear = (nombre) => prisma.usuario.create({
    data: { nombreUsuario: `${nombre}_${sufijo}`, email: `${nombre}_${sufijo}@prueba.local`, passwordHash },
  });
  ana = await crear('ana');
  beatriz = await crear('beatriz');
  ids = [ana.id, beatriz.id];
});

// Cada prueba empieza sin relaciones entre los dos usuarios
afterEach(async () => {
  await prisma.amistad.deleteMany({ where: { solicitanteId: { in: ids } } });
  await prisma.seguimiento.deleteMany({ where: { seguidorId: { in: ids } } });
});

afterAll(async () => {
  await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

async function agente(usuario) {
  const cliente = request.agent(app);
  const login = await cliente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return cliente;
}

const contarAmistades = () => prisma.amistad.count({
  where: { solicitanteId: { in: ids }, destinatarioId: { in: ids } },
});

test('MySQL no admite una segunda relación entre la misma pareja, aunque sea en el otro sentido', async () => {
  expect(await amistadRepository.crear(ana.id, beatriz.id)).toMatchObject({ estado: 'PENDIENTE' });

  await expect(amistadRepository.crear(beatriz.id, ana.id)).resolves.toBeNull();
  expect(await contarAmistades()).toBe(1);
});

test('dos solicitudes cruzadas simultáneas dejan una sola relación y ningún error 500', async () => {
  const [clienteAna, clienteBeatriz] = await Promise.all([agente(ana), agente(beatriz)]);

  const respuestas = await Promise.all([
    clienteAna.post('/api/amistades').send({ destinatarioId: beatriz.id }),
    clienteBeatriz.post('/api/amistades').send({ destinatarioId: ana.id }),
  ]);

  expect(respuestas.map((respuesta) => respuesta.status).sort()).toEqual([201, 400]);
  expect(await contarAmistades()).toBe(1);
});

test(`${PETICIONES} «seguir» simultáneos dejan un solo seguimiento y ningún error 500`, async () => {
  const clienteAna = await agente(ana);

  const respuestas = await Promise.all(Array.from({ length: PETICIONES }, () =>
    clienteAna.post('/api/seguimientos').send({ seguidoId: beatriz.id })));

  const codigos = respuestas.map((respuesta) => respuesta.status);
  expect(codigos.filter((codigo) => codigo === 201)).toHaveLength(1);
  expect(codigos.filter((codigo) => codigo === 400)).toHaveLength(PETICIONES - 1);
  expect(await prisma.seguimiento.count({ where: { seguidorId: ana.id, seguidoId: beatriz.id } })).toBe(1);
});

test('aceptar, borrar o dejar de seguir algo que ya no existe devuelve null en lugar de fallar', async () => {
  await expect(amistadRepository.aceptar(2147483647)).resolves.toBeNull();
  await expect(amistadRepository.borrar(2147483647)).resolves.toBeNull();
  await expect(seguimientoRepository.dejarDeSeguir(ana.id, beatriz.id)).resolves.toBeNull();
});
