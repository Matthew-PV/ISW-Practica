// Listado de las experiencias de un usuario con «Cargar más» (CS-44). Es común a /paginas/cuenta/perfil.html
// («Mis experiencias», con las privadas) y a /paginas/social/usuario.html («Sus experiencias»): el backend solo
// devuelve las que puede ver el usuario de la sesión.
// Lo usan: js/cuenta/perfil.js y js/social/usuario.js. Usa `crearTarjetaPlan` de shared/planes.js, `api` de shared/api.js y `listaConCargarMas` y
// `mostrarErrorConReintento` de shared/pantalla.js, que se cargan antes.
// La página necesita #lista-experiencias, #sin-experiencias, #mas-experiencias y #error-experiencias.

const cajaErrorExperiencias = document.getElementById('error-experiencias');

// Autor del listado: el nombre con el que se piden las páginas
let autorExperiencias = null;

const listadoExperiencias = listaConCargarMas({
  lista: document.getElementById('lista-experiencias'),
  vacio: document.getElementById('sin-experiencias'),
  botonMas: document.getElementById('mas-experiencias'),
  pedir: async (cursor) => {
    ocultarMensaje(cajaErrorExperiencias);
    const despuesDe = cursor === null ? '' : `&despuesDe=${cursor}`;
    const { experiencias, siguiente } = await api(`/experiencias?autor=${encodeURIComponent(autorExperiencias)}${despuesDe}`);
    return { elementos: experiencias, siguiente };
  },
  crear: (experiencia) => crearTarjetaPlan(experiencia, { conVisibilidad: true }),
  alFallar: (err, reintentar) => mostrarErrorConReintento(cajaErrorExperiencias, err.message, reintentar),
});

// Muestra el listado de `nombreUsuario`. La primera vez carga la primera página. Si el listado ya
// se está mostrando (por ejemplo, tras cambiar el nombre en «Mi perfil»), solo actualiza el
// nombre con el que se piden las páginas siguientes.
function mostrarExperienciasDe(nombreUsuario) {
  const primeraVez = autorExperiencias === null;
  autorExperiencias = nombreUsuario;
  if (primeraVez) {
    listadoExperiencias.cargar();
  }
}

// Vuelve a empezar el listado desde la primera página. Por ejemplo, tras aceptar o eliminar una
// amistad, porque cambia qué experiencias de amigos se pueden ver.
function recargarExperiencias() {
  return listadoExperiencias.reiniciar();
}

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
window.mostrarExperienciasDe = mostrarExperienciasDe;
window.recargarExperiencias = recargarExperiencias;
