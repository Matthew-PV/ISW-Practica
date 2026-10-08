// usuarioRepository con MySQL real (CS-61, CS-62 y CS-64). Se ejecuta con `npm run test:mysql`.
const { prisma, crearUsuarios, borrarUsuarios } = require('../../helpers/datosMysql');
const usuarioRepository = require('../../../src/repositories/usuarioRepository');

let u;

beforeAll(async () => {
  // Se crean desordenados a propósito; todos comparten el sufijo, que es lo que se busca
  u = await crearUsuarios(['zz', 'aa', 'mm', ...Array.from({ length: 19 }, (_, i) => `n${String(i).padStart(2, '0')}`)]);
});

afterAll(async () => {
  await borrarUsuarios(u);
  await prisma.$disconnect();
});

const sufijo = () => u.aa.nombreUsuario.split('_')[1];

test('la búsqueda excluye a quien busca, ordena por nombre, devuelve como mucho 20 y nunca el email', async () => {
  const encontrados = await usuarioRepository.buscarPorNombre(sufijo(), u.aa.id);

  expect(encontrados).toHaveLength(20);
  expect(encontrados.map((x) => x.id)).not.toContain(u.aa.id);
  const nombres = encontrados.map((x) => x.nombreUsuario);
  expect(nombres).toEqual([...nombres].sort());
  expect(Object.keys(encontrados[0]).sort()).toEqual(['foto', 'id', 'nombreUsuario']);
});

test('el perfil público se busca por nombre, sin email, y es null si no existe', async () => {
  const perfil = await usuarioRepository.obtenerPerfilPublico(u.mm.nombreUsuario);

  expect(perfil).toMatchObject({ id: u.mm.id, nombreUsuario: u.mm.nombreUsuario });
  expect(perfil).not.toHaveProperty('email');
  expect(await usuarioRepository.obtenerPerfilPublico(`nadie_${sufijo()}`)).toBeNull();
});

test('actualizarPassword guarda el hash nuevo', async () => {
  await usuarioRepository.actualizarPassword(u.zz.id, 'hash-nuevo');

  expect((await usuarioRepository.buscarPorId(u.zz.id)).passwordHash).toBe('hash-nuevo');
});
