// Ayudas para las pruebas de pantallas (tests/frontend), que usan el navegador simulado jsdom.
// No es un archivo de pruebas.
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');

// Contenido de un archivo del frontend, por ejemplo leer('perfil.html')
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

// Ejecuta los scripts de una página en el orden indicado, como hace el navegador con sus <script>.
// Se cargan con require (y no con eval) para que Jest pueda medir su cobertura, en un registro de
// módulos nuevo cada vez: así cada prueba ejecuta los scripts desde cero.
function cargarScripts(archivos) {
  jest.isolateModules(() => {
    for (const archivo of archivos) {
      require(path.join(FRONTEND, archivo));
    }
  });
}

module.exports = { FRONTEND, leer, cargarScripts };
