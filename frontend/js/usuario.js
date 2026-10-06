// Página del perfil de otro usuario (usuario.html): muestra su foto, nombre, ciudad, el número de
// amigos y seguidores, y el botón de amistad que corresponde a la relación con él.
// Se abre con usuario.html?nombre=ana. Usa `api` de shared/api.js.

const nombre = new URLSearchParams(window.location.search).get('nombre');
const botonesAmistad = document.getElementById('botones-amistad');
const cajaError = document.getElementById('error-usuario');

// Crea un botón con su texto y lo añade a la zona de botones de amistad
function crearBoton(texto, clase, alPulsar) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = `btn ${clase}`;
  boton.textContent = texto;
  boton.addEventListener('click', alPulsar);
  botonesAmistad.append(boton);
  return boton;
}

// Hace una petición de amistad y, si sale bien, vuelve a pedir el perfil para actualizar
// los botones y los contadores sin recargar la página. Si falla, se muestra el mensaje del backend.
async function actuar(ruta, opciones) {
  cajaError.classList.add('d-none');
  try {
    await api(ruta, opciones);
    await cargarPerfil();
  } catch (err) {
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }
}

// Muestra el botón (o botones) de amistad que corresponden a la relación con este usuario
function mostrarBotonesAmistad(perfil) {
  botonesAmistad.replaceChildren();
  const { amistad, amistadId } = perfil.relacion;
  const ruta = `/amistades/${amistadId}`;
  const responder = (aceptar) => actuar(ruta, { method: 'PATCH', body: JSON.stringify({ aceptar }) });

  if (amistad === 'ninguna') {
    crearBoton('Añadir amigo', 'btn-primary', () =>
      actuar('/amistades', { method: 'POST', body: JSON.stringify({ destinatarioId: perfil.id }) }));
  } else if (amistad === 'enviada') {
    crearBoton('Solicitud enviada', 'btn-secondary', () => {}).disabled = true;
  } else if (amistad === 'recibida') {
    crearBoton('Aceptar', 'btn-success', () => responder(true));
    crearBoton('Rechazar', 'btn-outline-danger', () => responder(false));
  } else if (amistad === 'amigos') {
    crearBoton('Eliminar amigo', 'btn-outline-danger', () => {
      if (window.confirm(`¿Seguro que quieres eliminar a ${perfil.nombreUsuario} de tus amigos?`)) {
        actuar(ruta, { method: 'DELETE' });
      }
    });
  }
}

// Pone en la página los datos del perfil público que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombre-usuario').textContent = perfil.nombreUsuario;
  document.getElementById('ciudad').textContent = perfil.ciudad ?? '';
  document.getElementById('foto-usuario').src = perfil.foto;
  document.getElementById('amigos').textContent = perfil.amigos;
  document.getElementById('seguidores').textContent = perfil.seguidores;
  mostrarBotonesAmistad(perfil);
}

// Pide el perfil del usuario indicado en la dirección (?nombre=...)
async function cargarPerfil() {
  try {
    mostrarPerfil(await api(`/usuarios/${encodeURIComponent(nombre)}`));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/';
  }
}

cargarPerfil();
