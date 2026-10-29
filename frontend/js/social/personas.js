// Página de búsqueda (/paginas/social/personas.html). Cada resultado lleva al perfil público de esa persona en
// /paginas/social/usuario.html. Usa `api` de shared/api.js, `crearTarjetaPlan` y `pedirPlanes` de shared/planes.js, `activarPestanas` de shared/pestanas.js y
// `crearEnlacePerfil`, `mostrarMensaje`, `ocultarMensaje`, `mostrarCargando` y `ocultarCargando`
// de shared/pantalla.js.

const formularioBusqueda = document.getElementById('form-busqueda');
const campoBusqueda = document.getElementById('texto-busqueda');
const botonBuscar = formularioBusqueda.querySelector('button[type="submit"]');
const resultados = document.getElementById('resultados');
const sinResultados = document.getElementById('sin-resultados');
const errorBusqueda = document.getElementById('error-busqueda');
const ayudaBusqueda = document.getElementById('ayuda-busqueda');
const ayudaExperiencias = document.getElementById('ayuda-experiencias');
const sinExperiencias = document.getElementById('sin-experiencias');
const resultadosExperiencias = document.getElementById('resultados-experiencias');
const recuento = document.getElementById('recuento-busqueda');
const pestanaPlanes = document.getElementById('pestana-experiencias');
const pestanaPersonas = document.getElementById('pestana-personas');
const verTodosPlanes = document.getElementById('ver-todos-planes');

activarPestanas(document.getElementById('pestanas-busqueda'));

// Cuenta las búsquedas: si llega una respuesta de una búsqueda que ya no es la última, se descarta
let ultimaBusqueda = 0;

// Texto de la relación con quien busca
const ETIQUETAS_AMISTAD = { enviada: 'Solicitud enviada', recibida: 'Te ha enviado una solicitud', amigos: 'Amigos' };

// Hace la petición de amistad de la fila y, si sale bien, la pinta con la relación nueva. `id` es el de la
// amistad, que el servidor devuelve al crearla.
async function actuarSobreAmistad(fila, usuario, boton, peticion, relacionNueva) {
  boton.disabled = true;
  fila.querySelector('[role="alert"]')?.remove();
  try {
    const { ruta, opciones } = peticion;
    const respuesta = await api(ruta, opciones);
    const amistadId = relacionNueva.amistad === 'enviada' ? respuesta.id : null;
    pintarRelacion(fila, usuario, { ...usuario.relacion, ...relacionNueva, amistadId });
  } catch (err) {
    boton.disabled = false;
    const error = document.createElement('p');
    error.className = 'fila-resultado-error';
    error.setAttribute('role', 'alert');
    error.textContent = err.message;
    fila.append(error);
  }
}

// Pone en la fila la relación (texto) y el botón que corresponde: «Añadir amigo» si no hay amistad,
// «Cancelar solicitud» si la envió quien busca y «Aceptar» si la recibió. Un amigo no lleva botón.
function pintarRelacion(fila, usuario, relacion) {
  usuario.relacion = relacion;
  fila.querySelector('.fila-resultado-relacion')?.remove();
  fila.querySelector('[role="alert"]')?.remove();

  const zona = document.createElement('div');
  zona.className = 'fila-resultado-relacion';
  const etiquetas = [ETIQUETAS_AMISTAD[relacion.amistad], relacion.siguiendo ? 'Le sigues' : null].filter(Boolean);
  if (etiquetas.length) {
    const texto = document.createElement('span');
    texto.className = 'fila-resultado-estado';
    texto.textContent = etiquetas.join(' · ');
    zona.append(texto);
  }

  const acciones = {
    ninguna: ['Añadir amigo', 'btn-outline-primary',
      { ruta: '/amistades', opciones: { method: 'POST', body: JSON.stringify({ destinatarioId: usuario.id }) } },
      { amistad: 'enviada' }],
    enviada: ['Cancelar solicitud', 'btn-outline-secondary',
      { ruta: `/amistades/${relacion.amistadId}`, opciones: { method: 'DELETE' } },
      { amistad: 'ninguna' }],
    recibida: ['Aceptar', 'btn-primary',
      { ruta: `/amistades/${relacion.amistadId}`, opciones: { method: 'PATCH', body: JSON.stringify({ aceptar: true }) } },
      { amistad: 'amigos' }],
  }[relacion.amistad];
  if (acciones) {
    const [textoBoton, clase, peticion, nueva] = acciones;
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `btn btn-sm ${clase}`;
    boton.textContent = textoBoton;
    boton.addEventListener('click', () => actuarSobreAmistad(fila, usuario, boton, peticion, nueva));
    zona.append(boton);
  }
  fila.append(zona);
}

