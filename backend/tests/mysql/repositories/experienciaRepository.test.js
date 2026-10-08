// CS-63 y CS-30: el detalle de una experiencia incluye a su autor solo con sus datos públicos.
// Con MySQL real, porque lo que se comprueba es la consulta de Prisma: con el repositorio
// simulado no se vería qué columnas trae. Se ejecuta con `npm run test:mysql`.
// Crea sus propios usuarios y experiencia y los borra al terminar, aunque la prueba falle.
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../../src/app');
const prisma = require('../../../src/repositories/shared/prisma');
const experienciaRepository = require('../../../src/repositories/experienciaRepository');

// Sufijo único para no chocar con datos existentes ni con otra ejecución
const sufijo = `${Date.now()}`;
let autor;
let lector;
let experiencia;

jest.setTimeout(30000);

beforeAll(async () => {
  const ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  const passwordHash = await bcrypt.hash('secreta123', 4);
  autor = await prisma.usuario.create({
    data: { nombreUsuario: `autor_${sufijo}`, email: `autor_${sufijo}@prueba.local`, passwordHash },
  });
  lector = await prisma.usuario.create({
    data: { nombreUsuario: `lector_${sufijo}`, email: `lector_${sufijo}@prueba.local`, passwordHash },
  });
  experiencia = await prisma.experiencia.create({
    data: {
      titulo: 'Prueba del autor público', descripcion: 'Experiencia temporal de la prueba',
      ciudadId: ciudad.id, autorId: autor.id, visibilidad: 'PUBLICA',
    },
  });
});

afterAll(async () => {
  // Orden inverso a la creación: las claves foráneas impiden borrar antes al autor
  if (experiencia) await prisma.experiencia.delete({ where: { id: experiencia.id } });
  await prisma.usuario.deleteMany({ where: { id: { in: [autor?.id, lector?.id].filter(Boolean) } } });
  await prisma.$disconnect();
});

test('buscarPorId devuelve el autor solo con id, nombreUsuario y foto', async () => {
  const encontrada = await experienciaRepository.buscarPorId(experiencia.id);

  expect(encontrada.autor).toEqual({ id: autor.id, nombreUsuario: autor.nombreUsuario, foto: null });
});

test('GET /api/experiencias/:id no envía el email ni el hash de la contraseña del autor', async () => {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: lector.email, password: 'secreta123' });
  expect(login.status).toBe(200);

  const res = await agente.get(`/api/experiencias/${experiencia.id}`);

  expect(res.status).toBe(200);
  expect(res.body.autor.nombreUsuario).toBe(autor.nombreUsuario);
  expect(res.body.autor).not.toHaveProperty('email');
  expect(res.body.autor).not.toHaveProperty('passwordHash');
});
