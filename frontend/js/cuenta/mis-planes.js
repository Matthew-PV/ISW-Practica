
 // Mis planes (/paginas/cuenta/mis-planes.html): muestra las experiencias del usuario con sesión
 // por páginas (CS-44) y permite crearlas (CS-49) y editarlas (CS-57), con su visibilidad (CS-22),
 // su categoría (CS-55) y su momento adecuado (CS-56) elegidos de la lista del backend.
 // CS-53: duración en minutos y tarifa en euros.
// CS-50: lugares del plan, buscados y mostrados con shared/lugares.js.
 // Cada tarjeta enlaza a la página de su experiencia (/paginas/experiencias/experiencia.html, CS-63).
 // Usa `api` de shared/api.js y `listaConCargarMas`, `mostrarMensaje`, `ocultarMensaje`, `ocultarCargando` e
 // `alFallarCarga` de shared/pantalla.js.

const rejilla = document.getElementById('rejilla');
const columnaNueva = document.getElementById('columna-nueva');
const sinExperiencias = document.getElementById('sin-experiencias');
const cajaErrorLista = document.getElementById('error-lista');

const dialogo = document.getElementById('dialogo-experiencia');
const dialogoDescartar = document.getElementById('dialogo-descartar');
const formulario = document.getElementById('form-experiencia');
const cajaError = document.getElementById('error-experiencia');
const boton = formulario.querySelector('button[type="submit"]');
const campoCiudad = document.getElementById('ciudad');
const errorCiudad = document.getElementById('mensaje-ciudad');
const descripcion = document.getElementById('descripcion');
const vistaPrevia = document.getElementById('vista-previa');

// CS-53: nuevos campos del formulario
const campoDuracion = document.getElementById('duracion-minutos');
const campoTarifa = document.getElementById('tarifa');

// Experiencia que se está editando. Es null cuando el formulario sirve para crear una nueva.
let editando = null;
// Ciudades del catálogo y la del perfil, para proponerla al crear (C1)
let ciudades = [];
let ciudadPerfil = null;
// Ciudades de mis experiencias, que se sugieren antes que el resto
const ciudadesUsadas = new Set();
// Datos del formulario al abrirlo: si cambian, se pregunta antes de cerrar (C7)
let datosIniciales = '';
// Si se llegó desde el detalle (?editar=), al guardar o cancelar se vuelve allí (C8)
let volverA = null;

const textoCiudad = (ciudad) => (ciudad.pais ? `${ciudad.nombre} (${ciudad.pais})` : ciudad.nombre);

// Busca en el catálogo la ciudad escrita, como aparece en la lista o solo por su nombre.
function buscarCiudad(texto) {
  const buscado = texto.trim().toLowerCase();
  return ciudades.find((ciudad) => textoCiudad(ciudad).toLowerCase() === buscado || ciudad.nombre.toLowerCase() === buscado);
}

// Crea la columna con la tarjeta de una experiencia (shared/planes.js). Con `previa`, la del formulario,
// sin enlace ni botón.
function crearTarjeta(experiencia, { previa = false } = {}) {
  const columna = document.createElement('div');
  columna.className = 'col';
  columna.dataset.id = experiencia.id;
  // Cuenta como elemento de la lista aunque se cree o se edite a mano (y evita repetirla en «Cargar más»)
  columna.dataset.idElemento = experiencia.id;
  columna.append(crearTarjetaPlan(experiencia, {
    conVisibilidad: true,
    enlazar: !previa,
    alEditar: previa ? undefined : () => abrirFormulario(experiencia),
  }));
  return columna;
}

// Crea una opción de tipo radio con su texto, dentro de una etiqueta con forma de pastilla.
function crearPastilla(nombre, valor, texto) {
  const etiqueta = document.createElement('label');
  etiqueta.className = 'pastilla-opcion';
  const opcion = document.createElement('input');
  opcion.type = 'radio';
  opcion.name = nombre;
  opcion.value = valor;
  etiqueta.append(opcion, texto);
  return etiqueta;
}

