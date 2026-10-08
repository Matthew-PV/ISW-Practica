// Página de una experiencia (experiencia.html?id=7): título, autor y ciudad, las valoraciones y
// comentarios (CS-63), las de amigos y seguidores (CS-48) y el formulario para valorarla. Si la
// experiencia no existe o no se puede ver, solo se muestra «Contenido no disponible» (CS-30).
// «Útil» y «Reportar» funcionan solo en la pantalla: no guardan nada hasta CS-02 y CS-04.
// Usa `api` de shared/api.js.

// Obtener parámetros de la URL
const parametros = new URLSearchParams(window.location.search);
const experienciaId = parametros.get('id');
let miUsuarioId = null;

// Elementos del DOM
const mensajeEstado = document.getElementById('mensaje-estado');
const contenidoExperiencia = document.getElementById('contenido-experiencia');
const tituloEl = document.getElementById('detalle-titulo');
const autorEl = document.getElementById('detalle-autor');
const ciudadEl = document.getElementById('detalle-ciudad');
const descEl = document.getElementById('detalle-descripcion');
const cajaFormulario = document.getElementById('caja-formulario-valoracion');

// Convierte `enlace` en el enlace al perfil de `usuario`: el mío lleva a «Mi perfil» y el de otra
// persona, a su página (CS-62). El nombre se pone como texto, nunca como HTML.
function enlacePerfil(enlace, usuario) {
  enlace.textContent = usuario.nombreUsuario;
  enlace.href = usuario.id === miUsuarioId
    ? 'perfil.html'
    : `usuario.html?nombre=${encodeURIComponent(usuario.nombreUsuario)}`;
}

async function cargarPaginaExperiencia() {
  if (!experienciaId) {
    mostrarError('No se ha especificado ninguna experiencia.');
    return;
  }

  try {
    // Pedimos la experiencia y nuestros propios datos de usuario a la vez
    const [experiencia, yo] = await Promise.all([
      api(`/experiencias/${experienciaId}`),
      api('/auth/yo')
    ]);

    miUsuarioId = yo.id;

    mensajeEstado.classList.add('d-none');
    contenidoExperiencia.classList.remove('d-none');

    tituloEl.textContent = experiencia.titulo;
    // Las experiencias antiguas pueden no tener autor
    if (experiencia.autor) {
      enlacePerfil(autorEl, experiencia.autor);
    } else {
      autorEl.textContent = 'Usuario anónimo';
    }
    ciudadEl.textContent = experiencia.ciudad?.nombre || 'Ciudad desconocida';
    descEl.textContent = experiencia.descripcion;

    // El autor no puede valorar su propia experiencia: solo los demás ven el formulario
    const autorId = experiencia.autorId || (experiencia.autor && experiencia.autor.id);
    if (autorId !== yo.id) {
      cajaFormulario.classList.remove('d-none'); // Mostrar formulario
      cargarMiValoracion();
    }

    cargarValoracionesAmigos();
    await cargarComentarios();
  } catch (error) {
    if (!tratarErrorDeAcceso(error)) {
      mostrarError(error.message);
    }
  }
}

function mostrarError(mensaje) {
  mensajeEstado.className = 'alert alert-danger';
  mensajeEstado.textContent = mensaje;
  contenidoExperiencia.classList.add('d-none');
}

// CS-30: si la experiencia no existe o ya no se puede ver, se borra todo lo que se mostraba y
// solo queda el aviso, sin ningún dato de la experiencia.
function mostrarNoDisponible() {
  tituloEl.textContent = '';
  autorEl.textContent = '';
  autorEl.removeAttribute('href');
  ciudadEl.textContent = '';
  descEl.textContent = '';
  listaComentarios.replaceChildren();
  listaAmigos.replaceChildren();
  mostrarError('Contenido no disponible');
}

// Errores que no dependen de la sección: 404 (la experiencia no existe o ya no se puede ver) y
// 401 (sin sesión: se vuelve al login). Devuelve true si el error era uno de ellos.
function tratarErrorDeAcceso(error) {
  if (error.status === 404) {
    mostrarNoDisponible();
    return true;
  }
  if (error.status === 401) {
    window.location.href = '/';
    return true;
  }
  return false;
}

