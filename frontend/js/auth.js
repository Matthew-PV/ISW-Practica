// Lógica de los formularios de login y registro.

// Envía el formulario `idFormulario` a la API con el valor de cada campo (el id del input
// coincide con el nombre que espera la API) y lo que devuelva `datosExtra()`. Si va bien,
// lleva a la bienvenida; si no, muestra el mensaje del servidor en la caja de error.
function enviarFormulario(idFormulario, idError, ruta, campos, datosExtra = () => ({})) {
  const formulario = document.getElementById(idFormulario);
  if (!formulario) return; // el formulario no está en esta página

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById(idError);
    errorBox.classList.add('d-none');

    const datos = datosExtra();
    for (const campo of campos) {
      datos[campo] = document.getElementById(campo).value;
    }

    try {
      await api(ruta, { method: 'POST', body: JSON.stringify(datos) });
      window.location.href = 'bienvenida.html';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('d-none');
      // Cada respuesta del CAPTCHA solo vale una vez: tras un error hay que resolverlo de nuevo
      window.turnstile?.reset();
    }
  });
}

// CAPTCHA del registro (Cloudflare Turnstile). Lo llama el script de Turnstile al cargarse
// (parámetro onload en registro.html); la clave pública la da el servidor.
async function iniciarCaptcha() {
  const { siteKey } = await api('/auth/captcha');
  turnstile.render('#captcha', { sitekey: siteKey, language: 'es' });
}

enviarFormulario('form-login', 'error-login', '/auth/login', ['email', 'password']);
enviarFormulario('form-registro', 'error-registro', '/auth/registro', ['nombreUsuario', 'email', 'password'], () => ({
  captcha: window.turnstile?.getResponse(),
}));
