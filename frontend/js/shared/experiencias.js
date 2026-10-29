// Listado de las experiencias de un usuario con «Cargar más» (CS-44). Es común a /paginas/cuenta/perfil.html
// («Mis experiencias», con las privadas) y a /paginas/social/usuario.html («Sus experiencias»): el backend solo
// devuelve las que puede ver el usuario de la sesión.
// Lo usan: js/cuenta/perfil.js y js/social/usuario.js. Usa `api` de shared/api.js y `listaConCargarMas` y
// `mostrarErrorConReintento` de shared/pantalla.js, que se cargan antes.
// La página necesita #lista-experiencias, #sin-experiencias, #mas-experiencias y #error-experiencias.

const cajaErrorExperiencias = document.getElementById('error-experiencias');

// Autor del listado: el nombre con el que se piden las páginas
let autorExperiencias = null;

// Etiqueta de cada visibilidad (clases definidas en componentes.css); igual que en bienvenida.js
const ETIQUETAS_VISIBILIDAD = {
  PUBLICA: { clase: 'etiqueta-publica', texto: 'Pública' },
  AMIGOS: { clase: 'etiqueta-amigos', texto: 'Amigos' },
  PRIVADA: { clase: 'etiqueta-privada', texto: 'Privada' },
};

// Crea la tarjeta de una experiencia, la misma que se ve en /paginas/cuenta/bienvenida.html pero sin «Editar»:
// desde aquí solo se consulta. Los textos se incorporan con textContent para que nunca se
// interpreten como HTML.
function crearTarjetaExperiencia(experiencia) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card h-100 tarjeta-experiencia';
  tarjeta.dataset.experienciaId = experiencia.id;

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body d-flex flex-column';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h6';
  titulo.textContent = experiencia.titulo;

  const ciudad = document.createElement('p');
  ciudad.className = 'card-subtitle small text-body-secondary mb-2';
  ciudad.textContent = experiencia.ciudad?.nombre ?? '';

  const { clase, texto } = ETIQUETAS_VISIBILIDAD[experiencia.visibilidad];
  const etiqueta = document.createElement('span');
  etiqueta.className = clase;
  etiqueta.textContent = texto;
  const parrafoEtiqueta = document.createElement('p');
  parrafoEtiqueta.className = 'mb-2';
  parrafoEtiqueta.append(etiqueta);

  const ver = document.createElement('a');
  ver.className = 'btn btn-outline-primary btn-sm mt-auto';
  ver.href = `/paginas/experiencias/experiencia.html?id=${experiencia.id}`;
  ver.dataset.experienciaId = experiencia.id;
  ver.textContent = 'Ver detalle';

  cuerpo.append(titulo, ciudad, parrafoEtiqueta, ver);
  tarjeta.append(crearBloqueCategoria(experiencia.tipo), cuerpo);
  return tarjeta;
}

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
  crear: crearTarjetaExperiencia,
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
