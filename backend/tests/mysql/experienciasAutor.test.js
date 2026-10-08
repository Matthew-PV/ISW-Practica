// CS-44: criterio del listado de experiencias de un usuario, con MySQL real.
// El filtro por visibilidad y el cursor se resuelven en la consulta, así que solo una base de
// datos real demuestra que no se filtra nada que no se pueda ver y que no se repite ni se salta
// ninguna. Se ejecuta con `npm run test:mysql`. Crea sus propios datos y los borra al terminar.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const sufijo = `${Date.now()}`;
const usuarios = {};
const experiencias = {};
let ciudad;

jest.setTimeout(30000);

const pareja = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

beforeAll(async () => {
  ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  for (const nombre of ['autor', 'amigo', 'seguidor', 'pendiente', 'desconocido']) {
    usuarios[nombre] = await prisma.usuario.create({
      data: { nombreUsuario: `${nombre}_${sufijo}`, email: `${nombre}_${sufijo}@prueba.local`, passwordHash },
    });
  }
  const { autor, amigo, seguidor, pendiente } = usuarios;
  await prisma.amistad.create({ data: { solicitanteId: amigo.id, destinatarioId: autor.id, estado: 'ACEPTADA', parejaClave: pareja(amigo.id, autor.id) } });
  await prisma.amistad.create({ data: { solicitanteId: pendiente.id, destinatarioId: autor.id, parejaClave: pareja(pendiente.id, autor.id) } });
  await prisma.seguimiento.create({ data: { seguidorId: seguidor.id, seguidoId: autor.id } });
  // Se crean en este orden: e5 es la más reciente
  for (const [clave, visibilidad] of [['e1', 'PUBLICA'], ['e2', 'PRIVADA'], ['e3', 'AMIGOS'], ['e4', 'PUBLICA'], ['e5', 'AMIGOS']]) {
    experiencias[clave] = await prisma.experiencia.create({
      data: { titulo: `${clave}_${sufijo}`, descripcion: 'Prueba de CS-44', ciudadId: ciudad.id, autorId: autor.id, visibilidad },
    });
  }
});

afterAll(async () => {
  const ids = Object.values(usuarios).map((usuario) => usuario.id);
  await prisma.amistad.deleteMany({ where: { solicitanteId: { in: ids } } });
  await prisma.seguimiento.deleteMany({ where: { seguidorId: { in: ids } } });
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

const titulos = (respuesta) => respuesta.body.experiencias.map((experiencia) => experiencia.titulo.split('_')[0]);
const rutaAutor = (query = '') => `/api/experiencias?autor=${usuarios.autor.nombreUsuario}${query}`;

test('el autor ve todas sus experiencias, también las privadas, de la más reciente a la más antigua', async () => {
  const respuesta = await (await agente(usuarios.autor)).get(rutaAutor());

  expect(respuesta.status).toBe(200);
  expect(titulos(respuesta)).toEqual(['e5', 'e4', 'e3', 'e2', 'e1']);
  expect(respuesta.body.siguiente).toBeNull();
});

test('un amigo con la amistad aceptada ve las de amigos y las públicas', async () => {
  const respuesta = await (await agente(usuarios.amigo)).get(rutaAutor());

  expect(titulos(respuesta)).toEqual(['e5', 'e4', 'e3', 'e1']);
});

test.each(['seguidor', 'pendiente', 'desconocido'])('%s solo ve las públicas', async (quien) => {
  const respuesta = await (await agente(usuarios[quien])).get(rutaAutor());

  expect(titulos(respuesta)).toEqual(['e4', 'e1']);
});

test('pidiendo todas las páginas no se repite ni se salta ninguna, aunque se publique otra entre dos peticiones', async () => {
  const cliente = await agente(usuarios.autor);
  const primera = await cliente.get(rutaAutor('&limite=2'));
  expect(titulos(primera)).toEqual(['e5', 'e4']);

  // Una experiencia nueva entre dos peticiones no desplaza las páginas siguientes
  await prisma.experiencia.create({
    data: { titulo: `e6_${sufijo}`, descripcion: 'Prueba de CS-44', ciudadId: ciudad.id, autorId: usuarios.autor.id, visibilidad: 'PUBLICA' },
  });
  const segunda = await cliente.get(rutaAutor(`&limite=2&despuesDe=${primera.body.siguiente}`));
  const tercera = await cliente.get(rutaAutor(`&limite=2&despuesDe=${segunda.body.siguiente}`));

  expect(titulos(segunda)).toEqual(['e3', 'e2']);
  expect(titulos(tercera)).toEqual(['e1']);
  expect(tercera.body.siguiente).toBeNull();
  // Y la nueva aparece al volver a cargar el listado
  expect(titulos(await cliente.get(rutaAutor('&limite=2')))).toEqual(['e6', 'e5']);
});

test('un usuario sin experiencias recibe una lista vacía, sin error', async () => {
  const cliente = await agente(usuarios.autor);
  const respuesta = await cliente.get(`/api/experiencias?autor=${usuarios.desconocido.nombreUsuario}`);

  expect(respuesta.status).toBe(200);
  expect(respuesta.body).toEqual({ experiencias: [], siguiente: null });
});

test('un usuario que no existe responde 404', async () => {
  const cliente = await agente(usuarios.autor);
  const respuesta = await cliente.get(`/api/experiencias?autor=nadie_${sufijo}`);

  expect(respuesta.status).toBe(404);
  expect(respuesta.body).toEqual({ error: 'Usuario no encontrado' });
});
