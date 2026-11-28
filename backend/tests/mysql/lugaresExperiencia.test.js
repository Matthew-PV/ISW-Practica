// CS-50: persistencia y rollback de lugares con MySQL real (`npm run test:mysql`).
const bcrypt = require('bcrypt');
const prisma = require('../../src/repositories/shared/prisma');
const experienciaRepository = require('../../src/repositories/experienciaRepository');

const sufijo = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
const PLAZA_MAYOR = {
  proveedorId: 'demo-plaza-mayor',
  nombre: 'Plaza Mayor',
  tipo: 'Plaza',
  direccion: 'Plaza Mayor',
  lat: 40.415456,
  lon: -3.707381,
  imagen: null,
  web: null,
  nota: 'Primera parada',
};
const GRAN_VIA = {
  proveedorId: 'demo-gran-via',
  nombre: 'Gran Vía',
  tipo: 'Calle',
  direccion: 'Gran Vía',
  lat: 40.42,
  lon: -3.70361,
  imagen: null,
  web: null,
  nota: 'Al final del recorrido',
};

let ciudad;
let autor;
let experiencia;

jest.setTimeout(30000);

beforeAll(async () => {
  ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed` en la base local.');
  autor = await prisma.usuario.create({
    data: {
      nombreUsuario: `lugares_${sufijo}`,
      email: `lugares_${sufijo}@prueba.local`,
      passwordHash: await bcrypt.hash('secreta123', 4),
    },
  });
});

beforeEach(async () => {
  experiencia = await experienciaRepository.crear({
    titulo: `Prueba lugares ${sufijo}`,
    descripcion: 'Experiencia temporal de la prueba',
    ciudadId: ciudad.id,
    visibilidad: 'PUBLICA',
    autorId: autor.id,
    lugares: [PLAZA_MAYOR],
  });
});

afterEach(async () => {
  if (experiencia) await prisma.experiencia.delete({ where: { id: experiencia.id } });
  experiencia = null;
});

afterAll(async () => {
  if (autor) await prisma.usuario.delete({ where: { id: autor.id } });
  await prisma.$disconnect();
});

test('guarda y consulta los lugares en el orden enviado', async () => {
  const consultada = await experienciaRepository.buscarPorId(experiencia.id);

  expect(consultada.lugares.map((lugar) => lugar.proveedorId)).toEqual([
    'demo-plaza-mayor',
  ]);
  expect(consultada.lugares[0]).toMatchObject({ nombre: 'Plaza Mayor', nota: 'Primera parada' });

  await experienciaRepository.actualizar(experiencia.id, { lugares: [GRAN_VIA, PLAZA_MAYOR] });
  const actualizada = await experienciaRepository.buscarPorId(experiencia.id);

  expect(actualizada.lugares.map((lugar) => lugar.proveedorId)).toEqual([
    'demo-gran-via',
    'demo-plaza-mayor',
  ]);
  const filas = await prisma.lugarExperiencia.findMany({
    where: { experienciaId: experiencia.id },
    orderBy: { orden: 'asc' },
  });
  expect(filas.map((lugar) => lugar.orden)).toEqual([0, 1]);
});

test('omitir lugares conserva la lista y enviar [] la vacía', async () => {
  await experienciaRepository.actualizar(experiencia.id, { titulo: 'Título cambiado' });
  let actualizada = await experienciaRepository.buscarPorId(experiencia.id);
  expect(actualizada.lugares.map((lugar) => lugar.proveedorId)).toEqual(['demo-plaza-mayor']);

  await experienciaRepository.actualizar(experiencia.id, { lugares: [] });
  actualizada = await experienciaRepository.buscarPorId(experiencia.id);
  expect(actualizada.lugares).toEqual([]);
});

test('un error al crear lugares revierte tanto el plan como la lista anterior', async () => {
  await expect(experienciaRepository.actualizar(experiencia.id, {
    titulo: 'Este título debe revertirse',
    lugares: [PLAZA_MAYOR, PLAZA_MAYOR],
  })).rejects.toMatchObject({ code: 'P2002' });

  const trasError = await experienciaRepository.buscarPorId(experiencia.id);
  expect(trasError.titulo).toBe(`Prueba lugares ${sufijo}`);
  expect(trasError.lugares.map((lugar) => lugar.proveedorId)).toEqual(['demo-plaza-mayor']);
});
