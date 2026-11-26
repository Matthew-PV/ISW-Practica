
 // Página de una experiencia: título, descripción, valoraciones y ficha.
 // CS-53: muestra duración en minutos y tarifa en euros.
// CS-50: fichas de sus lugares, con shared/lugares.js.
 // CS-30: si no existe o no es visible, muestra «Contenido no disponible».
 // «Útil» está desactivado y «Reportar» avisa de que no envía nada, hasta CS-02 y CS-04.

const parametros = new URLSearchParams(window.location.search);
const experienciaId = parametros.get('id');
let miUsuarioId = null;

const mensajeEstado = document.getElementById('mensaje-estado');
const contenidoExperiencia = document.getElementById('contenido-experiencia');
const tituloEl = document.getElementById('detalle-titulo');
const autorEl = document.getElementById('detalle-autor');
const ciudadEl = document.getElementById('detalle-ciudad');
const visibilidadEl = document.getElementById('detalle-visibilidad');
const tipoEl = document.getElementById('detalle-tipo');
const momentoEl = document.getElementById('detalle-momento');
const descEl = document.getElementById('detalle-descripcion');
const cajaFormulario = document.getElementById('caja-formulario-valoracion');
const listaComentarios = document.getElementById('lista-comentarios');
const listaAmigos = document.getElementById('lista-valoraciones-amigos');
const cajaResumen = document.getElementById('resumen-valoraciones');
const cajaMiValoracion = document.getElementById('mi-valoracion');

// CS-53: elementos de duración y tarifa.
const duracionEl = document.getElementById('detalle-duracion');
const tarifaEl = document.getElementById('detalle-tarifa');
const filaDuracion = document.getElementById('fila-duracion');
const filaTarifa = document.getElementById('fila-tarifa');

// «Volver» conserva la página anterior cuando pertenece a PlanB.
function rutaDeVuelta() {
  try {
    const origen = new URL(document.referrer);
    if (origen.origin === window.location.origin &&
        !origen.pathname.startsWith('/paginas/acceso/') &&
        origen.pathname !== window.location.pathname) {
      return origen.pathname + origen.search;
    }
  } catch {
    // Enlace directo sin página anterior.
  }
  return '/paginas/cuenta/bienvenida.html';
}

// Al volver de editar (js/cuenta/mis-planes.js) se confirma el guardado
function avisarSiSeEdito() {
  if (sessionStorage.getItem('planb-plan-editado') !== experienciaId) return;
  sessionStorage.removeItem('planb-plan-editado');
  document.getElementById('aviso-cambios').classList.remove('d-none');
}
avisarSiSeEdito();
// Si el navegador recupera la pantalla anterior, se recarga para no enseñar el plan sin los cambios
window.addEventListener('pageshow', (e) => {
  if (e.persisted && sessionStorage.getItem('planb-plan-editado') === experienciaId) window.location.reload();
});

const enlaceVolver = document.getElementById('enlace-volver');
enlaceVolver.href = rutaDeVuelta();
// Si hay una pantalla de PlanB detrás, se retrocede en el historial: vuelve como estaba (filtros,
// pestaña y posición) en lugar de abrirse de cero
enlaceVolver.addEventListener('click', (e) => {
  const referente = document.referrer;
  if (referente.startsWith(`${window.location.origin}/`) &&
      !referente.includes('/paginas/acceso/') && window.history.length > 1) {
    e.preventDefault();
    window.history.back();
  }
});

// Los saltos dentro de la página («Valorar», «Cambiar», «Saltar al contenido») no añaden entradas al
// historial, para que «Volver» vuelva a la primera
document.addEventListener('click', (e) => {
  const salto = e.target.closest?.('a[href^="#"]');
  if (!salto) return;
  e.preventDefault();
  window.location.replace(salto.getAttribute('href'));
});

// CS-53: muestra los datos disponibles.
// Las experiencias antiguas pueden tener ambos campos a null.
function pintarDuracionTarifa(experiencia) {
  const tieneDuracion = experiencia.duracionMinutos != null;
  const tieneTarifa = experiencia.tarifa != null;

  filaDuracion.hidden = !tieneDuracion;
  filaTarifa.hidden = !tieneTarifa;

  duracionEl.textContent = tieneDuracion ? formatearDuracion(experiencia.duracionMinutos) : '';
  tarifaEl.textContent = tieneTarifa ? formatearTarifa(experiencia.tarifa) : '';
}

