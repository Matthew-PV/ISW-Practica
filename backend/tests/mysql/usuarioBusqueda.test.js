// CS-61: con MySQL real, la búsqueda de usuarios devuelve los resultados ordenados por nombre.
// Se ejecuta con `npm run test:mysql`. Crea sus propios usuarios y los borra al terminar.
const bcrypt = require('bcrypt');
const prisma = require('../../src/repositories/shared/prisma');
const usuarioRepository = require('../../src/repositories/usuarioRepository');

// Sufijo único: solo estos usuarios contienen el texto buscado
const sufijo = `${Date.now()}`;
let creados = [];

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secreta123', 4);
  // Se crean desordenados a propósito
  for (const nombre of ['zz', 'aa', 'mm']) {
    creados.push(await prisma.usuario.create({
      data: { nombreUsuario: `${nombre}_${sufijo}`, email: `${nombre}_${sufijo}@prueba.local`, passwordHash },
    }));
  }
});

afterAll(async () => {
  await prisma.usuario.deleteMany({ where: { id: { in: creados.map((usuario) => usuario.id) } } });
  await prisma.$disconnect();
});

test('devuelve las coincidencias ordenadas por nombre de usuario', async () => {
  const encontrados = await usuarioRepository.buscarPorNombre(sufijo, 0);

  expect(encontrados.map((usuario) => usuario.nombreUsuario)).toEqual([`aa_${sufijo}`, `mm_${sufijo}`, `zz_${sufijo}`]);
});
