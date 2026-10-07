// Página de búsqueda de personas (personas.html). Cada resultado lleva al perfil público de esa
// persona en usuario.html. Usa api de shared/api.js para conservar la sesión del navegador.

const formularioBusqueda = document.getElementById('form-busqueda');
const campoBusqueda = document.getElementById('texto-busqueda');
const resultados = document.getElementById('resultados');
const sinResultados = document.getElementById('sin-resultados');
const errorBusqueda = document.getElementById('error-busqueda');

// Crea un enlace seguro al perfil público. El nombre procede de otro usuario, por eso se asigna
// con textContent y nunca se inserta como HTML.
function crearResultado(usuario) {
  const enlace = document.createElement('a');
  enlace.className = 'list-group-item list-group-item-action';
  enlace.href = `usuario.html?nombre=${encodeURIComponent(usuario.nombreUsuario)}`;
  enlace.textContent = usuario.nombreUsuario;
  return enlace;
}

// Pide al servidor los usuarios cuyo nombre contiene el texto buscado y reemplaza los resultados.
async function buscarPersonas() {
  resultados.replaceChildren();
  sinResultados.classList.add('d-none');
  errorBusqueda.classList.add('d-none');

  try {
    const usuarios = await api(`/usuarios?texto=${encodeURIComponent(campoBusqueda.value.trim())}`);
    if (usuarios.length === 0) {
      sinResultados.classList.remove('d-none');
      return;
    }
    resultados.append(...usuarios.map(crearResultado));
  } catch (err) {
    errorBusqueda.textContent = err.message;
    errorBusqueda.classList.remove('d-none');
  }
}

formularioBusqueda.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarPersonas();
});
