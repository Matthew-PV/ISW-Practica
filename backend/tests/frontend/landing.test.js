/**
 * @jest-environment jsdom
 */

// Landing pública (index.html): estática, sin sesión y sin scripts.
// Se comprueba su estructura leyendo el HTML con jsdom.

const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');

const leer = (archivo) =>
  fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = leer('index.html');
});

describe('landing', () => {
  test('tiene exactamente un h1 con texto', () => {
    const titulos = document.querySelectorAll('h1');
    expect(titulos).toHaveLength(1);
    expect(titulos[0].textContent.trim()).toBe(
      'Comparte y descubre planes por tu ciudad'
    );
  });

  test('enlaza a iniciar sesión y a crear cuenta', () => {
    expect(
      document.querySelectorAll('a[href="iniciar-sesion.html"]').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      document.querySelectorAll('a[href="registro.html"]').length
    ).toBeGreaterThanOrEqual(1);
  });

  test('muestra el marco de captura con su rótulo', () => {
    const marco = document.querySelector('.marco-captura');
    expect(marco).not.toBeNull();
    expect(marco.textContent).toContain('Captura de PlanB');
  });

  test('tiene tres bloques con h2 y párrafo', () => {
    const bloques = document.querySelectorAll('.bloque-landing');
    expect(bloques).toHaveLength(3);
    bloques.forEach((bloque) => {
      expect(bloque.querySelector('h2').textContent.trim()).not.toBe('');
      expect(bloque.querySelector('p').textContent.trim()).not.toBe('');
      expect(bloque.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    });
  });

  test('explica cómo funciona en tres pasos de una lista ordenada', () => {
    const pasos = document.querySelectorAll('main ol > li');
    expect(pasos).toHaveLength(3);
  });

  test('no incluye scripts', () => {
    expect(document.querySelectorAll('script')).toHaveLength(0);
  });

  test('no incluye cifras inventadas', () => {
    const texto = document.body.textContent;
    expect(texto).not.toMatch(/\d\s*[%+]/);
    expect(texto).not.toMatch(/\d/);
  });

  test('solo hay un botón principal', () => {
    expect(document.querySelectorAll('.btn-primary')).toHaveLength(1);
  });

  test('la cabecera no tiene buscador ni menú de cuenta', () => {
    expect(document.querySelector('header.cabecera form')).toBeNull();
    expect(document.querySelector('.menu-cuenta')).toBeNull();
  });
});
