// Requisitos de la contraseña (CS-64), que se marcan mientras se escribe. Lo usan js/registro.js,
// js/perfil.js (cambiar la contraseña) y js/restablecer.js. Son los mismos que comprueba el
// backend (backend/src/services/shared/password.js), que es quien decide: aquí solo se ayuda a
// escribir una contraseña válida.

const REQUISITOS_PASSWORD = [
  ['entre 8 y 72 caracteres', (password) => {
    // Se cuentan bytes, como el backend: una letra con tilde o un emoji ocupan más de uno
    const bytes = new TextEncoder().encode(password).length;
    return bytes >= 8 && bytes <= 72;
  }],
  ['al menos una mayúscula', (password) => /\p{Lu}/u.test(password)],
  ['al menos una minúscula', (password) => /\p{Ll}/u.test(password)],
  ['al menos un número', (password) => /[0-9]/.test(password)],
  ['sin el nombre de usuario', (password, nombreUsuario) =>
    !nombreUsuario || !password.toLowerCase().includes(nombreUsuario.toLowerCase())],
];

// Pinta los requisitos en `lista` (un <ul>) y los marca cada vez que cambia `campoPassword`.
// - `obtenerNombre`: función que devuelve el nombre de usuario actual.
// Devuelve la función que vuelve a marcarlos, para llamarla si cambia el nombre de usuario.
function mostrarRequisitosPassword(campoPassword, lista, obtenerNombre) {
  const elementos = REQUISITOS_PASSWORD.map(() => document.createElement('li'));
  lista.replaceChildren(...elementos);

  function marcar() {
    const password = campoPassword.value;
    REQUISITOS_PASSWORD.forEach(([texto, cumple], i) => {
      // Con el campo vacío no se da ninguno por cumplido
      const cumplido = password !== '' && cumple(password, obtenerNombre());
      elementos[i].textContent = `${cumplido ? '✓' : '○'} ${texto}`;
      elementos[i].dataset.cumple = cumplido;
      elementos[i].classList.toggle('text-success', cumplido);
      elementos[i].classList.toggle('text-secondary', !cumplido);
    });
  }

  campoPassword.addEventListener('input', marcar);
  marcar();
  return marcar;
}