// Pinta las categorías (con su icono y color) y los momentos, agrupados, de GET /experiencias/opciones.
function pintarOpciones({ categorias, momentos }) {
  const opcionesTipo = document.getElementById('opciones-tipo');
  for (const categoria of categorias) {
    const pastilla = crearPastilla('tipo', categoria, categoria);
    const bloque = crearBloqueCategoria(categoria);
    pastilla.dataset.categoria = bloque.dataset.categoria;
    pastilla.querySelector('input').after(bloque.querySelector('svg'));
    pastilla.querySelector('input').required = true;
    opcionesTipo.append(pastilla);
  }

  const opcionesMomento = document.getElementById('opciones-momento');
  const sinIndicar = document.createElement('div');
  sinIndicar.className = 'opciones-pastilla mb-2';
  sinIndicar.append(crearPastilla('momentoAdecuado', '', 'Sin indicar'));
  opcionesMomento.append(sinIndicar);
  for (const { grupo, valores } of momentos) {
    const titulo = document.createElement('p');
    titulo.className = 'grupo-momento-titulo';
    titulo.textContent = grupo;
    const fila = document.createElement('div');
    fila.className = 'opciones-pastilla mb-2';
    fila.append(...valores.map((valor) => crearPastilla('momentoAdecuado', valor, valor)));
    opcionesMomento.append(titulo, fila);
  }
}

// Sugerencias de ciudad: la del perfil, las de mis experiencias y después el resto del catálogo.
function pintarCiudades() {
  const orden = (ciudad) => (ciudad === ciudadPerfil ? 0 : ciudadesUsadas.has(ciudad.id) ? 1 : 2);
  const ordenadas = [...ciudades].sort((a, b) => orden(a) - orden(b));
  document.getElementById('lista-ciudades').replaceChildren(...ordenadas.map((ciudad) => new Option(textoCiudad(ciudad))));
}

// Marca la opción con ese valor; si no hay ninguna (un valor antiguo fuera de la lista), ninguna
const marcar = (nombre, valor) => {
  for (const opcion of formulario.querySelectorAll(`input[name="${nombre}"]`)) opcion.checked = opcion.value === valor;
};
const marcado = (nombre) => formulario.querySelector(`input[name="${nombre}"]:checked`)?.value ?? '';

// Lo que hay escrito en el formulario, tal cual
function leerFormulario() {
  return {
    titulo: document.getElementById('titulo').value,
    descripcion: descripcion.value,
    ciudad: campoCiudad.value,
    tipo: marcado('tipo'),
    momentoAdecuado: marcado('momentoAdecuado'),

    // CS-53: duración entera y tarifa decimal. Vacío significa sin especificar.
    duracionMinutos: campoDuracion?.value
      ? Number(campoDuracion.value)
      : null,
    tarifa: campoTarifa?.value || null,

    visibilidad: marcado('visibilidad'),
  };
}

// CS-50: lugares del plan
const MAXIMO_LUGARES = 20;
const campoLugar = document.getElementById('buscar-lugar');
const botonBuscarLugar = document.getElementById('boton-buscar-lugar');
const mensajeLugares = document.getElementById('mensaje-lugares');
const listaResultados = document.getElementById('resultados-lugares');
const listaElegidos = document.getElementById('lugares-elegidos');
const mapaFormulario = crearMapaLugares(document.getElementById('mapa-lugares'));
// Lugares elegidos, con su nota. Es null mientras no se conocen los del plan que se edita:
// entonces no se envían, para no borrarlos.
let lugaresElegidos = [];
let lugaresIniciales = '[]';
// Ciudad a la que pertenecen los lugares elegidos
let ciudadLugares = null;
let resultadosLugares = [];
// Descartan las respuestas que llegan después de abrir otro plan o de hacer otra búsqueda
let cargaLugares = 0;
let busquedaLugares = 0;

