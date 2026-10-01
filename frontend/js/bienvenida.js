// Página de bienvenida (bienvenida.html): saluda al usuario con sesión o lo devuelve al login.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js.

async function mostrarBienvenida() {
  try {
    // Se pregunta al servidor quién es el usuario de la sesión actual (lo sabe por la cookie)
    const usuario = await api('/auth/yo');
    // Hay sesión: se pone su nombre en el saludo
    document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;
  } catch {
    // No hay sesión (o el servidor no responde): se vuelve a la página de login
    window.location.href = '/';
  }
}

mostrarBienvenida();
