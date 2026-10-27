/**
 * @jest-environment node
 */
// CS-66, objetivo 1: las cuatro pantallas de acceso comparten la guía visual
// provisional y conservan los mínimos de acceso con teclado y CSP.
const { leer } = require('../helpers/pantalla');

const ESTILOS = leer('css/styles.css');
const PAGINAS_ACCESO = ['index.html', 'registro.html', 'recuperar.html', 'restablecer.html'];

test('las pantallas de acceso aplican la guía actual sin sacrificar el teclado ni la CSP', () => {
  // Preparación: se leen los cuatro documentos HTML y la hoja de estilos que carga el navegador.
  // Acción: se comprueba que usan los elementos comunes del diseño de acceso.
  // Resultado: tienen colores y controles accesibles, sin añadir JavaScript en línea.
  expect(ESTILOS).toContain('--color-primario: #0F766E');
  expect(ESTILOS).toContain('--color-borde-campo: #6B7280');
  expect(ESTILOS).toMatch(/\.boton-principal[\s\S]*?min-height:\s*44px/);
  expect(ESTILOS).toMatch(/\.pagina-acceso\s+\.form-control[\s\S]*?min-height:\s*44px/);
  expect(ESTILOS).toContain('.saltar-contenido:focus');

  for (const pagina of PAGINAS_ACCESO) {
    const html = leer(pagina);
    expect(html).toContain('<body class="pagina-acceso">');
    expect(html).toContain('class="saltar-contenido" href="#contenido-principal"');
    expect(html).toContain('id="contenido-principal"');
    expect(html).toMatch(/class="[^"]*\bboton-principal\b[^"]*"/);
    expect(html).not.toMatch(/\son\w+\s*=/i);
    expect(html).not.toMatch(/bootstrap(?:\.bundle)?(?:\.min)?\.js/i);
  }
});

test('el inicio de sesión presenta PlanB y ofrece crear cuenta como acción secundaria visible', () => {
  const html = leer('index.html');

  expect(html).toContain('Comparte y descubre planes por tu ciudad');
  expect(html).toMatch(/<a href="registro\.html" class="btn boton-secundario w-100">\s*Crear cuenta\s*<\/a>/);
});
