// CS-01, objetivo 10: con MySQL real, la restricción única impide valoraciones duplicadas
// incluso ante peticiones simultáneas.
// No se simula nada: usa la base de datos del .env (Docker en marcha). Por eso no forma parte
// de `npm test`; se ejecuta con `npm run test:mysql` (o `npm run test:todo` para ambas).
// Crea sus propios usuarios y experiencia y los borra al terminar, aunque la prueba falle.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const PETICIONES = 20;
// Sufijo único para no chocar con datos existentes ni con otra ejecución
const sufijo = `${Date.now()}`;
let autor;
let valorador;
let experiencia;

jest.setTimeout(30000);

beforeAll(async () => {
  const ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  autor = await prisma.usuario.create({
    data: { nombreUsuario: `autor_${sufijo}`, email: `autor_${sufijo}@prueba.local`, passwordHash },
  });
  valorador = await prisma.usuario.create({
    data: { nombreUsuario: `valorador_${sufijo}`, email: `valorador_${sufijo}@prueba.local`, passwordHash },
  });
  experiencia = await prisma.experiencia.create({
    data: {
      titulo: 'Prueba de concurrencia', descripcion: 'Experiencia temporal de la prueba',
      ciudadId: ciudad.id, autorId: autor.id, visibilidad: 'PUBLICA',
    },
  });
});

afterEach(async () => {
  await prisma.valoracion.deleteMany({ where: { experienciaId: experiencia.id } });
});

afterAll(async () => {
  // Orden inverso a la creación: las claves foráneas impiden borrar antes al autor
  if (experiencia) await prisma.experiencia.delete({ where: { id: experiencia.id } });
  await prisma.usuario.deleteMany({ where: { id: { in: [autor?.id, valorador?.id].filter(Boolean) } } });
  await prisma.$disconnect();
});

test('MySQL rechaza una segunda valoración de la misma pareja usuario-experiencia (P2002)', async () => {
  const datos = { usuarioId: valorador.id, experienciaId: experiencia.id, puntuacion: 4 };
  await prisma.valoracion.create({ data: datos });

  await expect(prisma.valoracion.create({ data: datos })).rejects.toMatchObject({ code: 'P2002' });
  expect(await prisma.valoracion.count({ where: { experienciaId: experiencia.id } })).toBe(1);
});

test(`${PETICIONES} peticiones simultáneas del mismo usuario dejan una sola valoración, sin errores`, async () => {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: valorador.email, password: 'secreta123' });
  expect(login.status).toBe(200);

  const respuestas = await Promise.all(Array.from({ length: PETICIONES }, (_, i) =>
    agente.put(`/api/experiencias/${experiencia.id}/valoracion`).send({ puntuacion: (i % 5) + 1 })));

  const estados = respuestas.map((r) => r.status);
  // Exactamente una la crea (201) y las demás actualizan esa misma (200); ningún 500
  expect(estados.filter((e) => e === 201)).toHaveLength(1);
  expect(estados.filter((e) => e === 200)).toHaveLength(PETICIONES - 1);
  expect(new Set(respuestas.map((r) => r.body.id)).size).toBe(1);
  expect(await prisma.valoracion.count({ where: { experienciaId: experiencia.id } })).toBe(1);
});
