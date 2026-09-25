const estado = document.getElementById('estado-servidor');

api('/health')
  .then(() => {
    estado.textContent = 'conectado';
    estado.className = 'badge text-bg-success';
  })
  .catch(() => {
    estado.textContent = 'sin conexión';
    estado.className = 'badge text-bg-danger';
  });
