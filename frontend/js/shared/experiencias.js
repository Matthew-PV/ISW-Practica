// Listado de las experiencias de un usuario con «Cargar más» (CS-44). Es común a perfil.html
// («Mis experiencias», con las privadas) y a usuario.html («Sus experiencias»): el backend solo
// devuelve las que puede ver el usuario de la sesión.
// Lo usan: js/perfil.js y js/usuario.js. Usa `api` de shared/api.js, que se carga antes.
// La página necesita #lista-experiencias, #sin-experiencias, #mas-experiencias y #error-experiencias.

const listaExperiencias = document.getElementById('lista-experiencias');
const sinExperiencias = document.getElementById('sin-experiencias');
const botonMasExperiencias = document.getElementById('mas-experiencias');
const cajaErrorExperiencias = document.getElementById('error-experiencias');

const NOMBRE_VISIBILIDAD = { PRIVADA: 'Privada', AMIGOS: 'Amigos', PUBLICA: 'Pública' };

// Autor del listado y cursor de la página siguiente (null = no hay más).
let autorExperiencias = null;
let siguienteExperiencias = null;

// Crea el enlace a la página de una experiencia. Los textos se incorporan con textContent para
// que nunca se interpreten como HTML.
function crearEnlaceExperiencia(experiencia) {
  const enlace = document.createElement('a');
  enlace.className = 'list-group-item list-group-item-action';
  enlace.href = `experiencia.html?id=${experiencia.id}`;
  enlace.dataset.experienciaId = experiencia.id;

  const titulo = document.createElement('div');
  titulo.className = 'fw-semibold';
  titulo.textContent = experiencia.titulo;

  const detalle = document.createElement('small');
  detalle.className = 'text-secondary';
  detalle.textContent = [experiencia.ciudad?.nombre, NOMBRE_VISIBILIDAD[experiencia.visibilidad]]
    .filter(Boolean)
    .join(' · ');

  enlace.append(titulo, detalle);
  return enlace;
}

// Pide la página siguiente (la primera si todavía no hay ninguna) y la añade a la lista.
async function cargarPaginaExperiencias() {
  cajaErrorExperiencias.classList.add('d-none');
  const cursor = siguienteExperiencias === null ? '' : `&despuesDe=${siguienteExperiencias}`;
  try {
    const respuesta = await api(`/experiencias?autor=${encodeURIComponent(autorExperiencias)}${cursor}`);
    for (const experiencia of respuesta.experiencias) {
      // Si una experiencia ya está en la lista, no se repite
      if (!listaExperiencias.querySelector(`[data-experiencia-id="${experiencia.id}"]`)) {
        listaExperiencias.append(crearEnlaceExperiencia(experiencia));
      }
    }
    siguienteExperiencias = respuesta.siguiente;
    sinExperiencias.classList.toggle('d-none', listaExperiencias.children.length !== 0);
    botonMasExperiencias.classList.toggle('d-none', siguienteExperiencias === null);
  } catch (err) {
    cajaErrorExperiencias.textContent = err.message;
    cajaErrorExperiencias.classList.remove('d-none');
  }
}

// Muestra el listado de `nombreUsuario`. La primera vez carga la primera página. Si el listado ya
// se está mostrando (por ejemplo, tras cambiar el nombre en «Mi perfil»), solo actualiza el
// nombre con el que se piden las páginas siguientes.
function mostrarExperienciasDe(nombreUsuario) {
  const primeraVez = autorExperiencias === null;
  autorExperiencias = nombreUsuario;
  if (primeraVez) {
    cargarPaginaExperiencias();
  }
}

// Vuelve a empezar el listado desde la primera página. Por ejemplo, tras aceptar o eliminar una
// amistad, porque cambia qué experiencias de amigos se pueden ver.
function recargarExperiencias() {
  siguienteExperiencias = null;
  listaExperiencias.replaceChildren();
  return cargarPaginaExperiencias();
}

// «Cargar más»: el botón se desactiva mientras llega la página para no pedirla dos veces.
botonMasExperiencias.addEventListener('click', async () => {
  botonMasExperiencias.disabled = true;
  await cargarPaginaExperiencias();
  botonMasExperiencias.disabled = false;
});

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
window.mostrarExperienciasDe = mostrarExperienciasDe;
window.recargarExperiencias = recargarExperiencias;
