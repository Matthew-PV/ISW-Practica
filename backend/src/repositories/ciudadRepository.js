// Acceso al catálogo de ciudades. Solo los repositorios consultan Prisma.
const prisma = require('./prisma');

// Devuelve la ciudad, o null si no existe.
async function buscarPorId(id) {
  return prisma.ciudad.findUnique({ where: { id } });
}

// Una transacción aplica toda la carga o la deshace si falla.
// No borra ciudades ni cambia sus identificadores, para conservar experiencias.
async function cargarCapitales(capitales) {
  return prisma.$transaction(async (db) => {
    const resultado = { creadas: 0, reutilizadas: 0, existentes: 0 };
    for (const capital of capitales) {
      const { codigoPais, pais, nombre } = capital;
      const existente = await db.ciudad.findUnique({
        where: { codigoPais_nombre: { codigoPais, nombre } },
      });
      if (existente) {
        resultado.existentes++;
        continue;
      }
      // Reutiliza una ciudad antigua solo si hay una coincidencia inequívoca.
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
  }, { timeout: 60000 });
}

// Cierra la conexión con MySQL; la usa prisma/seed.js al terminar la carga.
async function cerrarConexion() {
  await prisma.$disconnect();
}

module.exports = { buscarPorId, cargarCapitales, cerrarConexion };
