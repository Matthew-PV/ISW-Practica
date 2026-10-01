// Página de mi perfil (perfil.html): muestra y permite editar nombreUsuario y ciudad.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js.

const formulario = document.getElementById('form-perfil');
const cajaError = document.getElementById('error-perfil');
const cajaExito = document.getElementById('exito-perfil');
const boton = formulario.querySelector('button[type="submit"]');

// Pone en el formulario los datos del perfil que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombreUsuario').value = perfil.nombreUsuario;
  document.getElementById('email').value = perfil.email;
  document.getElementById('ciudad').value = perfil.ciudad ?? '';

  if (perfil.foto) {
    const img = document.getElementById('foto-perfil');
    img.src = perfil.foto;
    img.classList.remove('d-none');
  }
}

// Rellena el formulario con los datos actuales del perfil
async function cargarPerfil() {
  try {
    mostrarPerfil(await api('/perfil'));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/';
  }
}

// Al pulsar «Guardar cambios» se envían el nombre de usuario y la ciudad al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se ocultan los mensajes del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  cajaExito.classList.add('d-none');
  boton.disabled = true;

  const datos = {
    nombreUsuario: document.getElementById('nombreUsuario').value,
    ciudad: document.getElementById('ciudad').value,
  };

  try {
    // El backend devuelve el perfil ya guardado (sin espacios sobrantes y normalizado)
    const perfil = await api('/perfil', { method: 'PUT', body: JSON.stringify(datos) });
    mostrarPerfil(perfil);
    cajaExito.textContent = 'Perfil actualizado.';
    cajaExito.classList.remove('d-none');
  } catch (err) {
    // Se muestra el mensaje del backend tal cual
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }
  // Se vuelve a habilitar el botón, haya ido bien o mal
  boton.disabled = false;
});

cargarPerfil();
