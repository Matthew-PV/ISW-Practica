// Página de solicitudes (solicitudes.html): las solicitudes de amistad pendientes que ha recibido la
// persona de la sesión, con «Aceptar» y «Rechazar». Se ejecuta nada más cargar la página.
// Usa `api` de shared/api.js.

const solicitudesRecibidas = document.getElementById('solicitudes-recibidas');
const sinSolicitudes = document.getElementById('sin-solicitudes');
const cajaErrorSolicitudes = document.getElementById('error-solicitudes');

function actualizarEstadoSolicitudes() {
  const hay = solicitudesRecibidas.children.length !== 0;
  sinSolicitudes.classList.toggle('d-none', hay);
}

// Crea una solicitud con sus dos acciones. El nombre se incorpora como texto para que nunca se
// interprete como HTML aportado por otra persona.
function crearSolicitud(solicitud) {
  const fila = document.createElement('div');
  fila.className = 'list-group-item d-flex justify-content-between align-items-center gap-2';

  const nombre = document.createElement('span');
  nombre.textContent = solicitud.solicitante.nombreUsuario;

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
    botonRespuesta.addEventListener('click', () => responderSolicitud(solicitud.id, aceptar, fila));
    acciones.append(botonRespuesta);
  }

  fila.append(nombre, acciones);
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

async function responderSolicitud(solicitudId, aceptar, fila) {
  cajaErrorSolicitudes.classList.add('d-none');
  const botonesRespuesta = fila.querySelectorAll('button');
  botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = true; });

  try {
    await api(`/amistades/${solicitudId}`, {
      method: 'PATCH',
      body: JSON.stringify({ aceptar }),
    });
    fila.remove();
    actualizarEstadoSolicitudes();
  } catch (err) {
    cajaErrorSolicitudes.textContent = err.message;
    cajaErrorSolicitudes.classList.remove('d-none');
    botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = false; });
  }
}

cargarSolicitudesRecibidas();
