// Página de bienvenida (bienvenida.html): saluda al usuario con sesión,
// muestra sus experiencias y permite crearlas y editarlas. «Ver detalle»
// enlaza a la página de cada experiencia (experiencia.html, CS-63).
//
// Usa `api` de shared/api.js.

const rejilla = document.getElementById('rejilla');
const columnaNueva = document.getElementById('columna-nueva');
const cajaErrorLista = document.getElementById('error-lista');

const dialogo = document.getElementById('dialogo-experiencia');
const formulario = document.getElementById('form-experiencia');
const cajaError = document.getElementById('error-experiencia');
const boton = formulario.querySelector('button[type="submit"]');

const campos = [
  'titulo',
  'descripcion',
  'ciudadId',
  'visibilidad',
  'tipo',
  'momentoAdecuado',
].map((id) => document.getElementById(id));

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

// Experiencia que se está editando.
// Es null cuando el formulario sirve para crear una nueva.
let editando = null;

// Crea la columna con la tarjeta de una experiencia.
// Los textos se ponen con textContent para que el contenido de usuario
// nunca se ejecute como HTML.
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
          <a class="btn btn-link btn-sm p-0 boton-ver">
            Ver detalle
          </a>

          <button
            type="button"
            class="btn btn-link btn-sm p-0 boton-editar"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  `;

  columna.querySelector('.card-title').textContent =
    experiencia.titulo;

  columna.querySelector('.card-subtitle').textContent =
    [
      experiencia.ciudad.nombre,
      experiencia.tipo,
    ]
      .filter(Boolean)
      .join(' · ');

  columna.querySelector('.card-text').textContent =
    experiencia.descripcion;

  columna
    .querySelector('.boton-ver')
    .setAttribute('href', `experiencia.html?id=${experiencia.id}`);

  columna
    .querySelector('.boton-editar')
    .addEventListener(
      'click',
      () => abrirFormulario(experiencia)
    );

  return columna;
}

// Abre el formulario vacío para crear una experiencia,
// o relleno con los datos de una experiencia para editarla.
function abrirFormulario(experiencia) {
  editando = experiencia;

  document.getElementById('titulo-dialogo').textContent =
    experiencia
      ? 'Editar experiencia'
      : 'Nueva experiencia';

  for (const campo of campos) {
    if (campo.id === 'visibilidad') {
      campo.value = experiencia?.visibilidad ?? 'PUBLICA';
      continue;
    }

    campo.value = experiencia?.[campo.id] ?? '';
  }

  describirVisibilidad();
  cajaError.classList.add('d-none');

  dialogo.showModal();
}

document
  .getElementById('boton-nueva')
  .addEventListener(
    'click',
    () => abrirFormulario(null)
  );

document
  .getElementById('boton-cancelar')
  .addEventListener(
    'click',
    () => dialogo.close()
  );

// Al pulsar Guardar se crea o se edita la experiencia.
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  cajaError.classList.add('d-none');
  boton.disabled = true;

  const datos = Object.fromEntries(
    campos.map(
      (campo) => [
        campo.id,
        campo.value,
      ]
    )
  );

  // El backend espera el id de la ciudad como número.
  datos.ciudadId = Number(datos.ciudadId);

  try {
    if (editando) {
      const experiencia = await api(
        `/experiencias/${editando.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(datos),
        }
      );

      rejilla
        .querySelector(
          `[data-id="${editando.id}"]`
        )
        .replaceWith(
          crearTarjeta(experiencia)
        );
    } else {
      const experiencia = await api(
        '/experiencias',
        {
          method: 'POST',
          body: JSON.stringify(datos),
        }
      );

      columnaNueva.after(
        crearTarjeta(experiencia)
      );
    }

    dialogo.close();
  } catch (err) {
    cajaError.textContent = err.message;
    cajaError.classList.remove('d-none');
  }

  boton.disabled = false;
});

// Carga las ciudades y las experiencias del usuario.
async function cargarExperiencias() {
  try {
    const [
      ciudades,
      experiencias,
    ] = await Promise.all([
      api('/ciudades'),
      api('/experiencias/mias'),
    ]);

    const desplegable =
      document.getElementById('ciudadId');

    for (const ciudad of ciudades) {
      const texto = ciudad.pais
        ? `${ciudad.nombre} (${ciudad.pais})`
        : ciudad.nombre;

      desplegable.add(
        new Option(
          texto,
          ciudad.id
        )
      );
    }

    rejilla.append(
      ...experiencias.map(crearTarjeta)
    );
  } catch (err) {
    cajaErrorLista.textContent = err.message;
    cajaErrorLista.classList.remove('d-none');
  }
}

async function mostrarBienvenida() {
  try {
    const usuario = await api('/auth/yo');

    document
      .getElementById('nombre-usuario')
      .textContent = usuario.nombreUsuario;
  } catch {
    window.location.href = '/';
    return;
  }

  cargarExperiencias();
}

mostrarBienvenida();
