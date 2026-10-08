// Página de una experiencia (experiencia.html?id=7): título, autor y ciudad, las valoraciones y
// comentarios (CS-63), las de amigos y seguidores (CS-48) y el formulario para valorarla. Si la
// experiencia no existe o no se puede ver, solo se muestra «Contenido no disponible» (CS-30).
// «Útil» y «Reportar» funcionan solo en la pantalla: no guardan nada hasta CS-02 y CS-04.
// Usa `api` de shared/api.js y `listaConCargarMas`, `crearEnlacePerfil`, `mostrarMensaje`,
// `ocultarMensaje` e `irAlLogin` de shared/pantalla.js.

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
const listaComentarios = document.getElementById('lista-comentarios');
const listaAmigos = document.getElementById('lista-valoraciones-amigos');

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
      crearEnlacePerfil(autorEl, experiencia.autor, miUsuarioId);
    } else {
      autorEl.textContent = 'Usuario anónimo';
    }
    ciudadEl.textContent = experiencia.ciudad?.nombre || 'Ciudad desconocida';
    descEl.textContent = experiencia.descripcion;

    // El autor no puede valorar su propia experiencia: solo los demás ven el formulario
    const autorId = experiencia.autorId || (experiencia.autor && experiencia.autor.id);
    if (autorId !== yo.id) {
      cajaFormulario.classList.remove('d-none');
      cargarMiValoracion();
    }

    listadoAmigos.cargar();
    await listadoComentarios.cargar();
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
    irAlLogin();
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
  const autorEnlace = crearEnlacePerfil(document.createElement('a'), valoracion.usuario, miUsuarioId);
  autorEnlace.className = 'text-decoration-none fw-bold';

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

// Alerta al final de una lista cuando no se ha podido cargar una página
function avisarFalloDeCarga(lista, texto) {
  const alertaError = document.createElement('div');
  alertaError.className = 'alert alert-danger mt-3';
  alertaError.textContent = texto;
  lista.appendChild(alertaError);
}

// Pide una página de valoraciones (todas o las de amigos) con el cursor de «Cargar más»
async function pedirValoraciones(ruta, cursor) {
  const despuesDe = cursor === null ? '' : `?despuesDe=${cursor}`;
  const { valoraciones, siguiente } = await api(`/experiencias/${experienciaId}${ruta}${despuesDe}`);
  return { elementos: valoraciones, siguiente };
}

// --- OBJETIVO 7: «Útil» (solo en la pantalla hasta CS-02) ---
// Escribe el texto del botón con su contador
function pintarUtil(boton, cantidad) {
  const contador = document.createElement('span');
  contador.className = 'badge text-bg-light ms-1';
  contador.textContent = cantidad;
  boton.replaceChildren('👍 Útil ', contador);
}

// Crea la tarjeta de una valoración de la lista general, con «Útil» y «Reportar»
function crearElementoComentario(valoracion) {
  const { tarjeta, cuerpo } = crearTarjetaValoracion(valoracion);
  const acciones = document.createElement('div');
  acciones.className = 'mt-2';
  // En mi propio comentario no se puede marcar «Útil» ni reportar
  const esMio = valoracion.usuario?.id === miUsuarioId;

  const btnUtil = document.createElement('button');
  btnUtil.className = 'btn btn-sm btn-outline-success';
  let cantidadUtiles = valoracion.utiles || 0;
  let leDiUtil = valoracion.leDiUtil || false;
  if (leDiUtil) btnUtil.classList.replace('btn-outline-success', 'btn-success');
  pintarUtil(btnUtil, cantidadUtiles);
  if (esMio) {
    btnUtil.disabled = true;
    btnUtil.title = 'No puedes votar tu propio comentario';
  }
  // Marcar o desmarcar suma o resta uno al contador
  btnUtil.addEventListener('click', () => {
    leDiUtil = !leDiUtil;
    cantidadUtiles += leDiUtil ? 1 : -1;
    btnUtil.classList.toggle('btn-success', leDiUtil);
    btnUtil.classList.toggle('btn-outline-success', !leDiUtil);
    pintarUtil(btnUtil, cantidadUtiles);
  });

  // --- OBJETIVO 8: «Reportar» (solo en la pantalla hasta CS-04) ---
  const btnReportar = document.createElement('button');
  btnReportar.className = 'btn btn-sm btn-outline-danger ms-2';
  btnReportar.textContent = '🚨 Reportar';
  btnReportar.disabled = esMio;
  btnReportar.addEventListener('click', () => abrirReporte(valoracion));

  acciones.append(btnUtil, btnReportar);
  cuerpo.appendChild(acciones);
  return tarjeta;
}