// Crea la tarjeta común de una valoración: autor enlazado a su perfil, puntuación, texto y fecha,
// todo con textContent para que un comentario con HTML se vea como texto.
// Devuelve { tarjeta, cuerpo } para poder añadirle botones.
function crearTarjetaValoracion(valoracion) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card shadow-sm';
  tarjeta.dataset.valoracionId = valoracion.id;

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const cabecera = document.createElement('div');
  cabecera.className = 'd-flex justify-content-between mb-2';

  // Autor enlazado a su perfil
  const autorEnlace = document.createElement('a');
  autorEnlace.className = 'text-decoration-none fw-bold';
  enlacePerfil(autorEnlace, valoracion.usuario);

  // Puntuación
  const puntuacion = document.createElement('span');
  puntuacion.className = 'badge bg-secondary';
  puntuacion.textContent = `${valoracion.puntuacion}/5`;

  cabecera.append(autorEnlace, puntuacion);
  cuerpo.appendChild(cabecera);

  // Texto del comentario (si existe)
  if (valoracion.comentario) {
    const texto = document.createElement('p');
    texto.className = 'card-text mb-2 text-break';
    texto.textContent = valoracion.comentario;
    cuerpo.appendChild(texto);
  }

  // Fecha
  const fechaElemento = document.createElement('small');
  fechaElemento.className = 'text-muted d-block mb-2';
  fechaElemento.textContent = new Date(valoracion.creadaEn).toLocaleDateString('es-ES');
  cuerpo.appendChild(fechaElemento);

  tarjeta.appendChild(cuerpo);
  return { tarjeta, cuerpo };
}

// --- OBJETIVO 4: COMENTARIOS Y «CARGAR MÁS» ---
// Paginación por cursor: `siguienteComentarios` es el valor que devolvió el backend para pedir la
// página siguiente (null al empezar y cuando ya no quedan más).
let siguienteComentarios = null;

const listaComentarios = document.getElementById('lista-comentarios');
const sinComentarios = document.getElementById('sin-comentarios');
const btnCargarMas = document.getElementById('btn-cargar-mas');

// Pide la página siguiente de valoraciones y la añade a la lista sin repetir ninguna
async function cargarComentarios() {
  const cursor = siguienteComentarios === null ? '' : `?despuesDe=${siguienteComentarios}`;
  try {
    const { valoraciones, siguiente } = await api(`/experiencias/${experienciaId}/valoraciones${cursor}`);

    valoraciones
      .filter((valoracion) => !listaComentarios.querySelector(`[data-valoracion-id="${valoracion.id}"]`))
      .forEach(crearElementoComentario);

    siguienteComentarios = siguiente;
    sinComentarios.classList.toggle('d-none', listaComentarios.children.length !== 0);
    btnCargarMas.classList.toggle('d-none', siguiente === null);
  } catch (error) {
    if (tratarErrorDeAcceso(error)) return;
    console.error('Error al cargar comentarios:', error);

    // Mostramos una alerta visual al final de la lista de comentarios
    const alertaError = document.createElement('div');
    alertaError.className = 'alert alert-danger mt-3';
    alertaError.textContent = 'Problema de conexión al cargar los comentarios. Inténtalo de nuevo.';
    listaComentarios.appendChild(alertaError);
  }
}

// Vuelve a pedir la lista desde el principio (por ejemplo, después de guardar mi valoración)
function recargarComentarios() {
  siguienteComentarios = null;
  listaComentarios.replaceChildren();
  return cargarComentarios();
}

