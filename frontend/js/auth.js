// Lógica de los formularios de login y registro.

// Envía el formulario `idFormulario` a la API con el valor de cada campo (el id del input
// coincide con el nombre que espera la API). Si va bien, lleva a la bienvenida; si no,
// muestra el mensaje del servidor en la caja de error.
function enviarFormulario(idFormulario, idError, ruta, campos) {
  const formulario = document.getElementById(idFormulario);
  if (!formulario) return; // el formulario no está en esta página

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById(idError);
    errorBox.classList.add('d-none');

    const datos = {};
    for (const campo of campos) {
      datos[campo] = document.getElementById(campo).value;
    }

    try {
      await api(ruta, { method: 'POST', body: JSON.stringify(datos) });
      window.location.href = 'bienvenida.html';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('d-none');
    }
  });
}

enviarFormulario('form-login', 'error-login', '/auth/login', ['email', 'password']);
enviarFormulario('form-registro', 'error-registro', '/auth/registro', ['nombreUsuario', 'email', 'password']);
