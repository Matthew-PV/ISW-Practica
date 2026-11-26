// Página Amigos (/paginas/social/amigos.html): arriba las solicitudes de amistad pendientes que ha recibido la
// persona de la sesión, con «Aceptar» y «Rechazar»; debajo, su lista de amigos. Se ejecuta nada más
// cargar la página. Usa `api` de shared/api.js y `crearEnlacePerfil`, `crearFilaPersona`,
// `listaConCargarMas`, `crearHuecoCarga`, `crearBotonesAmistad`, `mostrarErrorConReintento` y `ocultarMensaje` de shared/pantalla.js.
// La campana de la cabecera (shared/cabecera.js) también responde solicitudes: las dos partes se avisan con
// el evento 'solicitud-respondida' ({ detail: { id, aceptada } }).

const solicitudesRecibidas = document.getElementById('solicitudes-recibidas');
const sinSolicitudes = document.getElementById('sin-solicitudes');
const cajaErrorSolicitudes = document.getElementById('error-solicitudes');

// «No tienes solicitudes pendientes» se ve cuando no queda ninguna por responder (las ya respondidas
// siguen en la lista con su mensaje, pero sin data-solicitud-id)
function actualizarEstadoSolicitudes() {
  const hay = solicitudesRecibidas.querySelector('[data-solicitud-id]') !== null;
  sinSolicitudes.classList.toggle('d-none', hay);
}

// Crea una solicitud con sus dos acciones. El nombre se incorpora como texto para que nunca se
// interprete como HTML aportado por otra persona.
function crearSolicitud(solicitud) {
  const fila = document.createElement('div');
  fila.className = 'list-group-item d-flex justify-content-between align-items-center gap-3 fila-solicitud';
  fila.dataset.solicitudId = solicitud.id;

  const persona = crearEnlacePerfil(document.createElement('a'), solicitud.solicitante);
  persona.className = 'd-flex align-items-center gap-3 fila-solicitud-persona';
  const foto = document.createElement('img');
  foto.src = solicitud.solicitante.foto;
  foto.alt = '';
  foto.width = 40;
  foto.height = 40;
  foto.className = 'rounded-circle';
  const nombre = document.createElement('span');
  nombre.textContent = solicitud.solicitante.nombreUsuario;
  persona.replaceChildren(foto, nombre);

  const acciones = document.createElement('div');
  acciones.className = 'd-flex gap-2';
  acciones.append(...crearBotonesAmistad('recibida', (accion) =>
    responderSolicitud(solicitud, accion === 'aceptar', fila)));

  fila.append(persona, acciones);
  return fila;
}

function mostrarSolicitudes(solicitudes) {
  solicitudesRecibidas.replaceChildren(...solicitudes.map(crearSolicitud));
  actualizarEstadoSolicitudes();
}

async function cargarSolicitudesRecibidas() {
  cajaErrorSolicitudes.classList.add('d-none');
  sinSolicitudes.classList.add('d-none');
  solicitudesRecibidas.replaceChildren(crearHuecoCarga());
  try {
    mostrarSolicitudes(await api('/amistades/solicitudes'));
  } catch (err) {
    solicitudesRecibidas.replaceChildren();
    mostrarErrorConReintento(cajaErrorSolicitudes, err.message, cargarSolicitudesRecibidas);
  }
}

// Sustituye la fila por su resultado, con enlace al perfil si se aceptó, y le da el foco: si no, al
// desaparecer el botón pulsado el foco caería al principio de la página.
function mostrarResultado(fila, solicitud, aceptar) {
  delete fila.dataset.solicitudId;
  const mensaje = document.createElement('p');
  mensaje.className = 'mb-0';
  mensaje.tabIndex = -1;
  if (aceptar) {
    const enlace = crearEnlacePerfil(document.createElement('a'), solicitud.solicitante);
    enlace.textContent = 'Ver perfil';
    mensaje.append(`Ahora sois amigos de ${solicitud.solicitante.nombreUsuario}. `, enlace);
  } else {
    mensaje.textContent = `Solicitud rechazada: ${solicitud.solicitante.nombreUsuario}.`;
  }
  fila.replaceChildren(mensaje);
  actualizarEstadoSolicitudes();
  mensaje.focus();
}

async function responderSolicitud(solicitud, aceptar, fila) {
  cajaErrorSolicitudes.classList.add('d-none');
  const botonesRespuesta = fila.querySelectorAll('button');
  botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = true; });

  try {
    await api(`/amistades/${solicitud.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ aceptar }),
    });
    mostrarResultado(fila, solicitud, aceptar);
    document.dispatchEvent(new CustomEvent('solicitud-respondida', { detail: { id: solicitud.id, aceptada: aceptar } }));
  } catch (err) {
    // Ya no se puede responder (se resolvió en otro sitio): se vuelve a pedir la lista
    if (err.status === 400 || err.status === 404) cargarSolicitudesRecibidas();
    cajaErrorSolicitudes.textContent = err.message;
    cajaErrorSolicitudes.classList.remove('d-none');
    botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = false; });
  }
}

// Una solicitud respondida (aquí o en la campana): se quita de las pendientes y, si se aceptó, se
// recarga la lista de amigos
document.addEventListener('solicitud-respondida', (e) => {
  solicitudesRecibidas.querySelector(`[data-solicitud-id="${e.detail.id}"]`)?.remove();
  actualizarEstadoSolicitudes();
  if (e.detail.aceptada) listadoAmigos.reiniciar();
});

// Lista de amigos (GET /perfil/amigos) con «Cargar más»
const cajaErrorAmigos = document.getElementById('error-amigos');
const listadoAmigos = listaConCargarMas({
  lista: document.getElementById('lista-amigos'),
  vacio: document.getElementById('sin-amigos'),
  botonMas: document.getElementById('mas-amigos'),
  pedir: async (cursor) => {
    ocultarMensaje(cajaErrorAmigos);
    const despuesDe = cursor === null ? '' : `&despuesDe=${cursor}`;
    const { personas, siguiente } = await api(`/perfil/amigos?limite=20${despuesDe}`);
    return { elementos: personas, siguiente };
  },
  crear: crearFilaPersona,
  alFallar: (err, reintentar) => mostrarErrorConReintento(cajaErrorAmigos, err.message, reintentar),
});

cargarSolicitudesRecibidas();
listadoAmigos.cargar();
