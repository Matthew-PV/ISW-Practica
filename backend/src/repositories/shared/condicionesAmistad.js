// Condición de Prisma «amigo aceptado de `usuarioId`» (amistad aceptada, la enviara quien la enviara),
// para aplicarla sobre un Usuario: el autor de una experiencia o de una valoración.
// Capa: repositorios (repositories/shared).
// Lo usan: experienciaRepository.js y valoracionRepository.js.
const esAmigoDe = (usuarioId) => [
  { solicitudesEnviadas: { some: { destinatarioId: usuarioId, estado: 'ACEPTADA' } } },
  { solicitudesRecibidas: { some: { solicitanteId: usuarioId, estado: 'ACEPTADA' } } },
];

module.exports = { esAmigoDe };
