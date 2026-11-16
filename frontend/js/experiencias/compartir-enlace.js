// CS-37: compartir una experiencia mediante un enlace.
// Copia la URL del plan y muestra el resultado al usuario.

const botonCopiarEnlace = document.getElementById('btn-copiar-enlace');
const mensajeCompartir = document.getElementById('mensaje-compartir');

function mostrarResultadoCompartir(texto, correcto) {
  mensajeCompartir.textContent = texto;
  mensajeCompartir.className = correcto
    ? 'small mt-2 mb-0 text-success'
    : 'small mt-2 mb-0 text-danger';
}

async function copiarEnlaceExperiencia() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get('id');

  if (!id) {
    mostrarResultadoCompartir(
      'No se ha podido copiar el enlace.',
      false
    );
    return;
  }

  const url = new URL(
    '/paginas/experiencias/experiencia.html',
    window.location.origin
  );

  url.searchParams.set('id', id);

  botonCopiarEnlace.disabled = true;
  mensajeCompartir.textContent = '';

  try {
    if (!navigator.clipboard ||
        typeof navigator.clipboard.writeText !== 'function') {
      throw new Error('Portapapeles no disponible');
    }

    await navigator.clipboard.writeText(url.href);

    mostrarResultadoCompartir(
      '¡Enlace copiado!',
      true
    );
  } catch (error) {
    mostrarResultadoCompartir(
      'No se ha podido copiar el enlace.',
      false
    );
  } finally {
    botonCopiarEnlace.disabled = false;
  }
}

if (botonCopiarEnlace && mensajeCompartir) {
  botonCopiarEnlace.addEventListener(
    'click',
    copiarEnlaceExperiencia
  );
}
