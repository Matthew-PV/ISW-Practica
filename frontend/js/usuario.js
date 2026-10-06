// Página del perfil de otro usuario (usuario.html): muestra su foto, nombre, ciudad y el número
// de amigos y seguidores. Se abre con usuario.html?nombre=ana. Usa `api` de shared/api.js.

// Pone en la página los datos del perfil público que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombre-usuario').textContent = perfil.nombreUsuario;
  document.getElementById('ciudad').textContent = perfil.ciudad ?? '';
  document.getElementById('foto-usuario').src = perfil.foto;
  document.getElementById('amigos').textContent = perfil.amigos;
  document.getElementById('seguidores').textContent = perfil.seguidores;
}

// Pide el perfil del usuario indicado en la dirección (?nombre=...)
async function cargarPerfil() {
  const nombre = new URLSearchParams(window.location.search).get('nombre');
  try {
    mostrarPerfil(await api(`/usuarios/${encodeURIComponent(nombre)}`));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/';
  }
}

cargarPerfil();