// --- OBJETIVO 4: COMENTARIOS Y «CARGAR MÁS» ---
const listadoComentarios = listaConCargarMas({
  lista: listaComentarios,
  vacio: document.getElementById('sin-comentarios'),
  botonMas: document.getElementById('btn-cargar-mas'),
  pedir: (cursor) => pedirValoraciones('/valoraciones', cursor),
  crear: crearElementoComentario,
  alFallar: (error) => {
    if (!tratarErrorDeAcceso(error)) {
      avisarFalloDeCarga(listaComentarios, 'Problema de conexión al cargar los comentarios. Inténtalo de nuevo.');
    }
  },
});

// --- CS-48: VALORACIONES DE AMIGOS Y SEGUIDORES ---
// Las de mis amigos (con la amistad aceptada) y de quienes me siguen, con su propio cursor
const listadoAmigos = listaConCargarMas({
  lista: listaAmigos,
  vacio: document.getElementById('sin-valoraciones-amigos'),
  botonMas: document.getElementById('btn-mas-amigos'),
  pedir: (cursor) => pedirValoraciones('/valoraciones/amigos', cursor),
  crear: (valoracion) => crearTarjetaValoracion(valoracion).tarjeta,
  alFallar: (error) => {
    if (!tratarErrorDeAcceso(error)) {
      avisarFalloDeCarga(listaAmigos, 'Problema de conexión al cargar las valoraciones de tus amigos. Inténtalo de nuevo.');
    }
  },
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
  const cercaDelLimite = actual >= MAX_COMENTARIO - 20;
  contadorCaracteres.classList.toggle('text-muted', !cercaDelLimite);
  contadorCaracteres.classList.toggle('text-danger', cercaDelLimite);
  contadorCaracteres.classList.toggle('fw-bold', cercaDelLimite);
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

  ocultarMensaje(errorValoracion);
  btnGuardarValoracion.disabled = true;

  const datos = { puntuacion: Number(inputPuntuacion.value) };
  if (inputComentario.value.trim() !== '') {
    datos.comentario = inputComentario.value.trim();
  }

  try {
    await api(`/experiencias/${experienciaId}/valoracion`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });

    await listadoComentarios.reiniciar();

    btnGuardarValoracion.textContent = '¡Guardado!';
    setTimeout(() => {
      btnGuardarValoracion.textContent = 'Actualizar valoración';
    }, 2000);
  } catch (error) {
    // Lo escrito no se borra: se puede volver a intentar
    if (!tratarErrorDeAcceso(error)) {
      mostrarMensaje(errorValoracion, error.message || 'Error al guardar la valoración');
    }
  } finally {
    btnGuardarValoracion.disabled = false;
  }
});

// --- OBJETIVO 8: VENTANA DE REPORTE (solo en la pantalla hasta CS-04) ---
const dialogoReporte = document.getElementById('dialogo-reporte');
const formReporte = document.getElementById('form-reporte');
const mensajeReporte = document.getElementById('mensaje-reporte');
const btnEnviarReporte = document.getElementById('btn-enviar-reporte');

// Si el comentario de la ventana abierta ya estaba reportado
let comentarioYaReportado = false;

// Abre la ventana para reportar una valoración, con el formulario vacío
function abrirReporte(valoracion) {
  comentarioYaReportado = valoracion.yaReportado || false;
  formReporte.reset();
  mensajeReporte.className = 'alert d-none small';
  btnEnviarReporte.disabled = false;
  btnEnviarReporte.classList.remove('d-none');
  dialogoReporte.showModal();
}

// La «X» y «Cancelar» cierran la ventana (Esc también, por ser un <dialog>)
for (const boton of dialogoReporte.querySelectorAll('[data-cerrar-reporte]')) {
  boton.addEventListener('click', () => dialogoReporte.close());
}

formReporte.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnEnviarReporte.disabled = true;

  // Simula el tiempo de respuesta del servidor que tendrá CS-04
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (comentarioYaReportado) {
    mensajeReporte.className = 'alert alert-warning small';
    mensajeReporte.textContent = 'Ya habías reportado este comentario anteriormente.';
  } else {
    mensajeReporte.className = 'alert alert-success small';
    mensajeReporte.textContent = 'Comentario reportado correctamente. Gracias por avisarnos.';
    comentarioYaReportado = true;
    btnEnviarReporte.classList.add('d-none');
    // La ventana se cierra sola a los 2 segundos
    setTimeout(() => dialogoReporte.close(), 2000);
  }
});

// Iniciar
cargarPaginaExperiencia();
