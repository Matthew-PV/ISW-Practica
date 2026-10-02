// Acceso al catálogo de ciudades. Solo los repositorios consultan Prisma.
// Capa: repositorios (repositories).
// Lo usan: services/experienciaService.js (buscarPorId), services/ciudadService.js
//          (listar, cargarCapitales) y prisma/seed.js (cerrarConexion).
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
const prisma = require('./shared/prisma');

// Devuelve la ciudad, o null si no existe.
async function buscarPorId(id) {
  return prisma.ciudad.findUnique({ where: { id } });
}

// Devuelve todo el catálogo ordenado por nombre (para el desplegable de ciudades).
async function listar() {
  return prisma.ciudad.findMany({
    select: { id: true, nombre: true, pais: true },
    orderBy: { nombre: 'asc' },
  });
}

// Una transacción aplica toda la carga o la deshace si falla.
// No borra ciudades ni cambia sus identificadores, para conservar experiencias.
// - `capitales`: lista de { codigoPais, pais, nombre }.
// Para cada capital:
//   1. si ya existe (mismo país y nombre), no se toca → `existentes`;
//   2. si hay una ciudad antigua con ese nombre y sin país (de antes de tener catálogo),
//      y es solo una, se le pone el país → `reutilizadas`;
//   3. si no, se crea → `creadas`.
// Devuelve el recuento { creadas, reutilizadas, existentes }. Se puede repetir sin duplicar nada.
async function cargarCapitales(capitales) {
  // `db` es Prisma dentro de la transacción: todo lo que se haga con él va junto
  return prisma.$transaction(async (db) => {
    const resultado = { creadas: 0, reutilizadas: 0, existentes: 0 };
    for (const capital of capitales) {
      const { codigoPais, pais, nombre } = capital;
      // codigoPais_nombre es el índice único @@unique([codigoPais, nombre]) del schema
      const existente = await db.ciudad.findUnique({
        where: { codigoPais_nombre: { codigoPais, nombre } },
      });
      if (existente) {
        resultado.existentes++;
        continue;
      }
      // Reutiliza una ciudad antigua solo si hay una coincidencia inequívoca.
      // (take: 2 basta para saber si hay una o más de una)
      const anteriores = await db.ciudad.findMany({
        where: { nombre, codigoPais: null, pais: null }, take: 2,
      });
      if (anteriores.length === 1) {
        await db.ciudad.update({ where: { id: anteriores[0].id }, data: { codigoPais, pais } });
        resultado.reutilizadas++;
      } else {
        await db.ciudad.create({ data: { codigoPais, pais, nombre } });
        resultado.creadas++;
      }
    }
    return resultado;
  }, { timeout: 60000 }); // hasta 60 s en vez de los 5 s por defecto: son unas 200 ciudades con varias consultas cada una
}

// Cierra la conexión con MySQL; la usa prisma/seed.js al terminar la carga.
// (El servidor no la necesita: mantiene la conexión abierta mientras funciona.)
async function cerrarConexion() {
  await prisma.$disconnect();
}

module.exports = { buscarPorId, listar, cargarCapitales, cerrarConexion };
