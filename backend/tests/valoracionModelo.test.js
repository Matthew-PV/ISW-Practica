// CS-01, objetivo 1: contrato de persistencia de las valoraciones.
// Esta prueba no abre MySQL: comprueba el esquema que Prisma convertirá en migración.
const fs = require('fs');
const path = require('path');

const esquema = fs.readFileSync(path.join(__dirname, '../prisma/schema.prisma'), 'utf8');

describe('modelo Valoracion', () => {
  test('guarda usuario, experiencia, puntuación y comentario opcional, con una sola valoración por pareja', () => {
    expect(esquema).toMatch(/model Valoracion\s*\{[^}]*usuarioId\s+Int\s[^}]*experienciaId\s+Int\s[^}]*puntuacion\s+Int\s[^}]*comentario\s+String\?[^}]*@@unique\(\[usuarioId, experienciaId\]\)/);
  });
});
