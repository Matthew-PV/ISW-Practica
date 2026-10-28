// Explorar (/experiencias/explorar.html): rejilla de planes con filtro por categoría. De momento los planes
// son de ejemplo (shared/ejemplos.js). Acepta ?tira=ciudad|nuevos|amigos (viene de «Ver más» en Inicio)
// solo para titular la página.
// Usa `api` de shared/api.js, `irAlLogin` y `crearBloqueCategoria` de shared/pantalla.js y
// `PLANES_EJEMPLO` y `crearTarjetaPlan` de shared/ejemplos.js.

const CATEGORIAS_FILTRO = [
  ['todas', 'Todos'],
  ['gastronomia', 'Gastronomía'],
  ['cultura', 'Cultura'],
  ['naturaleza', 'Naturaleza'],
  ['noche', 'Noche'],
  ['deporte', 'Deporte'],
  ['rincones', 'Rincones'],
];

const TITULOS_TIRA = {
  ciudad: ['Planes en mi ciudad', 'Lo que se hace cerca de ti.'],
  nuevos: ['Nuevos esta semana', 'Lo último que ha publicado la gente.'],
  amigos: ['Lo que hacen tus amigos', 'Planes de personas que conoces.'],
};

const filtros = document.getElementById('filtros');
const resultados = document.getElementById('resultados');
const sinResultados = document.getElementById('sin-resultados');
const total = document.getElementById('total-planes');

// Categoría de un plan, la misma que pinta su bloque de color
const categoriaDe = (plan) => crearBloqueCategoria(plan.tipo).dataset.categoria;

// Pinta los planes de la categoría elegida y marca su botón
function mostrarCategoria(categoria) {
  const planes = PLANES_EJEMPLO.filter((plan) => categoria === 'todas' || categoriaDe(plan) === categoria);
  resultados.replaceChildren(...planes.map((plan, indice) => crearTarjetaPlan(plan, undefined, indice)));
  sinResultados.classList.toggle('d-none', planes.length !== 0);
  total.textContent = `${planes.length} ${planes.length === 1 ? 'plan' : 'planes'}`;
  for (const boton of filtros.querySelectorAll('button')) {
    boton.setAttribute('aria-pressed', String(boton.dataset.categoria === categoria));
  }
}

for (const [categoria, texto] of CATEGORIAS_FILTRO) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'filtro';
  boton.dataset.categoria = categoria;
  boton.textContent = texto;
  boton.addEventListener('click', () => mostrarCategoria(categoria));
  filtros.append(boton);
}

const tira = TITULOS_TIRA[new URLSearchParams(window.location.search).get('tira')];
if (tira) {
  document.getElementById('titulo-explorar').textContent = tira[0];
  document.getElementById('subtitulo-explorar').textContent = tira[1];
}

// Sin sesión no se puede usar la página
api('/auth/yo').then(() => mostrarCategoria('todas')).catch(irAlLogin);
