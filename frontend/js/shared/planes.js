
 // Tarjeta de un plan real (los de GET /api/experiencias) y utilidades para
 // todas las pantallas que enseñan planes.
 // Usa crearBloqueCategoria de shared/pantalla.js, que se carga antes.
 //
 // CS-53: mostrar duración y tarifa cuando estén disponibles.

// La tarjeta de un plan, la misma en todas las pantallas. Se puede pulsar entera: el enlace del título
// se estira hasta cubrirla. Los textos se ponen con textContent para que nunca se interpreten como HTML.
// `indice` escalona la entrada; `conVisibilidad` añade su etiqueta; `alEditar`, el botón «Editar»;
// con `enlazar: false` no lleva enlace (vista previa del formulario).
function crearTarjetaPlan(plan, { indice = 0, conVisibilidad = false, alEditar, enlazar = true } = {}) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'card h-100 tarjeta-experiencia tarjeta-plan';
  tarjeta.dataset.experienciaId = plan.id;
  tarjeta.style.setProperty('--i', indice);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body d-flex flex-column';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h6';
  if (enlazar) {
    const enlace = document.createElement('a');
    enlace.className = 'stretched-link text-reset text-decoration-none enlace-tarjeta';
    enlace.href = `/paginas/experiencias/experiencia.html?id=${plan.id}`;
    enlace.dataset.experienciaId = plan.id;
    enlace.textContent = plan.titulo;
    titulo.append(enlace);
  } else {
    titulo.textContent = plan.titulo;
  }

  const subtitulo = document.createElement('p');
  subtitulo.className = 'card-subtitle small text-body-secondary mb-2';

  // CS-53: duración y tarifa opcionales.
  const datos = [plan.ciudad?.nombre, plan.tipo];
  if (plan.duracionMinutos != null) {
    datos.push(formatearDuracion(plan.duracionMinutos));
  }
  if (plan.tarifa != null) {
    datos.push(formatearTarifa(plan.tarifa));
  }
  subtitulo.textContent = datos.filter(Boolean).join(' · ');
  cuerpo.append(titulo, subtitulo);

  if (conVisibilidad) {
    const { clase, texto } = ETIQUETAS_VISIBILIDAD[plan.visibilidad];
    const etiqueta = document.createElement('span');
    etiqueta.className = clase;
    etiqueta.textContent = texto;
    const parrafo = document.createElement('p');
    parrafo.className = 'mb-2';
    parrafo.append(etiqueta);
    cuerpo.append(parrafo);
  }

  const descripcion = document.createElement('p');
  descripcion.className = 'card-text small descripcion-corta';
  descripcion.textContent = plan.descripcion;
  cuerpo.append(descripcion);

  if (plan.autor) {
    const autor = document.createElement('p');
    autor.className = 'card-text small text-body-secondary mt-auto mb-0';
    autor.textContent = `Por ${plan.autor.nombreUsuario}`;
    cuerpo.append(autor);
  }

  if (alEditar) {
    // Por encima del enlace estirado, para que «Editar» no abra el detalle
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn btn-outline-primary btn-sm boton-editar position-relative z-2 mt-auto';
    editar.textContent = 'Editar';
    editar.addEventListener('click', alEditar);
    cuerpo.append(editar);
  }

  tarjeta.append(crearBloqueCategoria(plan.tipo), cuerpo);
  return tarjeta;
}

// Id de la ciudad del catálogo que se llama como `nombre`.
// La ciudad del perfil es texto libre.
// No distingue mayúsculas, acentos ni espacios sobrantes.
function buscarCiudadPorNombre(nombre, ciudades) {
  const limpiar = (texto) =>
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();

  if (!nombre?.trim()) return null;

  return ciudades.find(
    (ciudad) =>
      limpiar(ciudad.nombre) === limpiar(nombre)
  )?.id ?? null;
}

// Pide a GET /api/experiencias los planes que cumplen `filtros`,
// sin enviar los vacíos.
// Devuelve { experiencias, siguiente }.
function pedirPlanes(filtros) {
  const parametros = new URLSearchParams();

  for (const [nombre, valor] of Object.entries(filtros)) {
    if (
      valor !== undefined &&
      valor !== null &&
      valor !== '' &&
      valor !== false
    ) {
      parametros.set(nombre, valor);
    }
  }

  return api(`/experiencias?${parametros}`);
}

// Funciones compartidas con otras pantallas.
Object.assign(window, {
  crearTarjetaPlan,
  buscarCiudadPorNombre,
  pedirPlanes,
});