let mapaDetalle;

// CS-50: una ficha por lugar, en el orden del autor y con su nota. Sin lugares no hay apartado.
async function mostrarLugares(experiencia) {
  const seccion = document.getElementById('seccion-lugares');
  try {
    const lugares = await lugaresDe(experiencia);
    document.getElementById('lista-lugares').replaceChildren(...lugares.map((lugar) => {
      const elemento = document.createElement('li');
      const ficha = crearFichaLugar(lugar);
      if (lugar.nota) {
        const nota = document.createElement('p');
        nota.className = 'ficha-lugar-nota';
        nota.textContent = lugar.nota;
        ficha.querySelector('.ficha-lugar-datos').append(nota);
      }
      elemento.append(ficha);
      return elemento;
    }));
    seccion.hidden = !lugares.length;
    // CS-73: con el apartado ya visible, para que el mapa conozca su tamaño
    mapaDetalle ??= crearMapaLugares(document.getElementById('mapa-lugares'));
    mapaDetalle.mostrar(lugares.map((lugar) => ({ lugar })));
  } catch (error) {
    document.getElementById('mensaje-lugares').textContent = error.message;
    seccion.hidden = false;
  }
}

async function cargarPaginaExperiencia() {
  if (!experienciaId) {
    mostrarError('No se ha especificado ningún plan.');
    return;
  }

  try {
    const [experiencia, yo] = await Promise.all([
      api(`/experiencias/${experienciaId}`),
      api('/auth/yo'),
    ]);

    miUsuarioId = yo.id;

    mensajeEstado.classList.add('d-none');
    contenidoExperiencia.classList.remove('d-none');

    tituloEl.textContent = experiencia.titulo;
    document.getElementById('detalle-categoria').replaceChildren(
      crearBloqueCategoria(experiencia.tipo)
    );

    if (experiencia.autor) {
      crearEnlacePerfil(autorEl, experiencia.autor, miUsuarioId);
    } else {
      autorEl.textContent = 'Usuario anónimo';
    }

    ciudadEl.textContent =
      experiencia.ciudad?.nombre || 'Ciudad desconocida';

    document.getElementById('btn-copiar-enlace').dataset.visibilidad = experiencia.visibilidad;
    const etiqueta = ETIQUETAS_VISIBILIDAD[experiencia.visibilidad];
    if (etiqueta) {
      visibilidadEl.className = etiqueta.clase;
      visibilidadEl.textContent = etiqueta.texto;
    }

    descEl.textContent = experiencia.descripcion;
    document.title = `PlanB · ${experiencia.titulo}`;
    tipoEl.textContent = experiencia.tipo || 'Sin indicar';
    momentoEl.textContent = experiencia.momentoAdecuado ?? '';

    document.getElementById('fila-momento').hidden =
      !experiencia.momentoAdecuado;

    // CS-53: presentar duración y tarifa.
    pintarDuracionTarifa(experiencia);

    // El hueco del resumen se reserva mientras llega, para que lo de debajo no salte
    document.getElementById('resumen-vacio').hidden = true;
    document.getElementById('resumen-cifras').hidden = true;
    cajaResumen.append(crearHuecoCarga());
    cajaResumen.hidden = false;
    cargarResumen();
    mostrarLugares(experiencia);

    const autorId = experiencia.autorId ||
      (experiencia.autor && experiencia.autor.id);

    if (autorId !== yo.id) {
      cajaFormulario.classList.remove('d-none');
      document.getElementById('enlace-valorar').classList.remove('d-none');
      cargarMiValoracion();
    } else {
      document.getElementById('boton-editar').href =
        `/paginas/cuenta/mis-planes.html?editar=${experiencia.id}`;
      document.getElementById('caja-editar').classList.remove('d-none');
    }

    // Las listas no se enseñan hasta saber qué pestaña toca, para no cambiarla a la vista
    const listas = [listaAmigos, listaComentarios];
    listas.forEach((lista) => lista.classList.add('invisible'));
    await Promise.all([
      listadoAmigos.cargar(),
      listadoComentarios.cargar(),
    ]);

    if (
      !listaAmigos.querySelector('[data-id-elemento]') &&
      listaComentarios.querySelector('[data-id-elemento]')
    ) {
      pestanas.seleccionar(
        document.getElementById('pestana-todas')
      );
    }
    listas.forEach((lista) => lista.classList.remove('invisible'));
  } catch (error) {
    if (!tratarErrorDeAcceso(error)) {
      mostrarError(error.message);
      mostrarErrorConReintento(mensajeEstado, error.message, () => window.location.reload());
    }
  }
}

