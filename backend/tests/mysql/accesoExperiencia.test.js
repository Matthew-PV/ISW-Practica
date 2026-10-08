// CS-30, objetivos 7 y 8: acceso a una experiencia por API según su visibilidad y la relación con
// su autor, con MySQL real. El permiso se vuelve a comprobar en cada petición: los cambios de
// visibilidad o de amistad se notan en la siguiente. Se ejecuta con `npm run test:mysql`.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const sufijo = `${Date.now()}`;
let autor;
let otro;
let ciudad;
let clienteAutor;
let clienteOtro;

jest.setTimeout(60000);

const pareja = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

beforeAll(async () => {
  ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  autor = await prisma.usuario.create({ data: { nombreUsuario: `autor_${sufijo}`, email: `autor_${sufijo}@prueba.local`, passwordHash } });
  otro = await prisma.usuario.create({ data: { nombreUsuario: `otro_${sufijo}`, email: `otro_${sufijo}@prueba.local`, passwordHash } });
  clienteAutor = request.agent(app);
  clienteOtro = request.agent(app);
  await clienteAutor.post('/api/auth/login').send({ email: autor.email, password: 'secreta123' });
  await clienteOtro.post('/api/auth/login').send({ email: otro.email, password: 'secreta123' });
});

// Cada prueba empieza sin relación entre los dos
afterEach(async () => {
  await prisma.amistad.deleteMany({ where: { parejaClave: pareja(autor.id, otro.id) } });
});

afterAll(async () => {
  await prisma.experiencia.deleteMany({ where: { autorId: autor.id } });
  await prisma.usuario.deleteMany({ where: { id: { in: [autor.id, otro.id] } } });
  await prisma.$disconnect();
});

const crearExperiencia = (visibilidad) => prisma.experiencia.create({
  data: { titulo: `${visibilidad} ${sufijo}`, descripcion: 'Prueba de CS-30', ciudadId: ciudad.id, autorId: autor.id, visibilidad },
});
const verComo = async (cliente, experiencia) => (await cliente.get(`/api/experiencias/${experiencia.id}`)).status;
const solicitudDeOtro = () => prisma.amistad.create({
  data: { solicitanteId: otro.id, destinatarioId: autor.id, parejaClave: pareja(autor.id, otro.id) },
});

describe('objetivo 7: los cinco casos de acceso', () => {
  test('una pública de otro usuario: 200', async () => {
    expect(await verComo(clienteOtro, await crearExperiencia('PUBLICA'))).toBe(200);
  });

  test('una privada propia: 200', async () => {
    expect(await verComo(clienteAutor, await crearExperiencia('PRIVADA'))).toBe(200);
  });

  test('una privada ajena: 404 «Contenido no disponible», sin ningún dato', async () => {
    const respuesta = await clienteOtro.get(`/api/experiencias/${(await crearExperiencia('PRIVADA')).id}`);

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'Contenido no disponible' });
  });

  test('una de amigos con la solicitud pendiente: 404', async () => {
    await solicitudDeOtro();

    expect(await verComo(clienteOtro, await crearExperiencia('AMIGOS'))).toBe(404);
  });

  test('una de amigos con la amistad aceptada: 200', async () => {
    const solicitud = await solicitudDeOtro();
    await prisma.amistad.update({ where: { id: solicitud.id }, data: { estado: 'ACEPTADA' } });

    expect(await verComo(clienteOtro, await crearExperiencia('AMIGOS'))).toBe(200);
  });
});

describe('objetivo 8: el permiso se vuelve a comprobar en cada petición', () => {
  test('una pública que pasa a privada deja de verse con el mismo enlace', async () => {
    const experiencia = await crearExperiencia('PUBLICA');
    expect(await verComo(clienteOtro, experiencia)).toBe(200);

    await clienteAutor.patch(`/api/experiencias/${experiencia.id}`).send({ visibilidad: 'PRIVADA' });

    expect(await verComo(clienteOtro, experiencia)).toBe(404);
  });

  test('al eliminar la amistad aceptada se pierde el acceso a la de amigos', async () => {
    const experiencia = await crearExperiencia('AMIGOS');
    const solicitud = await solicitudDeOtro();
    await clienteAutor.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true });
    expect(await verComo(clienteOtro, experiencia)).toBe(200);

    await clienteOtro.delete(`/api/amistades/${solicitud.id}`);

    expect(await verComo(clienteOtro, experiencia)).toBe(404);
  });

  test('una solicitud pendiente que después se acepta da acceso', async () => {
    const experiencia = await crearExperiencia('AMIGOS');
    const solicitud = await solicitudDeOtro();
    expect(await verComo(clienteOtro, experiencia)).toBe(404);

    await clienteAutor.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true });

    expect(await verComo(clienteOtro, experiencia)).toBe(200);
  });
});
