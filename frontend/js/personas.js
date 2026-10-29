// Página de búsqueda (/social/personas.html). Cada resultado lleva al perfil público de esa persona en
// /social/usuario.html. Usa `api` de shared/api.js, `PLANES_EJEMPLO` y `crearTarjetaPlan` de shared/ejemplos.js, `activarPestanas` de shared/pestanas.js y
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
const recuento = document.getElementById('recuento-busqueda');

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

// De momento los planes salen de los de ejemplo (shared/ejemplos.js); CS-24 los sustituirá por la llamada real
function buscarExperiencias(texto) {
  const buscado = texto.toLowerCase();
  const coincidencias = PLANES_EJEMPLO.filter((plan) =>
    [plan.titulo, plan.descripcion, plan.tipo, plan.ciudad, plan.autor].some((campo) => campo.toLowerCase().includes(buscado)));
  return Promise.resolve(coincidencias);
}

// Busca a la vez personas y planes y reemplaza los resultados anteriores de las dos pestañas.
async function buscar() {
  const numero = ++ultimaBusqueda;
  const texto = campoBusqueda.value.trim();

  // Acción con espera: «Buscando…» y desactivado hasta que acabe
  botonBuscar.textContent = 'Buscando…';
  botonBuscar.disabled = true;
  botonBuscar.setAttribute('aria-busy', 'true');
  resultados.replaceChildren();
  resultadosExperiencias.replaceChildren();
  ocultarMensaje(sinResultados);
  ocultarMensaje(sinExperiencias);
  ocultarMensaje(errorBusqueda);
  recuento.textContent = '';
  // Tras la primera búsqueda ya no hace falta explicar qué escribir; mientras llega la respuesta, «Cargando…»
  ocultarMensaje(ayudaBusqueda);
  ocultarMensaje(ayudaExperiencias);
  mostrarCargando();

  try {
    const [usuarios, planes] = await Promise.all([
      api(`/usuarios?texto=${encodeURIComponent(texto)}`),
      buscarExperiencias(texto),
    ]);
    if (numero !== ultimaBusqueda) return;

    // Un único aviso (role=status) en lugar de anunciar las listas enteras
    const personas = `${usuarios.length} ${usuarios.length === 1 ? 'persona' : 'personas'}`;
    recuento.textContent = `${personas} y ${planes.length} ${planes.length === 1 ? 'plan' : 'planes'}`;

    if (usuarios.length === 0) {
      sinResultados.classList.remove('d-none');
    } else {
      const filas = usuarios.map(crearResultado);
      resultados.append(...filas);
      animarEntrada(filas);
    }

    if (planes.length === 0) {
      sinExperiencias.classList.remove('d-none');
    } else {
      resultadosExperiencias.append(...planes.map((plan, indice) => crearTarjetaPlan(plan, plan.ciudad, indice)));
    }
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

// /social/personas.html?q=texto (el buscador de la cabecera): rellena el campo y busca; q vacío no busca
const textoInicial = new URLSearchParams(window.location.search).get('q')?.trim();
if (textoInicial) {
  campoBusqueda.value = textoInicial;
  buscar();
}
