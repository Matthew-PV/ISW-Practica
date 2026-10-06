// CS-22, objetivo 1 (prerrequisito de CS-01): cada experiencia tiene una visibilidad.
// Esta prueba no abre MySQL: comprueba el esquema que Prisma convertirá en migración.
const fs = require('fs');
const path = require('path');

const esquema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');

describe('visibilidad de Experiencia', () => {
  test('existen exactamente los niveles privada, amigos y pública', () => {
    expect(esquema).toMatch(/enum Visibilidad\s*\{\s*PRIVADA\s+AMIGOS\s+PUBLICA\s*\}/);
  });

  test('cada experiencia tiene visibilidad, pública por defecto', () => {
    expect(esquema).toMatch(/model Experiencia\s*\{[^}]*visibilidad\s+Visibilidad\s+@default\(PUBLICA\)/);
  });
});
