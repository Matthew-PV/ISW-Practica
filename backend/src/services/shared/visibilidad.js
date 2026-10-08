// Regla de visibilidad de las experiencias (CS-22): quién puede ver cada una.
// Capa: servicios (services), en shared/ porque la usan varias funcionalidades.
// Lo usa: services/experienciaService.js (CS-30, CS-44 y CS-63). Las valoraciones la aplican a
//         través de experienciaService.obtenerExperiencia.
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

// Devuelve los niveles de visibilidad que `usuarioId` puede ver entre las experiencias de
// `autorId`, para filtrar un listado en una sola consulta (CS-44). Es la misma regla que
// puedeVerExperiencia:
// - el autor: todas, también las privadas;
// - un amigo con la amistad aceptada: las de amigos y las públicas;
// - cualquier otro (también un seguidor o una solicitud pendiente): solo las públicas.
async function nivelesVisibles(usuarioId, autorId) {
  if (usuarioId === autorId) return ['PRIVADA', 'AMIGOS', 'PUBLICA'];
  if (await amistadService.sonAmigos(usuarioId, autorId)) return ['AMIGOS', 'PUBLICA'];
  return ['PUBLICA'];
}

module.exports = { puedeVerExperiencia, nivelesVisibles };
