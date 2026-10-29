// Página Amigos (/paginas/social/amigos.html): arriba las solicitudes de amistad pendientes que ha recibido la
// persona de la sesión, con «Aceptar» y «Rechazar»; debajo, su lista de amigos. Se ejecuta nada más
// cargar la página. Usa `api` de shared/api.js y `crearEnlacePerfil`, `crearFilaPersona`,
// `listaConCargarMas`, `mostrarMensaje` y `ocultarMensaje` de shared/pantalla.js.
// La campana de la cabecera (shared/cabecera.js) también responde solicitudes: las dos partes se avisan con
// el evento 'solicitud-respondida' ({ detail: { id } }).

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
  foto.width = 48;
  foto.height = 48;
  foto.className = 'rounded-circle';
  const nombre = document.createElement('span');
  nombre.textContent = solicitud.solicitante.nombreUsuario;
  persona.replaceChildren(foto, nombre);

  const acciones = document.createElement('div');
  acciones.className = 'd-flex gap-2';
  for (const [texto, clase, aceptar] of [
    ['Aceptar', 'btn-outline-success', true],
    ['Rechazar', 'btn-outline-danger', false],
  ]) {
    const botonRespuesta = document.createElement('button');
    botonRespuesta.type = 'button';
    botonRespuesta.className = `btn btn-sm ${clase}`;
    botonRespuesta.textContent = texto;
    botonRespuesta.addEventListener('click', () => responderSolicitud(solicitud, aceptar, fila));
    acciones.append(botonRespuesta);
  }

  fila.append(persona, acciones);
  return fila;
}

function mostrarSolicitudes(solicitudes) {
  solicitudesRecibidas.replaceChildren(...solicitudes.map(crearSolicitud));
  actualizarEstadoSolicitudes();
}

async function cargarSolicitudesRecibidas() {
  cajaErrorSolicitudes.classList.add('d-none');
  try {
    mostrarSolicitudes(await api('/amistades/solicitudes'));
  } catch (err) {
    cajaErrorSolicitudes.textContent = err.message;
    cajaErrorSolicitudes.classList.remove('d-none');
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
    document.dispatchEvent(new CustomEvent('solicitud-respondida', { detail: { id: solicitud.id } }));
    if (aceptar) {
      listadoAmigos.reiniciar();
    }
  } catch (err) {
    cajaErrorSolicitudes.textContent = err.message;
    cajaErrorSolicitudes.classList.remove('d-none');
    botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = false; });
  }
}

// La campana respondió una solicitud: se quita de esta lista
document.addEventListener('solicitud-respondida', (e) => {
  solicitudesRecibidas.querySelector(`[data-solicitud-id="${e.detail.id}"]`)?.remove();
  actualizarEstadoSolicitudes();
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
  alFallar: (err) => mostrarMensaje(cajaErrorAmigos, err.message),
});

cargarSolicitudesRecibidas();
listadoAmigos.cargar();