const avisarLugares = (texto) => {
  mensajeLugares.textContent = texto;
};

// Aviso si hay lugares de una ciudad distinta de la escrita; vacío si todo cuadra
function avisoOtraCiudad() {
  if (!lugaresElegidos?.length || !ciudadLugares) return '';
  if (buscarCiudad(campoCiudad.value) === ciudadLugares) return '';
  return `Estos lugares son de ${ciudadLugares.nombre}: quítalos o vuelve a esa ciudad.`;
}

function botonLugar(texto, nombre, alPulsar) {
  const elemento = document.createElement('button');
  elemento.type = 'button';
  elemento.className = 'btn btn-outline-primary btn-sm';
  elemento.textContent = texto;
  elemento.setAttribute('aria-label', `${texto} ${nombre}`);
  elemento.addEventListener('click', alPulsar);
  return elemento;
}

function elementoLugar(lugar, ...extras) {
  const elemento = document.createElement('li');
  const ficha = crearFichaLugar(lugar);
  ficha.querySelector('.ficha-lugar-datos').append(...extras);
  elemento.append(ficha);
  return elemento;
}

// CS-73: los elegidos y, atenuados, los resultados que aún no lo están
function pintarMapa() {
  const elegidos = lugaresElegidos ?? [];
  const porElegir = resultadosLugares.flatMap((lugar, posicion) => (
    elegidos.some((otro) => otro.proveedorId === lugar.proveedorId)
      ? []
      : [{ lugar, atenuado: true, alPulsar: () => seleccionarResultado(posicion) }]
  ));
  mapaFormulario.mostrar([...elegidos.map((lugar) => ({ lugar })), ...porElegir]);
}

// Marca en la lista el resultado pulsado en el mapa y le lleva el foco
function seleccionarResultado(posicion) {
  [...listaResultados.children].forEach((elemento, i) => {
    elemento.firstElementChild.classList.toggle('ficha-lugar-seleccionada', i === posicion);
  });
  listaResultados.children[posicion].querySelector('button').focus();
}

function pintarResultados() {
  listaResultados.replaceChildren(...resultadosLugares.map((lugar) => {
    const elegido = lugaresElegidos.some((otro) => otro.proveedorId === lugar.proveedorId);
    const anadir = botonLugar(elegido ? 'Añadido' : 'Añadir', lugar.nombre, () => anadirLugar(lugar));
    anadir.disabled = elegido || lugaresElegidos.length >= MAXIMO_LUGARES;
    const acciones = document.createElement('div');
    acciones.className = 'acciones-lugar';
    acciones.append(anadir);
    return elementoLugar(lugar, acciones);
  }));
  pintarMapa();
}

function pintarElegidos() {
  const lugares = lugaresElegidos ?? [];
  listaElegidos.replaceChildren(...lugares.map((lugar, posicion) => {
    const nota = document.createElement('textarea');
    nota.className = 'form-control form-control-sm mt-2';
    nota.rows = 2;
    nota.maxLength = 300;
    nota.placeholder = 'Nota (opcional)';
    nota.setAttribute('aria-label', `Nota sobre ${lugar.nombre}`);
    nota.value = lugar.nota;
    nota.addEventListener('input', () => {
      lugar.nota = nota.value;
    });
    const subir = botonLugar('Subir', lugar.nombre, () => moverLugar(posicion, posicion - 1));
    subir.disabled = posicion === 0;
    const bajar = botonLugar('Bajar', lugar.nombre, () => moverLugar(posicion, posicion + 1));
    bajar.disabled = posicion === lugares.length - 1;
    const quitar = botonLugar('Quitar', lugar.nombre, () => quitarLugar(posicion));
    const acciones = document.createElement('div');
    acciones.className = 'acciones-lugar';
    acciones.append(subir, bajar, quitar);
    return elementoLugar(lugar, nota, acciones);
  }));
  pintarMapa();
}

