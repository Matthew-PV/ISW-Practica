// Inicio (/paginas/cuenta/bienvenida.html): saludo y tiras horizontales de planes para descubrir, cada una con
// «Ver más» hacia el explorador. Los planes son los reales de GET /api/experiencias.
// Usa `api` de shared/api.js, `alFallarCarga` y `crearHuecoCarga` de shared/pantalla.js y `crearTarjetaPlan`, `pedirPlanes` y
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

// Crea una tira con su cabecera, el enlace «Ver más» y la fila, con huecos hasta que lleguen sus planes.
function crearTira(tira) {
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
  verMas.href = `/paginas/experiencias/explorar.html?tira=${tira.id}`;
  verMas.textContent = 'Ver más →';

  cabecera.append(textos, verMas);

  const fila = document.createElement('div');
  fila.className = 'tira-fila';
  // Con scroll horizontal y sin contenido enfocable, hay que poder llegar a ella con Tab para desplazarla con las flechas
  fila.tabIndex = 0;
  fila.setAttribute('role', 'group');
  fila.setAttribute('aria-labelledby', titulo.id);
  fila.append(...[1, 2, 3, 4].map(crearHuecoCarga));

  seccion.append(cabecera, fila);
  return seccion;
}

// Texto que ocupa el sitio de las tarjetas: la tira está vacía o no se ha podido cargar.
function crearAvisoTira(texto) {
  const aviso = document.createElement('p');
  aviso.className = 'tira-vacia text-secondary mb-0';
  aviso.textContent = texto;
  return aviso;
}

// Pide los planes de una tira y los pone en su fila. Una tira que falla no tumba a las demás.
async function llenarTira(seccion, tira) {
  const fila = seccion.querySelector('.tira-fila');
  fila.replaceChildren(...[1, 2, 3, 4].map(crearHuecoCarga));
  try {
    const planes = tira.filtros ? (await pedirPlanes({ ...tira.filtros, limite: PLANES_POR_TIRA })).experiencias : [];
    fila.replaceChildren(...(planes.length
      ? planes.map((plan, indice) => crearTarjetaPlan(plan, indice))
      : [crearAvisoTira(tira.vacio)]));
  } catch {
    const reintentar = document.createElement('button');
    reintentar.type = 'button';
    reintentar.className = 'btn btn-sm btn-outline-primary ms-2';
    reintentar.textContent = 'Reintentar';
    reintentar.addEventListener('click', () => llenarTira(seccion, tira));
    const aviso = crearAvisoTira('No se han podido cargar estos planes.');
    aviso.append(reintentar);
    fila.replaceChildren(aviso);
  }
}

// La ciudad del perfil es texto libre: se busca en el catálogo para pedir sus planes. Si algo falla o no
// aparece, la tira de la ciudad se queda sin planes pero las demás siguen
async function pedirCiudad() {
  let ciudad = null;
  try {
    const [perfil, catalogo] = await Promise.all([api('/perfil'), api('/ciudades').catch(() => [])]);
    ciudad = perfil?.ciudad?.trim() || null;
    return { ciudad, ciudadId: ciudad ? buscarCiudadPorNombre(ciudad, catalogo) : null };
  } catch {
    return { ciudad, ciudadId: null };
  }
}

// Al abrir la página: los encabezados con huecos y, en paralelo, el saludo y los planes de cada tira.
// Sin sesión, al inicio de sesión.
async function mostrarInicio() {
  const [tiraCiudad, ...resto] = definirTiras(null, null);
  const secciones = [tiraCiudad, ...resto].map(crearTira);
  document.getElementById('tiras').replaceChildren(...secciones);

  const usuario = api('/auth/yo');
  resto.forEach((tira, indice) => llenarTira(secciones[indice + 1], tira));
  pedirCiudad().then(({ ciudad, ciudadId }) => {
    const tira = definirTiras(ciudad, ciudadId)[0];
    const seccion = crearTira(tira);
    secciones[0].replaceWith(seccion);
    return llenarTira(seccion, tira);
  });

  try {
    document.getElementById('nombre-usuario').textContent = (await usuario).nombreUsuario;
  } catch (err) {
    alFallarCarga(err, mostrarInicio);
  }
}

mostrarInicio();