function mostrarError(mensaje) {
  mensajeEstado.className = 'alert alert-danger';
  mensajeEstado.setAttribute('role', 'alert');
  mensajeEstado.textContent = mensaje;
  contenidoExperiencia.classList.add('d-none');
}

// CS-30: no mostrar datos de una experiencia inaccesible.
function mostrarNoDisponible() {
  tituloEl.textContent = '';
  autorEl.textContent = '';
  autorEl.removeAttribute('href');
  ciudadEl.textContent = '';
  visibilidadEl.textContent = '';
  tipoEl.textContent = '';
  momentoEl.textContent = '';
  descEl.textContent = '';
  document.getElementById('lista-lugares').replaceChildren();
  mapaDetalle?.mostrar([]);

  // CS-53: ocultar también duración y tarifa.
  duracionEl.textContent = '';
  tarifaEl.textContent = '';
  filaDuracion.hidden = true;
  filaTarifa.hidden = true;

  cajaResumen.hidden = true;
  cajaMiValoracion.hidden = true;
  document.getElementById('mi-valoracion-contenido')
    .replaceChildren();
  listaComentarios.replaceChildren();
  listaAmigos.replaceChildren();

  mostrarError('Contenido no disponible');
}

function tratarErrorDeAcceso(error) {
  if (error.status === 404) {
    mostrarNoDisponible();
    return true;
  }
  // Al guardar ya se ha avisado sin salir (shared/api.js): se enseña el error y no se pierde lo escrito
  if (error.status === 401 && !error.sesionAvisada) {
    irAlLogin();
    return true;
  }
  return false;
}

// Tarjeta de una valoración.
function crearTarjetaValoracion(valoracion) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card shadow-sm';
  tarjeta.dataset.valoracionId = valoracion.id;

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const cabecera = document.createElement('div');
  cabecera.className = 'd-flex justify-content-between mb-2';

  const autorEnlace = crearEnlacePerfil(
    document.createElement('a'),
    valoracion.usuario,
    miUsuarioId
  );
  autorEnlace.className = 'text-decoration-none fw-bold';

  const puntuacion = crearEstrellas(valoracion.puntuacion);
  cabecera.append(autorEnlace, puntuacion);
  cuerpo.appendChild(cabecera);

  if (valoracion.comentario) {
    const texto = document.createElement('p');
    texto.className = 'card-text mb-2 text-break';
    texto.textContent = valoracion.comentario;
    cuerpo.appendChild(texto);
  }

  const fechaElemento = document.createElement('small');
  fechaElemento.className = 'text-muted d-block mb-2';
  fechaElemento.textContent = new Date(
    valoracion.creadaEn
  ).toLocaleDateString('es-ES');

  cuerpo.appendChild(fechaElemento);
  tarjeta.appendChild(cuerpo);

  return { tarjeta, cuerpo };
}

function avisarFalloDeCarga(lista, texto, reintentar) {
  const alertaError = document.createElement('div');
  alertaError.className = 'alert alert-danger mt-3';
  mostrarErrorConReintento(alertaError, texto, () => {
    alertaError.remove();
    reintentar();
  });
  lista.appendChild(alertaError);
}

async function pedirValoraciones(ruta, cursor) {
  const despuesDe = cursor === null ? '' : `?despuesDe=${cursor}`;
  const { valoraciones, siguiente } = await api(
    `/experiencias/${experienciaId}${ruta}${despuesDe}`
  );
  return { elementos: valoraciones, siguiente };
}

// CS-02: botón Útil. Persistencia pendiente.
function pintarUtil(boton, cantidad) {
  const contador = document.createElement('span');
  contador.className = 'badge text-bg-light ms-1';
  contador.textContent = cantidad;
  boton.replaceChildren('Útil ', contador);
}

