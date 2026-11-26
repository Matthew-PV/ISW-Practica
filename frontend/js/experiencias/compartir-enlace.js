// CS-37: compartir una experiencia mediante un enlace.
// Copia la URL del plan y muestra el resultado al usuario.

const botonCopiarEnlace = document.getElementById('btn-copiar-enlace');
const mensajeCompartir = document.getElementById('mensaje-compartir');

// Quién podrá abrir el enlace de un plan que no es público
const QUIEN_PUEDE_ABRIR = {
  AMIGOS: ' Solo pueden abrirlo los amigos de quien lo publicó.',
  PRIVADA: ' Es privado: solo puede abrirlo quien lo publicó.',
};

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
      `¡Enlace copiado!${QUIEN_PUEDE_ABRIR[botonCopiarEnlace.dataset.visibilidad] ?? ''}`,
      true
    );
  } catch (error) {
    mostrarResultadoCompartir(
      'No se ha podido copiar el enlace. Cópialo de aquí:',
      false
    );
    const campo = document.getElementById('enlace-compartir');
    campo.value = url.href;
    campo.hidden = false;
    campo.select();
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
