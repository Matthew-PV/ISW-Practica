// CS-10 y CS-14 con MySQL real y por HTTP: la búsqueda respeta la visibilidad del solicitante,
// aplica cada filtro y pagina por cursor; el resumen cuenta las valoraciones de verdad.
// Todas las experiencias llevan una marca única en el título y se busca por ella, para no
// mezclarse con otros datos de la base. Se ejecuta con `npm run test:mysql`.
const request = require('supertest');
const app = require('../../src/app');
const { prisma, PASSWORD, crearUsuarios, crearAmistad, crearExperiencia, borrarUsuarios } = require('../helpers/datosMysql');

const MARCA = `busq${Date.now()}`;
let u;
let e;

jest.setTimeout(30000);

beforeAll(async () => {
  // ana busca; bea es su amiga; carla solo tiene una solicitud pendiente con ana
  u = await crearUsuarios(['ana', 'bea', 'carla']);
  await crearAmistad(u.ana, u.bea);
  await crearAmistad(u.carla, u.ana, 'PENDIENTE');
  const otraCiudad = await prisma.ciudad.findFirst({ skip: 1 });
  const titulo = (texto) => `${MARCA} ${texto}`;
  e = {
    anaPrivada: await crearExperiencia(u.ana, { titulo: titulo('mía privada'), visibilidad: 'PRIVADA' }),
    beaAmigos: await crearExperiencia(u.bea, { titulo: titulo('de bea para amigos'), visibilidad: 'AMIGOS', tipo: 'Noche' }),
    beaPublica: await crearExperiencia(u.bea, { titulo: titulo('de bea pública'), tipo: 'Gastronomía', momentoAdecuado: 'Atardecer', ciudadId: otraCiudad.id }),
    beaPrivada: await crearExperiencia(u.bea, { titulo: titulo('de bea privada'), visibilidad: 'PRIVADA' }),
    carlaAmigos: await crearExperiencia(u.carla, { titulo: titulo('de carla para amigos'), visibilidad: 'AMIGOS' }),
    carlaPublica: await crearExperiencia(u.carla, { titulo: titulo('de carla pública'), descripcion: 'Churros con chocolate' }),
  };
  // Medias: beaPublica 4,5 (5 y 4); carlaPublica 2
  await prisma.valoracion.createMany({
    data: [
      { usuarioId: u.ana.id, experienciaId: e.beaPublica.id, puntuacion: 5, comentario: 'Genial' },
      { usuarioId: u.carla.id, experienciaId: e.beaPublica.id, puntuacion: 4, comentario: null },
      { usuarioId: u.ana.id, experienciaId: e.carlaPublica.id, puntuacion: 2, comentario: 'Flojo' },
    ],
  });
});

afterAll(async () => {
  await borrarUsuarios(u);
  await prisma.$disconnect();
});

async function agenteDe(usuario) {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: PASSWORD });
  expect(login.status).toBe(200);
  return agente;
}

// Ids de lo que encuentra ana con la marca y los filtros extra de `query`
async function buscar(query = '') {
  const agente = await agenteDe(u.ana);
  const res = await agente.get(`/api/experiencias?texto=${MARCA}${query}`);
  expect(res.status).toBe(200);
  return res.body.experiencias.map((experiencia) => experiencia.id);
}

test('ve las públicas, las suyas y las «solo amigos» de sus amigos, de la más reciente a la más antigua', async () => {
  expect(await buscar()).toEqual([e.carlaPublica.id, e.beaPublica.id, e.beaAmigos.id, e.anaPrivada.id]);
});

test('cada resultado trae su ciudad y solo los datos públicos del autor', async () => {
  const agente = await agenteDe(u.ana);
  const res = await agente.get(`/api/experiencias?texto=${MARCA}&limite=1`);
  const [primera] = res.body.experiencias;
  expect(primera.ciudad).toHaveProperty('nombre');
  expect(Object.keys(primera.autor).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
});

test('el texto se busca también en la descripción, sin distinguir mayúsculas', async () => {
  const agente = await agenteDe(u.ana);
  const res = await agente.get('/api/experiencias?texto=CHURROS con chocolate&limite=50');
  expect(res.body.experiencias.map((x) => x.id)).toContain(e.carlaPublica.id);
});

test.each([
  ['la ciudad', () => `&ciudadId=${e.beaPublica.ciudadId}`, () => [e.beaPublica.id]],
  ['la categoría', () => '&categoria=Noche', () => [e.beaAmigos.id]],
  ['el momento', () => '&momento=Atardecer', () => [e.beaPublica.id]],
  ['«de mis amigos»', () => '&amigos=true', () => [e.beaPublica.id, e.beaAmigos.id]],
  ['la valoración media mínima', () => '&minimo=4', () => [e.beaPublica.id]],
])('filtra por %s', async (_filtro, query, esperado) => {
  expect(await buscar(query())).toEqual(esperado());
});

test('pagina por cursor sin repetir ni saltar resultados', async () => {
  const agente = await agenteDe(u.ana);
  const primera = await agente.get(`/api/experiencias?texto=${MARCA}&limite=3`);
  const segunda = await agente.get(`/api/experiencias?texto=${MARCA}&limite=3&despuesDe=${primera.body.siguiente}`);

  expect(primera.body.experiencias.map((x) => x.id)).toEqual([e.carlaPublica.id, e.beaPublica.id, e.beaAmigos.id]);
  expect(primera.body.siguiente).toBe(e.beaAmigos.id);
  expect(segunda.body).toEqual({ experiencias: [expect.objectContaining({ id: e.anaPrivada.id })], siguiente: null });
});

test('el resumen cuenta media, total, distribución y comentarios', async () => {
  const agente = await agenteDe(u.carla);
  const res = await agente.get(`/api/experiencias/${e.beaPublica.id}/resumen`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ media: 4.5, total: 2, distribucion: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 }, comentarios: 1 });
});

test('el resumen de una experiencia que no puede ver responde 404', async () => {
  const agente = await agenteDe(u.carla);
  const res = await agente.get(`/api/experiencias/${e.beaAmigos.id}/resumen`);
  expect(res.status).toBe(404);
});
