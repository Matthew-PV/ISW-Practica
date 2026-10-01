// Errores con código HTTP. El manejador de errores de app.js devuelve al cliente
// el código (`status`) y el mensaje de cualquier error creado aquí.
// Capa: común a todas (no pertenece a ninguna).
// Lo usan: los servicios (services/) y los middlewares (middlewares/).
//
// Así un servicio puede cortar la petición con un simple
//   throw crearError('El email no es válido', 400);
// sin saber nada de Express: el error sube solo hasta app.js, que responde
// { "error": "El email no es válido" } con código 400.

// Crea un Error normal con el código HTTP que debe recibir el cliente.
// - `mensaje`: texto en español que verá el usuario tal cual.
// - `status`: código HTTP (400 datos no válidos, 401 sin sesión, etc.).
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

module.exports = { crearError };