function anadirLugar(lugar) {
  const aviso = avisoOtraCiudad();
  if (aviso) {
    avisarLugares(aviso);
    return;
  }
  if (!lugaresElegidos.length) ciudadLugares = buscarCiudad(campoCiudad.value);
  lugaresElegidos.push({ ...lugar, nota: '' });
  pintarElegidos();
  pintarResultados();
  avisarLugares(`${lugar.nombre} añadido al plan.`);
}

function moverLugar(desde, hasta) {
  const [lugar] = lugaresElegidos.splice(desde, 1);
  lugaresElegidos.splice(hasta, 0, lugar);
  pintarElegidos();
  // El foco sigue al lugar movido
  listaElegidos.children[hasta].querySelector('button:not(:disabled)').focus();
}

function quitarLugar(posicion) {
  lugaresElegidos.splice(posicion, 1);
  pintarElegidos();
  pintarResultados();
  avisarLugares(avisoOtraCiudad());
  campoLugar.focus();
}

async function buscarEnFormulario() {
  const busqueda = ++busquedaLugares;
  const ciudad = buscarCiudad(campoCiudad.value);
  const texto = campoLugar.value.trim();
  resultadosLugares = [];
  pintarResultados();
  const aviso = !ciudad ? 'Elige primero la ciudad del plan.' : avisoOtraCiudad() || (!texto && 'Escribe qué lugar buscas.');
  if (aviso) {
    avisarLugares(aviso);
    return;
  }
  avisarLugares('Buscando…');
  try {
    const encontrados = await buscarLugares(texto, ciudad);
    if (busqueda !== busquedaLugares) return;
    resultadosLugares = encontrados;
    pintarResultados();
    const cuantos = encontrados.length === 1 ? '1 lugar encontrado.' : `${encontrados.length} lugares encontrados.`;
    avisarLugares(encontrados.length ? cuantos : `No hay lugares con ese nombre en ${ciudad.nombre}.`);
  } catch (err) {
    if (busqueda === busquedaLugares) avisarLugares(err.message);
  }
}

const activarBuscador = (activo) => {
  campoLugar.disabled = !activo;
  botonBuscarLugar.disabled = !activo;
};

// Vacía el apartado y, al editar, carga los lugares del plan
async function prepararLugares(experiencia) {
  const carga = ++cargaLugares;
  busquedaLugares++;
  lugaresElegidos = experiencia ? null : [];
  lugaresIniciales = JSON.stringify(lugaresElegidos);
  ciudadLugares = null;
  resultadosLugares = [];
  campoLugar.value = '';
  listaResultados.replaceChildren();
  pintarElegidos();
  avisarLugares('');
  activarBuscador(!experiencia);
  if (!experiencia) return;
  try {
    const lugares = await lugaresDe(experiencia);
    if (carga !== cargaLugares) return;
    lugaresElegidos = lugares.map(({ id, ...lugar }) => ({ ...lugar, nota: lugar.nota ?? '' }));
    lugaresIniciales = JSON.stringify(lugaresElegidos);
    ciudadLugares = ciudades.find((ciudad) => ciudad.id === experiencia.ciudadId) ?? null;
    pintarElegidos();
    activarBuscador(true);
  } catch (err) {
    if (carga === cargaLugares) avisarLugares(err.message);
  }
}

botonBuscarLugar.addEventListener('click', buscarEnFormulario);
campoLugar.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  buscarEnFormulario();
});
// Los resultados eran de la ciudad anterior
campoCiudad.addEventListener('input', () => {
  if (lugaresElegidos === null) return;
  busquedaLugares++;
  resultadosLugares = [];
  pintarResultados();
  avisarLugares(avisoOtraCiudad());
});

// Pone o quita el error junto al campo de ciudad
function avisarCiudad(texto) {
  errorCiudad.textContent = texto;
  errorCiudad.classList.toggle('d-none', !texto);
  if (texto) campoCiudad.setAttribute('aria-invalid', 'true');
  else campoCiudad.removeAttribute('aria-invalid');
}

