/**
 * @jest-environment jsdom
 */

// Estados vacíos: sus ilustraciones (img/vacio-*.svg) son decorativas y llevan microanimación
// propia dentro del SVG (se usan como <img>, así que el CSS va embebido). Sin scripts, sin texto
// y con el movimiento desactivable.

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

const ILUSTRACIONES = ['planes', 'personas', 'solicitudes', 'error'];

describe('ilustraciones de estados vacíos', () => {
  test.each(ILUSTRACIONES)('vacio-%s.svg está animada, es decorativa y respeta prefers-reduced-motion', (nombre) => {
    const svg = leer(`img/vacio-${nombre}.svg`);
    expect(svg).toMatch(/<svg[^>]+viewBox=/);
    expect(svg).toMatch(/aria-hidden="true"/);
    expect(svg).not.toMatch(/<script/i);
    expect(svg).not.toMatch(/<text/i);
    expect(svg).toMatch(/@keyframes/);
    expect(svg).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  test('.estado-vacio muestra la ilustración en grande', () => {
    const css = leer('css/styles.css');
    expect(css).toMatch(/\.estado-vacio img\s*\{[^}]*max-width:\s*(2[4-9]\d|3\d\d)px/);
  });
});
