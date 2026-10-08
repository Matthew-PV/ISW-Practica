// Datos de prueba para las pruebas con MySQL real (tests/mysql). No es un archivo de pruebas.
// Cada archivo crea sus propios usuarios con un sufijo único (no chocan con otros datos ni con otra
// ejecución) y los borra al terminar, con todo lo que dependa de ellos.
const bcrypt = require('bcrypt');
const prisma = require('../../src/repositories/shared/prisma');

const PASSWORD = 'Secreta123';

// Sufijo distinto en cada llamada
const nuevoSufijo = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

// Clave de la pareja sin orden, como la calcula amistadRepository.crear
const pareja = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

// Crea un usuario por nombre: crearUsuarios(['ana', 'bea']) → { ana, bea }. Contraseña: PASSWORD.
async function crearUsuarios(nombres) {
  const sufijo = nuevoSufijo();
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  const usuarios = {};
  for (const nombre of nombres) {
    usuarios[nombre] = await prisma.usuario.create({
      data: { nombreUsuario: `${nombre}_${sufijo}`, email: `${nombre}_${sufijo}@prueba.local`, passwordHash },
    });
  }
  return usuarios;
}

// Amistad entre dos usuarios, ya aceptada o pendiente
const crearAmistad = (solicitante, destinatario, estado = 'ACEPTADA') => prisma.amistad.create({
  data: { solicitanteId: solicitante.id, destinatarioId: destinatario.id, estado, parejaClave: pareja(solicitante.id, destinatario.id) },
});

// Una experiencia del autor indicado con la primera ciudad del catálogo
async function crearExperiencia(autor, datos = {}) {
  const ciudad = await prisma.ciudad.findFirst();
  if (!ciudad) throw new Error('No hay ciudades: ejecuta antes `npm run db:seed`');
  return prisma.experiencia.create({
    data: { titulo: 'Prueba', descripcion: 'Experiencia de prueba', ciudadId: ciudad.id, autorId: autor.id, ...datos },
  });
}

// Borra los usuarios y todo lo que depende de ellos, en el orden que permiten las claves foráneas
async function borrarUsuarios(usuarios) {
  const ids = Object.values(usuarios).filter(Boolean).map((usuario) => usuario.id);
  const deEllos = { in: ids };
  await prisma.valoracion.deleteMany({ where: { OR: [{ usuarioId: deEllos }, { experiencia: { autorId: deEllos } }] } });
  await prisma.amistad.deleteMany({ where: { OR: [{ solicitanteId: deEllos }, { destinatarioId: deEllos }] } });
  await prisma.seguimiento.deleteMany({ where: { OR: [{ seguidorId: deEllos }, { seguidoId: deEllos }] } });
  await prisma.experiencia.deleteMany({ where: { autorId: deEllos } });
  await prisma.usuario.deleteMany({ where: { id: deEllos } });
}

module.exports = { prisma, PASSWORD, pareja, crearUsuarios, crearAmistad, crearExperiencia, borrarUsuarios };
