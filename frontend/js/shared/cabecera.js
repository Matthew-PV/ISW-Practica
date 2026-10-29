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
    window.location.href = '/paginas/acceso/iniciar-sesion.html';
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
// la persona y se puede aceptar o rechazar desde ahí; «Ver amigos y solicitudes» lleva a /paginas/social/amigos.html.
// Cuando una solicitud se responde (aquí o en la página Amigos) se emite 'solicitud-respondida' con
// { detail: { id } } y las dos partes se ponen al día.
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

  // El contador son las solicitudes que siguen pendientes (las ya respondidas pierden data-solicitud-id)
  function actualizarContador() {
    const pendientes = lista.querySelectorAll('[data-solicitud-id]').length;
    contador.textContent = pendientes;
    contador.classList.toggle('d-none', pendientes === 0);
    sinNotificaciones.classList.toggle('d-none', lista.children.length !== 0);
  }

  // Sustituye la notificación por un mensaje de resultado (con enlace al perfil si se acepta) y le da el
  // foco, que si no se perdería al desaparecer el botón pulsado.
  function mostrarResultado(notificacion, solicitud, aceptada) {
    delete notificacion.dataset.solicitudId;
    const mensaje = document.createElement('p');
    mensaje.className = 'notificacion-resultado';
    mensaje.tabIndex = -1;
    if (aceptada) {
      const enlace = document.createElement('a');
      enlace.href = `/paginas/social/usuario.html?nombre=${encodeURIComponent(solicitud.solicitante.nombreUsuario)}`;
      enlace.textContent = 'Ver perfil';
      mensaje.append(`Ahora sois amigos de ${solicitud.solicitante.nombreUsuario}. `, enlace);
    } else {
      mensaje.textContent = 'Solicitud rechazada.';
    }
    notificacion.replaceChildren(mensaje);
    actualizarContador();
    mensaje.focus();
  }

  async function responder(notificacion, solicitud, aceptar) {
    const botones = notificacion.querySelectorAll('button');
    botones.forEach((boton) => { boton.disabled = true; });
    try {
      await api(`/amistades/${solicitud.id}`, { method: 'PATCH', body: JSON.stringify({ aceptar }) });
      mostrarResultado(notificacion, solicitud, aceptar);
      document.dispatchEvent(new CustomEvent('solicitud-respondida', { detail: { id: solicitud.id } }));
    } catch (err) {
      botones.forEach((boton) => { boton.disabled = false; });
      let error = notificacion.querySelector('.notificacion-error');
      if (!error) {
        error = document.createElement('p');
        error.className = 'notificacion-error';
        error.setAttribute('role', 'alert');
        notificacion.append(error);
      }
      error.textContent = err.message;
    }
  }

  // Los textos de otras personas se ponen con textContent, nunca como HTML
  function crearNotificacion(solicitud) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.dataset.solicitudId = solicitud.id;

    const enlace = document.createElement('a');
    enlace.className = 'notificacion-persona';
    enlace.href = `/paginas/social/usuario.html?nombre=${encodeURIComponent(solicitud.solicitante.nombreUsuario)}`;
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

    const acciones = document.createElement('div');
    acciones.className = 'notificacion-acciones';
    for (const [textoBoton, clase, aceptar] of [
      ['Aceptar', 'btn-primary', true],
      ['Rechazar', 'btn-outline-secondary', false],
    ]) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = `btn btn-sm ${clase}`;
      boton.textContent = textoBoton;
      boton.addEventListener('click', () => responder(notificacion, solicitud, aceptar));
      acciones.append(boton);
    }

    notificacion.append(enlace, acciones);
    return notificacion;
  }

  // Otra parte de la página (la lista de Amigos) respondió una solicitud
  document.addEventListener('solicitud-respondida', (e) => {
    lista.querySelector(`[data-solicitud-id="${e.detail.id}"]`)?.remove();
    actualizarContador();
  });

  api('/amistades/solicitudes')
    .then((solicitudes) => {
      lista.replaceChildren(...solicitudes.map(crearNotificacion));
      actualizarContador();
    })
    .catch(() => {});
}

// El buscador no se envía si no hay texto (aparte de espacios)
document.querySelector('header.cabecera form[role="search"]')?.addEventListener('submit', (e) => {
  if (e.currentTarget.elements.q.value.trim() === '') e.preventDefault();
});
