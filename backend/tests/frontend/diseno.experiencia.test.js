/**
 * @jest-environment node
 */
// CS-66, objetivo 2: la pantalla de una experiencia, sus valoraciones y la ventana de reporte
// siguen la guía visual provisional sin introducir Bootstrap JavaScript ni manejadores en línea.
const { leer } = require('../helpers/pantalla');

const HTML = leer('experiencia.html');
const ESTILOS = leer('css/styles.css');
const SCRIPT = leer('js/experiencia.js');

test('el detalle de experiencia tiene una estructura adaptable y navegación accesible', () => {
  // Preparación: se leen el HTML y los estilos que recibirá el navegador.
  // Acción: se buscan las piezas del diseño de sesión y las dos columnas de escritorio.
  // Resultado: en móvil la navegación queda abajo y el contenido se apila; en escritorio hay
  // una columna para la experiencia y otra para las valoraciones.
  expect(HTML).toContain('<body class="pagina-sesion">');
  expect(HTML).toContain('class="saltar-contenido" href="#contenido-principal"');
  expect(HTML).toContain('<nav class="barra-sesion" aria-label="Navegación principal">');
  expect(HTML).toContain('class="rejilla-experiencia"');
  expect(HTML).toContain('class="columna-experiencia"');
  expect(HTML).toContain('class="columna-valoraciones"');
  expect(HTML).not.toMatch(/\sstyle=/i);
  expect(HTML).not.toMatch(/\son\w+\s*=/i);
  expect(HTML).not.toMatch(/bootstrap(?:\.bundle)?(?:\.min)?\.js/i);

  expect(ESTILOS).toContain('.barra-sesion');
  expect(ESTILOS).toMatch(/\.rejilla-experiencia[\s\S]*?grid-template-columns/);
  expect(ESTILOS).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.barra-sesion[\s\S]*?position: fixed/);
  expect(ESTILOS).toMatch(/\.pagina-sesion \.form-control[\s\S]*?min-height:\s*44px/);
});

test('las valoraciones y la ventana de reporte usan los componentes de la guía', () => {
  expect(HTML).toMatch(/class="[^"]*\btarjeta-valoracion\b[^"]*"/);
  expect(HTML).toContain('class="dialogo-experiencia dialogo-reporte"');
  expect(HTML).toContain('class="btn boton-principal" id="btn-guardar-valoracion"');
  expect(HTML).toContain('class="btn boton-peligro" id="btn-enviar-reporte"');
  expect(SCRIPT).toContain("tarjeta-valoracion-lista");
  expect(SCRIPT).toContain("accion-valoracion");
});