// Rehace la vista previa y el contador con lo escrito (C5 y C6)
function actualizarPrevia() {
  const datos = leerFormulario();
  const tarjeta = crearTarjeta({
    id: 0,
    titulo: datos.titulo || 'Título del plan',
    descripcion: datos.descripcion || 'La descripción aparecerá aquí.',
    ciudad: buscarCiudad(datos.ciudad),
    tipo: datos.tipo,
    duracionMinutos: datos.duracionMinutos,
    tarifa: datos.tarifa,
    visibilidad: datos.visibilidad || 'PUBLICA',
  }, { previa: true });
  vistaPrevia.replaceChildren(tarjeta);
  const caracteres = descripcion.value.length;
  document.getElementById('contador-descripcion').textContent = `${caracteres} ${caracteres === 1 ? 'carácter' : 'caracteres'}`;
}

formulario.addEventListener('input', actualizarPrevia);
formulario.addEventListener('change', actualizarPrevia);

// Abre el formulario vacío para crear una experiencia, o relleno con los datos de una
// experiencia para editarla.
function abrirFormulario(experiencia) {
  editando = experiencia;
  document.getElementById('titulo-dialogo').textContent = experiencia ? 'Editar plan' : 'Nuevo plan';
  boton.textContent = experiencia ? 'Guardar cambios' : 'Publicar plan';

  document.getElementById('titulo').value = experiencia?.titulo ?? '';
  descripcion.value = experiencia?.descripcion ?? '';

  // CS-53: recuperar los valores guardados al editar.
  if (campoDuracion) {
    campoDuracion.value = experiencia?.duracionMinutos ?? '';
  }
  if (campoTarifa) {
    campoTarifa.value = experiencia?.tarifa ?? '';
  }

  const ciudad = experiencia ? ciudades.find((c) => c.id === experiencia.ciudadId) : ciudadPerfil;
  campoCiudad.value = ciudad ? textoCiudad(ciudad) : '';
  // Un valor antiguo fuera de la lista queda sin marcar
  marcar('tipo', experiencia?.tipo ?? '');
  marcar('momentoAdecuado', experiencia?.momentoAdecuado ?? '');
  // Una experiencia nueva es pública salvo que se elija otra cosa
  marcar('visibilidad', experiencia?.visibilidad ?? 'PUBLICA');

  datosIniciales = JSON.stringify(leerFormulario());
  prepararLugares(experiencia);
  avisarCiudad('');
  ocultarMensaje(cajaError);
  actualizarPrevia();
  dialogo.showModal();
}

// Vuelve al detalle desde el que se abrió el formulario: retrocediendo si se venía de él, para que
// su «Volver» siga llevando a donde se estaba antes
function irAlDetalle() {
  datosIniciales = null;
  if (document.referrer.includes('/paginas/experiencias/experiencia.html')) window.history.back();
  else window.location.replace(volverA);
}

// Cierra el formulario; si se abrió desde el detalle, vuelve a él
function cerrarFormulario() {
  if (volverA) {
    irAlDetalle();
    return;
  }
  dialogo.close();
}

const hayCambios = () =>
  JSON.stringify(leerFormulario()) !== datosIniciales || JSON.stringify(lugaresElegidos) !== lugaresIniciales;

const botonCancelar = document.getElementById('boton-cancelar');

// Antes de cerrar con cambios sin guardar, se pregunta (C7)
let guardando = false;
function pedirCerrar() {
  // Mientras se guarda no se puede cerrar: la respuesta cambiaría otro formulario
  if (guardando) return;
  if (hayCambios()) dialogoDescartar.showModal();
  else cerrarFormulario();
}

// Enter en un campo corto no publica el plan: se publica con el botón
formulario.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.preventDefault();
});

