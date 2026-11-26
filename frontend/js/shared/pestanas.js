// Pestañas accesibles. Uso: `activarPestanas(lista)`, donde `lista` es el elemento con
// role="tablist" cuyas pestañas (role="tab") llevan aria-controls hacia su panel. Devuelve
// `{ seleccionar(pestana) }` para abrir otra pestaña desde el código.
// La pestaña que elige la persona queda en la URL (?pestana=<id>), para recuperarla al volver; si
// ya ha elegido una o la URL la trae, `seleccionar` desde el código no la cambia.
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

  // Lo que elige la persona se apunta en la URL sin añadir entradas al historial
  let elegidaPorLaPersona = false;
  function elegir(elegida, darFoco) {
    elegidaPorLaPersona = true;
    seleccionar(elegida, darFoco);
    const url = new URL(window.location.href);
    url.searchParams.set('pestana', elegida.id);
    window.history.replaceState(window.history.state, '', url);
  }

  for (const [i, pestana] of pestanas.entries()) {
    pestana.addEventListener('click', () => elegir(pestana, false));
    // Flechas con vuelta circular; Inicio y Fin saltan a la primera y a la última
    pestana.addEventListener('keydown', (e) => {
      let destino;
      if (e.key === 'ArrowRight') destino = pestanas[(i + 1) % pestanas.length];
      else if (e.key === 'ArrowLeft') destino = pestanas[(i - 1 + pestanas.length) % pestanas.length];
      else if (e.key === 'Home') destino = pestanas[0];
      else if (e.key === 'End') destino = pestanas[pestanas.length - 1];
      if (destino) {
        e.preventDefault();
        elegir(destino, true);
      }
    });
  }

  const idEnUrl = new URLSearchParams(window.location.search).get('pestana');
  const recordada = pestanas.find((pestana) => pestana.id === idEnUrl);
  seleccionar(recordada ?? pestanas[0], false);
  return {
    seleccionar: (pestana) => {
      if (!recordada && !elegidaPorLaPersona) seleccionar(pestana, false);
    },
  };
}

window.activarPestanas = activarPestanas;
