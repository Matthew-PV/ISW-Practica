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

// Sin sesión no se puede usar la página: se vuelve al inicio de sesión.
function irAlLogin() {
  window.location.href = '/';
}

// Convierte `enlace` (un <a>) en el enlace al perfil de `usuario`: el mío lleva a «Mi perfil» y
// el de otra persona, a su página (CS-62). El nombre se pone como texto, nunca como HTML.
// - `miUsuarioId`: el id del usuario de la sesión, si se conoce.
function crearEnlacePerfil(enlace, usuario, miUsuarioId) {
  enlace.textContent = usuario.nombreUsuario;
  enlace.href = usuario.id === miUsuarioId
    ? 'perfil.html'
    : `usuario.html?nombre=${encodeURIComponent(usuario.nombreUsuario)}`;
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
      vacio?.classList.toggle('d-none', lista.children.length !== 0);
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

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
Object.assign(window, { mostrarMensaje, ocultarMensaje, irAlLogin, crearEnlacePerfil, listaConCargarMas });
