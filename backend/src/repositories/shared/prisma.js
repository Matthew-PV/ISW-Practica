// Cliente de Prisma compartido. Solo los repositorios deben importarlo.
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
