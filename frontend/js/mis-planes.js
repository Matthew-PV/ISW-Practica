// Mis planes (/cuenta/mis-planes.html): muestra las experiencias del usuario con sesión
// por páginas (CS-44) y permite crearlas (CS-49) y editarlas (CS-57), con su visibilidad (CS-22),
// su categoría (CS-55) y su momento adecuado (CS-56) elegidos de la lista del backend.
// «Ver detalle» enlaza a la página de cada experiencia (/experiencias/experiencia.html, CS-63).
// Usa `api` de shared/api.js y `listaConCargarMas`, `mostrarMensaje`, `ocultarMensaje`, `ocultarCargando` e
// `irAlLogin` de shared/pantalla.js.

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

// Etiqueta de cada visibilidad en la tarjeta (clases definidas en componentes.css)
const ETIQUETAS_VISIBILIDAD = {
  PUBLICA: { clase: 'etiqueta-publica', texto: 'Pública' },
  AMIGOS: { clase: 'etiqueta-amigos', texto: 'Amigos' },
  PRIVADA: { clase: 'etiqueta-privada', texto: 'Privada' },
};

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

// Crea la columna con la tarjeta de una experiencia. La estructura es fija; los textos se ponen
// después con textContent para que el contenido de usuario nunca se ejecute como HTML.
function crearTarjeta(experiencia) {
  const columna = document.createElement('div');
  columna.className = 'col';
  columna.dataset.id = experiencia.id;
  // Cuenta como elemento de la lista aunque se cree o se edite a mano (y evita repetirla en «Cargar más»)
  columna.dataset.idElemento = experiencia.id;
  columna.innerHTML = `
    <div class="card h-100 tarjeta-experiencia">
      <div class="card-body d-flex flex-column">
        <h3 class="card-title h6"></h3>
        <p class="card-subtitle small text-body-secondary mb-2"></p>
        <p class="mb-2"><span class="etiqueta-visibilidad"></span></p>
        <p class="card-text small descripcion-corta"></p>
        <div class="d-grid gap-2 mt-auto">
          <a class="btn btn-outline-primary btn-sm boton-ver">Ver detalle</a>
          <button type="button" class="btn btn-outline-primary btn-sm boton-editar">Editar</button>
        </div>
      </div>
    </div>
  `;

  columna.querySelector('.card').prepend(crearBloqueCategoria(experiencia.tipo));
  columna.querySelector('.card-title').textContent = experiencia.titulo;
  columna.querySelector('.card-subtitle').textContent =
    [experiencia.ciudad?.nombre, experiencia.tipo].filter(Boolean).join(' · ');
  const etiqueta = columna.querySelector('.etiqueta-visibilidad');
  etiqueta.className = ETIQUETAS_VISIBILIDAD[experiencia.visibilidad].clase;
  etiqueta.textContent = ETIQUETAS_VISIBILIDAD[experiencia.visibilidad].texto;
  columna.querySelector('.card-text').textContent = experiencia.descripcion;
  columna.querySelector('.boton-ver').setAttribute('href', `/experiencias/experiencia.html?id=${experiencia.id}`);
  columna.querySelector('.boton-editar').addEventListener('click', () => abrirFormulario(experiencia));
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
    visibilidad: marcado('visibilidad'),
  };
}

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
    visibilidad: datos.visibilidad || 'PUBLICA',
  });
  tarjeta.querySelector('.d-grid').remove();
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
  const ciudad = experiencia ? ciudades.find((c) => c.id === experiencia.ciudadId) : ciudadPerfil;
  campoCiudad.value = ciudad ? textoCiudad(ciudad) : '';
  // Un valor antiguo fuera de la lista queda sin marcar
  marcar('tipo', experiencia?.tipo ?? '');
  marcar('momentoAdecuado', experiencia?.momentoAdecuado ?? '');
  // Una experiencia nueva es pública salvo que se elija otra cosa
  marcar('visibilidad', experiencia?.visibilidad ?? 'PUBLICA');

  datosIniciales = JSON.stringify(leerFormulario());
  avisarCiudad('');
  ocultarMensaje(cajaError);
  actualizarPrevia();
  dialogo.showModal();
}

