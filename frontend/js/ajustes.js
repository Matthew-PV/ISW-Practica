// Página de ajustes (ajustes.html): edición de nombreUsuario, ciudad, foto y contraseña.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js, `ocultarCargando` de
// shared/pantalla.js, `activarPestanas` de shared/pestanas.js y `mostrarRequisitosPassword` de shared/password.js (CS-64).

activarPestanas(document.getElementById('pestanas-ajustes'));

const formulario = document.getElementById('form-perfil');
const cajaError = document.getElementById('error-perfil');
const cajaExito = document.getElementById('exito-perfil');
const boton = formulario.querySelector('button[type="submit"]');
const textoBoton = boton.textContent;

// Pone en el formulario los datos del perfil que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombreUsuario').value = perfil.nombreUsuario;
  document.getElementById('email').value = perfil.email;
  document.getElementById('ciudad').value = perfil.ciudad ?? '';

  if (perfil.foto) {
    document.getElementById('foto-perfil').src = perfil.foto;
  }
}

// Rellena el formulario con los datos actuales del perfil
async function cargarPerfil() {
  try {
    mostrarPerfil(await api('/perfil'));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = 'iniciar-sesion.html';
  } finally {
    ocultarCargando();
  }
}

// Al pulsar «Guardar cambios» se envían el nombre de usuario y la ciudad al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se ocultan los mensajes del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  cajaExito.classList.add('d-none');
  boton.textContent = 'Guardando…';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');

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
  boton.textContent = textoBoton;
  boton.disabled = false;
  boton.removeAttribute('aria-busy');
});

cargarPerfil();

// Subida de la foto de perfil: se envía en cuanto se elige el archivo, con su propia petición
// (un archivo en lugar de JSON). «Guardar cambios» solo guarda el nombre y la ciudad.
const campoFoto = document.getElementById('foto');
const ayudaFoto = document.getElementById('ayuda-foto');
const textoAyudaFoto = ayudaFoto.textContent;
const cajaErrorFoto = document.getElementById('error-foto');
const cajaExitoFoto = document.getElementById('exito-foto');

campoFoto.addEventListener('change', async () => {
  // Si se cierra el selector sin elegir nada, no hay nada que subir
  if (!campoFoto.files.length) return;
  // Se ocultan los mensajes del intento anterior y se desactiva el campo mientras se sube
  cajaErrorFoto.classList.add('d-none');
  cajaExitoFoto.classList.add('d-none');
  campoFoto.disabled = true;
  ayudaFoto.textContent = 'Subiendo foto...';

  // FormData = formulario multipart; el backend espera el archivo en el campo `foto`
  const datos = new FormData();
  datos.append('foto', campoFoto.files[0]);

  try {
    // El backend valida formato y tamaño, la sube a Cloudinary y devuelve el perfil con la URL nueva
    const perfil = await api('/perfil/foto', { method: 'PUT', body: datos });
    mostrarPerfil(perfil);
    cajaExitoFoto.textContent = 'Foto actualizada.';
    cajaExitoFoto.classList.remove('d-none');
  } catch (err) {
    // Se muestra el mensaje del backend tal cual (formato no permitido, más de 5 MB...)
    cajaErrorFoto.textContent = err.message;
    cajaErrorFoto.classList.remove('d-none');
  }
  // Se vacía el campo (así elegir otra vez el mismo archivo también lo sube) y se reactiva
  campoFoto.value = '';
  campoFoto.disabled = false;
  ayudaFoto.textContent = textoAyudaFoto;
});

// CS-64: cambiar la contraseña. Hay que dar la actual y repetir la nueva; los requisitos de la
// nueva se marcan mientras se escribe (el del nombre usa el que hay en el formulario del perfil).
const formPassword = document.getElementById('form-password');
const campoPasswordActual = document.getElementById('password-actual');
const campoPasswordNueva = document.getElementById('password-nueva');
const campoPasswordRepetida = document.getElementById('password-repetida');
const cajaErrorPassword = document.getElementById('error-password');
const cajaExitoPassword = document.getElementById('exito-password');
const botonPassword = formPassword.querySelector('button[type="submit"]');
const textoBotonPassword = botonPassword.textContent;

const marcarRequisitosPassword = mostrarRequisitosPassword(
  campoPasswordNueva,
  document.getElementById('requisitos-password'),
  () => document.getElementById('nombreUsuario').value
);

function mostrarErrorPassword(mensaje) {
  cajaErrorPassword.textContent = mensaje;
  cajaErrorPassword.classList.remove('d-none');
}

formPassword.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaErrorPassword.classList.add('d-none');
  cajaExitoPassword.classList.add('d-none');

  if (campoPasswordNueva.value !== campoPasswordRepetida.value) {
    mostrarErrorPassword('Las dos contraseñas nuevas no coinciden');
    return;
  }

  botonPassword.textContent = 'Cambiando…';
  botonPassword.disabled = true;
  botonPassword.setAttribute('aria-busy', 'true');
  try {
    await api('/perfil/password', {
      method: 'PUT',
      body: JSON.stringify({ actual: campoPasswordActual.value, nueva: campoPasswordNueva.value }),
    });
    formPassword.reset();
    marcarRequisitosPassword();
    cajaExitoPassword.textContent = 'Contraseña cambiada.';
    cajaExitoPassword.classList.remove('d-none');
  } catch (err) {
    // Lo escrito se mantiene para poder corregirlo
    mostrarErrorPassword(err.message);
  }
  botonPassword.textContent = textoBotonPassword;
  botonPassword.disabled = false;
  botonPassword.removeAttribute('aria-busy');
});

