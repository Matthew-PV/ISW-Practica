// Comportamiento de la cabecera común de las pantallas con sesión (header.cabecera). Cada página
// la carga después de shared/api.js y shared/pantalla.js. No exporta nada: al cargarse, engancha
// sus eventos.
// Lo usan: /cuenta/bienvenida.html, /cuenta/perfil.html, /social/personas.html, /social/usuario.html y /experiencias/experiencia.html.

const menuCuenta = document.querySelector('details.menu-cuenta');

// Cierra la sesión en el servidor y vuelve al inicio de sesión. Mientras espera, el botón queda
// desactivado y marcado como ocupado; si falla, se restaura y se muestra un aviso.
async function cerrarSesion(evento) {
  const boton = evento.currentTarget;
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');
  boton.textContent = 'Cerrando sesión…';
  try {
    await api('/auth/logout', { method: 'POST' });
    window.location.href = '/acceso/iniciar-sesion.html';
  } catch {
    boton.disabled = false;
    boton.removeAttribute('aria-busy');
    boton.textContent = textoOriginal;
    mostrarAvisoCierre();
  }
}

// Crea (una sola vez) el aviso de error justo después de la cabecera
function mostrarAvisoCierre() {
  if (document.querySelector('.cabecera-aviso')) return;
  const aviso = document.createElement('div');
  aviso.className = 'alert alert-danger cabecera-aviso';
  aviso.setAttribute('role', 'alert');
  aviso.textContent = 'No se ha podido cerrar la sesión. Inténtalo de nuevo.';
  document.querySelector('header.cabecera').after(aviso);
}

for (const boton of document.querySelectorAll('button[data-cerrar-sesion]')) {
  boton.addEventListener('click', cerrarSesion);
}

if (menuCuenta) {
  // Clic fuera del menú: se cierra
  document.addEventListener('click', (e) => {
    if (!menuCuenta.contains(e.target)) menuCuenta.open = false;
  });

  // Escape: se cierra y el foco vuelve al resumen
  menuCuenta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menuCuenta.open = false;
      menuCuenta.querySelector('summary').focus();
    }
  });

  // Al elegir una opción también se cierra y el foco vuelve al resumen
  menuCuenta.querySelector('.menu-cuenta-lista')?.addEventListener('click', () => {
    menuCuenta.open = false;
    menuCuenta.querySelector('summary').focus();
  });
}

// El buscador no se envía si no hay texto (aparte de espacios)
document.querySelector('header.cabecera form[role="search"]')?.addEventListener('submit', (e) => {
  if (e.currentTarget.elements.q.value.trim() === '') e.preventDefault();
});