// Cierra el formulario; si se abrió desde el detalle, vuelve a él
function cerrarFormulario() {
  if (volverA) {
    window.location.href = volverA;
    return;
  }
  dialogo.close();
}

// Antes de cerrar con cambios sin guardar, se pregunta (C7)
function pedirCerrar() {
  if (JSON.stringify(leerFormulario()) === datosIniciales) cerrarFormulario();
  else dialogoDescartar.showModal();
}

document.getElementById('boton-nueva').addEventListener('click', () => abrirFormulario(null));
document.getElementById('boton-cancelar').addEventListener('click', pedirCerrar);
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

// Tras crear, aviso con enlace a la nueva experiencia y el foco en él (C9)
function avisarCreada(experiencia) {
  const enlace = document.getElementById('enlace-creada');
  enlace.setAttribute('href', `/experiencias/experiencia.html?id=${experiencia.id}`);
  document.getElementById('aviso-creada').classList.remove('d-none');
  enlace.focus();
}

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

  // Acción con espera: «Guardando…» y desactivado hasta que acabe
  const textoBoton = boton.textContent;
  boton.textContent = 'Guardando…';
  boton.disabled = true;
  boton.setAttribute('aria-busy', 'true');

  try {
    if (editando) {
      const experiencia = await api(`/experiencias/${editando.id}`, { method: 'PATCH', body: JSON.stringify(datos) });
      if (volverA) {
        window.location.href = volverA;
        return;
      }
      rejilla.querySelector(`[data-id="${editando.id}"]`)?.replaceWith(crearTarjeta(experiencia));
      dialogo.close();
    } else {
      const experiencia = await api('/experiencias', { method: 'POST', body: JSON.stringify(datos) });
      ciudadesUsadas.add(experiencia.ciudadId);
      // La nueva es la más reciente: va la primera, justo después de la tarjeta «+»
      columnaNueva.after(crearTarjeta(experiencia));
      ocultarMensaje(sinExperiencias);
      dialogo.close();
      avisarCreada(experiencia);
    }
  } catch (err) {
    mostrarMensaje(cajaError, err.message);
  }

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

// Carga el catálogo de ciudades, las opciones del formulario y la primera página de mis experiencias.
async function cargarExperiencias(perfil) {
  autorExperiencias = perfil.nombreUsuario;
  try {
    const [catalogo, opciones] = await Promise.all([api('/ciudades'), api('/experiencias/opciones'), listadoExperiencias.cargar()]);
    ciudades = catalogo;
    // La ciudad del perfil es texto libre: se propone si coincide con una del catálogo
    ciudadPerfil = buscarCiudad(perfil.ciudad ?? '') ?? null;
    pintarCiudades();
    pintarOpciones(opciones);
  } catch (err) {
    mostrarMensaje(cajaErrorLista, err.message);
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
  } catch {
    irAlLogin();
    return;
  }
  await cargarExperiencias(perfil);
  abrirDesdeEnlace();
}

// Los enlaces de otras pantallas abren el formulario directamente: ?nuevo=1 desde Inicio y
// ?editar=<id> desde el detalle de una experiencia (solo su autor puede editarla; el backend lo comprueba).
// Se limpia la dirección para que recargar no vuelva a abrirlo.
async function abrirDesdeEnlace() {
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.has('nuevo') || parametros.has('editar')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  if (parametros.has('nuevo')) {
    abrirFormulario(null);
  } else if (parametros.has('editar')) {
    const id = Number(parametros.get('editar'));
    try {
      const experiencia = await api(`/experiencias/${id}`);
      volverA = `/experiencias/experiencia.html?id=${id}`;
      abrirFormulario(experiencia);
    } catch (err) {
      mostrarMensaje(cajaErrorLista, err.message);
    }
  }
}

mostrarPlanes();
