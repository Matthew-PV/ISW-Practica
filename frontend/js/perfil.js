// Página de mi perfil (/cuenta/perfil.html): cabecera con contadores y, en pestañas, mis experiencias,
// amigos y seguidores. Las solicitudes y los ajustes tienen su propia página.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js, `listaConCargarMas`,
// `crearEnlacePerfil`, `mostrarMensaje`, `ocultarMensaje` y `ocultarCargando` de shared/pantalla.js,
// `activarPestanas` de shared/pestanas.js y `mostrarExperienciasDe` de shared/experiencias.js (CS-44).

// Pone en la cabecera los datos del perfil que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombre-perfil').textContent = perfil.nombreUsuario;
  mostrarExperienciasDe(perfil.nombreUsuario);

  if (perfil.foto) {
    document.getElementById('foto-perfil').src = perfil.foto;
  }
}

async function cargarPerfil() {
  try {
    mostrarPerfil(await api('/perfil'));
  } catch {
    // Sin sesión (o el servidor no responde): se vuelve al login
    window.location.href = '/acceso/iniciar-sesion.html';
  } finally {
    ocultarCargando();
  }
}

cargarPerfil();

activarPestanas(document.getElementById('pestanas-perfil'));

// Contador de experiencias de la cabecera: son las que hay cargadas en la rejilla (la API no da
// el total), con «+» si todavía queda otra página por cargar.
const listaExperiencias = document.getElementById('lista-experiencias');
const botonMasExperiencias = document.getElementById('mas-experiencias');
function contarExperiencias() {
  const cargadas = listaExperiencias.querySelectorAll('[data-id-elemento]').length;
  const hayMas = !botonMasExperiencias.classList.contains('d-none');
  document.getElementById('total-experiencias').textContent = hayMas ? `${cargadas}+` : cargadas;
}
const vigilante = new MutationObserver(contarExperiencias);
vigilante.observe(listaExperiencias, { childList: true });
vigilante.observe(botonMasExperiencias, { attributes: true, attributeFilter: ['class'] });

// Amigos y seguidores (CS-45): contadores y listados paginados del perfil propio.
const cajaErrorRelaciones = document.getElementById('error-relaciones');
const PERSONAS_POR_PAGINA = 20;

// Crea la fila de una persona, que enlaza a su perfil (/social/usuario.html). El nombre se incorpora como
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

cargarRelaciones();
