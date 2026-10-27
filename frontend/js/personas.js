// Página de búsqueda de personas (personas.html). Cada resultado lleva al perfil público de esa
// persona en usuario.html. Usa `api` de shared/api.js y `crearEnlacePerfil`, `mostrarMensaje`,
// `ocultarMensaje`, `mostrarCargando` y `ocultarCargando` de shared/pantalla.js.

const formularioBusqueda = document.getElementById('form-busqueda');
const campoBusqueda = document.getElementById('texto-busqueda');
const resultados = document.getElementById('resultados');
const sinResultados = document.getElementById('sin-resultados');
const errorBusqueda = document.getElementById('error-busqueda');
const ayudaBusqueda = document.getElementById('ayuda-busqueda');

// Crea un enlace seguro al perfil público. El nombre procede de otro usuario, por eso se asigna
// con textContent y nunca se inserta como HTML.
function crearResultado(usuario) {
  const enlace = crearEnlacePerfil(document.createElement('a'), usuario);
  enlace.className = 'resultado-persona';
  return enlace;
}

// Pide al servidor los usuarios cuyo nombre contiene el texto buscado y reemplaza los resultados.
async function buscarPersonas() {
  resultados.replaceChildren();
  ocultarMensaje(sinResultados);
  ocultarMensaje(errorBusqueda);
  // Tras la primera búsqueda ya no hace falta explicar qué escribir; mientras llega la respuesta, «Cargando…»
  ocultarMensaje(ayudaBusqueda);
  mostrarCargando();

  try {
    const usuarios = await api(`/usuarios?texto=${encodeURIComponent(campoBusqueda.value.trim())}`);
    if (usuarios.length === 0) {
      sinResultados.classList.remove('d-none');
      return;
    }
    resultados.append(...usuarios.map(crearResultado));
  } catch (err) {
    mostrarMensaje(errorBusqueda, err.message);
  } finally {
    ocultarCargando();
  }
}

formularioBusqueda.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarPersonas();
});
