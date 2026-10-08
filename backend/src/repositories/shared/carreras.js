// Peticiones simultáneas: errores de Prisma que solo indican que otra petición se adelantó.
// Capa: repositorios (repositories/shared).
// Lo usan: repositories/amistadRepository.js y repositories/seguimientoRepository.js.
//
// Comprobar antes de escribir («¿ya existe?») no basta cuando llegan dos peticiones a la vez:
// las dos pasan la comprobación y una de ellas falla después en MySQL. Esos fallos tienen un
// código de Prisma conocido y no son errores del servidor:
//   P2002: ya existe una fila con ese valor único (la otra petición la creó antes).
//   P2025: la fila que se quería modificar o borrar ya no existe (la otra la borró antes).

// Ejecuta la consulta y devuelve su resultado o, si falla con el código indicado, null.
// Cualquier otro error se relanza, y app.js responde 500.
async function nullSi(codigo, consulta) {
  try {
    return await consulta();
  } catch (err) {
    if (err.code === codigo) return null;
    throw err;
  }
}

module.exports = { nullSi };
