// Página de mi perfil (perfil.html): muestra y permite editar nombreUsuario y ciudad.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js.

const form = document.getElementById('form-perfil');
const errorBox = document.getElementById('error-perfil');
const exitoBox = document.getElementById('exito-perfil');

// Rellena el formulario con los datos actuales del perfil
async function cargarPerfil() {
  try {
    const perfil = await api('/perfil');
    document.getElementById('nombreUsuario').value = perfil.nombreUsuario;
    document.getElementById('email').value = perfil.email;
    document.getElementById('ciudad').value = perfil.ciudad ?? '';

    if (perfil.foto) {
      const img = document.getElementById('foto-perfil');
      img.src = perfil.foto;
      img.classList.remove('d-none');
    }
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/';
  }
}

// Envía los cambios al backend
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('d-none');
  exitoBox.classList.add('d-none');

  const nombreUsuario = document.getElementById('nombreUsuario').value;
  const ciudad = document.getElementById('ciudad').value;

  try {
    await api('/perfil', {
      method: 'PUT',
      body: JSON.stringify({ nombreUsuario, ciudad }),
    });
    exitoBox.textContent = 'Perfil actualizado.';
    exitoBox.classList.remove('d-none');
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('d-none');
  }
});

cargarPerfil();
