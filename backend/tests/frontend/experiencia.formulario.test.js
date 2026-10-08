const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Cargamos el HTML de la página
const html = fs.readFileSync(path.resolve(__dirname, '../../../frontend/experiencia.html'), 'utf8');

describe('CS-63: Pantalla de Detalles de Experiencia', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Inicializamos JSDOM con la URL simulada para que URLSearchParams funcione
    dom = new JSDOM(html, {
      url: 'http://localhost/experiencia.html?id=1',
      runScripts: 'dangerously'
    });
    window = dom.window;
    document = window.document;

    // Mockeamos la función global `api` que usa el frontend
    window.api = jest.fn();

    // Mockeamos el objeto bootstrap para evitar errores del modal en consola
    window.bootstrap = { Modal: jest.fn(() => ({ show: jest.fn(), hide: jest.fn() })) };
  });

  test('Debe ocultar el formulario de valoración si el usuario es el autor de la experiencia', async () => {
    // Simulamos que la API devuelve una experiencia donde el autor es el usuario actual (ID: 1)
    window.api.mockImplementation((ruta) => {
      if (ruta === '/experiencias/1') {
        return Promise.resolve({
          id: 1,
          titulo: 'Paseo por el Retiro',
          descripcion: 'Un paseo increíble',
          autorId: 1,
          autor: { id: 1, nombreUsuario: 'JJ' },
          ciudad: { nombre: 'Madrid' }
        });
      }
      if (ruta === '/auth/yo') return Promise.resolve({ id: 1 });
      if (ruta.includes('valoracion?pagina=')) return Promise.resolve({ valoraciones: [], total: 0 });
      return Promise.resolve();
    });

    // Inyectamos el JS de la página
    // experiencia.js usa las piezas comunes de shared/pantalla.js, que la página carga antes
    const scriptCodigo = fs.readFileSync(path.resolve(__dirname, '../../../frontend/js/shared/pantalla.js'), 'utf8')
      + fs.readFileSync(path.resolve(__dirname, '../../../frontend/js/experiencia.js'), 'utf8');
    const script = document.createElement('script');
    script.textContent = scriptCodigo;
    document.body.appendChild(script);

    // Damos tiempo a que se resuelvan las promesas
    await new Promise(process.nextTick);

    // Comprobación: La caja del formulario debe mantener la clase 'd-none'
    const cajaFormulario = document.getElementById('caja-formulario-valoracion');
    expect(cajaFormulario.classList.contains('d-none')).toBe(true);
  });

  test('Debe mostrar el formulario de valoración si el usuario NO es el autor', async () => {
    // Simulamos que el usuario actual (ID: 2) NO es el autor (ID: 1)
    window.api.mockImplementation((ruta) => {
      if (ruta === '/experiencias/1') {
        return Promise.resolve({
          id: 1,
          titulo: 'Paseo por el Retiro',
          autorId: 1,
          autor: { id: 1, nombreUsuario: 'JJ' },
          ciudad: { nombre: 'Madrid' }
        });
      }
      if (ruta === '/auth/yo') return Promise.resolve({ id: 2 });
      if (ruta.includes('/mia')) return Promise.reject(new Error('No encontrada')); // No ha valorado aún
      if (ruta.includes('valoracion?pagina=')) return Promise.resolve({ valoraciones: [], total: 0 });
      return Promise.resolve();
    });

    // experiencia.js usa las piezas comunes de shared/pantalla.js, que la página carga antes
    const scriptCodigo = fs.readFileSync(path.resolve(__dirname, '../../../frontend/js/shared/pantalla.js'), 'utf8')
      + fs.readFileSync(path.resolve(__dirname, '../../../frontend/js/experiencia.js'), 'utf8');
    const script = document.createElement('script');
    script.textContent = scriptCodigo;
    document.body.appendChild(script);

    await new Promise(process.nextTick);

    // Comprobación: La caja del formulario debe haber perdido la clase 'd-none'
    const cajaFormulario = document.getElementById('caja-formulario-valoracion');
    expect(cajaFormulario.classList.contains('d-none')).toBe(false);
  });
});
