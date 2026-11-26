// Explorar (/paginas/experiencias/explorar.html): rejilla de planes reales con filtros de categoría, momento adecuado,
// ciudad, presupuesto, duración, valoración mínima y «solo mis amigos», paginada con «Cargar más». Acepta ?tira=ciudad|nuevos|amigos (viene de «Ver más»
// en Inicio) para titular la página y dejar puestos los filtros de esa tira, y ?q= (el buscador de la cabecera):
// entonces la pestaña «Personas» (js/social/personas.js) busca además personas.
// Usa `api` de shared/api.js, `alFallarCarga`, `ocultarMensaje`, `mostrarErrorConReintento` y `listaConCargarMas` de
// shared/pantalla.js, `activarPestanas` de shared/pestanas.js, `buscarPersonas` de social/personas.js y `crearTarjetaPlan`, `pedirPlanes` y `buscarCiudadPorNombre` de shared/planes.js.

const PLANES_POR_PAGINA = 12;

const TITULOS_TIRA = {
  ciudad: ['Planes en mi ciudad', 'Lo que se hace cerca de ti.'],
  nuevos: ['Planes nuevos', 'Lo último que ha publicado la gente.'],
  amigos: ['Lo que hacen tus amigos', 'Planes de personas que conoces.'],
};

const filtros = document.getElementById('filtros');
const campoMomento = document.getElementById('filtro-momento');
const campoCiudad = document.getElementById('filtro-ciudad');
const campoAmigos = document.getElementById('filtro-amigos');
const campoTarifa = document.getElementById('filtro-tarifa');
const campoDuracion = document.getElementById('filtro-duracion');
const campoMinimo = document.getElementById('filtro-minimo');
const errorPlanes = document.getElementById('error-planes');
const avisoVacio = document.querySelector('#sin-resultados p');
const total = document.getElementById('total-planes');

const parametros = new URLSearchParams(window.location.search);
const texto = parametros.get('q')?.trim() ?? '';
const botonLimpiar = document.getElementById('limpiar-filtros');
const pestanaPlanes = document.getElementById('pestana-planes');
const pestanas = activarPestanas(document.getElementById('pestanas-busqueda'));
let categoria = '';
let cargados = 0;

// Los planes que cumplen los filtros de ahora, de 12 en 12
const listado = listaConCargarMas({
  lista: document.getElementById('resultados'),
  vacio: document.getElementById('sin-resultados'),
  botonMas: document.getElementById('mas-planes'),
  pedir: async (cursor) => {
    ocultarMensaje(errorPlanes);
    if (cursor === null) cargados = 0;
    const { experiencias, siguiente } = await pedirPlanes({
      texto,
      ciudadId: campoCiudad.value,
      categoria,
      momento: campoMomento.value,
      amigos: campoAmigos.checked,
      minimo: campoMinimo.value,
      tarifaMax: campoTarifa.value,
      duracionMax: campoDuracion.value,
      despuesDe: cursor,
      limite: PLANES_POR_PAGINA,
    });
    return { elementos: experiencias, siguiente };
  },
  crear: (plan) => crearTarjetaPlan(plan),
  alFallar: (err, reintentar) => mostrarErrorConReintento(errorPlanes, err.message, reintentar),
  // Se cuentan las tarjetas que están puestas: una respuesta descartada no cuenta
  alPintar: (siguiente) => {
    explicarVacio();
    cargados = document.querySelectorAll('#resultados [data-id-elemento]').length;
    total.textContent = `${cargados} ${cargados === 1 ? 'plan' : 'planes'}${siguiente === null ? '' : ' o más'}`;
    if (texto) pestanaPlanes.textContent = `Planes (${cargados}${siguiente === null ? '' : '+'})`;
  },
});

// Marca el botón de la categoría elegida ('' = todas) y vuelve a pedir los planes
function elegirCategoria(nueva) {
  categoria = nueva;
  marcarCategoria();
  guardarEnUrl();
  return listado.reiniciar();
}

function marcarCategoria() {
  for (const boton of filtros.querySelectorAll('button')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.categoria === categoria));
  }
}

// Los filtros de ahora, en la URL: al volver o recargar se recuperan
const CAMPOS_EN_URL = { momento: campoMomento, ciudad: campoCiudad, tarifa: campoTarifa, duracion: campoDuracion, minimo: campoMinimo };

