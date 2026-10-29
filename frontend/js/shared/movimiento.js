// Pausa del movimiento decorativo (WCAG 2.2.2). Las animaciones que no terminan (fondo, ilustraciones)
// se detienen solas a los 5 s poniendo data-movimiento="pausado" en <html>; el CSS hace el resto.
// La preferencia vive en Ajustes (interruptor «Pausar las animaciones del fondo»): «pausado» arranca ya
// detenido y «activo» no las detiene nunca. Con «reducir movimiento» en el sistema arranca pausado.
// Lo cargan todas las páginas; expone fijarMovimiento(pausado) y movimientoPausado().

const CLAVE_MOVIMIENTO = 'movimiento';
const SEGUNDOS_DE_MOVIMIENTO = 5;
let temporizador;

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

function aplicarMovimiento(pausado) {
  if (pausado) document.documentElement.dataset.movimiento = 'pausado';
  else document.documentElement.removeAttribute('data-movimiento');
}

// Elección de la persona (Ajustes): se aplica y se recuerda
function fijarMovimiento(pausado) {
  clearTimeout(temporizador);
  aplicarMovimiento(pausado);
  guardarMovimiento(pausado ? 'pausado' : 'activo');
}

function movimientoPausado() {
  return document.documentElement.dataset.movimiento === 'pausado';
}

function iniciarMovimiento() {
  const guardado = leerMovimiento();
  const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  aplicarMovimiento(guardado ? guardado === 'pausado' : Boolean(reducir));
  // Sin elección guardada, el movimiento dura solo 5 s
  if (!guardado) temporizador = setTimeout(() => aplicarMovimiento(true), SEGUNDOS_DE_MOVIMIENTO * 1000);
}

iniciarMovimiento();

window.fijarMovimiento = fijarMovimiento;
window.movimientoPausado = movimientoPausado;
