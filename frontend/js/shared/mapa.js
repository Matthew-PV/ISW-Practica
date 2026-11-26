// Mapa de lugares (CS-73) con Leaflet, copiado en /vendor/leaflet/, y fondo de OpenStreetMap.
// El mapa es un apoyo: si no carga, se avisa y la lista de lugares sigue funcionando.

const URL_TESELAS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
const ZOOM_LUGAR = 16;

// Prepara un mapa dentro de `contenedor`; Leaflet no se arranca hasta que hay algo que mostrar.
// `mostrar` recibe [{ lugar, atenuado, alPulsar }] y sustituye los marcadores; sin ninguno, lo oculta.
function crearMapaLugares(contenedor) {
  let mapa = null;
  let marcadores = null;
  const lienzo = document.createElement('div');
  lienzo.className = 'mapa-lienzo';
  const aviso = document.createElement('p');
  aviso.className = 'small text-body-secondary mb-0';
  aviso.setAttribute('role', 'status');

  function arrancar() {
    contenedor.replaceChildren(lienzo, aviso);
    mapa = window.L.map(lienzo);
    // Sin el enlace a Leaflet: dentro del formulario sacaría al autor de la página
    mapa.attributionControl?.setPrefix(false);
    // OpenStreetMap exige saber qué web pide las teselas: se envía solo el origen, nunca la ruta
    const teselas = window.L.tileLayer(URL_TESELAS, {
      attribution: ATRIBUCION, maxZoom: 19, referrerPolicy: 'origin',
    });
    teselas.on('tileerror', () => {
      aviso.textContent = 'No se ha podido cargar el fondo del mapa.';
    });
    teselas.on('tileload', () => {
      aviso.textContent = '';
    });
    teselas.addTo(mapa);
    marcadores = window.L.layerGroup().addTo(mapa);
  }

  function marcador({ lugar, atenuado, alPulsar }) {
    // El globo recibe un elemento: un texto se interpretaría como HTML
    const nombre = document.createElement('span');
    nombre.textContent = lugar.nombre;
    const nuevo = window.L.marker([lugar.lat, lugar.lon], { title: lugar.nombre, opacity: atenuado ? 0.6 : 1 })
      .bindPopup(nombre);
    if (alPulsar) nuevo.on('click', alPulsar);
    return nuevo;
  }

  function mostrar(puntos) {
    contenedor.hidden = !puntos.length;
    if (!puntos.length) {
      marcadores?.clearLayers();
      return;
    }
    if (!window.L) {
      contenedor.textContent = 'El mapa no está disponible.';
      return;
    }
    if (!mapa) arrancar();
    // El tamaño del contenedor cambia mientras está oculto
    mapa.invalidateSize();
    marcadores.clearLayers();
    for (const punto of puntos) marcador(punto).addTo(marcadores);
    const posiciones = puntos.map(({ lugar }) => [lugar.lat, lugar.lon]);
    if (posiciones.length === 1) mapa.setView(posiciones[0], ZOOM_LUGAR);
    else mapa.fitBounds(posiciones, { padding: [32, 32], maxZoom: ZOOM_LUGAR });
  }

  return { mostrar };
}

// Global también cuando las pruebas cargan el archivo como módulo
Object.assign(window, { crearMapaLugares });
