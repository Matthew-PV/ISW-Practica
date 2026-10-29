// Inicio (/cuenta/bienvenida.html): saludo y tiras horizontales de planes para descubrir, cada una con
// «Ver más» hacia el explorador. Los planes son los reales de GET /api/experiencias.
// Usa `api` de shared/api.js, `irAlLogin` de shared/pantalla.js y `crearTarjetaPlan`, `pedirPlanes` y
// `buscarCiudadPorNombre` de shared/planes.js.

const PLANES_POR_TIRA = 8;

// Cada tira: su título, su subtítulo, lo que se pide a la API para llenarla y qué decir si queda vacía.
function definirTiras(ciudad, ciudadId) {
  return [
    {
      id: 'ciudad', titulo: 'Ver experiencias en mi ciudad', subtitulo: ciudad ?? 'Indica tu ciudad en el perfil',
      filtros: ciudadId === null ? null : { ciudadId },
      vacio: ciudadId === null && ciudad ? 'Tu ciudad no está en el catálogo de PlanB.'
        : ciudadId === null ? 'Indica tu ciudad en tu perfil para ver aquí sus experiencias.' : 'Aún no hay experiencias en tu ciudad.',
    },
    { id: 'nuevos', titulo: 'Nuevas experiencias', subtitulo: 'Lo último que ha publicado la gente', filtros: {}, vacio: 'Aún no hay experiencias publicadas.' },
    {
      id: 'amigos', titulo: 'Lo que hacen tus amigos', subtitulo: 'Experiencias de personas que conoces', filtros: { amigos: true },
      vacio: 'Tus amigos aún no han publicado experiencias.',
    },
  ];
}

// Crea una tira con su cabecera, el enlace «Ver más» y la fila de tarjetas (o su aviso si no hay planes).
function crearTira(tira, planes) {
  const seccion = document.createElement('section');
  seccion.className = 'tira';
  seccion.setAttribute('aria-labelledby', `tira-${tira.id}`);

  const cabecera = document.createElement('div');
  cabecera.className = 'tira-cabecera';

  const textos = document.createElement('div');
  const titulo = document.createElement('h2');
  titulo.className = 'h5 mb-0';
  titulo.id = `tira-${tira.id}`;
  titulo.textContent = tira.titulo;
  const subtitulo = document.createElement('p');
  subtitulo.className = 'tira-subtitulo mb-0';
  subtitulo.textContent = tira.subtitulo;
  textos.append(titulo, subtitulo);

  const verMas = document.createElement('a');
  verMas.className = 'tira-ver-mas';
  verMas.href = `/experiencias/explorar.html?tira=${tira.id}`;
  verMas.textContent = 'Ver más →';

  cabecera.append(textos, verMas);

  const fila = document.createElement('div');
  fila.className = 'tira-fila';
  // Con scroll horizontal y sin contenido enfocable, hay que poder llegar a ella con Tab para desplazarla con las flechas
  fila.tabIndex = 0;
  fila.setAttribute('role', 'group');
  fila.setAttribute('aria-labelledby', titulo.id);
  fila.append(...planes.map((plan, indice) => crearTarjetaPlan(plan, indice)));
  if (planes.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'tira-vacia text-secondary mb-0';
    vacio.textContent = tira.vacio;
    fila.append(vacio);
  }

  seccion.append(cabecera, fila);
  return seccion;
}

// Al abrir la página: el saludo y las tiras. Sin sesión, al inicio de sesión.
async function mostrarInicio() {
  let usuario;
  try {
    usuario = await api('/auth/yo');
  } catch {
    irAlLogin();
    return;
  }
  document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;

  // La ciudad del perfil es texto libre: se busca en el catálogo para pedir sus planes. Si algo falla o no
  // aparece, la tira de la ciudad se queda sin planes pero las demás siguen
  let ciudad = null;
  let ciudadId = null;
  try {
    ciudad = (await api('/perfil'))?.ciudad?.trim() || null;
    if (ciudad) ciudadId = buscarCiudadPorNombre(ciudad, await api('/ciudades'));
  } catch {
    // se queda sin ciudad
  }

  // Una tira que falla no tumba a las demás
  const tiras = await Promise.all(definirTiras(ciudad, ciudadId).map(async (tira) => {
    let planes = [];
    if (tira.filtros) {
      try {
        planes = (await pedirPlanes({ ...tira.filtros, limite: PLANES_POR_TIRA })).experiencias;
      } catch {
        // la tira muestra su aviso de vacío
      }
    }
    return crearTira(tira, planes);
  }));
  document.getElementById('tiras').replaceChildren(...tiras);
}

mostrarInicio();
