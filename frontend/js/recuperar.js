// Página para pedir el enlace de recuperación de la contraseña (recuperar.html, CS-64).
// Usa `api` de shared/api.js.
//
// El servidor responde lo mismo exista o no el email, así que la página muestra siempre su
// mensaje: no puede saber (ni decir) si la cuenta existe.

const formulario = document.getElementById('form-recuperar');
const cajaError = document.getElementById('error-recuperar');
const cajaExito = document.getElementById('exito-recuperar');
const boton = formulario.querySelector('button[type="submit"]');

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaError.classList.add('d-none');
  cajaExito.classList.add('d-none');
  boton.disabled = true;

  try {
    const { mensaje } = await api('/auth/recuperar', {
      method: 'POST',
      body: JSON.stringify({ email: document.getElementById('email').value }),
    });
    cajaExito.textContent = mensaje;
    cajaExito.classList.remove('d-none');
  } catch (err) {
    // El email escrito se mantiene para poder reintentar
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }
  boton.disabled = false;
});
