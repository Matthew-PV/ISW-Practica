// Lógica de los formularios de login (index.html) y registro (registro.html).
// Este mismo archivo se carga en las dos páginas: cada una solo tiene uno de los dos
// formularios, y `enviarFormulario` ignora el que no encuentra. Usa `api` de api.js.

// Envía el formulario `idFormulario` a la API con el valor de cada campo (el id del input
// coincide con el nombre que espera la API) y lo que devuelva `datosExtra()`. Si va bien,
// lleva a la bienvenida; si no, muestra el mensaje del servidor en la caja de error.
//  - `idFormulario`: id del <form> en el HTML.
//  - `idError`: id de la caja donde se muestran los errores (oculta con la clase d-none).
//  - `ruta`: endpoint de la API al que se hace el POST.
//  - `campos`: ids de los inputs que se envían.
//  - `datosExtra`: función que devuelve datos que no salen de un input (el CAPTCHA).
function enviarFormulario(idFormulario, idError, ruta, campos, datosExtra = () => ({})) {
  const formulario = document.getElementById(idFormulario);
  if (!formulario) return; // el formulario no está en esta página

  formulario.addEventListener('submit', async (e) => {
    // Evita que el navegador envíe el formulario por su cuenta y recargue la página
    e.preventDefault();
    // Se oculta el error del intento anterior, si lo había
    const errorBox = document.getElementById(idError);
    errorBox.classList.add('d-none');
    // Se desactiva el botón mientras se espera la respuesta, para no enviar dos veces
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;

    // Se monta el objeto a enviar: primero los datos extra y después el valor de cada input
    const datos = datosExtra();
    for (const campo of campos) {
      datos[campo] = document.getElementById(campo).value;
    }

    try {
      // Si el servidor acepta, deja la sesión iniciada (cookie) y se pasa a la bienvenida
      await api(ruta, { method: 'POST', body: JSON.stringify(datos) });
      window.location.href = 'bienvenida.html';
    } catch (err) {
      // Se muestra el mensaje del servidor y se vuelve a habilitar el botón para reintentar
      errorBox.textContent = err.message;
      errorBox.classList.remove('d-none');
      boton.disabled = false;
      // Cada respuesta del CAPTCHA solo vale una vez: tras un error hay que resolverlo de nuevo
      window.turnstile?.reset();
    }
  });
}

// CAPTCHA del registro (Cloudflare Turnstile). Lo llama el script de Turnstile al cargarse
// (parámetro onload en registro.html); la clave pública la da el servidor.
// Pinta el CAPTCHA dentro del elemento con id "captcha" del formulario de registro.
async function iniciarCaptcha() {
  const { siteKey } = await api('/auth/captcha');
  turnstile.render('#captcha', { sitekey: siteKey, language: 'es' });
}

// Se preparan los dos formularios; en cada página solo existe uno, el otro no hace nada.
// Login: envía email y contraseña.
enviarFormulario('form-login', 'error-login', '/auth/login', ['email', 'password']);
// Registro: envía nombre de usuario, email y contraseña, más la respuesta del CAPTCHA
// (undefined si aún no se ha resuelto; el servidor lo rechaza en ese caso).
enviarFormulario('form-registro', 'error-registro', '/auth/registro', ['nombreUsuario', 'email', 'password'], () => ({
  captcha: window.turnstile?.getResponse(),
}));
