// CS-22 y CS-30: con MySQL real, la visibilidad elegida al crear y al editar se guarda, se
// conserva al volver a pedir la experiencia y decide quién puede verla en cada petición.
// Se ejecuta con `npm run test:mysql`. Crea sus propios datos y los borra al terminar.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

// Sufijo único para no chocar con datos existentes ni con otra ejecución
const sufijo = `${Date.now()}`;
let autor;
let otro;
let ciudad;

jest.setTimeout(30000);

beforeAll(async () => {
  ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  autor = await prisma.usuario.create({
    data: { nombreUsuario: `autor_${sufijo}`, email: `autor_${sufijo}@prueba.local`, passwordHash },
  });
  otro = await prisma.usuario.create({
    data: { nombreUsuario: `otro_${sufijo}`, email: `otro_${sufijo}@prueba.local`, passwordHash },
  });
});

afterAll(async () => {
  const ids = [autor?.id, otro?.id].filter(Boolean);
  await prisma.amistad.deleteMany({ where: { solicitanteId: { in: ids } } });
  await prisma.experiencia.deleteMany({ where: { autorId: { in: ids } } });
  await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

async function agente(usuario) {
  const cliente = request.agent(app);
  const login = await cliente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return cliente;
}

test('la visibilidad se guarda al crear y al editar, se conserva al recargar y decide quién la ve', async () => {
  const [clienteAutor, clienteOtro] = await Promise.all([agente(autor), agente(otro)]);
  const creada = await clienteAutor.post('/api/experiencias').send({
    titulo: 'Ruta privada', descripcion: 'Solo para mí', ciudadId: ciudad.id, visibilidad: 'PRIVADA',
  });
  expect(creada.status).toBe(201);
  const ruta = `/api/experiencias/${creada.body.id}`;

  // Privada: el autor la ve con su visibilidad guardada; otro usuario no
  expect((await clienteAutor.get(ruta)).body.visibilidad).toBe('PRIVADA');
  expect((await clienteOtro.get(ruta)).status).toBe(404);

  // Pública: el cambio se conserva al volver a pedirla y ya la ve cualquiera
  expect((await clienteAutor.patch(ruta).send({ visibilidad: 'PUBLICA' })).status).toBe(200);
  expect((await clienteAutor.get(ruta)).body.visibilidad).toBe('PUBLICA');
  expect((await clienteOtro.get(ruta)).status).toBe(200);

  // Amigos: sin amistad no la ve; con la amistad aceptada, sí
  expect((await clienteAutor.patch(ruta).send({ visibilidad: 'AMIGOS' })).status).toBe(200);
  expect((await clienteOtro.get(ruta)).status).toBe(404);
  await prisma.amistad.create({
    data: {
      solicitanteId: autor.id, destinatarioId: otro.id, estado: 'ACEPTADA',
      parejaClave: `${Math.min(autor.id, otro.id)}-${Math.max(autor.id, otro.id)}`,
    },
  });
  expect((await clienteOtro.get(ruta)).status).toBe(200);
});