// Crea la tarjeta del comentario, con los botones «Útil» y «Reportar», y la añade a la lista
function crearElementoComentario(valoracion) {
  const { tarjeta, cuerpo } = crearTarjetaValoracion(valoracion);

  // --- OBJETIVO 7: Botón Útil (Simulado visualmente) ---
  const contenedorUtil = document.createElement('div');
  contenedorUtil.className = 'mt-2';

  const btnUtil = document.createElement('button');
  btnUtil.className = 'btn btn-sm btn-outline-success';

  // Comprobamos si el comentario es tuyo para desactivar el botón
  const autorComentarioId = valoracion.usuarioId || valoracion.usuario?.id;
  if (autorComentarioId === miUsuarioId) {
    btnUtil.disabled = true;
    btnUtil.title = "No puedes votar tu propio comentario";
  }

  // Variables locales simuladas
  let cantidadUtiles = valoracion.utiles || 0;
  let leDiUtil = valoracion.leDiUtil || false;

  if (leDiUtil) btnUtil.classList.replace('btn-outline-success', 'btn-success');
  btnUtil.innerHTML = `👍 Útil <span class="badge text-bg-light ms-1">${cantidadUtiles}</span>`;

  // Evento simulado para marcar/desmarcar útil (Con manejo de errores integrado)
  btnUtil.addEventListener('click', async () => {
    btnUtil.disabled = true;
    try {
      // Cuando tengas el backend: await api(...)
      leDiUtil = !leDiUtil;
      cantidadUtiles += leDiUtil ? 1 : -1;

      if (leDiUtil) {
        btnUtil.classList.replace('btn-outline-success', 'btn-success');
      } else {
        btnUtil.classList.replace('btn-success', 'btn-outline-success');
      }
      btnUtil.innerHTML = `👍 Útil <span class="badge text-bg-light ms-1">${cantidadUtiles}</span>`;
    } catch (error) {
      console.error('Error al dar útil:', error);
      // Deshacemos el cambio visual porque falló el servidor
      leDiUtil = !leDiUtil;
      cantidadUtiles += leDiUtil ? 1 : -1;
      alert('Error de red: No se pudo registrar tu voto.');
    } finally {
      btnUtil.disabled = false;
    }
  });

  contenedorUtil.appendChild(btnUtil);

  // --- OBJETIVO 8: Botón Reportar ---
  const btnReportar = document.createElement('button');
  btnReportar.className = 'btn btn-sm btn-outline-danger ms-2';
  btnReportar.innerHTML = `🚨 Reportar`;

  if (autorComentarioId === miUsuarioId) {
    btnReportar.disabled = true;
  }

  btnReportar.addEventListener('click', () => {
    valoracionReporteId = valoracion.id;
    comentarioYaReportado = valoracion.yaReportado || false;

    // Reseteamos el formulario
    formReporte.reset();
    mensajeReporte.classList.add('d-none');
    btnEnviarReporte.disabled = false;
    btnEnviarReporte.classList.remove('d-none');

    // MAGIA PURA: Forzamos la apertura del modal modificando su CSS directamente
    const modal = document.getElementById('modal-reporte');
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'; // Fondo oscuro semitransparente
    setTimeout(() => modal.classList.add('show'), 10);
  });

  contenedorUtil.appendChild(btnReportar);

  cuerpo.appendChild(contenedorUtil);
  listaComentarios.appendChild(tarjeta);
}

// Evento para el botón de cargar más
btnCargarMas.addEventListener('click', async () => {
  btnCargarMas.disabled = true;
  btnCargarMas.textContent = 'Cargando...';

  await cargarComentarios();

  btnCargarMas.disabled = false;
  btnCargarMas.textContent = 'Cargar más';
});

// --- CS-48: VALORACIONES DE AMIGOS Y SEGUIDORES ---
// Las de mis amigos (con la amistad aceptada) y de quienes me siguen, con su propio cursor.
let siguienteAmigos = null;

const listaAmigos = document.getElementById('lista-valoraciones-amigos');
const sinAmigos = document.getElementById('sin-valoraciones-amigos');
const btnMasAmigos = document.getElementById('btn-mas-amigos');

async function cargarValoracionesAmigos() {
  const cursor = siguienteAmigos === null ? '' : `?despuesDe=${siguienteAmigos}`;
  try {
    const { valoraciones, siguiente } = await api(`/experiencias/${experienciaId}/valoraciones/amigos${cursor}`);

    for (const valoracion of valoraciones) {
      if (!listaAmigos.querySelector(`[data-valoracion-id="${valoracion.id}"]`)) {
        listaAmigos.appendChild(crearTarjetaValoracion(valoracion).tarjeta);
      }
    }

    siguienteAmigos = siguiente;
    sinAmigos.classList.toggle('d-none', listaAmigos.children.length !== 0);
    btnMasAmigos.classList.toggle('d-none', siguiente === null);
  } catch (error) {
    if (tratarErrorDeAcceso(error)) return;
    const alertaError = document.createElement('div');
    alertaError.className = 'alert alert-danger';
    alertaError.textContent = 'Problema de conexión al cargar las valoraciones de tus amigos. Inténtalo de nuevo.';
    listaAmigos.appendChild(alertaError);
  }
}

btnMasAmigos.addEventListener('click', async () => {
  btnMasAmigos.disabled = true;
  await cargarValoracionesAmigos();
  btnMasAmigos.disabled = false;
});

// --- OBJETIVO 5 y 6: FORMULARIO, CONTADOR Y GUARDADO ---
const formValoracion = document.getElementById('form-valoracion');
const inputPuntuacion = document.getElementById('val-puntuacion');
const inputComentario = document.getElementById('val-comentario');
const contadorCaracteres = document.getElementById('contador-caracteres');
const errorValoracion = document.getElementById('error-valoracion');
const btnGuardarValoracion = document.getElementById('btn-guardar-valoracion');

const MAX_COMENTARIO = 1000; // El mismo máximo que comprueba el backend (CS-01)

