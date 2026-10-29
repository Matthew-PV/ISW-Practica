// Tarjeta de un plan real (los de GET /api/experiencias) y utilidades para las pantallas que los
// descubren: Inicio, Explorar y el buscador. Usa `crearBloqueCategoria` de shared/pantalla.js, que se
// carga antes.

// La tarjeta entera es un enlace al detalle del plan. `indice` escalona su animación de entrada.
// Los textos se incorporan con textContent: título, descripción y autor los escriben los usuarios.
function crearTarjetaPlan(plan, indice = 0) {
  const tarjeta = document.createElement('a');
  tarjeta.className = 'card tarjeta-experiencia tarjeta-plan';
  tarjeta.href = `/paginas/experiencias/experiencia.html?id=${plan.id}`;
  tarjeta.style.setProperty('--i', indice);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body d-flex flex-column';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h6';
  titulo.textContent = plan.titulo;

  const subtitulo = document.createElement('p');
  subtitulo.className = 'card-subtitle small text-body-secondary mb-2';
  subtitulo.textContent = [plan.ciudad?.nombre, plan.tipo].filter(Boolean).join(' · ');

  const descripcion = document.createElement('p');
  descripcion.className = 'card-text small descripcion-corta';
  descripcion.textContent = plan.descripcion;

  cuerpo.append(titulo, subtitulo, descripcion);
  if (plan.autor) {
    const autor = document.createElement('p');
    autor.className = 'small text-body-secondary mt-auto mb-0';
    autor.textContent = `Por ${plan.autor.nombreUsuario}`;
    cuerpo.append(autor);
  }
  tarjeta.append(crearBloqueCategoria(plan.tipo), cuerpo);
  return tarjeta;
}

// Id de la ciudad del catálogo que se llama como `nombre` (la ciudad del perfil es texto libre), sin
// distinguir mayúsculas, acentos ni espacios sobrantes. Devuelve null si no hay coincidencia.
function buscarCiudadPorNombre(nombre, ciudades) {
  const limpiar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  if (!nombre?.trim()) return null;
  return ciudades.find((ciudad) => limpiar(ciudad.nombre) === limpiar(nombre))?.id ?? null;
}

// Pide a GET /api/experiencias los planes que cumplen `filtros`, sin enviar los vacíos. Devuelve
// { experiencias, siguiente }.
function pedirPlanes(filtros) {
  const parametros = new URLSearchParams();
  for (const [nombre, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) parametros.set(nombre, valor);
  }
  return api(`/experiencias?${parametros}`);
}

Object.assign(window, { crearTarjetaPlan, buscarCiudadPorNombre, pedirPlanes });
