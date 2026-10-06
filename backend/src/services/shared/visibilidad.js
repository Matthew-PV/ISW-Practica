// Regla de visibilidad de las experiencias (CS-22): quién puede ver cada una.
// Capa: servicios (services), en shared/ porque la usan varias funcionalidades.
// Lo usa: services/valoracionService.js. Lo reutilizarán CS-02, CS-30 y CS-63.
// Usa: services/amistadService.js (sonAmigos, que solo cuenta amistades aceptadas).
const amistadService = require('../amistadService');

// Devuelve true si el usuario puede ver la experiencia:
// - su autor, siempre;
// - PUBLICA: cualquiera;
// - AMIGOS: solo quien tiene una amistad aceptada con el autor;
// - PRIVADA: nadie más.
// - `usuarioId`: el usuario que quiere verla (el de la sesión).
// - `experiencia`: al menos { autorId, visibilidad }.
async function puedeVerExperiencia(usuarioId, experiencia) {
  if (experiencia.autorId === usuarioId) return true;
  if (experiencia.visibilidad === 'PUBLICA') return true;
  if (experiencia.visibilidad === 'AMIGOS') {
    return amistadService.sonAmigos(usuarioId, experiencia.autorId);
  }
  return false;
}

module.exports = { puedeVerExperiencia };
