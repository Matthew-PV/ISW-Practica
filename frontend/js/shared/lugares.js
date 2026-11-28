// Lugares de un plan (CS-50): acceso por API y ficha común de un lugar.

// Lugares de la ciudad cuyo nombre, tipo o dirección contienen todas las palabras escritas.
async function buscarLugares(texto, ciudad) {
  return api(`/lugares/buscar?q=${encodeURIComponent(texto)}&ciudadId=${ciudad.id}`);
}

// Lugares persistidos en la experiencia, en el orden del autor.
async function lugaresDe(experiencia) {
  return experiencia.lugares ?? [];
}

// La categoría OSM forma parte del identificador: «stop» por sí solo es ambiguo.
// La traducción es de presentación; no cambia los datos guardados ni el contrato de API.
function etiquetaTipoLugar(lugar) {
  const categoria = /^osm:[NWR]\d+:([a-z_]+)$/.exec(lugar.proveedorId ?? '')?.[1];
  if (!categoria) return lugar.tipo || 'Lugar'; // Catálogo anterior, ya en español.
  const etiquetas = {
    tourism: { apartment: 'Apartamento turístico', hotel: 'Hotel', hostel: 'Albergue',
      guest_house: 'Casa de huéspedes', museum: 'Museo', attraction: 'Atracción turística',
      viewpoint: 'Mirador', information: 'Información turística', artwork: 'Obra de arte',
      camp_site: 'Camping' },
    highway: { bus_stop: 'Parada de autobús', stop: 'Señal de STOP',
      pedestrian: 'Calle peatonal', residential: 'Calle residencial', footway: 'Camino peatonal',
      path: 'Sendero', steps: 'Escaleras', living_street: 'Calle de prioridad peatonal',
      primary: 'Vía principal', secondary: 'Vía secundaria', tertiary: 'Calle', service: 'Vía de servicio' },
    railway: { stop: 'Punto de parada de tren o metro', station: 'Estación de tren o metro',
      subway_entrance: 'Entrada de metro', tram_stop: 'Parada de tranvía',
      halt: 'Apeadero', platform: 'Andén' },
    public_transport: { stop_position: 'Punto de parada de transporte público',
      platform: 'Zona de espera de transporte público', station: 'Estación de transporte público',
      stop_area: 'Área de parada de transporte público' },
    amenity: { restaurant: 'Restaurante', cafe: 'Cafetería', bar: 'Bar', pub: 'Pub',
      fast_food: 'Comida rápida', theatre: 'Teatro', cinema: 'Cine', library: 'Biblioteca',
      place_of_worship: 'Lugar de culto', marketplace: 'Mercado', fountain: 'Fuente',
      parking: 'Aparcamiento', toilets: 'Aseos', bus_station: 'Estación de autobuses',
      hospital: 'Hospital', pharmacy: 'Farmacia', university: 'Universidad', school: 'Colegio' },
    leisure: { park: 'Parque', garden: 'Jardín', playground: 'Zona de juegos',
      sports_centre: 'Centro deportivo', stadium: 'Estadio', swimming_pool: 'Piscina' },
    historic: { monument: 'Monumento', memorial: 'Memorial', castle: 'Castillo',
      ruins: 'Ruinas', archaeological_site: 'Yacimiento arqueológico' },
    shop: { bakery: 'Panadería', supermarket: 'Supermercado', convenience: 'Tienda de alimentación',
      books: 'Librería', clothes: 'Tienda de ropa', mall: 'Centro comercial' },
    building: { apartments: 'Edificio de viviendas', residential: 'Edificio residencial',
      hotel: 'Edificio de hotel', house: 'Casa' },
    place: { square: 'Plaza', neighbourhood: 'Barrio', suburb: 'Barrio',
      city: 'Ciudad', town: 'Localidad', village: 'Pueblo' },
    natural: { peak: 'Cima', beach: 'Playa', wood: 'Bosque', water: 'Masa de agua' },
  };
  const generales = { tourism: 'Lugar de interés turístico', highway: 'Elemento de la vía',
    railway: 'Instalación ferroviaria', public_transport: 'Transporte público', amenity: 'Servicio o equipamiento',
    leisure: 'Espacio de ocio', historic: 'Lugar histórico', shop: 'Comercio', building: 'Edificio',
    place: 'Lugar', natural: 'Espacio natural', boundary: 'Límite administrativo' };
  return Object.hasOwn(etiquetas, categoria) && Object.hasOwn(etiquetas[categoria], lugar.tipo)
    ? etiquetas[categoria][lugar.tipo]
    : (Object.hasOwn(generales, categoria) ? generales[categoria] : 'Lugar');
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
  detalle.textContent = [etiquetaTipoLugar(lugar), lugar.direccion].filter(Boolean).join(' · ');
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
