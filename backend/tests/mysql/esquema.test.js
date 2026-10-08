// Restricciones y valores por defecto del esquema, comprobados en MySQL real (sustituyen a las
// pruebas que leían schema.prisma como texto). Se ejecuta con `npm run test:mysql`.
const { prisma, crearUsuarios, crearExperiencia, borrarUsuarios, pareja } = require('../helpers/datosMysql');

let u;

beforeEach(async () => {
  u = await crearUsuarios(['ana', 'bea']);
});

afterEach(() => borrarUsuarios(u));
afterAll(() => prisma.$disconnect());

test('una experiencia sin visibilidad indicada es PUBLICA (CS-22) y solo admite los tres niveles', async () => {
  expect((await crearExperiencia(u.ana)).visibilidad).toBe('PUBLICA');
  await expect(crearExperiencia(u.ana, { visibilidad: 'SECRETA' })).rejects.toThrow();
});

test('Amistad: PENDIENTE por defecto y una sola fila por pareja, en cualquier sentido (CS-61)', async () => {
  const solicitud = await prisma.amistad.create({ data: { solicitanteId: u.ana.id, destinatarioId: u.bea.id, parejaClave: pareja(u.ana.id, u.bea.id) } });
  expect(solicitud.estado).toBe('PENDIENTE');

  await expect(prisma.amistad.create({ data: { solicitanteId: u.bea.id, destinatarioId: u.ana.id, parejaClave: pareja(u.ana.id, u.bea.id) } }))
    .rejects.toMatchObject({ code: 'P2002' });
});

test('Seguimiento: una sola fila por seguidor y seguido (CS-61)', async () => {
  await prisma.seguimiento.create({ data: { seguidorId: u.ana.id, seguidoId: u.bea.id } });

  await expect(prisma.seguimiento.create({ data: { seguidorId: u.ana.id, seguidoId: u.bea.id } })).rejects.toMatchObject({ code: 'P2002' });
  // El sentido contrario es otro seguimiento distinto
  await expect(prisma.seguimiento.create({ data: { seguidorId: u.bea.id, seguidoId: u.ana.id } })).resolves.toBeTruthy();
});

test('Valoracion: una sola por usuario y experiencia (CS-01)', async () => {
  const experiencia = await crearExperiencia(u.bea);
  await prisma.valoracion.create({ data: { usuarioId: u.ana.id, experienciaId: experiencia.id, puntuacion: 4 } });

  await expect(prisma.valoracion.create({ data: { usuarioId: u.ana.id, experienciaId: experiencia.id, puntuacion: 2 } }))
    .rejects.toMatchObject({ code: 'P2002' });
});