function crearElementoComentario(valoracion) {
  const { tarjeta, cuerpo } = crearTarjetaValoracion(valoracion);

  const acciones = document.createElement('div');
  acciones.className = 'mt-2';

  const esMio = valoracion.usuario?.id === miUsuarioId;

  const btnUtil = document.createElement('button');
  btnUtil.type = 'button';
  btnUtil.className = 'btn btn-sm btn-outline-success';

  pintarUtil(btnUtil, valoracion.utiles || 0);

  // CS-02: el voto aún no se guarda, así que no se deja marcar
  btnUtil.disabled = true;
  btnUtil.title = esMio ? 'No puedes votar tu propio comentario' : 'Todavía no está disponible';
  if (valoracion.leDiUtil) btnUtil.classList.replace('btn-outline-success', 'btn-success');
  // Un botón desactivado no enseña su title: el motivo se escribe al lado
  const motivoUtil = document.createElement('span');
  motivoUtil.className = 'small text-secondary ms-2';
  motivoUtil.textContent = btnUtil.title;

  // CS-04: botón Reportar. Persistencia pendiente.
  const btnReportar = document.createElement('button');
  btnReportar.type = 'button';
  btnReportar.className = 'btn btn-sm btn-outline-danger ms-2';
  btnReportar.textContent = 'Reportar';
  btnReportar.disabled = esMio;

  btnReportar.addEventListener(
    'click',
    () => abrirReporte()
  );

  acciones.append(btnUtil, btnReportar, motivoUtil);
  cuerpo.appendChild(acciones);

  return tarjeta;
}

// Lista general de comentarios.
const listadoComentarios = listaConCargarMas({
  lista: listaComentarios,
  vacio: document.getElementById('sin-comentarios'),
  botonMas: document.getElementById('btn-cargar-mas'),
  pedir: (cursor) => pedirValoraciones('/valoraciones', cursor),
  crear: crearElementoComentario,
  alFallar: (error, reintentar) => {
    if (!tratarErrorDeAcceso(error)) {
      avisarFalloDeCarga(
        listaComentarios,
        'Problema de conexión al cargar los comentarios. Inténtalo de nuevo.',
        reintentar
      );
    }
  },
});

// CS-48: valoraciones de amigos y seguidores.
const listadoAmigos = listaConCargarMas({
  lista: listaAmigos,
  vacio: document.getElementById('sin-valoraciones-amigos'),
  botonMas: document.getElementById('btn-mas-amigos'),
  pedir: (cursor) => pedirValoraciones('/valoraciones/amigos', cursor),
  crear: (valoracion) =>
    crearTarjetaValoracion(valoracion).tarjeta,
  alFallar: (error, reintentar) => {
    if (!tratarErrorDeAcceso(error)) {
      avisarFalloDeCarga(
        listaAmigos,
        'Problema de conexión al cargar las valoraciones de tus amigos. Inténtalo de nuevo.',
        reintentar
      );
    }
  },
});

const pestanas = activarPestanas(
  document.querySelector('[role="tablist"]')
);

// CS-14: resumen de valoraciones.
const formatearNota = (nota) => nota.toLocaleString('es-ES');
const enPlural = (n, singular, plural) =>
  `${n} ${n === 1 ? singular : plural}`;

function pintarResumen({ media, total, distribucion, comentarios }) {
  cajaResumen.querySelector('.hueco-carga')?.remove();
  const hayValoraciones = total > 0;

  document.getElementById('resumen-vacio').hidden =
    hayValoraciones;
  document.getElementById('resumen-cifras').hidden =
    !hayValoraciones;

  document.getElementById('resumen-media').textContent =
    hayValoraciones ? formatearNota(media) : '';

  document.getElementById('resumen-estrellas').replaceChildren(
    ...(hayValoraciones
      ? [crearEstrellas(media, formatearNota(media))]
      : [])
  );

  document.getElementById('resumen-total').textContent =
    enPlural(total, 'valoración', 'valoraciones');

  document.getElementById('resumen-comentarios').textContent =
    enPlural(comentarios, 'comentario', 'comentarios');

  const filas = [];

  for (
    let estrellas = MAX_PUNTUACION;
    estrellas >= 1;
    estrellas--
  ) {
    const cantidad = distribucion[estrellas] ?? 0;

    const fila = document.createElement('li');
    fila.dataset.estrellas = estrellas;

    const etiqueta = document.createElement('span');
    etiqueta.textContent = enPlural(
      estrellas,
      'estrella',
      'estrellas'
    );

    const barra = document.createElement('span');
    barra.className = 'resumen-barra';
    barra.setAttribute('aria-hidden', 'true');

    const relleno = document.createElement('span');
    relleno.style.width = `${
      hayValoraciones ? (cantidad / total) * 100 : 0
    }%`;

    barra.append(relleno);

    const numero = document.createElement('span');
    numero.textContent = cantidad;

    fila.append(etiqueta, barra, numero);
    filas.push(fila);
  }

  document.getElementById('resumen-distribucion')
    .replaceChildren(...filas);

  cajaResumen.hidden = false;
}

