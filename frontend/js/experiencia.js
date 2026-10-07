// Obtener parámetros de la URL
const parametros = new URLSearchParams(window.location.search);
const experienciaId = parametros.get('id');

// Elementos del DOM
const mensajeEstado = document.getElementById('mensaje-estado');
const contenidoExperiencia = document.getElementById('contenido-experiencia');
const tituloEl = document.getElementById('detalle-titulo');
const autorEl = document.getElementById('detalle-autor');
const ciudadEl = document.getElementById('detalle-ciudad');
const descEl = document.getElementById('detalle-descripcion');

async function cargarPaginaExperiencia() {
  if (!experienciaId) {
    mostrarError('No se ha especificado ninguna experiencia.');
    return;
  }

  try {
    const experiencia = await api(`/experiencias/${experienciaId}`);

    // Ocultar mensaje de carga y mostrar el contenido
    mensajeEstado.classList.add('d-none');
    contenidoExperiencia.classList.remove('d-none');

    // Inyectar datos (Objetivo 3)
    tituloEl.textContent = experiencia.titulo;
    autorEl.textContent = experiencia.autor.nombreUsuario;
    ciudadEl.textContent = experiencia.ciudad.nombre;
    descEl.textContent = experiencia.descripcion;

    await cargarComentarios();

  } catch (error) {
    // Si da 403 o 404, mostramos «Contenido no disponible» según el criterio (Objetivo 9)
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
    // Usamos la ruta de valoraciones que ya tenías en tu backend
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

// Crea la tarjeta del comentario usando textContent por seguridad (LUC01 / Criterio Validación)
function crearElementoComentario(valoracion) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card shadow-sm';

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const cabecera = document.createElement('div');
  cabecera.className = 'd-flex justify-content-between mb-2';

  // Autor enlazado a su perfil (CS-62)
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
  fechaElemento.className = 'text-muted';
  const fechaValor = valoracion.creadoEn || valoracion.fecha;
  fechaElemento.textContent = fechaValor ? new Date(fechaValor).toLocaleDateString() : '';
  cuerpo.appendChild(fechaElemento);

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

// --- OBJETIVO 5: FORMULARIO Y CONTADOR DE CARACTERES ---
const formValoracion = document.getElementById('form-valoracion');
const inputPuntuacion = document.getElementById('val-puntuacion');
const inputComentario = document.getElementById('val-comentario');
const contadorCaracteres = document.getElementById('contador-caracteres');
const errorValoracion = document.getElementById('error-valoracion');
const btnGuardarValoracion = document.getElementById('btn-guardar-valoracion');

const MAX_COMENTARIO = 255;

// Actualiza el contador dinámicamente y avisa si se acerca al límite
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

// Evitamos que recargue la página al enviar (se preparará en el Objetivo 6)
formValoracion.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log("Puntuación lista para guardar:", inputPuntuacion.value);
});
