// La tarea 2 de CS-61 define el contrato de persistencia de los seguimientos.
// Esta prueba no abre MySQL: comprueba el esquema que Prisma convertirá en migración.
const fs = require('fs');
const path = require('path');

const esquema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');

describe('modelo Seguimiento', () => {
  test('guarda quién sigue a quién, la fecha y evita repetir el mismo seguimiento', () => {
    expect(esquema).toMatch(/model Seguimiento\s*\{[\s\S]*seguidorId\s+Int[\s\S]*seguidoId\s+Int[\s\S]*fecha\s+DateTime[\s\S]*@@unique\(\[seguidorId, seguidoId\]\)/);
  });
});