function guardarEnUrl() {
  const tira = parametros.get('tira');
  const nuevos = new URLSearchParams();
  if (tira) nuevos.set('tira', tira);
  if (texto) nuevos.set('q', texto);
  if (categoria) nuevos.set('categoria', categoria);
  for (const [nombre, campo] of Object.entries(CAMPOS_EN_URL)) {
    // En «mi ciudad», «todas las ciudades» también hay que recordarlo
    if (campo.value || (nombre === 'ciudad' && tira === 'ciudad')) nuevos.set(nombre, campo.value);
  }
  if (campoAmigos.checked || tira === 'amigos') nuevos.set('amigos', String(campoAmigos.checked));
  const pestana = new URLSearchParams(window.location.search).get('pestana');
  if (pestana) nuevos.set('pestana', pestana);
  actualizarLimpiar();
  titularPorCiudad();
  const consulta = nuevos.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${consulta ? `?${consulta}` : ''}`);
}

// Con una ciudad elegida, el título la nombra (CS-74). Las tiras y la búsqueda conservan el suyo
function titularPorCiudad() {
  if (TITULOS_TIRA[parametros.get('tira')] || texto) return;
  const nombre = campoCiudad.value && campoCiudad.selectedOptions[0].dataset.nombre;
  document.getElementById('titulo-explorar').textContent = nombre ? `Planes en ${nombre}` : 'Explorar';
}

// CS-74: si la ciudad es el único filtro, el aviso de vacío la nombra
function explicarVacio() {
  const otrosFiltros = texto || categoria || campoAmigos.checked
    || [campoMomento, campoTarifa, campoDuracion, campoMinimo].some((campo) => campo.value);
  avisoVacio.textContent = campoCiudad.value && !otrosFiltros
    ? `Todavía no hay planes en ${campoCiudad.selectedOptions[0].dataset.nombre}.`
    : 'No hay planes con estos filtros.';
}

// CS-74: la ciudad de la URL no está en el catálogo. No se piden planes, que serían de otras ciudades;
// «Limpiar filtros» es la salida, porque el desplegable ya marca «Todas»
function avisarCiudadDesconocida() {
  campoCiudad.value = '';
  avisoVacio.textContent = 'Esa ciudad no está en el catálogo de PlanB.';
  document.getElementById('sin-resultados').classList.remove('d-none');
  total.textContent = '0 planes';
  botonLimpiar.classList.remove('d-none');
}

// «Limpiar filtros» solo aparece si hay alguno puesto
function actualizarLimpiar() {
  const hay = categoria || campoAmigos.checked || Object.values(CAMPOS_EN_URL).some((campo) => campo.value);
  botonLimpiar.classList.toggle('d-none', !hay);
}

botonLimpiar.addEventListener('click', () => {
  for (const campo of Object.values(CAMPOS_EN_URL)) campo.value = '';
  campoAmigos.checked = false;
  elegirCategoria('');
});

// Al salir se apunta cuánto se había cargado y por dónde se iba; al volver se repone
window.addEventListener('pagehide', () => {
  window.history.replaceState({ cargados, scroll: window.scrollY }, '');
});

async function reponerPosicion(primeraCarga) {
  const anterior = window.history.state;
  await primeraCarga;
  if (!anterior?.cargados) return;
  const botonMas = document.getElementById('mas-planes');
  while (cargados < anterior.cargados && !botonMas.classList.contains('d-none')) {
    const antes = cargados;
    await listado.cargar();
    if (cargados === antes) break;
  }
  if (anterior.scroll) window.scrollTo(0, anterior.scroll);
}

function crearOpcion(valor, textoOpcion) {
  const opcion = document.createElement('option');
  opcion.value = valor;
  opcion.textContent = textoOpcion;
  return opcion;
}

// Pinta los botones de categoría y el selector de momento con las opciones del backend
function pintarOpciones({ categorias, momentos }) {
  filtros.replaceChildren();
  for (const [valor, textoBoton] of [['', 'Todos'], ...categorias.map((c) => [c, c])]) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'filtro';
    boton.dataset.categoria = valor;
    boton.textContent = textoBoton;
    boton.addEventListener('click', () => elegirCategoria(valor));
    filtros.append(boton);
  }
  for (const { grupo, valores } of momentos) {
    const agrupacion = document.createElement('optgroup');
    agrupacion.label = grupo;
    agrupacion.append(...valores.map((valor) => crearOpcion(valor, valor)));
    campoMomento.append(agrupacion);
  }
}

for (const campo of [campoMomento, campoCiudad, campoAmigos, campoTarifa, campoDuracion, campoMinimo]) {
  campo.addEventListener('change', () => {
    guardarEnUrl();
    listado.reiniciar();
  });
}

// Dice qué se ha buscado y lo deja escrito en el buscador de la cabecera
function pintarBusqueda() {
  if (!texto) return;
  const aviso = document.getElementById('busqueda-activa');
  aviso.querySelector('span').textContent = `Resultados para «${texto}».`;
  aviso.classList.remove('d-none');
  const campo = document.querySelector('.cabecera-busqueda input');
  if (campo) campo.value = texto;
}

// Primera carga de planes; si no hay ninguno pero sí personas, se abre su pestaña
async function cargarPlanes(personas) {
  await reponerPosicion(listado.reiniciar());
  actualizarLimpiar();
  const encontradas = await personas;
  if (encontradas > 0 && cargados === 0 && errorPlanes.classList.contains('d-none')) {
    pestanas.seleccionar(document.getElementById('pestana-personas'));
  }
}

async function iniciar() {
  const sesion = api('/auth/yo');
  pintarBusqueda();
  const personas = buscarPersonas(texto);
  const tira = parametros.get('tira');
  if (TITULOS_TIRA[tira]) {
    document.getElementById('titulo-explorar').textContent = TITULOS_TIRA[tira][0];
    document.getElementById('subtitulo-explorar').textContent = TITULOS_TIRA[tira][1];
  }
  campoAmigos.checked = parametros.has('amigos') ? parametros.get('amigos') === 'true' : tira === 'amigos';
  // Los planes no esperan a las opciones, salvo que haga falta alguna para saber qué filtrar
  const esperaOpciones = tira === 'ciudad' || ['categoria', 'momento', 'ciudad'].some((nombre) => parametros.has(nombre));
  categoria = parametros.get('categoria') ?? '';
  for (const nombre of ['tarifa', 'duracion', 'minimo']) {
    if (parametros.has(nombre)) CAMPOS_EN_URL[nombre].value = parametros.get(nombre);
  }
  if (!esperaOpciones) cargarPlanes(personas);

  try {
    await sesion;
  } catch (err) {
    alFallarCarga(err, iniciar);
    return;
  }

  // Las opciones y las ciudades no impiden ver los planes si fallan: quedan solo los filtros que se pudieron cargar
  const [opciones, ciudades] = await Promise.all([
    api('/experiencias/opciones').catch(() => ({ categorias: [], momentos: [] })),
    api('/ciudades').catch(() => []),
  ]);
  pintarOpciones(opciones);
  campoCiudad.append(...ciudades.map((ciudad) => {
    const opcion = crearOpcion(ciudad.id, `${ciudad.nombre} (${ciudad.pais})`);
    opcion.dataset.nombre = ciudad.nombre;
    return opcion;
  }));
  marcarCategoria();

  if (!esperaOpciones) return;
  campoMomento.value = parametros.get('momento') ?? '';
  if (parametros.has('ciudad')) {
    campoCiudad.value = parametros.get('ciudad');
    titularPorCiudad();
    // Sin catálogo (no se pudo cargar) no se puede saber si existe
    if (parametros.get('ciudad') && ciudades.length && !campoCiudad.value) {
      avisarCiudadDesconocida();
      return;
    }
  } else if (tira === 'ciudad') {
    // La ciudad del perfil es texto libre: se busca en el catálogo; si no está, se ven todas
    const perfil = await api('/perfil').catch(() => null);
    const ciudadId = buscarCiudadPorNombre(perfil?.ciudad, ciudades);
    campoCiudad.value = ciudadId ?? '';
    const subtitulo = document.getElementById('subtitulo-explorar');
    if (!perfil) {
      subtitulo.textContent = 'No se ha podido saber tu ciudad: se muestran todas.';
    } else if (perfil.ciudad && ciudades.length && ciudadId === null) {
      subtitulo.textContent = 'Tu ciudad no está en el catálogo: se muestran todas.';
    }
  }
  cargarPlanes(personas);
}

iniciar();
