// Página del perfil de otro usuario (usuario.html): muestra su foto, nombre, ciudad, el número de
// amigos y seguidores, el botón de amistad que corresponde a la relación con él y el de seguir.
// Se abre con usuario.html?nombre=ana. Si el usuario no existe lo indica, y si es el propio usuario
// va a perfil.html. Debajo, sus experiencias que puedo ver (CS-44). Usa `api` de shared/api.js y
// `mostrarExperienciasDe` y `recargarExperiencias` de shared/experiencias.js, y `mostrarMensaje`,
// `ocultarMensaje` e `irAlLogin` de shared/pantalla.js.

const nombre = new URLSearchParams(window.location.search).get('nombre');
const botonesAmistad = document.getElementById('botones-amistad');
const botonSeguir = document.getElementById('boton-seguir');
const cajaError = document.getElementById('error-usuario');

// Crea un botón con su texto y lo añade a la zona indicada
function crearBoton(zona, texto, clase, alPulsar) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = `btn ${clase}`;
  boton.textContent = texto;
  boton.addEventListener('click', alPulsar);
  zona.append(boton);
  return boton;
}

// Hace una petición de amistad o de seguimiento y, si sale bien, vuelve a pedir el perfil para actualizar
// los botones y los contadores sin recargar la página. Si falla, se muestra el mensaje del backend.
async function actuar(ruta, opciones) {
  ocultarMensaje(cajaError);
  try {
    await api(ruta, opciones);
    await cargarPerfil();
    // Una amistad aceptada o eliminada cambia qué experiencias suyas se pueden ver (CS-44)
    if (ruta.startsWith('/amistades')) {
      await recargarExperiencias();
    }
  } catch (err) {
    mostrarMensaje(cajaError, err.message);
  }
}

// Muestra el botón (o botones) de amistad que corresponden a la relación con este usuario
function mostrarBotonesAmistad(perfil) {
  botonesAmistad.replaceChildren();
  const { amistad, amistadId } = perfil.relacion;
  const ruta = `/amistades/${amistadId}`;
  const responder = (aceptar) => actuar(ruta, { method: 'PATCH', body: JSON.stringify({ aceptar }) });

  if (amistad === 'ninguna') {
    crearBoton(botonesAmistad, 'Añadir amigo', 'btn-primary', () =>
      actuar('/amistades', { method: 'POST', body: JSON.stringify({ destinatarioId: perfil.id }) }));
  } else if (amistad === 'enviada') {
    crearBoton(botonesAmistad, 'Solicitud enviada', 'btn-secondary', () => {}).disabled = true;
  } else if (amistad === 'recibida') {
    crearBoton(botonesAmistad, 'Aceptar', 'btn-success', () => responder(true));
    crearBoton(botonesAmistad, 'Rechazar', 'btn-outline-danger', () => responder(false));
  } else if (amistad === 'amigos') {
    crearBoton(botonesAmistad, 'Eliminar amigo', 'btn-outline-danger', () => {
      if (window.confirm(`¿Seguro que quieres eliminar a ${perfil.nombreUsuario} de tus amigos?`)) {
        actuar(ruta, { method: 'DELETE' });
      }
    });
  }
}

// Muestra «Seguir» o «Dejar de seguir» según si ya sigo a este usuario
function mostrarBotonSeguir(perfil) {
  botonSeguir.replaceChildren();
  if (perfil.relacion.siguiendo) {
    crearBoton(botonSeguir, 'Dejar de seguir', 'btn-outline-secondary', () =>
      actuar(`/seguimientos/${perfil.id}`, { method: 'DELETE' }));
  } else {
    crearBoton(botonSeguir, 'Seguir', 'btn-outline-primary', () =>
      actuar('/seguimientos', { method: 'POST', body: JSON.stringify({ seguidoId: perfil.id }) }));
  }
}

// Pone en la página los datos del perfil público que devuelve el backend
function mostrarPerfil(perfil) {
  // Si el perfil es el mío, la pantalla de otro usuario no tiene sentido: se va a «Mi perfil»
  if (perfil.esPropio) {
    window.location.href = 'perfil.html';
    return;
  }
  document.getElementById('nombre-usuario').textContent = perfil.nombreUsuario;
  document.getElementById('ciudad').textContent = perfil.ciudad ?? '';
  document.getElementById('foto-usuario').src = perfil.foto;
  document.getElementById('amigos').textContent = perfil.amigos;
  document.getElementById('seguidores').textContent = perfil.seguidores;
  mostrarBotonesAmistad(perfil);
  mostrarBotonSeguir(perfil);
}

// Pide el perfil del usuario indicado en la dirección (?nombre=...). Devuelve true si se ha
// mostrado (existe y no es el propio).
async function cargarPerfil() {
  try {
    const perfil = await api(`/usuarios/${encodeURIComponent(nombre)}`);
    mostrarPerfil(perfil);
    return !perfil.esPropio;
  } catch (err) {
    if (err.status === 404) {
      document.getElementById('perfil-usuario').classList.add('d-none');
      document.getElementById('no-encontrado').classList.remove('d-none');
    } else {
      // Sin sesión (o el servidor no responde): se vuelve al login
      irAlLogin();
    }
    return false;
  }
}

// Al abrir la página: el perfil y, si se muestra, sus experiencias. Las acciones de amistad y
// seguimiento vuelven a pedir solo el perfil.
cargarPerfil().then((mostrado) => {
  if (mostrado) {
    mostrarExperienciasDe(nombre);
  }
});
