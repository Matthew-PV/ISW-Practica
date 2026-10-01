// Pantalla de bienvenida: saluda al usuario con sesión o lo devuelve al login.
// Se ejecuta nada más cargar bienvenida.html. Usa `api` de api.js.

// Se pregunta al servidor quién es el usuario de la sesión actual (lo sabe por la cookie)
api('/auth/yo')
  .then((usuario) => {
    // Hay sesión: se pone su nombre en el saludo
    document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;
  })
  .catch(() => {
    // No hay sesión (o el servidor no responde): se vuelve a la página de login
    window.location.href = '/';
  });
