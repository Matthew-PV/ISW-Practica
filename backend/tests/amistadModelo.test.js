// La tarea 1 de CS-61 define el contrato de persistencia de las amistades.
// Esta prueba no abre MySQL: comprueba el esquema que Prisma convertirá en migración.
const fs = require('fs');
const path = require('path');

const esquema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');

describe('modelo Amistad', () => {
  test('guarda solicitante, destinatario, estado y fecha, y evita duplicar una pareja', () => {
    expect(esquema).toMatch(/enum EstadoAmistad\s*\{[\s\S]*PENDIENTE[\s\S]*ACEPTADA[\s\S]*\}/);
    expect(esquema).toMatch(/model Amistad\s*\{[\s\S]*solicitanteId\s+Int[\s\S]*destinatarioId\s+Int[\s\S]*estado\s+EstadoAmistad[\s\S]*fecha\s+DateTime[\s\S]*@@unique\(\[solicitanteId, destinatarioId\]\)/);
  });
});
