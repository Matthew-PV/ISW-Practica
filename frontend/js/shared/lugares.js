// Lugares de un plan (CS-50): acceso por API y ficha común de un lugar.

// Lugares de la ciudad cuyo nombre, tipo o dirección contienen todas las palabras escritas.
async function buscarLugares(texto, ciudad) {
  return api(`/lugares/buscar?q=${encodeURIComponent(texto)}&ciudadId=${ciudad.id}`);
}

// Lugares persistidos en la experiencia, en el orden del autor.
async function lugaresDe(experiencia) {
  return experiencia.lugares ?? [];
}

// Ficha de un lugar: imagen, nombre, tipo, dirección y web. Los textos se ponen con textContent
// y la web solo se enlaza si es http(s).
function crearFichaLugar(lugar) {
  const ficha = document.createElement('div');
  ficha.className = 'ficha-lugar';
  if (lugar.imagen) {
    const imagen = document.createElement('img');
    imagen.src = lugar.imagen;
    imagen.alt = '';
    imagen.loading = 'lazy';
    ficha.append(imagen);
  }
  const datos = document.createElement('div');
  datos.className = 'ficha-lugar-datos';
  const nombre = document.createElement('p');
  nombre.className = 'ficha-lugar-nombre';
  nombre.textContent = lugar.nombre;
  const detalle = document.createElement('p');
  detalle.className = 'ficha-lugar-detalle';
  detalle.textContent = [lugar.tipo, lugar.direccion].filter(Boolean).join(' · ');
  datos.append(nombre, detalle);
  if (/^https?:\/\//i.test(lugar.web ?? '')) {
    const enlace = document.createElement('a');
    enlace.href = lugar.web;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.textContent = 'Página web';
    datos.append(enlace);
  }
  ficha.append(datos);
  return ficha;
}

// Globales también cuando las pruebas cargan el archivo como módulo (como en shared/pantalla.js)
Object.assign(window, { buscarLugares, lugaresDe, crearFichaLugar });
