// Página de bienvenida (bienvenida.html): saluda al usuario con sesión o lo devuelve al login,
// y muestra sus experiencias en una rejilla donde puede crearlas (botón «+») y editarlas
// (pulsando una tarjeta). Se ejecuta nada más cargar la página. Usa `api` de shared/api.js.

const rejilla = document.getElementById('rejilla');
const columnaNueva = document.getElementById('columna-nueva');
const cajaErrorLista = document.getElementById('error-lista');
const dialogo = document.getElementById('dialogo-experiencia');
const formulario = document.getElementById('form-experiencia');
const cajaError = document.getElementById('error-experiencia');
const boton = formulario.querySelector('button[type="submit"]');
const campos = ['titulo', 'descripcion', 'ciudadId', 'tipo', 'momentoAdecuado']
  .map((id) => document.getElementById(id));

// Experiencia que se está editando, o null si el formulario es para crear una nueva
let editando = null;

// Crea la columna con la tarjeta de una experiencia. Los textos se ponen con textContent,
// nunca como HTML, para que lo que escriba un usuario no se ejecute en la página.
function crearTarjeta(experiencia) {
  const columna = document.createElement('div');
  columna.className = 'col';
  columna.dataset.id = experiencia.id;
  columna.innerHTML = `
    <div class="card h-100 tarjeta-experiencia">
      <div class="card-body">
        <h3 class="card-title h6"></h3>
        <p class="card-subtitle small text-body-secondary mb-2"></p>
        <p class="card-text small descripcion-corta"></p>
        <button type="button" class="btn btn-link btn-sm p-0 stretched-link">Editar</button>
      </div>
    </div>`;
  columna.querySelector('.card-title').textContent = experiencia.titulo;
  // Debajo del título: ciudad y, si lo tiene, el tipo («Madrid · Cultural»)
  columna.querySelector('.card-subtitle').textContent =
    [experiencia.ciudad.nombre, experiencia.tipo].filter(Boolean).join(' · ');
  columna.querySelector('.card-text').textContent = experiencia.descripcion;
  // stretched-link hace que toda la tarjeta responda al clic del botón «Editar»
  columna.querySelector('button').addEventListener('click', () => abrirFormulario(experiencia));
  return columna;
}

// Abre el formulario vacío (experiencia = null) o con los datos de la experiencia a editar
function abrirFormulario(experiencia) {
  editando = experiencia;
  document.getElementById('titulo-dialogo').textContent =
    experiencia ? 'Editar experiencia' : 'Nueva experiencia';
  for (const campo of campos) {
    campo.value = experiencia?.[campo.id] ?? '';
  }
  cajaError.classList.add('d-none');
  dialogo.showModal();
}

document.getElementById('boton-nueva').addEventListener('click', () => abrirFormulario(null));
document.getElementById('boton-cancelar').addEventListener('click', () => dialogo.close());

// Al pulsar «Guardar» se crea (POST) o se edita (PATCH) la experiencia
formulario.addEventListener('submit', async (e) => {
  // Evita que el navegador envíe el formulario por su cuenta y recargue la página
  e.preventDefault();
  // Se oculta el error del intento anterior y se desactiva el botón para no enviar dos veces
  cajaError.classList.add('d-none');
  boton.disabled = true;

  const datos = Object.fromEntries(campos.map((campo) => [campo.id, campo.value]));
  // El backend espera el id de la ciudad como número, no como texto
  datos.ciudadId = Number(datos.ciudadId);

  try {
    if (editando) {
      const experiencia = await api(`/experiencias/${editando.id}`, { method: 'PATCH', body: JSON.stringify(datos) });
      // La tarjeta se sustituye en su sitio por la versión guardada
      rejilla.querySelector(`[data-id="${editando.id}"]`).replaceWith(crearTarjeta(experiencia));
    } else {
      const experiencia = await api('/experiencias', { method: 'POST', body: JSON.stringify(datos) });
      // La nueva va justo detrás del «+», delante de las demás
      columnaNueva.after(crearTarjeta(experiencia));
    }
    dialogo.close();
  } catch (err) {
    // Se muestra el mensaje del backend tal cual
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }
  // Se vuelve a habilitar el botón, haya ido bien o mal
  boton.disabled = false;
});

// Carga las ciudades del desplegable y las experiencias del usuario
async function cargarExperiencias() {
  try {
    const [ciudades, experiencias] = await Promise.all([api('/ciudades'), api('/experiencias/mias')]);
    const desplegable = document.getElementById('ciudadId');
    for (const ciudad of ciudades) {
      // Se añade el país para distinguir ciudades con el mismo nombre
      const texto = ciudad.pais ? `${ciudad.nombre} (${ciudad.pais})` : ciudad.nombre;
      desplegable.add(new Option(texto, ciudad.id));
    }
    // Llegan de la más nueva a la más antigua y se colocan en ese orden detrás del «+»
    rejilla.append(...experiencias.map(crearTarjeta));
  } catch (err) {
    cajaErrorLista.textContent = err.message;
    cajaErrorLista.classList.remove('d-none');
  }
}

async function mostrarBienvenida() {
  try {
    // Se pregunta al servidor quién es el usuario de la sesión actual (lo sabe por la cookie)
    const usuario = await api('/auth/yo');
    // Hay sesión: se pone su nombre en el saludo
    document.getElementById('nombre-usuario').textContent = usuario.nombreUsuario;
  } catch {
    // No hay sesión (o el servidor no responde): se vuelve a la página de login
    window.location.href = '/';
    return;
  }
  cargarExperiencias();
}

mostrarBienvenida();
