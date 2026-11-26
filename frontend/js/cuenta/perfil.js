// Página de mi perfil (/paginas/cuenta/perfil.html): cabecera con contadores y, en pestañas, mis experiencias,
// amigos y seguidores. Las solicitudes y los ajustes tienen su propia página.
// Se ejecuta nada más cargar la página. Usa `api` de shared/api.js, `listaConCargarMas`,
// `crearEnlacePerfil`, `mostrarErrorConReintento`, `ocultarMensaje` y `ocultarCargando` de shared/pantalla.js,
// `activarPestanas` de shared/pestanas.js y `mostrarExperienciasDe` de shared/experiencias.js (CS-44).

// Pone en la cabecera los datos del perfil que devuelve el backend
function mostrarPerfil(perfil) {
  document.getElementById('nombre-perfil').textContent = perfil.nombreUsuario;
  document.getElementById('ciudad-perfil').textContent = perfil.ciudad ?? '';
  mostrarExperienciasDe(perfil.nombreUsuario);

  if (perfil.foto) {
    document.getElementById('foto-perfil').src = perfil.foto;
  }
}

async function cargarPerfil() {
  try {
    mostrarPerfil(await api('/perfil'));
  } catch (err) {
    alFallarCarga(err, cargarPerfil);
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
  // Mientras carga se queda el «–»: un 0 sería un dato falso
  if (listaExperiencias.querySelector('.hueco-carga')) return;
  const hayMas = !botonMasExperiencias.classList.contains('d-none');
  document.getElementById('total-experiencias').textContent = hayMas ? `${cargadas}+` : cargadas;
}
const vigilante = new MutationObserver(contarExperiencias);
vigilante.observe(listaExperiencias, { childList: true });
vigilante.observe(botonMasExperiencias, { attributes: true, attributeFilter: ['class'] });

// Amigos y seguidores (CS-45): contadores y listados paginados del perfil propio.
const cajaErrorRelaciones = document.getElementById('error-relaciones');
const PERSONAS_POR_PAGINA = 20;

// Comparten caja: «Reintentar» repite todo lo que haya fallado, no solo lo último
const porReintentar = new Set();
function mostrarErrorRelaciones(err, reintentar) {
  porReintentar.add(reintentar);
  mostrarErrorConReintento(cajaErrorRelaciones, err.message, () => {
    const pendientes = [...porReintentar];
    porReintentar.clear();
    pendientes.forEach((repetir) => repetir());
  });
}

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
    crear: crearFilaPersona,
    alFallar: mostrarErrorRelaciones,
  });
}

const listadoAmigos = crearListadoPersonas('amigos', 'lista-amigos', 'sin-amigos', 'mas-amigos');
const listadoSeguidores = crearListadoPersonas('seguidores', 'lista-seguidores', 'sin-seguidores', 'mas-seguidores');

// Pide los contadores de amigos y seguidores.
async function cargarContadores() {
  try {
    const resumen = await api('/perfil/resumen');
    document.getElementById('total-amigos').textContent = resumen.amigos;
    document.getElementById('total-seguidores').textContent = resumen.seguidores;
    rotularContador('total-amigos', resumen.amigos, 'amigo', 'amigos');
    rotularContador('total-seguidores', resumen.seguidores, 'seguidor', 'seguidores');
  } catch (err) {
    mostrarErrorRelaciones(err, cargarContadores);
  }
}

// Al abrir la página (y al reintentar): los contadores y la primera página de cada listado, cada cosa
// por su lado para que un fallo no impida ver las demás.
function cargarRelaciones() {
  porReintentar.clear();
  ocultarMensaje(cajaErrorRelaciones);
  cargarContadores();
  listadoAmigos.reiniciar();
  listadoSeguidores.reiniciar();
}

cargarRelaciones();
