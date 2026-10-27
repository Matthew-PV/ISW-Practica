// Página de inicio de sesión (/acceso/iniciar-sesion.html). Usa `api` de shared/api.js.

const formulario = document.getElementById('form-login');
const cajaError = document.getElementById('error-login');
const boton = formulario.querySelector('button[type="submit"]');
const textoBoton = boton.textContent;

// Al pulsar «Entrar» se envían el email y la contraseña al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se oculta el error del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  // Acción con espera: «Entrando…» y desactivado hasta que acabe
  boton.textContent = 'Entrando…';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');

  const datos = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    // Si los datos son correctos, el backend inicia la sesión (cookie) y se pasa a la bienvenida
    await api('/auth/login', { method: 'POST', body: JSON.stringify(datos) });
    window.location.href = '/cuenta/bienvenida.html';
  } catch (err) {
    // Se muestra el mensaje del backend y se vuelve a habilitar el botón para reintentar
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
    boton.textContent = textoBoton;
    boton.disabled = false;
    boton.removeAttribute('aria-busy');
  }
});
