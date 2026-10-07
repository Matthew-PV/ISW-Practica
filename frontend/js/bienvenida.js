// Página de bienvenida (bienvenida.html): saluda al usuario con sesión,
// muestra sus experiencias y permite crearlas, editarlas y consultar su detalle.
// CS-48: en el detalle se muestran en una sección propia las valoraciones
// realizadas por amigos y seguidores, con paginación.
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
  'tipo',
  'momentoAdecuado',
].map((id) => document.getElementById(id));

// Elementos del diálogo de detalle.
const dialogoDetalle = document.getElementById('dialogo-detalle');
const tituloDetalle = document.getElementById('titulo-detalle');
const descripcionDetalle = document.getElementById('descripcion-detalle');
const listaValoraciones = document.getElementById('lista-valoraciones');
const sinValoraciones = document.getElementById('sin-valoraciones');
const errorValoraciones = document.getElementById('error-valoraciones');

// Elementos de paginación de las valoraciones.
const paginacionValoraciones =
  document.getElementById('paginacion-valoraciones');

const botonPaginaAnterior =
  document.getElementById('boton-pagina-anterior');

const botonPaginaSiguiente =
  document.getElementById('boton-pagina-siguiente');

const textoPaginaValoraciones =
  document.getElementById('pagina-valoraciones');

// Experiencia que se está editando.
// Es null cuando el formulario sirve para crear una nueva.
let editando = null;

// Experiencia cuyo detalle está abierto.
let experienciaDetalle = null;

// Estado de la paginación de valoraciones.
let paginaActualValoraciones = 1;
const LIMITE_VALORACIONES = 10;

// Crea visualmente una valoración.
// Todos los datos del usuario se asignan con textContent para evitar ejecutar HTML.
function crearValoracion(valoracion) {
  const elemento = document.createElement('div');

  elemento.className = 'border rounded p-3 mb-2';

  const cabecera = document.createElement('div');
  cabecera.className = 'd-flex justify-content-between gap-3 mb-2';

  const usuario = document.createElement('strong');
  usuario.textContent =
    valoracion.usuario?.nombreUsuario ?? 'Usuario';

  const puntuacion = document.createElement('span');
  puntuacion.className = 'text-nowrap';
  puntuacion.textContent = `${valoracion.puntuacion}/5`;

  cabecera.append(usuario, puntuacion);
  elemento.appendChild(cabecera);

  if (valoracion.comentario) {
    const comentario = document.createElement('p');
    comentario.className = 'mb-0';
    comentario.textContent = valoracion.comentario;

    elemento.appendChild(comentario);
  }

  return elemento;
}

// Actualiza los botones y el texto de la paginación.
function actualizarPaginacion(total) {
  const totalPaginas = Math.max(
    1,
    Math.ceil(total / LIMITE_VALORACIONES)
  );

  if (totalPaginas <= 1) {
    paginacionValoraciones.classList.add('d-none');
    return;
  }

  paginacionValoraciones.classList.remove('d-none');

  textoPaginaValoraciones.textContent =
    `Página ${paginaActualValoraciones} de ${totalPaginas}`;

  botonPaginaAnterior.disabled =
    paginaActualValoraciones <= 1;

  botonPaginaSiguiente.disabled =
    paginaActualValoraciones >= totalPaginas;
}

// Consulta y muestra una página de valoraciones.
async function cargarValoracionesDetalle() {
  listaValoraciones.replaceChildren();

  sinValoraciones.classList.add('d-none');
  errorValoraciones.classList.add('d-none');
  paginacionValoraciones.classList.add('d-none');

  try {
    // La primera página puede usar los valores por defecto del backend.
    // Para las siguientes se envían página y límite expresamente.
    const ruta =
      paginaActualValoraciones === 1
        ? `/experiencias/${experienciaDetalle.id}/valoracion`
        : `/experiencias/${experienciaDetalle.id}/valoracion?pagina=${paginaActualValoraciones}&limite=${LIMITE_VALORACIONES}`;

    const resultado = await api(ruta);

    const valoraciones = resultado.valoraciones ?? [];
    const total = resultado.total ?? valoraciones.length;

    if (valoraciones.length === 0 && total === 0) {
      sinValoraciones.classList.remove('d-none');
      return;
    }

    listaValoraciones.append(
      ...valoraciones.map(crearValoracion)
    );

    actualizarPaginacion(total);
  } catch (err) {
    errorValoraciones.textContent = err.message;
    errorValoraciones.classList.remove('d-none');
  }
}

// Abre el detalle de una experiencia, carga sus datos completos desde la API
// y luego muestra la primera página de valoraciones.
async function abrirDetalle(experiencia) {
  experienciaDetalle = experiencia;
  paginaActualValoraciones = 1;

  // Mostramos el diálogo inmediatamente en estado de carga
  tituloDetalle.textContent = 'Cargando...';
  descripcionDetalle.textContent = '';
  listaValoraciones.replaceChildren();
  sinValoraciones.classList.add('d-none');
  errorValoraciones.classList.add('d-none');
  paginacionValoraciones.classList.add('d-none');

  dialogoDetalle.showModal();

  try {
    // LLAMADA A LA API (CS-63): Obtiene la experiencia si es visible
    const datosCompletos = await api('/experiencias/' + experiencia.id);

    // Inyectamos los datos validados
    tituloDetalle.textContent = datosCompletos.titulo;
    descripcionDetalle.textContent = datosCompletos.descripcion;

    // Mostramos autor y ciudad
    const autorDialogo = document.getElementById('autor-detalle');
    const ciudadDialogo = document.getElementById('ciudad-detalle');
    if (autorDialogo) autorDialogo.textContent = `Autor: ${datosCompletos.autor.nombreUsuario}`;
    if (ciudadDialogo) ciudadDialogo.textContent = `Ciudad: ${datosCompletos.ciudad.nombre}`;

    // Cargamos las valoraciones originales (CS-48)
    await cargarValoracionesDetalle();
  } catch (error) {
    // Si la API devuelve error, mostramos el mensaje del backend
    tituloDetalle.textContent = 'Aviso';
    descripcionDetalle.textContent = error.message;
  }
}
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
          <button
            type="button"
            class="btn btn-link btn-sm p-0 boton-ver"
          >
            Ver detalle
          </button>

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
    .addEventListener(
      'click',
      () => abrirDetalle(experiencia)
    );

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
    campo.value = experiencia?.[campo.id] ?? '';
  }

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

document
  .getElementById('boton-cerrar-detalle')
  .addEventListener(
    'click',
    () => dialogoDetalle.close()
  );

// Página anterior de valoraciones.
botonPaginaAnterior.addEventListener(
  'click',
  async () => {
    if (paginaActualValoraciones <= 1) {
      return;
    }

    paginaActualValoraciones -= 1;

    await cargarValoracionesDetalle();
  }
);

// Página siguiente de valoraciones.
botonPaginaSiguiente.addEventListener(
  'click',
  async () => {
    paginaActualValoraciones += 1;

    await cargarValoracionesDetalle();
  }
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
