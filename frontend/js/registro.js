// Página de registro (registro.html). Usa `api` de shared/api.js y `mostrarRequisitosPassword`
// de shared/password.js (CS-64).

const formulario = document.getElementById('form-registro');
const cajaError = document.getElementById('error-registro');
const boton = formulario.querySelector('button[type="submit"]');
const textoBoton = boton.textContent;

const ERROR_CARGA_CAPTCHA = 'No se ha podido cargar el CAPTCHA. Revisa tu conexión y recarga la página.';
const ERROR_VERIFICAR_CAPTCHA = 'No se ha podido verificar el CAPTCHA. Inténtalo de nuevo.';

// Muestra un mensaje de error encima del botón
function mostrarError(mensaje) {
  cajaError.textContent = mensaje;
  cajaError.classList.remove('d-none');
}

// Si el script de Turnstile no llega (sin red, bloqueado...), su `error` no sube hasta window,
// pero se puede escuchar en la fase de captura. Sin esto el formulario se quedaría sin CAPTCHA
// y sin ningún aviso.
window.addEventListener('error', (e) => {
  if (e.target instanceof HTMLScriptElement && e.target.src.startsWith('https://challenges.cloudflare.com/')) {
    mostrarError(ERROR_CARGA_CAPTCHA);
  }
}, true);

// CAPTCHA del registro (Cloudflare Turnstile). Lo llama el script de Turnstile al cargarse
// (parámetro onload en registro.html); la clave pública la da el servidor.
// Pinta el CAPTCHA dentro del elemento con id "captcha" del formulario.
async function iniciarCaptcha() {
  try {
    const { siteKey } = await api('/auth/captcha');
    // Sin clave pública el servidor está mal configurado (falta TURNSTILE_SITE_KEY en .env)
    if (!siteKey) throw new Error('Falta la clave del CAPTCHA');
    turnstile.render('#captcha', {
      sitekey: siteKey,
      language: 'es',
      // Turnstile avisa aquí de los fallos del propio CAPTCHA (red, clave no válida...)
      'error-callback': () => mostrarError(ERROR_VERIFICAR_CAPTCHA),
      // Si después se resuelve, sobra ese aviso (los errores del servidor se mantienen)
      callback: () => {
        if (cajaError.textContent === ERROR_VERIFICAR_CAPTCHA) cajaError.classList.add('d-none');
      },
    });
  } catch {
    mostrarError(ERROR_CARGA_CAPTCHA);
  }
}

// Al pulsar «Crear cuenta» se envían los datos y la respuesta del CAPTCHA al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se oculta el error del intento anterior y se desactiva el botón para no enviar dos veces.
  // El botón muestra que el registro está en curso
  cajaError.classList.add('d-none');
  boton.disabled = true;
  boton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Creando cuenta...';

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
    mostrarError(err.message);
    boton.disabled = false;
    boton.textContent = textoBoton;
    // Cada respuesta del CAPTCHA solo vale una vez: tras un error hay que resolverlo de nuevo
    window.turnstile?.reset();
  }
});

// CS-64: requisitos de la contraseña, marcados mientras se escribe. El de «sin el nombre de
// usuario» depende también del nombre, así que se vuelve a marcar cuando este cambia.
const campoNombre = document.getElementById('nombreUsuario');
const marcarRequisitos = mostrarRequisitosPassword(
  document.getElementById('password'),
  document.getElementById('requisitos-password'),
  () => campoNombre.value
);
campoNombre.addEventListener('input', marcarRequisitos);