// Actualiza el contador «n / 1000» y lo resalta al acercarse al máximo
function actualizarContador() {
  const actual = inputComentario.value.length;
  contadorCaracteres.textContent = `${actual} / ${MAX_COMENTARIO}`;

  if (actual >= MAX_COMENTARIO - 20) {
    contadorCaracteres.classList.remove('text-muted');
    contadorCaracteres.classList.add('text-danger', 'fw-bold');
  } else {
    contadorCaracteres.classList.add('text-muted');
    contadorCaracteres.classList.remove('text-danger', 'fw-bold');
  }
}

inputComentario.addEventListener('input', actualizarContador);

// Si ya había valorado la experiencia, rellena el formulario con mi valoración (null si no)
async function cargarMiValoracion() {
  try {
    const miValoracion = await api(`/experiencias/${experienciaId}/valoracion`);

    if (miValoracion) {
      inputPuntuacion.value = miValoracion.puntuacion;
      inputComentario.value = miValoracion.comentario ?? '';
      actualizarContador();
      btnGuardarValoracion.textContent = 'Actualizar valoración';
    }
  } catch (error) {
    // Si falla por otra causa, el formulario se queda vacío y se puede valorar igualmente
    tratarErrorDeAcceso(error);
  }
}

// Guardar o actualizar la valoración. El backend crea la mía o actualiza la que ya tenía.
formValoracion.addEventListener('submit', async (e) => {
  e.preventDefault();

  // El navegador ya impide enviar sin una puntuación entera del 1 al 5 (required, min y max);
  // esto lo asegura también si el envío no pasa por su validación
  if (!formValoracion.checkValidity()) {
    formValoracion.reportValidity();
    return;
  }

  errorValoracion.classList.add('d-none');
  btnGuardarValoracion.disabled = true;

  const datos = {
    puntuacion: Number(inputPuntuacion.value)
  };
  if (inputComentario.value.trim() !== '') {
    datos.comentario = inputComentario.value.trim();
  }

  try {
    await api(`/experiencias/${experienciaId}/valoracion`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });

    await recargarComentarios();

    btnGuardarValoracion.textContent = '¡Guardado!';
    setTimeout(() => {
      btnGuardarValoracion.textContent = 'Actualizar valoración';
    }, 2000);

  } catch (error) {
    // Lo escrito no se borra: se puede volver a intentar
    if (!tratarErrorDeAcceso(error)) {
      errorValoracion.textContent = error.message || 'Error al guardar la valoración';
      errorValoracion.classList.remove('d-none');
    }
  } finally {
    btnGuardarValoracion.disabled = false;
  }
});

// --- OBJETIVO 8: LÓGICA DEL MODAL DE REPORTE ---
let valoracionReporteId = null;
let comentarioYaReportado = false;

const formReporte = document.getElementById('form-reporte');
const mensajeReporte = document.getElementById('mensaje-reporte');
const btnEnviarReporte = document.getElementById('btn-enviar-reporte');
const modalReporteEl = document.getElementById('modal-reporte');

// Función para cerrar el modal manualmente
function cerrarModalManual() {
  modalReporteEl.classList.remove('show');
  setTimeout(() => {
    modalReporteEl.style.display = 'none';
  }, 300); // Esperamos a que acabe la animación
}

// Escuchamos los clics en la "X" y en el botón "Cancelar" para cerrarlo
const botonesCerrar = modalReporteEl.querySelectorAll('[data-bs-dismiss="modal"]');
botonesCerrar.forEach(btn => btn.addEventListener('click', cerrarModalManual));

formReporte.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnEnviarReporte.disabled = true;

  try {
    // Simulamos un pequeño retraso de red
    await new Promise(resolve => setTimeout(resolve, 500));

    mensajeReporte.classList.remove('d-none', 'alert-success', 'alert-warning');

    if (comentarioYaReportado) {
      mensajeReporte.classList.add('alert-warning');
      mensajeReporte.textContent = 'Ya habías reportado este comentario anteriormente.';
    } else {
      mensajeReporte.classList.add('alert-success');
      mensajeReporte.textContent = 'Comentario reportado correctamente. Gracias por avisarnos.';
      comentarioYaReportado = true;
      btnEnviarReporte.classList.add('d-none');

      // Cerramos tras 2 segundos de éxito
      setTimeout(() => {
        cerrarModalManual();
      }, 2000);
    }

  } catch (error) {
    mensajeReporte.classList.remove('d-none', 'alert-success', 'alert-warning');
    mensajeReporte.classList.add('alert-danger');
    mensajeReporte.textContent = 'Error al enviar el reporte.';
    btnEnviarReporte.disabled = false;
  }
});

// Iniciar
cargarPaginaExperiencia();
