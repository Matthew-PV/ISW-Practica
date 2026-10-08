// Página de mi perfil (perfil.html): muestra y permite editar nombreUsuario, ciudad y foto.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js, `listaConCargarMas`,
// `crearEnlacePerfil`, `mostrarMensaje` y `ocultarMensaje` de shared/pantalla.js, `mostrarExperienciasDe` de
// shared/experiencias.js (CS-44: mis experiencias) y `mostrarRequisitosPassword` de
// shared/password.js (CS-64: cambiar la contraseña).

const formulario = document.getElementById('form-perfil');
const cajaError = document.getElementById('error-perfil');
const cajaExito = document.getElementById('exito-perfil');
const boton = formulario.querySelector('button[type="submit"]');

// Pone en el formulario los datos del perfil que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombreUsuario').value = perfil.nombreUsuario;
  document.getElementById('email').value = perfil.email;
  document.getElementById('ciudad').value = perfil.ciudad ?? '';
  mostrarExperienciasDe(perfil.nombreUsuario);

  if (perfil.foto) {
    const img = document.getElementById('foto-perfil');
    img.src = perfil.foto;
    img.classList.remove('d-none');
  }
}

// Rellena el formulario con los datos actuales del perfil
async function cargarPerfil() {
  try {
    mostrarPerfil(await api('/perfil'));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/';
  }
}

// Al pulsar «Guardar cambios» se envían el nombre de usuario y la ciudad al backend
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se ocultan los mensajes del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  cajaExito.classList.add('d-none');
  boton.disabled = true;

  const datos = {
    nombreUsuario: document.getElementById('nombreUsuario').value,
    ciudad: document.getElementById('ciudad').value,
  };

  try {
    // El backend devuelve el perfil ya guardado (sin espacios sobrantes y normalizado)
    const perfil = await api('/perfil', { method: 'PUT', body: JSON.stringify(datos) });
    mostrarPerfil(perfil);
    cajaExito.textContent = 'Perfil actualizado.';
    cajaExito.classList.remove('d-none');
  } catch (err) {
    // Se muestra el mensaje del backend tal cual
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }
  // Se vuelve a habilitar el botón, haya ido bien o mal
  boton.disabled = false;
});

cargarPerfil();

// Solicitudes pendientes que ha recibido la persona de la sesión. Se cargan por separado del
// formulario para que un error al responder no afecte a la edición del perfil.
const solicitudesRecibidas = document.getElementById('solicitudes-recibidas');
const sinSolicitudes = document.getElementById('sin-solicitudes');
const cajaErrorSolicitudes = document.getElementById('error-solicitudes');

function actualizarEstadoSolicitudes() {
  sinSolicitudes.classList.toggle('d-none', solicitudesRecibidas.children.length !== 0);
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
    ['Aceptar', 'btn-success', true],
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
    // CS-45: un amigo nuevo cambia el contador y la lista de amigos de esta misma página
    if (aceptar) {
      recargarRelaciones();
    }
  } catch (err) {
    cajaErrorSolicitudes.textContent = err.message;
    cajaErrorSolicitudes.classList.remove('d-none');
    botonesRespuesta.forEach((botonRespuesta) => { botonRespuesta.disabled = false; });
  }
}

cargarSolicitudesRecibidas();

// Subida de la foto de perfil: se envía en cuanto se elige el archivo, con su propia petición
// (un archivo en lugar de JSON). «Guardar cambios» solo guarda el nombre y la ciudad.
const campoFoto = document.getElementById('foto');
const ayudaFoto = document.getElementById('ayuda-foto');
const textoAyudaFoto = ayudaFoto.textContent;
const cajaErrorFoto = document.getElementById('error-foto');
const cajaExitoFoto = document.getElementById('exito-foto');

campoFoto.addEventListener('change', async () => {
  // Si se cierra el selector sin elegir nada, no hay nada que subir
  if (!campoFoto.files.length) return;
  // Se ocultan los mensajes del intento anterior y se desactiva el campo mientras se sube
  cajaErrorFoto.classList.add('d-none');
  cajaExitoFoto.classList.add('d-none');
  campoFoto.disabled = true;
  ayudaFoto.textContent = 'Subiendo foto...';

  // FormData = formulario multipart; el backend espera el archivo en el campo `foto`
  const datos = new FormData();
  datos.append('foto', campoFoto.files[0]);

  try {
    // El backend valida formato y tamaño, la sube a Cloudinary y devuelve el perfil con la URL nueva
    const perfil = await api('/perfil/foto', { method: 'PUT', body: datos });
    mostrarPerfil(perfil);
    cajaExitoFoto.textContent = 'Foto actualizada.';
    cajaExitoFoto.classList.remove('d-none');
  } catch (err) {
    // Se muestra el mensaje del backend tal cual (formato no permitido, más de 5 MB...)
    cajaErrorFoto.textContent = err.message;
    cajaErrorFoto.classList.remove('d-none');
  }
  // Se vacía el campo (así elegir otra vez el mismo archivo también lo sube) y se reactiva
  campoFoto.value = '';
  campoFoto.disabled = false;
  ayudaFoto.textContent = textoAyudaFoto;
});

