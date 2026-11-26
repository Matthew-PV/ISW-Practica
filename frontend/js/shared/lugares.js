// Lugares de un plan (CS-50): único punto de acceso a sus datos y ficha común de un lugar.
// Los datos salen de los ficheros de /datos/; el contrato de la API que los sustituirá está en
// documentacion/decisiones/2026-11-26-lugares-y-mapa.md.

const MAXIMO_RESULTADOS = 10;

async function leerFicheroLugares(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error('No se han podido cargar los lugares.');
  return respuesta.json();
}

const sinTildes = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Lugares de la ciudad cuyo nombre, tipo o dirección contienen todas las palabras escritas.
// La ciudad se compara por nombre porque su id cambia entre bases de datos.
async function buscarLugares(texto, ciudad) {
  const datos = await leerFicheroLugares('/datos/lugares-madrid.json');
  if (ciudad.nombre !== datos.ciudad.nombre) return [];
  const palabras = sinTildes(texto).split(/\s+/).filter(Boolean);
  return datos.lugares
    .filter((lugar) => {
      const donde = sinTildes(`${lugar.nombre} ${lugar.tipo} ${lugar.direccion}`);
      return palabras.every((palabra) => donde.includes(palabra));
    })
    .slice(0, MAXIMO_RESULTADOS);
}

// Lugares de una experiencia, en el orden del autor. Si no vienen en ella, se buscan por título.
async function lugaresDe(experiencia) {
  if (experiencia.lugares) return experiencia.lugares;
  const porTitulo = await leerFicheroLugares('/datos/lugares-planes.json');
  return porTitulo[experiencia.titulo] ?? [];
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
