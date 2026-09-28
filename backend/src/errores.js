// Errores con código HTTP. El manejador de errores de app.js devuelve al cliente
// el código (`status`) y el mensaje de cualquier error creado aquí.
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

module.exports = { crearError };
