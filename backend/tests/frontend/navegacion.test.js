/**
 * @jest-environment jsdom
 */
// CS-61, objetivo 14: acceso a la búsqueda desde las pantallas autenticadas.
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

test.each(['bienvenida.html', 'perfil.html', 'usuario.html'])(
  '%s muestra en su barra el enlace «Buscar personas»',
  (pagina) => {
    document.documentElement.innerHTML = leer(pagina);

    const enlace = document.querySelector('nav a[href="personas.html"]');
    expect(enlace).not.toBeNull();
    expect(enlace.textContent.trim()).toBe('Buscar personas');
  }
);
