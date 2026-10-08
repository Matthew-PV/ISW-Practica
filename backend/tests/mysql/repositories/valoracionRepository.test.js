// valoracionRepository.guardar con MySQL real (CS-01): crea la valoración o, si ya existía, la
// actualiza. Las peticiones simultáneas están en tests/mysql/valoracionConcurrencia.test.js.
const { prisma, crearUsuarios, crearExperiencia, borrarUsuarios } = require('../../helpers/datosMysql');
const valoracionRepository = require('../../../src/repositories/valoracionRepository');

let u;
let experiencia;

beforeAll(async () => {
  u = await crearUsuarios(['autor', 'ana']);
  experiencia = await crearExperiencia(u.autor);
});

afterAll(async () => {
  await borrarUsuarios(u);
  await prisma.$disconnect();
});

test('la primera vez crea la valoración y la segunda actualiza esa misma, sin crear otra', async () => {
  const primera = await valoracionRepository.guardar({ usuarioId: u.ana.id, experienciaId: experiencia.id, puntuacion: 3, comentario: 'Bien' });
  const segunda = await valoracionRepository.guardar({ usuarioId: u.ana.id, experienciaId: experiencia.id, puntuacion: 5, comentario: null });

  expect(primera.creada).toBe(true);
  expect(segunda.creada).toBe(false);
  expect(segunda.valoracion).toMatchObject({ id: primera.valoracion.id, puntuacion: 5, comentario: null });
  expect(await prisma.valoracion.count({ where: { experienciaId: experiencia.id } })).toBe(1);
});

test('cualquier otro error al guardar se relanza (P2003: la experiencia no existe)', async () => {
  await expect(valoracionRepository.guardar({ usuarioId: u.ana.id, experienciaId: 2147483647, puntuacion: 3, comentario: null }))
    .rejects.toMatchObject({ code: 'P2003' });
});
