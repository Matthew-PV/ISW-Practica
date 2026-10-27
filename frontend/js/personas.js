// Página de búsqueda (personas.html). Cada resultado lleva al perfil público de esa persona en
// usuario.html. Usa `api` de shared/api.js, `activarPestanas` de shared/pestanas.js y
// `crearEnlacePerfil`, `mostrarMensaje`, `ocultarMensaje`, `mostrarCargando` y `ocultarCargando`
// de shared/pantalla.js.

const formularioBusqueda = document.getElementById('form-busqueda');
const campoBusqueda = document.getElementById('texto-busqueda');
const botonBuscar = formularioBusqueda.querySelector('button[type="submit"]');
const resultados = document.getElementById('resultados');
const sinResultados = document.getElementById('sin-resultados');
const errorBusqueda = document.getElementById('error-busqueda');
const ayudaBusqueda = document.getElementById('ayuda-busqueda');
const ayudaExperiencias = document.getElementById('ayuda-experiencias');
const sinExperiencias = document.getElementById('sin-experiencias');
const resultadosExperiencias = document.getElementById('resultados-experiencias');
const pestanaExperiencias = document.getElementById('pestana-experiencias');

activarPestanas(document.getElementById('pestanas-busqueda'));

// Cuenta las búsquedas: si llega una respuesta de una búsqueda que ya no es la última, se descarta
let ultimaBusqueda = 0;

// Crea la fila de una persona: un enlace a su perfil público con foto, nombre y, si la hay, ciudad.
// El nombre procede de otro usuario, por eso se asigna con textContent y nunca como HTML.
function crearResultado(usuario) {
  const fila = crearEnlacePerfil(document.createElement('a'), usuario);
  fila.className = 'fila-resultado';

  let foto;
  if (usuario.foto) {
    foto = document.createElement('img');
    foto.src = usuario.foto;
    foto.alt = '';
  } else {
    foto = document.createElement('span');
    foto.className = 'fila-resultado-sin-foto';
  }

  const cuerpo = document.createElement('span');
  const nombre = document.createElement('span');
  nombre.className = 'fila-resultado-nombre';
  nombre.textContent = usuario.nombreUsuario;
  cuerpo.append(nombre);
  if (usuario.ciudad) {
    const ciudad = document.createElement('span');
    ciudad.className = 'fila-resultado-ciudad';
    ciudad.textContent = usuario.ciudad;
    cuerpo.append(ciudad);
  }

  fila.replaceChildren(foto, cuerpo);
  return fila;
}

// Los resultados nuevos entran con un fundido de 150 ms; la clase se retira al acabar
function animarEntrada(elementos) {
  for (const elemento of elementos) {
    elemento.classList.add('entrando');
    const retirar = () => elemento.classList.remove('entrando');
    elemento.addEventListener('animationend', retirar, { once: true });
    setTimeout(retirar, 300);
  }
}

// CS-24 la sustituirá por la llamada real
function buscarExperiencias(texto) {
  return Promise.resolve([]);
}

// Busca según la pestaña activa y reemplaza los resultados anteriores.
async function buscar() {
  const numero = ++ultimaBusqueda;
  const texto = campoBusqueda.value.trim();
  const enExperiencias = pestanaExperiencias.getAttribute('aria-selected') === 'true';

  // Acción con espera: «Buscando…» y desactivado hasta que acabe
  botonBuscar.textContent = 'Buscando…';
  botonBuscar.disabled = true;
  botonBuscar.setAttribute('aria-busy', 'true');

  resultados.replaceChildren();
  resultadosExperiencias.replaceChildren();
  ocultarMensaje(sinResultados);
  ocultarMensaje(sinExperiencias);
  ocultarMensaje(errorBusqueda);
  // Tras la primera búsqueda ya no hace falta explicar qué escribir; mientras llega la respuesta, «Cargando…»
  ocultarMensaje(enExperiencias ? ayudaExperiencias : ayudaBusqueda);
  mostrarCargando();

  try {
    if (enExperiencias) {
      const experiencias = await buscarExperiencias(texto);
      if (numero !== ultimaBusqueda) return;
      if (experiencias.length === 0) sinExperiencias.classList.remove('d-none');
      return;
    }
    const usuarios = await api(`/usuarios?texto=${encodeURIComponent(texto)}`);
    if (numero !== ultimaBusqueda) return;
    if (usuarios.length === 0) {
      sinResultados.classList.remove('d-none');
      return;
    }
    const filas = usuarios.map(crearResultado);
    resultados.append(...filas);
    animarEntrada(filas);
  } catch (err) {
    if (numero === ultimaBusqueda) mostrarMensaje(errorBusqueda, err.message);
  } finally {
    // Solo la última búsqueda restaura el botón; las anteriores ya no importan
    if (numero === ultimaBusqueda) {
      ocultarCargando();
      botonBuscar.textContent = 'Buscar';
      botonBuscar.disabled = false;
      botonBuscar.removeAttribute('aria-busy');
    }
  }
}

formularioBusqueda.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscar();
});

// personas.html?q=texto (el buscador de la cabecera): rellena el campo y busca; q vacío no busca
const textoInicial = new URLSearchParams(window.location.search).get('q')?.trim();
if (textoInicial) {
  campoBusqueda.value = textoInicial;
  buscar();
}
