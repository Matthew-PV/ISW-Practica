// Pantalla de bienvenida: saluda al usuario con sesión o lo devuelve al login.
api('/auth/yo')
  .then((usuario) => {
    document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;
  })
  .catch(() => {
    window.location.href = '/';
  });
