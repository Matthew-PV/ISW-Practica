/**
 * @jest-environment jsdom
 */

// Pantallas de acceso: su columna de marca lleva una escena animada de fondo (img/escena-acceso.svg)
// puesta por CSS. La escena es decorativa: sin scripts, sin texto y con el movimiento desactivable.

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

const PAGINAS = ['iniciar-sesion', 'registro', 'recuperar', 'restablecer'];

describe('escena de las pantallas de acceso', () => {
  test('el SVG existe, no tiene scripts ni texto y respeta prefers-reduced-motion', () => {
    const svg = leer('img/escena-acceso.svg');
    expect(svg).toMatch(/<svg[^>]+viewBox=/);
    expect(svg).not.toMatch(/<script/i);
    expect(svg).not.toMatch(/<text/i);
    expect(svg).toMatch(/@keyframes/);
    expect(svg).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  test('styles.css pone la escena como fondo de la columna de marca', () => {
    const css = leer('css/styles.css');
    expect(css).toMatch(/\.pantalla-dividida-marca\s*\{[^}]*escena-acceso\.svg/);
  });

  test.each(PAGINAS)('%s usa la escena y ya no la ilustración pequeña', (pagina) => {
    document.documentElement.innerHTML = leer(`acceso/${pagina}.html`);
    expect(document.querySelector('.pantalla-dividida-marca')).not.toBeNull();
    expect(document.querySelector('.acceso-ilustracion')).toBeNull();
  });
});
