// Campos de un usuario que se pueden enseñar a cualquiera: nunca su email ni el hash de su
// contraseña. Se usan en el `select` de toda consulta que devuelve a otra persona.
// Capa: repositorios (repositories/shared).
// Lo usan: repositories/amistadRepository.js, experienciaRepository.js, seguimientoRepository.js,
//          usuarioRepository.js y valoracionRepository.js.

const USUARIO_PUBLICO = { id: true, nombreUsuario: true, foto: true };

module.exports = { USUARIO_PUBLICO };