async function cargarResumen() {
  try {
    pintarResumen(
      await api(`/experiencias/${experienciaId}/resumen`)
    );
  } catch (error) {
    cajaResumen.hidden = true;
    tratarErrorDeAcceso(error);
  }
}

// Mi valoración.
function pintarMiValoracion(valoracion) {
  const contenido = [crearEstrellas(valoracion.puntuacion)];

  if (valoracion.comentario) {
    const texto = document.createElement('p');
    texto.className = 'mb-0 mt-2 text-break';
    texto.textContent = valoracion.comentario;
    contenido.push(texto);
  }

  document.getElementById('mi-valoracion-contenido')
    .replaceChildren(...contenido);

  cajaMiValoracion.hidden = false;
}

// Estrellas.
const MAX_PUNTUACION = 5;

function crearEstrella(encendida) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');

  svg.setAttribute('viewBox', '-11 -11 22 22');
  svg.setAttribute(
    'class',
    encendida ? 'estrella on' : 'estrella'
  );
  svg.setAttribute('aria-hidden', 'true');

  const forma = document.createElementNS(ns, 'path');
  forma.setAttribute(
    'd',
    'M0-10L2.9-3.1 10-2.5 4.6 2 6.2 9 0 5.3-6.2 9-4.6 2-10-2.5-2.9-3.1Z'
  );

  svg.append(forma);
  return svg;
}

function crearEstrellas(puntuacion, texto = puntuacion) {
  const contenedor = document.createElement('span');
  contenedor.className = 'estrellas';
  contenedor.setAttribute('role', 'img');
  contenedor.setAttribute(
    'aria-label',
    `${texto} de ${MAX_PUNTUACION}`
  );

  for (let i = 1; i <= MAX_PUNTUACION; i++) {
    contenedor.append(
      crearEstrella(i <= Math.round(puntuacion))
    );
  }

  return contenedor;
}

// CS-01: formulario para crear o actualizar valoraciones.
const formValoracion = document.getElementById('form-valoracion');
const inputPuntuacion = document.getElementById('val-puntuacion');
const inputComentario = document.getElementById('val-comentario');
const contadorCaracteres = document.getElementById('contador-caracteres');
const errorValoracion = document.getElementById('error-valoracion');
const btnGuardarValoracion = document.getElementById(
  'btn-guardar-valoracion'
);

const MAX_COMENTARIO = 1000;

const grupoEstrellas = formValoracion.querySelector(
  '[role="radiogroup"]'
);
const botonesEstrella = [];

for (let n = 1; n <= MAX_PUNTUACION; n++) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'estrella-boton';
  boton.setAttribute('role', 'radio');
  boton.setAttribute(
    'aria-label',
    n === 1 ? '1 estrella' : `${n} estrellas`
  );
  boton.append(crearEstrella(false));

  boton.addEventListener('click', () => elegirPuntuacion(n));

  boton.addEventListener('keydown', (e) => {
    const paso = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }[e.key];

    if (!paso) return;

    e.preventDefault();

    const destino =
      (n - 1 + paso + MAX_PUNTUACION) % MAX_PUNTUACION;

    elegirPuntuacion(destino + 1);
    botonesEstrella[destino].focus();
  });

  botonesEstrella.push(boton);
}

grupoEstrellas.append(...botonesEstrella);

function elegirPuntuacion(valor) {
  inputPuntuacion.value = valor;

  botonesEstrella.forEach((boton, i) => {
    boton.classList.toggle('on', i < valor);
    boton.setAttribute(
      'aria-checked',
      String(i + 1 === valor)
    );

    boton.tabIndex =
      i + 1 === (valor || 1) ? 0 : -1;
  });
}

elegirPuntuacion(0);

