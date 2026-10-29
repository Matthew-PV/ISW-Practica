// Pausa del movimiento decorativo (WCAG 2.2.2). Añade un botón fijo que detiene las animaciones que no
// terminan (fondo, ilustraciones) poniendo data-movimiento="pausado" en <html>; el CSS hace el resto.
// Arranca pausado si la persona lo pausó antes o si el sistema pide reducir el movimiento.
// Lo cargan todas las páginas; no exporta nada.

const CLAVE_MOVIMIENTO = 'movimiento';

// El almacenamiento puede estar bloqueado (ventana privada, datos desactivados): entonces no se recuerda
function leerMovimiento() {
  try {
    return localStorage.getItem(CLAVE_MOVIMIENTO);
  } catch {
    return null;
  }
}

function guardarMovimiento(valor) {
  try {
    localStorage.setItem(CLAVE_MOVIMIENTO, valor);
  } catch {
    // no se recuerda la elección
  }
}

function aplicarMovimiento(boton, pausado) {
  if (pausado) document.documentElement.dataset.movimiento = 'pausado';
  else document.documentElement.removeAttribute('data-movimiento');
  boton.setAttribute('aria-pressed', String(pausado));
  boton.textContent = pausado ? 'Reanudar animaciones' : 'Pausar animaciones';
}

function iniciarMovimiento() {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton-movimiento';

  const guardado = leerMovimiento();
  const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  aplicarMovimiento(boton, guardado ? guardado === 'pausado' : Boolean(reducir));

  boton.addEventListener('click', () => {
    const pausado = boton.getAttribute('aria-pressed') !== 'true';
    aplicarMovimiento(boton, pausado);
    guardarMovimiento(pausado ? 'pausado' : 'activo');
  });
  document.body.append(boton);
}

iniciarMovimiento();