// Amigos y seguidores (CS-45): contadores y listados paginados del perfil propio. Se cargan por
// separado del formulario para que un error aquí no afecte a la edición del perfil.
const cajaErrorRelaciones = document.getElementById('error-relaciones');
const PERSONAS_POR_PAGINA = 20;

// Crea la fila de una persona, que enlaza a su perfil (usuario.html). El nombre se incorpora como
// texto para que nunca se interprete como HTML aportado por otra persona.
function crearPersona(persona) {
  const fila = crearEnlacePerfil(document.createElement('a'), persona);
  fila.className = 'list-group-item list-group-item-action d-flex align-items-center gap-2';
  fila.dataset.usuarioId = persona.id;

  const foto = document.createElement('img');
  foto.src = persona.foto;
  foto.alt = '';
  foto.width = 32;
  foto.height = 32;
  foto.className = 'rounded-circle';

  const nombre = document.createElement('span');
  nombre.textContent = persona.nombreUsuario;

  fila.replaceChildren(foto, nombre);
  return fila;
}

const mostrarErrorRelaciones = (err) => mostrarMensaje(cajaErrorRelaciones, err.message);

// Un listado con «Cargar más» de 'amigos' o 'seguidores' (ver shared/pantalla.js)
function crearListadoPersonas(tipo, idLista, idVacio, idBoton) {
  return listaConCargarMas({
    lista: document.getElementById(idLista),
    vacio: document.getElementById(idVacio),
    botonMas: document.getElementById(idBoton),
    pedir: async (cursor) => {
      ocultarMensaje(cajaErrorRelaciones);
      const despuesDe = cursor === null ? '' : `&despuesDe=${cursor}`;
      const { personas, siguiente } = await api(`/perfil/${tipo}?limite=${PERSONAS_POR_PAGINA}${despuesDe}`);
      return { elementos: personas, siguiente };
    },
    crear: crearPersona,
    alFallar: mostrarErrorRelaciones,
  });
}

const listadoAmigos = crearListadoPersonas('amigos', 'lista-amigos', 'sin-amigos', 'mas-amigos');
const listadoSeguidores = crearListadoPersonas('seguidores', 'lista-seguidores', 'sin-seguidores', 'mas-seguidores');

// Pide los contadores de amigos y seguidores. Devuelve false si fallan (y lo muestra).
async function cargarContadores() {
  ocultarMensaje(cajaErrorRelaciones);
  try {
    const resumen = await api('/perfil/resumen');
    document.getElementById('total-amigos').textContent = resumen.amigos;
    document.getElementById('total-seguidores').textContent = resumen.seguidores;
    return true;
  } catch (err) {
    mostrarErrorRelaciones(err);
    return false;
  }
}

// Al abrir la página: los contadores y la primera página de cada listado.
async function cargarRelaciones() {
  if (await cargarContadores()) {
    await listadoAmigos.cargar();
    await listadoSeguidores.cargar();
  }
}

// Vuelve a empezar los contadores y los dos listados (por ejemplo, tras aceptar una solicitud).
async function recargarRelaciones() {
  if (await cargarContadores()) {
    await listadoAmigos.reiniciar();
    await listadoSeguidores.reiniciar();
  }
}

cargarRelaciones();

// CS-64: cambiar la contraseña. Hay que dar la actual y repetir la nueva; los requisitos de la
// nueva se marcan mientras se escribe (el del nombre usa el que hay en el formulario del perfil).
const formPassword = document.getElementById('form-password');
const campoPasswordActual = document.getElementById('password-actual');
const campoPasswordNueva = document.getElementById('password-nueva');
const campoPasswordRepetida = document.getElementById('password-repetida');
const cajaErrorPassword = document.getElementById('error-password');
const cajaExitoPassword = document.getElementById('exito-password');
const botonPassword = formPassword.querySelector('button[type="submit"]');

const marcarRequisitosPassword = mostrarRequisitosPassword(
  campoPasswordNueva,
  document.getElementById('requisitos-password'),
  () => document.getElementById('nombreUsuario').value
);

function mostrarErrorPassword(mensaje) {
  cajaErrorPassword.textContent = mensaje;
  cajaErrorPassword.classList.remove('d-none');
}

formPassword.addEventListener('submit', async (e) => {
  e.preventDefault();
  cajaErrorPassword.classList.add('d-none');
  cajaExitoPassword.classList.add('d-none');

  if (campoPasswordNueva.value !== campoPasswordRepetida.value) {
    mostrarErrorPassword('Las dos contraseñas nuevas no coinciden');
    return;
  }

  botonPassword.disabled = true;
  try {
    await api('/perfil/password', {
      method: 'PUT',
      body: JSON.stringify({ actual: campoPasswordActual.value, nueva: campoPasswordNueva.value }),
    });
    formPassword.reset();
    marcarRequisitosPassword();
    cajaExitoPassword.textContent = 'Contraseña cambiada.';
    cajaExitoPassword.classList.remove('d-none');
  } catch (err) {
    // Lo escrito se mantiene para poder corregirlo
    mostrarErrorPassword(err.message);
  }
  botonPassword.disabled = false;
});

