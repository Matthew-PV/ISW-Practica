// Cliente de Prisma compartido. Solo los repositorios deben importarlo.
// Capa: repositorios (repositories), en shared/ porque no es de ninguna tabla concreta.
// Lo usan: todos los repositorios que leen o escriben en MySQL y shared/sesionStore.js.
// Usa: @prisma/client, generado a partir de prisma/schema.prisma.
//
// Se crea un único cliente para toda la aplicación: cada cliente abre su propio grupo de
// conexiones con MySQL, y crear uno por archivo las multiplicaría. La dirección de la base
// de datos la toma de DATABASE_URL en .env.
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
