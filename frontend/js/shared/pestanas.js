// Pestañas accesibles. Uso: `activarPestanas(lista)`, donde `lista` es el elemento con
// role="tablist" cuyas pestañas (role="tab") llevan aria-controls hacia su panel.
// Cada página que las usa carga este archivo antes de su propio script.

function activarPestanas(lista) {
  const pestanas = [...lista.querySelectorAll('[role="tab"]')];

  // Selecciona una pestaña: solo ella es alcanzable con Tab y solo su panel es visible
  function seleccionar(elegida, darFoco) {
    for (const pestana of pestanas) {
      const activa = pestana === elegida;
      pestana.setAttribute('aria-selected', String(activa));
      pestana.setAttribute('tabindex', activa ? '0' : '-1');
      const panel = document.getElementById(pestana.getAttribute('aria-controls'));
      if (panel) panel.hidden = !activa;
    }
    if (darFoco) elegida.focus();
  }

  for (const [i, pestana] of pestanas.entries()) {
    pestana.addEventListener('click', () => seleccionar(pestana, false));
    // Flechas con vuelta circular; Inicio y Fin saltan a la primera y a la última
    pestana.addEventListener('keydown', (e) => {
      let destino;
      if (e.key === 'ArrowRight') destino = pestanas[(i + 1) % pestanas.length];
      else if (e.key === 'ArrowLeft') destino = pestanas[(i - 1 + pestanas.length) % pestanas.length];
      else if (e.key === 'Home') destino = pestanas[0];
      else if (e.key === 'End') destino = pestanas[pestanas.length - 1];
      if (destino) {
        e.preventDefault();
        seleccionar(destino, true);
      }
    });
  }

  seleccionar(pestanas[0], false);
}

window.activarPestanas = activarPestanas;
