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
// CORRECCIÓN: Faltaba capturar la caja del formulario para poder mostrarla/ocultarla
const cajaFormulario = document.getElementById('caja-formulario-valoracion');

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
    autorEl.textContent = experiencia.autor.nombreUsuario;
    ciudadEl.textContent = experiencia.ciudad.nombre;
    descEl.textContent = experiencia.descripcion;

    await cargarComentarios();

    // Comprobamos si somos el autor para mostrar u ocultar el formulario
    const autorId = experiencia.autorId || (experiencia.autor && experiencia.autor.id);
    if (autorId !== yo.id) {
      cajaFormulario.classList.remove('d-none'); // Mostrar formulario
      await cargarMiValoracion(); // Solo cargar mi valoración si puedo valorar
    }

  } catch (error) {
    if (error.message.includes('permiso') || error.message.includes('existe')) {
      mostrarError('Contenido no disponible');
    } else {
      mostrarError('Error de red o servidor: ' + error.message);
    }
  }
}

function mostrarError(mensaje) {
  mensajeEstado.className = 'alert alert-danger';
  mensajeEstado.textContent = mensaje;
  contenidoExperiencia.classList.add('d-none');
}

// Iniciar
cargarPaginaExperiencia();

// --- OBJETIVO 4: COMENTARIOS Y PAGINACIÓN ---
let paginaComentarios = 1;
const LIMITE_COMENTARIOS = 10;

const listaComentarios = document.getElementById('lista-comentarios');
const sinComentarios = document.getElementById('sin-comentarios');
const btnCargarMas = document.getElementById('btn-cargar-mas');

// Función que pide las valoraciones al backend y las dibuja
async function cargarComentarios() {
  try {
    const ruta = `/experiencias/${experienciaId}/valoracion?pagina=${paginaComentarios}&limite=${LIMITE_COMENTARIOS}`;
    const resultado = await api(ruta);

    const valoraciones = resultado.valoraciones || [];
    const total = resultado.total || 0;

    // Si es la primera página y no hay nada, mostramos el mensaje
    if (paginaComentarios === 1 && valoraciones.length === 0) {
      sinComentarios.classList.remove('d-none');
      btnCargarMas.classList.add('d-none');
      return;
    }

    // Dibujamos cada comentario
    valoraciones.forEach(crearElementoComentario);

    // Si los comentarios mostrados son menores que el total, mostramos el botón
    const mostrados = listaComentarios.children.length;
    if (mostrados < total) {
      btnCargarMas.classList.remove('d-none');
    } else {
      btnCargarMas.classList.add('d-none');
    }
  } catch (error) {
    console.error('Error al cargar comentarios:', error);
  }
}

// Crea la tarjeta del comentario usando textContent por seguridad
function crearElementoComentario(valoracion) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card shadow-sm';

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const cabecera = document.createElement('div');
  cabecera.className = 'd-flex justify-content-between mb-2';

  // Autor enlazado a su perfil
  const autorEnlace = document.createElement('a');
  autorEnlace.href = `perfil.html?id=${valoracion.usuarioId || valoracion.usuario?.id}`;
  autorEnlace.className = 'text-decoration-none fw-bold';
  autorEnlace.textContent = valoracion.usuario?.nombreUsuario || 'Usuario anónimo';

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
  const fechaValor = valoracion.creadoEn || valoracion.fecha;
  fechaElemento.textContent = fechaValor ? new Date(fechaValor).toLocaleDateString() : '';
  cuerpo.appendChild(fechaElemento);

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

  // Evento simulado para marcar/desmarcar útil
  btnUtil.addEventListener('click', () => {
    leDiUtil = !leDiUtil;
    cantidadUtiles += leDiUtil ? 1 : -1;

    if (leDiUtil) {
      btnUtil.classList.replace('btn-outline-success', 'btn-success');
    } else {
      btnUtil.classList.replace('btn-success', 'btn-outline-success');
    }
    btnUtil.innerHTML = `👍 Útil <span class="badge text-bg-light ms-1">${cantidadUtiles}</span>`;
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

  tarjeta.appendChild(cuerpo);
  listaComentarios.appendChild(tarjeta);
}

// Evento para el botón de cargar más
btnCargarMas.addEventListener('click', async () => {
  paginaComentarios++;
  btnCargarMas.disabled = true;
  btnCargarMas.textContent = 'Cargando...';

  await cargarComentarios();

  btnCargarMas.disabled = false;
  btnCargarMas.textContent = 'Cargar más';
});

// --- OBJETIVO 5 y 6: FORMULARIO, CONTADOR Y GUARDADO ---
const formValoracion = document.getElementById('form-valoracion');
const inputPuntuacion = document.getElementById('val-puntuacion');
const inputComentario = document.getElementById('val-comentario');
const contadorCaracteres = document.getElementById('contador-caracteres');
const errorValoracion = document.getElementById('error-valoracion');
const btnGuardarValoracion = document.getElementById('btn-guardar-valoracion');

const MAX_COMENTARIO = 255;
let miValoracionId = null;

// Actualiza el contador dinámicamente
inputComentario.addEventListener('input', () => {
  const actual = inputComentario.value.length;
  contadorCaracteres.textContent = `${actual} / ${MAX_COMENTARIO}`;

  if (actual >= MAX_COMENTARIO - 20) {
    contadorCaracteres.classList.remove('text-muted');
    contadorCaracteres.classList.add('text-danger', 'fw-bold');
  } else {
    contadorCaracteres.classList.add('text-muted');
    contadorCaracteres.classList.remove('text-danger', 'fw-bold');
  }
});

// Comprueba si el usuario ya ha valorado esta experiencia
async function cargarMiValoracion() {
  try {
    const miValoracion = await api(`/experiencias/${experienciaId}/valoracion/mia`);

    if (miValoracion && miValoracion.id) {
      miValoracionId = miValoracion.id;
      inputPuntuacion.value = miValoracion.puntuacion;

      if (miValoracion.comentario) {
        inputComentario.value = miValoracion.comentario;
        contadorCaracteres.textContent = `${inputComentario.value.length} / ${MAX_COMENTARIO}`;
      }

      btnGuardarValoracion.textContent = 'Actualizar valoración';
    }
  } catch (error) {
    // Silencioso: significa que no ha valorado aún
  }
}

// Guardar o actualizar la valoración
formValoracion.addEventListener('submit', async (e) => {
  e.preventDefault();

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

    paginaComentarios = 1;
    listaComentarios.replaceChildren();
    await cargarComentarios();

    btnGuardarValoracion.textContent = '¡Guardado!';
    setTimeout(() => {
      btnGuardarValoracion.textContent = 'Actualizar valoración';
    }, 2000);

  } catch (error) {
    errorValoracion.textContent = error.message || 'Error al guardar la valoración';
    errorValoracion.classList.remove('d-none');
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