// Escape se atiende aquí: el navegador deja de lanzar «cancel» si se pulsa varias veces seguidas
dialogo.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.defaultPrevented) return;
  e.preventDefault();
  pedirCerrar();
});
dialogoDescartar.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  e.preventDefault();
  e.stopPropagation();
  dialogoDescartar.close();
});

// Recargar o salir de la página con cambios sin guardar pide confirmación
window.addEventListener('beforeunload', (e) => {
  if (dialogo.open && datosIniciales !== null && hayCambios()) e.preventDefault();
});

document.getElementById('boton-nueva').addEventListener('click', () => abrirFormulario(null));
botonCancelar.addEventListener('click', pedirCerrar);
// Esc lanza «cancel»: se pasa por la misma comprobación
dialogo.addEventListener('cancel', (e) => {
  e.preventDefault();
  pedirCerrar();
});
document.getElementById('seguir-editando').addEventListener('click', () => dialogoDescartar.close());
document.getElementById('confirmar-descartar').addEventListener('click', () => {
  dialogoDescartar.close();
  cerrarFormulario();
});

// Tras guardar, aviso con enlace al plan y el foco en él (C9)
const avisoGuardado = document.getElementById('aviso-creada');
function avisarGuardado(experiencia, texto) {
  const enlace = document.getElementById('enlace-creada');
  enlace.setAttribute('href', `/paginas/experiencias/experiencia.html?id=${experiencia.id}`);
  document.getElementById('texto-aviso').textContent = texto;
  avisoGuardado.classList.remove('d-none');
  enlace.focus();
}
document.getElementById('cerrar-aviso').addEventListener('click', () => ocultarMensaje(avisoGuardado));

// Al pulsar Publicar o Guardar cambios se crea o se edita la experiencia.
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarMensaje(cajaError);
  const { ciudad: textoEscrito, ...datos } = leerFormulario();
  const ciudad = buscarCiudad(textoEscrito);
  if (!ciudad) {
    avisarCiudad('Elige una ciudad de la lista.');
    campoCiudad.focus();
    return;
  }
  avisarCiudad('');
  datos.ciudadId = ciudad.id;

  // CS-50: los lugares tienen que ser de la ciudad del plan. Un plan nuevo sin ellos no los envía.
  const aviso = avisoOtraCiudad();
  if (aviso) {
    avisarLugares(aviso);
    campoCiudad.focus();
    return;
  }
  if (lugaresElegidos && (editando || lugaresElegidos.length)) {
    datos.lugares = lugaresElegidos.map((lugar) => ({ ...lugar, nota: lugar.nota.trim() }));
  }

  // Acción con espera: «Guardando…» y desactivado hasta que acabe
  const textoBoton = boton.textContent;
  boton.textContent = 'Guardando…';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');
  guardando = true;
  botonCancelar.disabled = true;
  ocultarMensaje(avisoGuardado);

  try {
    if (editando) {
      const experiencia = await api(`/experiencias/${editando.id}`, { method: 'PATCH', body: JSON.stringify(datos) });
      if (volverA) {
        sessionStorage.setItem('planb-plan-editado', String(editando.id));
        irAlDetalle();
        return;
      }
      rejilla.querySelector(`[data-id="${editando.id}"]`)?.replaceWith(crearTarjeta(experiencia));
      dialogo.close();
      avisarGuardado(experiencia, 'Cambios guardados.');
    } else {
      const experiencia = await api('/experiencias', { method: 'POST', body: JSON.stringify(datos) });
      ciudadesUsadas.add(experiencia.ciudadId);
      // La nueva es la más reciente: va la primera, justo después de la tarjeta «+»
      columnaNueva.after(crearTarjeta(experiencia));
      ocultarMensaje(sinExperiencias);
      dialogo.close();
      avisarGuardado(experiencia, 'Plan publicado.');
    }
  } catch (err) {
    mostrarMensaje(cajaError, err.message);
  }

  guardando = false;
  botonCancelar.disabled = false;
  boton.textContent = textoBoton;
  boton.disabled = false;
  boton.removeAttribute('aria-busy');
});

