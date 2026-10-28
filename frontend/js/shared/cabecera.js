// Comportamiento de la cabecera común de las pantallas con sesión (header.cabecera). Cada página
// la carga después de shared/api.js y shared/pantalla.js. No exporta nada: al cargarse, engancha
// sus eventos.
// Lo usan todas las pantallas con sesión (Inicio, Explorar, Mis planes, Amigos, perfil, ajustes, búsqueda, usuario y experiencia).

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

// Avatar del menú: la foto del usuario en pequeño. Si no tiene o la petición falla, se queda la
// foto por defecto del HTML
const avatar = menuCuenta?.querySelector('img.menu-avatar');
if (avatar) {
  api('/perfil')
    .then((perfil) => {
      if (perfil?.foto) avatar.src = perfil.foto;
    })
    .catch(() => {});
}

// Campana: las solicitudes de amistad pendientes como notificaciones, con un contador. Cada una lleva a
// la persona; «Ver amigos y solicitudes» lleva a /social/amigos.html, donde se aceptan o rechazan.
const menuNotificaciones = document.querySelector('details.menu-notificaciones');

if (menuNotificaciones) {
  const contador = document.getElementById('contador-notificaciones');
  const lista = document.getElementById('lista-notificaciones');
  const sinNotificaciones = document.getElementById('sin-notificaciones');

  // Mismo cierre que el menú de cuenta: clic fuera o Escape
  document.addEventListener('click', (e) => {
    if (!menuNotificaciones.contains(e.target)) menuNotificaciones.open = false;
  });
  menuNotificaciones.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menuNotificaciones.open = false;
      menuNotificaciones.querySelector('summary').focus();
    }
  });

  // Los textos de otras personas se ponen con textContent, nunca como HTML
  function crearNotificacion(solicitud) {
    const enlace = document.createElement('a');
    enlace.className = 'notificacion';
    enlace.href = `/social/usuario.html?nombre=${encodeURIComponent(solicitud.solicitante.nombreUsuario)}`;
    const foto = document.createElement('img');
    foto.src = solicitud.solicitante.foto;
    foto.alt = '';
    foto.width = 32;
    foto.height = 32;
    const texto = document.createElement('span');
    const nombre = document.createElement('strong');
    nombre.textContent = solicitud.solicitante.nombreUsuario;
    texto.append(nombre, ' quiere ser tu amigo');
    enlace.append(foto, texto);
    return enlace;
  }

  api('/amistades/solicitudes')
    .then((solicitudes) => {
      lista.replaceChildren(...solicitudes.map(crearNotificacion));
      sinNotificaciones.classList.toggle('d-none', solicitudes.length !== 0);
      contador.textContent = solicitudes.length;
      contador.classList.toggle('d-none', solicitudes.length === 0);
    })
    .catch(() => {});
}

// El buscador no se envía si no hay texto (aparte de espacios)
document.querySelector('header.cabecera form[role="search"]')?.addEventListener('submit', (e) => {
  if (e.currentTarget.elements.q.value.trim() === '') e.preventDefault();
});
