// CS-45: con MySQL real, los listados de amigos y seguidores del perfil propio no repiten ni
// saltan a nadie al pedir todas las páginas, aunque llegue una relación nueva entre dos peticiones.
// Con páginas numeradas (OFFSET), el alta desplazaba la lista y el último de la primera página
// volvía a salir en la segunda. Se ejecuta con `npm run test:mysql`; crea y borra sus datos.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const sufijo = `${Date.now()}`;
const TOTAL = 25;
let ana;
let otros = [];

jest.setTimeout(60000);

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secreta123', 4);
  const crear = (nombre) => prisma.usuario.create({
    data: { nombreUsuario: `${nombre}_${sufijo}`, email: `${nombre}_${sufijo}@prueba.local`, passwordHash },
  });
  ana = await crear('ana');
  // TOTAL personas que serán amigas y seguidoras de Ana, y una más que llega entre dos páginas
  for (let i = 1; i <= TOTAL + 1; i += 1) {
    otros.push(await crear(`p${i}`));
  }
  for (const persona of otros.slice(0, TOTAL)) {
    await prisma.amistad.create({
      data: {
        solicitanteId: persona.id, destinatarioId: ana.id, estado: 'ACEPTADA',
        parejaClave: `${Math.min(persona.id, ana.id)}-${Math.max(persona.id, ana.id)}`,
      },
    });
    await prisma.seguimiento.create({ data: { seguidorId: persona.id, seguidoId: ana.id } });
  }
});

afterAll(async () => {
  const ids = [ana.id, ...otros.map((persona) => persona.id)];
  await prisma.amistad.deleteMany({ where: { solicitanteId: { in: ids } } });
  await prisma.seguimiento.deleteMany({ where: { seguidorId: { in: ids } } });
  await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

test.each([
  ['amigos', (persona) => prisma.amistad.create({
    data: {
      solicitanteId: persona.id, destinatarioId: ana.id, estado: 'ACEPTADA',
      parejaClave: `${Math.min(persona.id, ana.id)}-${Math.max(persona.id, ana.id)}`,
    },
  })],
  ['seguidores', (persona) => prisma.seguimiento.create({ data: { seguidorId: persona.id, seguidoId: ana.id } })],
])('%s: todas las páginas, con un alta entre medias, sin repetir ni saltar a nadie', async (tipo, darDeAlta) => {
  const cliente = request.agent(app);
  await cliente.post('/api/auth/login').send({ email: ana.email, password: 'secreta123' });

  const primera = (await cliente.get(`/api/perfil/${tipo}?limite=20`)).body;
  const nueva = otros[TOTAL];
  await darDeAlta(nueva);
  const segunda = (await cliente.get(`/api/perfil/${tipo}?limite=20&despuesDe=${primera.siguiente}`)).body;

  expect(primera.personas).toHaveLength(20);
  expect(primera.siguiente).toEqual(expect.any(Number));
  expect(segunda.siguiente).toBeNull();
  const ids = [...primera.personas, ...segunda.personas].map((persona) => persona.id);
  // Las 25 que había, una sola vez cada una; la nueva aparecerá al volver a cargar la lista
  expect(ids).toHaveLength(TOTAL);
  expect(new Set(ids)).toEqual(new Set(otros.slice(0, TOTAL).map((persona) => persona.id)));
  expect(primera.personas[0]).not.toHaveProperty('email');

  // Se deshace el alta para que la otra variante empiece igual
  if (tipo === 'amigos') {
    await prisma.amistad.deleteMany({ where: { solicitanteId: nueva.id } });
  } else {
    await prisma.seguimiento.deleteMany({ where: { seguidorId: nueva.id } });
  }
});
