// Piezas comunes de las pantallas. Cada página que las usa carga este archivo después de
// shared/api.js y antes de su propio script.
// Lo usan: js/experiencia.js, js/perfil.js, js/personas.js, js/usuario.js, js/bienvenida.js y
//          js/shared/experiencias.js.

// Muestra un texto en una caja de aviso (error, éxito...) que estaba oculta con la clase d-none.
function mostrarMensaje(caja, texto) {
  caja.textContent = texto;
  caja.classList.remove('d-none');
}

// Vuelve a ocultar una caja de aviso.
function ocultarMensaje(caja) {
  caja.classList.add('d-none');
}

// Muestra u oculta el texto «Cargando…» (#cargando) de una página mientras llegan sus datos.
function mostrarCargando() {
  document.getElementById('cargando')?.classList.remove('d-none');
}

function ocultarCargando() {
  document.getElementById('cargando')?.classList.add('d-none');
}

// Sin sesión no se puede usar la página: se vuelve al inicio de sesión.
function irAlLogin() {
  window.location.href = '/acceso/iniciar-sesion.html';
}

// Convierte `enlace` (un <a>) en el enlace al perfil de `usuario`: el mío lleva a «Mi perfil» y
// el de otra persona, a su página (CS-62). El nombre se pone como texto, nunca como HTML.
// - `miUsuarioId`: el id del usuario de la sesión, si se conoce.
function crearEnlacePerfil(enlace, usuario, miUsuarioId) {
  enlace.textContent = usuario.nombreUsuario;
  enlace.href = usuario.id === miUsuarioId
    ? '/cuenta/perfil.html'
    : `/social/usuario.html?nombre=${encodeURIComponent(usuario.nombreUsuario)}`;
  return enlace;
}

// Listado con «Cargar más» por cursor (ver backend/src/services/shared/paginacion.js):
// - `lista`: el elemento donde se añaden las filas; `vacio`: el aviso de lista vacía (opcional);
//   `botonMas`: el botón «Cargar más».
// - `pedir(cursor)`: pide una página (cursor null = la primera) y devuelve { elementos, siguiente }.
// - `crear(elemento)`: crea la fila de un elemento.
// - `alFallar(err)`: qué hacer si falla una petición.
// Cada fila guarda el id de su elemento en data-id-elemento, para no repetir ninguna aunque la
// lista cambie entre dos páginas. Devuelve { cargar, reiniciar }: `cargar` pide la página
// siguiente y `reiniciar` vacía la lista y vuelve a pedir la primera.
function listaConCargarMas({ lista, vacio, botonMas, pedir, crear, alFallar }) {
  let siguiente = null;

  async function cargar() {
    try {
      const pagina = await pedir(siguiente);
      for (const elemento of pagina.elementos) {
        if (!lista.querySelector(`[data-id-elemento="${elemento.id}"]`)) {
          const fila = crear(elemento);
          fila.dataset.idElemento = elemento.id;
          lista.append(fila);
        }
      }
      siguiente = pagina.siguiente;
      // Solo cuentan los elementos de la lista: la bienvenida lleva además la tarjeta «+» dentro de la rejilla
      vacio?.classList.toggle('d-none', lista.querySelector('[data-id-elemento]') !== null);
      botonMas.classList.toggle('d-none', siguiente === null);
    } catch (err) {
      alFallar(err);
    }
  }

  function reiniciar() {
    siguiente = null;
    lista.replaceChildren();
    return cargar();
  }

  // El botón se desactiva mientras llega la página para no pedirla dos veces
  botonMas.addEventListener('click', async () => {
    botonMas.disabled = true;
    await cargar();
    botonMas.disabled = false;
  });

  return { cargar, reiniciar };
}

// Categorías de las tarjetas de experiencia: palabras clave para reconocerlas en `tipo` (texto libre)
// y trazo del icono (24x24, de línea). El color de cada una está en styles.css (.bloque-categoria).
const CATEGORIAS = {
  gastronomia: { palabras: /tapa|comer|comid|restaur|bar\b|cafe|café|cena|brunch|gastro|vino|cocina/i, trazo: '<path d="M5 3v8a3 3 0 0 0 3 3v7M8 3v6M11 3v8a3 3 0 0 1-3 3M17 21V3c-2.5 1.5-3.5 5-3.5 8H17"/>' },
  cultura: { palabras: /museo|arte|arquitect|histori|teatro|cine|exposici|monument|cultur/i, trazo: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M3 10l9-6 9 6"/>' },
  naturaleza: { palabras: /sendero|senderis|naturaleza|parque|playa|monte|ruta verde|jard[ií]n|campo/i, trazo: '<path d="M12 21v-6M12 15c-4 0-6-3-6-6 0-3 2-5 6-7 4 2 6 4 6 7 0 3-2 6-6 6Z"/>' },
  noche: { palabras: /copas|noche|m[uú]sica|concierto|fiesta|disco|club|karaoke/i, trazo: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>' },
  deporte: { palabras: /deport|f[uú]tbol|baloncesto|correr|running|bici|nataci|padel|p[aá]del|tenis|gimnasio/i, trazo: '<circle cx="12" cy="12" r="9"/><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18M3 12h18"/>' },
  rincones: { palabras: /^$/, trazo: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>' },
};

// Bloque de color con el icono de la categoría de `tipo` (puede ser null): va arriba de la tarjeta.
// El SVG es fijo, nada de lo que escribe el usuario entra en él.
function crearBloqueCategoria(tipo) {
  const categoria = Object.keys(CATEGORIAS).find((nombre) => CATEGORIAS[nombre].palabras.test(tipo ?? '')) ?? 'rincones';
  const bloque = document.createElement('div');
  bloque.className = 'bloque-categoria';
  bloque.dataset.categoria = categoria;
  bloque.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CATEGORIAS[categoria].trazo}</svg>`;
  return bloque;
}

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
Object.assign(window, { mostrarMensaje, ocultarMensaje, mostrarCargando, ocultarCargando, irAlLogin, crearEnlacePerfil, listaConCargarMas, crearBloqueCategoria });