function actualizarContador() {
  const actual = inputComentario.value.length;

  contadorCaracteres.textContent =
    `${actual} / ${MAX_COMENTARIO}`;

  const cercaDelLimite =
    actual >= MAX_COMENTARIO - 20;

  contadorCaracteres.classList.toggle(
    'text-muted',
    !cercaDelLimite
  );
  contadorCaracteres.classList.toggle(
    'text-danger',
    cercaDelLimite
  );
  contadorCaracteres.classList.toggle(
    'fw-bold',
    cercaDelLimite
  );
}

inputComentario.addEventListener(
  'input',
  actualizarContador
);

// Hasta saber si ya hay valoración, el formulario no se puede usar: publicar la reemplazaría
function bloquearValoracion(bloquear) {
  for (const control of formValoracion.querySelectorAll('button, textarea, input')) {
    control.disabled = bloquear;
  }
}

async function cargarMiValoracion() {
  bloquearValoracion(true);
  ocultarMensaje(errorValoracion);
  try {
    const miValoracion = await api(
      `/experiencias/${experienciaId}/valoracion`
    );

    if (miValoracion) {
      elegirPuntuacion(miValoracion.puntuacion);
      inputComentario.value =
        miValoracion.comentario ?? '';

      actualizarContador();

      btnGuardarValoracion.textContent =
        'Actualizar valoración';

      pintarMiValoracion(miValoracion);
    }
    bloquearValoracion(false);
  } catch (error) {
    if (!tratarErrorDeAcceso(error)) {
      mostrarErrorConReintento(errorValoracion, 'No se ha podido comprobar si ya la habías valorado.', cargarMiValoracion);
    }
  }
}

formValoracion.addEventListener('submit', async (e) => {
  e.preventDefault();

  const valor = Number(inputPuntuacion.value);

  if (
    inputPuntuacion.value === '' ||
    !Number.isInteger(valor) ||
    valor < 1 ||
    valor > MAX_PUNTUACION
  ) {
    mostrarMensaje(
      errorValoracion,
      'Elige una puntuación de 1 a 5 estrellas.'
    );
    return;
  }

  ocultarMensaje(errorValoracion);

  const exito = document.getElementById('exito-valoracion');
  exito.textContent = '';
  const textoGuardar = btnGuardarValoracion.textContent;
  btnGuardarValoracion.disabled = true;
  btnGuardarValoracion.setAttribute('aria-busy', 'true');
  btnGuardarValoracion.textContent = 'Guardando…';

  const datos = {
    puntuacion: Number(inputPuntuacion.value),
  };

  if (inputComentario.value.trim() !== '') {
    datos.comentario = inputComentario.value.trim();
  }

  try {
    const guardada = await api(
      `/experiencias/${experienciaId}/valoracion`,
      {
        method: 'PUT',
        body: JSON.stringify(datos),
      }
    );

    pintarMiValoracion(guardada);
    exito.textContent = 'Valoración guardada.';
    btnGuardarValoracion.textContent =
      'Actualizar valoración';

    await Promise.all([
      cargarResumen(),
      listadoComentarios.reiniciar(),
    ]);
  } catch (error) {
    btnGuardarValoracion.textContent = textoGuardar;

    if (!tratarErrorDeAcceso(error)) {
      mostrarMensaje(
        errorValoracion,
        error.message || 'Error al guardar la valoración'
      );
    }
  } finally {
    btnGuardarValoracion.disabled = false;
    btnGuardarValoracion.removeAttribute('aria-busy');
  }
});

// CS-04: diálogo de reporte (simulado).
const dialogoReporte = document.getElementById('dialogo-reporte');
const formReporte = document.getElementById('form-reporte');
const mensajeReporte = document.getElementById('mensaje-reporte');

function abrirReporte() {
  formReporte.reset();
  mensajeReporte.className = 'alert d-none small';
  dialogoReporte.showModal();
}

for (const boton of dialogoReporte.querySelectorAll(
  '[data-cerrar-reporte]'
)) {
  boton.addEventListener(
    'click',
    () => dialogoReporte.close()
  );
}

// CS-04: todavía no hay ruta para reportar, y se dice tal cual
formReporte.addEventListener('submit', (e) => {
  e.preventDefault();
  mensajeReporte.className = 'alert alert-warning small';
  mensajeReporte.textContent = 'Los reportes todavía no se pueden enviar: no se ha guardado nada.';
});

// Iniciar la página.
cargarPaginaExperiencia();
