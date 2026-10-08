// Página de bienvenida (bienvenida.html): saluda al usuario con sesión, muestra sus experiencias
// por páginas (CS-44) y permite crearlas (CS-49) y editarlas (CS-57), con su visibilidad (CS-22).
// «Ver detalle» enlaza a la página de cada experiencia (experiencia.html, CS-63).
// Usa `api` de shared/api.js y `listaConCargarMas`, `mostrarMensaje`, `ocultarMensaje` e
// `irAlLogin` de shared/pantalla.js.

const rejilla = document.getElementById('rejilla');
const columnaNueva = document.getElementById('columna-nueva');
const cajaErrorLista = document.getElementById('error-lista');

const dialogo = document.getElementById('dialogo-experiencia');
const formulario = document.getElementById('form-experiencia');
const cajaError = document.getElementById('error-experiencia');
const boton = formulario.querySelector('button[type="submit"]');

// Campos del formulario, con el mismo nombre que en la API
const campos = ['titulo', 'descripcion', 'ciudadId', 'visibilidad', 'tipo', 'momentoAdecuado']
  .map((id) => document.getElementById(id));

// CS-22: explicación de cada visibilidad, que se muestra debajo del selector.
const DESCRIPCIONES_VISIBILIDAD = {
  PRIVADA: 'Solo tú puedes verla.',
  AMIGOS: 'Solo la ven tus amigos (con la amistad aceptada) y tú.',
  PUBLICA: 'Cualquier usuario puede verla.',
};
const selectorVisibilidad = document.getElementById('visibilidad');
const descripcionVisibilidad = document.getElementById('descripcion-visibilidad');

// Escribe debajo del selector la descripción de la visibilidad elegida.
function describirVisibilidad() {
  descripcionVisibilidad.textContent = DESCRIPCIONES_VISIBILIDAD[selectorVisibilidad.value] ?? '';
}

selectorVisibilidad.addEventListener('change', describirVisibilidad);

// Experiencia que se está editando. Es null cuando el formulario sirve para crear una nueva.
let editando = null;

// Crea la columna con la tarjeta de una experiencia. La estructura es fija; los textos se ponen
// después con textContent para que el contenido de usuario nunca se ejecute como HTML.
function crearTarjeta(experiencia) {
  const columna = document.createElement('div');
  columna.className = 'col';
  columna.dataset.id = experiencia.id;
  columna.innerHTML = `
    <div class="card h-100 tarjeta-experiencia">
      <div class="card-body d-flex flex-column">
        <h3 class="card-title h6"></h3>
        <p class="card-subtitle small text-body-secondary mb-2"></p>
        <p class="card-text small descripcion-corta"></p>
        <div class="d-flex gap-2 mt-auto">
          <a class="btn btn-link btn-sm p-0 boton-ver">Ver detalle</a>
          <button type="button" class="btn btn-link btn-sm p-0 boton-editar">Editar</button>
        </div>
      </div>
    </div>
  `;

  columna.querySelector('.card-title').textContent = experiencia.titulo;
  columna.querySelector('.card-subtitle').textContent =
    [experiencia.ciudad.nombre, experiencia.tipo].filter(Boolean).join(' · ');
  columna.querySelector('.card-text').textContent = experiencia.descripcion;
  columna.querySelector('.boton-ver').setAttribute('href', `experiencia.html?id=${experiencia.id}`);
  columna.querySelector('.boton-editar').addEventListener('click', () => abrirFormulario(experiencia));
  return columna;
}

// Abre el formulario vacío para crear una experiencia, o relleno con los datos de una
// experiencia para editarla.
function abrirFormulario(experiencia) {
  editando = experiencia;
  document.getElementById('titulo-dialogo').textContent = experiencia ? 'Editar experiencia' : 'Nueva experiencia';

  for (const campo of campos) {
    // Una experiencia nueva es pública salvo que se elija otra cosa
    campo.value = campo.id === 'visibilidad'
      ? experiencia?.visibilidad ?? 'PUBLICA'
      : experiencia?.[campo.id] ?? '';
  }

  describirVisibilidad();
  ocultarMensaje(cajaError);
  dialogo.showModal();
}

document.getElementById('boton-nueva').addEventListener('click', () => abrirFormulario(null));
document.getElementById('boton-cancelar').addEventListener('click', () => dialogo.close());

// Al pulsar Guardar se crea o se edita la experiencia.
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  ocultarMensaje(cajaError);
  boton.disabled = true;

  const datos = Object.fromEntries(campos.map((campo) => [campo.id, campo.value]));
  // El backend espera el id de la ciudad como número.
  datos.ciudadId = Number(datos.ciudadId);

  try {
    if (editando) {
      const experiencia = await api(`/experiencias/${editando.id}`, { method: 'PATCH', body: JSON.stringify(datos) });
      rejilla.querySelector(`[data-id="${editando.id}"]`).replaceWith(crearTarjeta(experiencia));
    } else {
      const experiencia = await api('/experiencias', { method: 'POST', body: JSON.stringify(datos) });
      // La nueva es la más reciente: va la primera, justo después de la tarjeta «+»
      columnaNueva.after(crearTarjeta(experiencia));
    }
    dialogo.close();
  } catch (err) {
    mostrarMensaje(cajaError, err.message);
  }

  boton.disabled = false;
});

// Mis experiencias se cargan por páginas (CS-44), con «Cargar más» (ver shared/pantalla.js)
let autorExperiencias = null;
const listadoExperiencias = listaConCargarMas({
  lista: rejilla,
  botonMas: document.getElementById('mas-experiencias'),
  pedir: async (cursor) => {
    const despuesDe = cursor === null ? '' : `&despuesDe=${cursor}`;
    const { experiencias, siguiente } = await api(`/experiencias?autor=${encodeURIComponent(autorExperiencias)}${despuesDe}`);
    return { elementos: experiencias, siguiente };
  },
  crear: crearTarjeta,
  alFallar: (err) => mostrarMensaje(cajaErrorLista, err.message),
});

// Carga las ciudades del formulario y la primera página de las experiencias del usuario.
async function cargarExperiencias(nombreUsuario) {
  autorExperiencias = nombreUsuario;
  try {
    const [ciudades] = await Promise.all([api('/ciudades'), listadoExperiencias.cargar()]);
    const desplegable = document.getElementById('ciudadId');
    for (const ciudad of ciudades) {
      const texto = ciudad.pais ? `${ciudad.nombre} (${ciudad.pais})` : ciudad.nombre;
      desplegable.add(new Option(texto, ciudad.id));
    }
  } catch (err) {
    mostrarMensaje(cajaErrorLista, err.message);
  }
}

// Al abrir la página: el saludo y las experiencias. Sin sesión, al inicio de sesión.
async function mostrarBienvenida() {
  let usuario;
  try {
    usuario = await api('/auth/yo');
  } catch {
    irAlLogin();
    return;
  }
  document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;
  cargarExperiencias(usuario.nombreUsuario);
}

mostrarBienvenida();
