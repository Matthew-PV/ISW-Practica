// CS-63 y CS-48: valoraciones de una experiencia con MySQL real. El filtro de «amigos y
// seguidores» y el cursor se resuelven en una sola consulta, así que solo una base de datos real
// demuestra qué valoraciones aparecen. Se ejecuta con `npm run test:mysql`; crea y borra sus datos.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const sufijo = `${Date.now()}`;
const u = {};
let publica;
let privada;
let ciudad;

jest.setTimeout(60000);

const pareja = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
const nombre = (valoracion) => valoracion.usuario.nombreUsuario.split('_')[0];

beforeAll(async () => {
  ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  for (const clave of ['autor', 'yo', 'amigoEnviado', 'amigoRecibido', 'seguidor', 'seguido', 'pendiente', 'desconocido']) {
    u[clave] = await prisma.usuario.create({
      data: { nombreUsuario: `${clave}_${sufijo}`, email: `${clave}_${sufijo}@prueba.local`, passwordHash },
    });
  }
  const { yo } = u;
  // Amistades aceptadas en los dos sentidos, una pendiente y seguimientos en los dos sentidos
  await prisma.amistad.create({ data: { solicitanteId: yo.id, destinatarioId: u.amigoEnviado.id, estado: 'ACEPTADA', parejaClave: pareja(yo.id, u.amigoEnviado.id) } });
  await prisma.amistad.create({ data: { solicitanteId: u.amigoRecibido.id, destinatarioId: yo.id, estado: 'ACEPTADA', parejaClave: pareja(yo.id, u.amigoRecibido.id) } });
  await prisma.amistad.create({ data: { solicitanteId: u.pendiente.id, destinatarioId: yo.id, parejaClave: pareja(yo.id, u.pendiente.id) } });
  await prisma.seguimiento.create({ data: { seguidorId: u.seguidor.id, seguidoId: yo.id } });
  await prisma.seguimiento.create({ data: { seguidorId: yo.id, seguidoId: u.seguido.id } });

  publica = await prisma.experiencia.create({
    data: { titulo: `Pública ${sufijo}`, descripcion: 'Prueba', ciudadId: ciudad.id, autorId: u.autor.id, visibilidad: 'PUBLICA' },
  });
  privada = await prisma.experiencia.create({
    data: { titulo: `Privada ${sufijo}`, descripcion: 'Prueba', ciudadId: ciudad.id, autorId: u.autor.id, visibilidad: 'PRIVADA' },
  });
  // Valoran en este orden: la más reciente es la del desconocido
  for (const clave of ['amigoEnviado', 'amigoRecibido', 'seguidor', 'seguido', 'pendiente', 'desconocido']) {
    await prisma.valoracion.create({
      data: { usuarioId: u[clave].id, experienciaId: publica.id, puntuacion: 4, comentario: `De ${clave}` },
    });
  }
});

afterAll(async () => {
  const ids = Object.values(u).map((usuario) => usuario.id);
  await prisma.valoracion.deleteMany({ where: { usuarioId: { in: ids } } });
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

test('CS-48: solo aparecen las de mis amigos (en cualquier sentido) y mis seguidores, de la más reciente a la más antigua', async () => {
  const respuesta = await (await agente(u.yo)).get(`/api/experiencias/${publica.id}/valoraciones/amigos`);

  expect(respuesta.status).toBe(200);
  expect(respuesta.body.valoraciones.map(nombre)).toEqual(['seguidor', 'amigoRecibido', 'amigoEnviado']);
  expect(respuesta.body.siguiente).toBeNull();
});

test('CS-48: quien no tiene amigos ni seguidores ve la sección vacía, sin error', async () => {
  const respuesta = await (await agente(u.desconocido)).get(`/api/experiencias/${publica.id}/valoraciones/amigos`);

  expect(respuesta.status).toBe(200);
  expect(respuesta.body).toEqual({ valoraciones: [], siguiente: null });
});

test('CS-48: una valoración nueva de un amigo aparece en la siguiente consulta', async () => {
  // Experiencia propia de la prueba, para no cambiar el orden de las demás
  const otra = await prisma.experiencia.create({
    data: { titulo: `Otra ${sufijo}`, descripcion: 'Prueba', ciudadId: ciudad.id, autorId: u.autor.id, visibilidad: 'PUBLICA' },
  });
  const cliente = await agente(u.yo);
  const ruta = `/api/experiencias/${otra.id}/valoraciones/amigos`;
  expect((await cliente.get(ruta)).body.valoraciones).toEqual([]);

  await prisma.valoracion.create({ data: { usuarioId: u.amigoEnviado.id, experienciaId: otra.id, puntuacion: 5 } });

  expect((await cliente.get(ruta)).body.valoraciones.map(nombre)).toEqual(['amigoEnviado']);
});

test('CS-48: pidiendo de dos en dos no se repite ni se salta ninguna', async () => {
  const cliente = await agente(u.yo);
  const ruta = `/api/experiencias/${publica.id}/valoraciones/amigos?limite=2`;

  const primera = (await cliente.get(ruta)).body;
  const segunda = (await cliente.get(`${ruta}&despuesDe=${primera.siguiente}`)).body;

  expect(primera.valoraciones.map(nombre)).toEqual(['seguidor', 'amigoRecibido']);
  expect(segunda.valoraciones.map(nombre)).toEqual(['amigoEnviado']);
  expect(segunda.siguiente).toBeNull();
});

test('CS-63: la lista general tiene todas, con el autor público y la fecha, sin emails', async () => {
  const respuesta = await (await agente(u.yo)).get(`/api/experiencias/${publica.id}/valoraciones`);

  expect(respuesta.body.valoraciones.map(nombre)).toEqual(
    ['desconocido', 'pendiente', 'seguido', 'seguidor', 'amigoRecibido', 'amigoEnviado']
  );
  const primera = respuesta.body.valoraciones[0];
  expect(Object.keys(primera.usuario).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
  expect(primera.creadaEn).toEqual(expect.any(String));
});

test('CS-63: mi valoración es null hasta que valoro, y después es la mía', async () => {
  const cliente = await agente(u.yo);
  const ruta = `/api/experiencias/${publica.id}/valoracion`;

  expect((await cliente.get(ruta)).body).toBeNull();
  expect((await cliente.put(ruta).send({ puntuacion: 5, comentario: 'Me gustó' })).status).toBe(201);
  expect((await cliente.get(ruta)).body).toMatchObject({ puntuacion: 5, comentario: 'Me gustó' });
});

test.each(['/valoracion', '/valoraciones', '/valoraciones/amigos'])(
  'en una experiencia que no puedo ver, %s responde 404 «Contenido no disponible»', async (sufijoRuta) => {
    const respuesta = await (await agente(u.yo)).get(`/api/experiencias/${privada.id}${sufijoRuta}`);

    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'Contenido no disponible' });
  }
);
