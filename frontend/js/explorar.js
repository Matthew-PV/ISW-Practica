// Explorar (/experiencias/explorar.html): rejilla de planes reales con filtros de categoría, momento adecuado,
// ciudad y «solo mis amigos», paginada con «Cargar más». Acepta ?tira=ciudad|nuevos|amigos (viene de «Ver más»
// en Inicio) para titular la página y dejar puestos los filtros de esa tira, y ?texto= (viene del buscador).
// Usa `api` de shared/api.js, `irAlLogin`, `ocultarMensaje`, `mostrarErrorConReintento` y `listaConCargarMas` de
// shared/pantalla.js y `crearTarjetaPlan`, `pedirPlanes` y `buscarCiudadPorNombre` de shared/planes.js.

const PLANES_POR_PAGINA = 12;

const TITULOS_TIRA = {
  ciudad: ['Experiencias en mi ciudad', 'Lo que se hace cerca de ti.'],
  nuevos: ['Nuevas experiencias', 'Lo último que ha publicado la gente.'],
  amigos: ['Lo que hacen tus amigos', 'Experiencias de personas que conoces.'],
};

const filtros = document.getElementById('filtros');
const campoMomento = document.getElementById('filtro-momento');
const campoCiudad = document.getElementById('filtro-ciudad');
const campoAmigos = document.getElementById('filtro-amigos');
const errorPlanes = document.getElementById('error-planes');
const total = document.getElementById('total-planes');

const parametros = new URLSearchParams(window.location.search);
const texto = parametros.get('texto')?.trim() ?? '';
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
      despuesDe: cursor,
      limite: PLANES_POR_PAGINA,
    });
    cargados += experiencias.length;
    total.textContent = `${cargados} ${cargados === 1 ? 'plan' : 'planes'}${siguiente === null ? '' : ' o más'}`;
    return { elementos: experiencias, siguiente };
  },
  crear: (plan) => crearTarjetaPlan(plan),
  alFallar: (err, reintentar) => mostrarErrorConReintento(errorPlanes, err.message, reintentar),
});

// Marca el botón de la categoría elegida ('' = todas) y vuelve a pedir los planes
function elegirCategoria(nueva) {
  categoria = nueva;
  for (const boton of filtros.querySelectorAll('button')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.categoria === categoria));
  }
  return listado.reiniciar();
}

function crearOpcion(valor, textoOpcion) {
  const opcion = document.createElement('option');
  opcion.value = valor;
  opcion.textContent = textoOpcion;
  return opcion;
}

// Pinta los botones de categoría y el selector de momento con las opciones del backend
function pintarOpciones({ categorias, momentos }) {
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

for (const campo of [campoMomento, campoCiudad, campoAmigos]) campo.addEventListener('change', () => listado.reiniciar());

async function iniciar() {
  try {
    await api('/auth/yo');
  } catch {
    irAlLogin();
    return;
  }

  const tira = parametros.get('tira');
  if (TITULOS_TIRA[tira]) {
    document.getElementById('titulo-explorar').textContent = TITULOS_TIRA[tira][0];
    document.getElementById('subtitulo-explorar').textContent = TITULOS_TIRA[tira][1];
  }
  campoAmigos.checked = tira === 'amigos';

  // Las opciones y las ciudades no impiden ver los planes si fallan: quedan solo los filtros que se pudieron cargar
  const [opciones, ciudades] = await Promise.all([
    api('/experiencias/opciones').catch(() => ({ categorias: [], momentos: [] })),
    api('/ciudades').catch(() => []),
  ]);
  pintarOpciones(opciones);
  campoCiudad.append(...ciudades.map((ciudad) => crearOpcion(ciudad.id, `${ciudad.nombre} (${ciudad.pais})`)));
  filtros.firstElementChild?.setAttribute('aria-pressed', 'true');
  for (const boton of filtros.querySelectorAll('button:not(:first-child)')) boton.setAttribute('aria-pressed', 'false');

  if (tira === 'ciudad') {
    // La ciudad del perfil es texto libre: se busca en el catálogo; si no está, se ven todas
    const perfil = await api('/perfil').catch(() => null);
    campoCiudad.value = buscarCiudadPorNombre(perfil?.ciudad, ciudades) ?? '';
  }
  listado.cargar();
}

iniciar();
