// Acceso a los enlaces para restablecer la contraseña en MySQL (CS-64).
// Capa: repositorios (repositories).
// Lo usa: services/authService.js.
// Usa: repositories/shared/prisma.js (la conexión con MySQL).
//
// Solo se guarda el hash del token del enlace (ver TokenRecuperacion en schema.prisma). Los
// datos llegan validados desde el servicio.
const prisma = require('./shared/prisma');

// Guarda un enlace nuevo: `{ usuarioId, tokenHash, caducaEn }`.
async function crear({ usuarioId, tokenHash, caducaEn }) {
  return prisma.tokenRecuperacion.create({ data: { usuarioId, tokenHash, caducaEn } });
}

// Devuelve el enlace si existe, no se ha usado y no ha caducado en el momento `ahora`, con el id
// y el nombre de su usuario; si no, null.
async function buscarVigente(tokenHash, ahora) {
  return prisma.tokenRecuperacion.findFirst({
    where: { tokenHash, usadoEn: null, caducaEn: { gt: ahora } },
    include: { usuario: { select: { id: true, nombreUsuario: true } } },
  });
}

// Usa el enlace y guarda el hash de la nueva contraseña, las dos cosas o ninguna (transacción).
// El enlace se marca como usado con un UPDATE que solo afecta a la fila si sigue sin usar y sin
// caducar: con dos peticiones simultáneas, MySQL deja que solo una lo consiga (la otra encuentra
// la fila ya usada). Devuelve true si se ha cambiado la contraseña. Afecta también a la tabla
// Usuario porque las dos escrituras tienen que ir en la misma transacción.
async function restablecerPassword(tokenHash, passwordHash, ahora) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.tokenRecuperacion.updateMany({
      where: { tokenHash, usadoEn: null, caducaEn: { gt: ahora } },
      data: { usadoEn: ahora },
    });
    if (count !== 1) {
      return false;
    }
    const { usuarioId } = await tx.tokenRecuperacion.findUnique({ where: { tokenHash } });
    await tx.usuario.update({ where: { id: usuarioId }, data: { passwordHash } });
    return true;
  });
}

module.exports = { crear, buscarVigente, restablecerPassword };
