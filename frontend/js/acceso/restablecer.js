// Página para elegir una contraseña nueva desde el enlace del email (/paginas/acceso/restablecer.html?token=...,
// CS-64). Usa `api` de shared/api.js y `mostrarRequisitosPassword` de shared/password.js.
//
// La página no sabe de quién es el enlace, así que el requisito «sin el nombre de usuario» solo
// lo puede comprobar el servidor: si no se cumple, se verá en su mensaje de error.

const token = new URLSearchParams(window.location.search).get('token');
const formulario = document.getElementById('form-restablecer');
const campoNueva = document.getElementById('password-nueva');
const campoRepetida = document.getElementById('password-repetida');
const cajaError = document.getElementById('error-restablecer');
const cajaExito = document.getElementById('exito-restablecer');
const boton = formulario.querySelector('button[type="submit"]');
const textoBoton = boton.textContent;

mostrarRequisitosPassword(campoNueva, document.getElementById('requisitos-password'), () => '');

function mostrarError(mensaje) {
  cajaError.textContent = mensaje;
  cajaError.classList.remove('d-none');
}

function mostrarEnlaceNoValido(texto) {
  formulario.classList.add('d-none');
  const enlace = document.createElement('a');
  enlace.href = '/paginas/acceso/recuperar.html';
  enlace.textContent = 'Pide uno nuevo';
  cajaError.replaceChildren(`${texto} `, enlace, '.');
  cajaError.classList.remove('d-none');
}

// Sin token en la dirección no hay nada que restablecer
if (!token) mostrarEnlaceNoValido('El enlace no es válido.');

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaError.classList.add('d-none');

  if (campoNueva.value !== campoRepetida.value) {
    mostrarError('Las dos contraseñas no coinciden.');
    return;
  }

  boton.textContent = 'Guardando…';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');
  try {
    const { mensaje } = await api('/auth/restablecer', {
      method: 'POST',
      body: JSON.stringify({ token, nueva: campoNueva.value }),
    });
    // El enlace ya no sirve: se oculta el formulario y se ofrece ir al inicio de sesión
    formulario.classList.add('d-none');
    const enlace = document.createElement('a');
    enlace.href = '/paginas/acceso/iniciar-sesion.html';
    enlace.textContent = 'Iniciar sesión';
    cajaExito.replaceChildren(`${mensaje} `, enlace);
    cajaExito.classList.remove('d-none');
  } catch (err) {
    // Lo escrito se mantiene: si el problema son los requisitos, se puede corregir y reintentar
    // Un enlace usado o caducado no se arregla reintentando: se ofrece pedir otro
    if (err.message.startsWith('El enlace no es válido')) mostrarEnlaceNoValido(`${err.message}.`);
    else mostrarError(err.message);
  }
  boton.textContent = textoBoton;
  boton.disabled = false;
  boton.removeAttribute('aria-busy');
});
