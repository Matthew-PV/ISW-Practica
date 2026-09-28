// Página principal (login): muestra en la barra si el servidor y la base de datos responden.
// Si algo falla, el motivo se ve al pasar el ratón por encima.
const estado = document.getElementById('estado-servidor');

api('/health')
  .then(() => {
    estado.textContent = 'conectado';
    estado.className = 'badge text-bg-success';
  })
  .catch((err) => {
    estado.textContent = 'sin conexión';
    estado.title = err.message;
    estado.className = 'badge text-bg-danger';
  });