// Mis experiencias se cargan por páginas (CS-44), con «Cargar más» (ver shared/pantalla.js)
let autorExperiencias = null;
const listadoExperiencias = listaConCargarMas({
  lista: rejilla,
  vacio: sinExperiencias,
  botonMas: document.getElementById('mas-experiencias'),
  pedir: async (cursor) => {
    const despuesDe = cursor === null ? '' : `&despuesDe=${cursor}`;
    const { experiencias, siguiente } = await api(`/experiencias?autor=${encodeURIComponent(autorExperiencias)}${despuesDe}`);
    experiencias.forEach((experiencia) => ciudadesUsadas.add(experiencia.ciudadId));
    return { elementos: experiencias, siguiente };
  },
  crear: crearTarjeta,
  alFallar: (err, reintentar) => mostrarErrorConReintento(cajaErrorLista, err.message, reintentar),
});

// El catálogo de ciudades y las opciones: sin ellos no se puede abrir el formulario
async function cargarCatalogos(perfil) {
  const botonNueva = document.getElementById('boton-nueva');
  botonNueva.disabled = true;
  try {
    const [catalogo, opciones] = await Promise.all([api('/ciudades'), api('/experiencias/opciones')]);
    ciudades = catalogo;
    // La ciudad del perfil es texto libre: se propone si coincide con una del catálogo
    ciudadPerfil = buscarCiudad(perfil.ciudad ?? '') ?? null;
    pintarCiudades();
    pintarOpciones(opciones);
    botonNueva.disabled = false;
  } catch (err) {
    mostrarErrorConReintento(cajaErrorLista, err.message, () => cargarCatalogos(perfil));
  }
}

// Carga el catálogo de ciudades, las opciones del formulario y la primera página de mis experiencias.
async function cargarExperiencias(perfil) {
  autorExperiencias = perfil.nombreUsuario;
  try {
    // El formulario de un enlace solo necesita los catálogos: no espera al listado
    await Promise.all([cargarCatalogos(perfil).then(abrirDesdeEnlace), listadoExperiencias.cargar()]);
  } finally {
    ocultarCargando();
    // La región de estado no debe seguir diciendo «Cargando…» a los lectores de pantalla (C9)
    document.getElementById('cargando').textContent = '';
  }
}

// Al abrir la página: las experiencias. Sin sesión, al inicio de sesión.
async function mostrarPlanes() {
  let perfil;
  try {
    perfil = await api('/perfil');
  } catch (err) {
    ocultarCargando();
    alFallarCarga(err, mostrarPlanes);
    return;
  }
  await cargarExperiencias(perfil);
}

// Los enlaces de otras pantallas abren el formulario directamente: ?nuevo=1 desde Inicio y
// ?editar=<id> desde el detalle de una experiencia (solo su autor puede editarla; el backend lo comprueba).
// Se limpia la dirección para que recargar no vuelva a abrirlo.
async function abrirDesdeEnlace() {
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.has('nuevo') || parametros.has('editar')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  if (document.getElementById('boton-nueva').disabled) return;
  if (parametros.has('nuevo')) {
    abrirFormulario(null);
  } else if (parametros.has('editar')) {
    const id = Number(parametros.get('editar'));
    try {
      const experiencia = await api(`/experiencias/${id}`);
      if (experiencia.autor && experiencia.autor.nombreUsuario !== autorExperiencias) {
        mostrarMensaje(cajaErrorLista, 'No puedes editar un plan de otro usuario');
        return;
      }
      volverA = `/paginas/experiencias/experiencia.html?id=${id}`;
      abrirFormulario(experiencia);
    } catch (err) {
      mostrarMensaje(cajaErrorLista, err.message);
    }
  }
}

mostrarPlanes();