// Crea la fila de una persona: un enlace a su perfil público con foto, nombre y, si la hay, ciudad, y a su
// lado la relación con quien busca y el botón de amistad. El nombre procede de otro usuario, por eso se asigna
// con textContent y nunca como HTML.
function crearResultado(usuario) {
  const fila = document.createElement('div');
  fila.className = 'fila-resultado';
  const enlace = crearEnlacePerfil(document.createElement('a'), usuario);
  enlace.className = 'fila-resultado-persona';

  let foto;
  if (usuario.foto) {
    foto = document.createElement('img');
    foto.src = usuario.foto;
    foto.alt = '';
  } else {
    foto = document.createElement('span');
    foto.className = 'fila-resultado-sin-foto';
  }

  const cuerpo = document.createElement('span');
  const nombre = document.createElement('span');
  nombre.className = 'fila-resultado-nombre';
  nombre.textContent = usuario.nombreUsuario;
  cuerpo.append(nombre);
  if (usuario.ciudad) {
    const ciudad = document.createElement('span');
    ciudad.className = 'fila-resultado-ciudad';
    ciudad.textContent = usuario.ciudad;
    cuerpo.append(ciudad);
  }

  enlace.replaceChildren(foto, cuerpo);
  fila.append(enlace);
  if (usuario.relacion) pintarRelacion(fila, usuario, usuario.relacion);
  return fila;
}

// Los resultados nuevos entran con un fundido de 150 ms; la clase se retira al acabar
function animarEntrada(elementos) {
  for (const elemento of elementos) {
    elemento.classList.add('entrando');
    const retirar = () => elemento.classList.remove('entrando');
    elemento.addEventListener('animationend', retirar, { once: true });
    setTimeout(retirar, 300);
  }
}

// Busca a la vez personas y planes y reemplaza los resultados anteriores de las dos pestañas.
async function buscar() {
  const numero = ++ultimaBusqueda;
  const texto = campoBusqueda.value.trim();

  // Acción con espera: «Buscando…» y desactivado hasta que acabe
  botonBuscar.textContent = 'Buscando…';
  botonBuscar.disabled = true;
  botonBuscar.setAttribute('aria-busy', 'true');
  resultados.replaceChildren();
  resultadosExperiencias.replaceChildren();
  ocultarMensaje(sinResultados);
  ocultarMensaje(sinExperiencias);
  ocultarMensaje(errorBusqueda);
  recuento.textContent = '';
  verTodosPlanes.hidden = true;
  pestanaPlanes.textContent = 'Planes';
  pestanaPersonas.textContent = 'Personas';
  // Tras la primera búsqueda ya no hace falta explicar qué escribir; mientras llega la respuesta, «Cargando…»
  ocultarMensaje(ayudaBusqueda);
  ocultarMensaje(ayudaExperiencias);
  mostrarCargando();

  try {
    const [usuarios, { experiencias: planes, siguiente }] = await Promise.all([
      api(`/usuarios?texto=${encodeURIComponent(texto)}`),
      pedirPlanes({ texto }),
    ]);
    if (numero !== ultimaBusqueda) return;

    // Si hay otra página de planes, el contador queda en «N+» y se enlaza a Explorar con el mismo texto
    const hayMasPlanes = siguiente !== null;
    pestanaPlanes.textContent = `Planes (${planes.length}${hayMasPlanes ? '+' : ''})`;
    pestanaPersonas.textContent = `Personas (${usuarios.length})`;
    verTodosPlanes.href = `/paginas/experiencias/explorar.html?texto=${encodeURIComponent(texto)}`;
    verTodosPlanes.hidden = !hayMasPlanes;

    // Un único aviso (role=status) en lugar de anunciar las listas enteras
    const personas = `${usuarios.length} ${usuarios.length === 1 ? 'persona' : 'personas'}`;
    recuento.textContent = `${planes.length}${hayMasPlanes ? ' o más' : ''} ${planes.length === 1 ? 'plan' : 'planes'} y ${personas}`;

    if (usuarios.length === 0) {
      sinResultados.classList.remove('d-none');
    } else {
      const filas = usuarios.map(crearResultado);
      resultados.append(...filas);
      animarEntrada(filas);
    }

    if (planes.length === 0) {
      sinExperiencias.classList.remove('d-none');
    } else {
      resultadosExperiencias.append(...planes.map((plan, indice) => crearTarjetaPlan(plan, indice)));
    }
  } catch (err) {
    if (numero === ultimaBusqueda) mostrarMensaje(errorBusqueda, err.message);
  } finally {
    // Solo la última búsqueda restaura el botón; las anteriores ya no importan
    if (numero === ultimaBusqueda) {
      ocultarCargando();
      botonBuscar.textContent = 'Buscar';
      botonBuscar.disabled = false;
      botonBuscar.removeAttribute('aria-busy');
    }
  }
}

formularioBusqueda.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscar();
});

// /paginas/social/personas.html?q=texto (el buscador de la cabecera): rellena el campo y busca; q vacío no busca
const textoInicial = new URLSearchParams(window.location.search).get('q')?.trim();
if (textoInicial) {
  campoBusqueda.value = textoInicial;
  buscar();
}
