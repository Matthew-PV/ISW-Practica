// Página de registro (registro.html). Usa `api` de shared/api.js.

const formulario = document.getElementById('form-registro');
const cajaError = document.getElementById('error-registro');
const boton = formulario.querySelector('button[type="submit"]');

// CAPTCHA del registro (Cloudflare Turnstile). Lo llama el script de Turnstile al cargarse
// (parámetro onload en registro.html); la clave pública la da el servidor.
// Pinta el CAPTCHA dentro del elemento con id "captcha" del formulario.
async function iniciarCaptcha() {
  const { siteKey } = await api('/auth/captcha');
  turnstile.render('#captcha', { sitekey: siteKey, language: 'es' });
}

// Al pulsar «Crear cuenta» se envían los datos y la respuesta del CAPTCHA al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se oculta el error del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  boton.disabled = true;

  const datos = {
    nombreUsuario: document.getElementById('nombreUsuario').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    // undefined si el CAPTCHA aún no se ha resuelto; el backend lo rechaza en ese caso
    captcha: window.turnstile?.getResponse(),
  };

  try {
    // Si todo es correcto, el backend crea la cuenta, inicia la sesión y se pasa a la bienvenida
    await api('/auth/registro', { method: 'POST', body: JSON.stringify(datos) });
    window.location.href = 'bienvenida.html';
  } catch (err) {
    // Se muestra el mensaje del backend y se vuelve a habilitar el botón para reintentar
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
    boton.disabled = false;
    // Cada respuesta del CAPTCHA solo vale una vez: tras un error hay que resolverlo de nuevo
    window.turnstile?.reset();
  }
});
