// Inicio (/cuenta/bienvenida.html): saludo y tiras horizontales de planes para descubrir, cada una con
// «Ver más» hacia el explorador. De momento los planes son de ejemplo (shared/ejemplos.js); cuando exista
// el algoritmo bastará con cambiar de dónde sale cada lista.
// Usa `api` de shared/api.js, `irAlLogin` de shared/pantalla.js y `PLANES_EJEMPLO` y `crearTarjetaPlan` de
// shared/ejemplos.js.

// Cada tira: su título, su subtítulo y los planes que muestra. `ciudad` sustituye a la de los planes.
function definirTiras(ciudad) {
  return [
    { id: 'ciudad', titulo: 'Ver planes en mi ciudad', subtitulo: ciudad, planes: PLANES_EJEMPLO.slice(0, 8), ciudad },
    { id: 'nuevos', titulo: 'Nuevos esta semana', subtitulo: 'Lo último que ha publicado la gente', planes: PLANES_EJEMPLO.slice(4, 12) },
    { id: 'amigos', titulo: 'Lo que hacen tus amigos', subtitulo: 'Planes de personas que conoces', planes: PLANES_EJEMPLO.slice(2, 10) },
  ];
}

// Crea una tira con su cabecera, el enlace «Ver más» y la fila de tarjetas.
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
  verMas.href = `/experiencias/explorar.html?tira=${tira.id}`;
  verMas.textContent = 'Ver más →';

  cabecera.append(textos, verMas);

  const fila = document.createElement('div');
  fila.className = 'tira-fila';
  tira.planes.forEach((plan, indice) => fila.append(crearTarjetaPlan(plan, tira.ciudad, indice)));

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

  // La ciudad del perfil es texto libre; si no hay o falla la petición, se usa Madrid
  let ciudad = 'Madrid';
  try {
    const perfil = await api('/perfil');
    if (perfil?.ciudad) ciudad = perfil.ciudad;
  } catch {
    // se queda la ciudad por defecto
  }

  document.getElementById('tiras').replaceChildren(...definirTiras(ciudad).map(crearTira));
}

mostrarInicio();
