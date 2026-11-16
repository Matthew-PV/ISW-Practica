/**
 * @jest-environment jsdom
 *
 * CS-37: Compartir experiencias mediante un enlace.
 */
const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('paginas/experiencias/experiencia.html');

const RUTA = '/paginas/experiencias/experiencia.html?id=7';

const esperar = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  window.history.replaceState({}, '', RUTA);
  document.documentElement.innerHTML = HTML;

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

describe('CS-37: compartir enlace de una experiencia', () => {

  test('existe el botón Copiar enlace y su mensaje', () => {
    const boton = document.getElementById('btn-copiar-enlace');
    const mensaje = document.getElementById('mensaje-compartir');

    expect(boton).not.toBeNull();
    expect(boton.textContent).toContain('Copiar enlace');
    expect(mensaje).not.toBeNull();
  });

  test('copia la URL completa y confirma la operación', async () => {
    cargarScripts(['js/experiencias/compartir-enlace.js']);

    const boton = document.getElementById('btn-copiar-enlace');

    boton.click();
    await esperar();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.origin + RUTA
    );

    const mensaje = document.getElementById('mensaje-compartir');

    expect(mensaje.textContent).toMatch(/copiado/i);
  });

  test('muestra un error cuando falla el portapapeles', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(
      new Error('Permiso denegado')
    );

    cargarScripts(['js/experiencias/compartir-enlace.js']);

    const boton = document.getElementById('btn-copiar-enlace');

    boton.click();
    await esperar();

    const mensaje = document.getElementById('mensaje-compartir');

    expect(mensaje.textContent).toMatch(/no se ha podido copiar/i);
    expect(mensaje.textContent).not.toMatch(/enlace copiado/i);
  });

});

