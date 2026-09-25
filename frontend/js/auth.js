// Lógica de los formularios de login y registro.

const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('error-login');
    errorBox.classList.add('d-none');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      window.location.href = '/';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('d-none');
    }
  });
}

const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('error-registro');
    errorBox.classList.add('d-none');

    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await api('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nombreUsuario, email, password }),
      });
      window.location.href = '/';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('d-none');
    }
  });
}
