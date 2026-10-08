// Página para elegir una contraseña nueva desde el enlace del email (restablecer.html?token=...,
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

mostrarRequisitosPassword(campoNueva, document.getElementById('requisitos-password'), () => '');

function mostrarError(mensaje) {
  cajaError.textContent = mensaje;
  cajaError.classList.remove('d-none');
}

// Sin token en la dirección no hay nada que restablecer
if (!token) {
  formulario.classList.add('d-none');
  mostrarError('El enlace no es válido. Pide uno nuevo desde «¿Has olvidado tu contraseña?».');
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaError.classList.add('d-none');

  if (campoNueva.value !== campoRepetida.value) {
    mostrarError('Las dos contraseñas no coinciden');
    return;
  }

  boton.disabled = true;
  try {
    const { mensaje } = await api('/auth/restablecer', {
      method: 'POST',
      body: JSON.stringify({ token, nueva: campoNueva.value }),
    });
    // El enlace ya no sirve: se oculta el formulario y se ofrece ir al inicio de sesión
    formulario.classList.add('d-none');
    const enlace = document.createElement('a');
    enlace.href = 'index.html';
    enlace.textContent = 'Iniciar sesión';
    cajaExito.replaceChildren(`${mensaje} `, enlace);
    cajaExito.classList.remove('d-none');
  } catch (err) {
    // Lo escrito se mantiene: si el problema son los requisitos, se puede corregir y reintentar
    mostrarError(err.message);
  }
  boton.disabled = false;
});
