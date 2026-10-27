/**
 * @jest-environment node
 */
// CS-66, objetivo 3: las tres pantallas sociales usan la guía visual provisional y conservan
// sus identificadores para que los scripts existentes mantengan su comportamiento.
const { leer } = require('../helpers/pantalla');

const PERFILES = ['perfil.html', 'usuario.html', 'personas.html'].map(leer);
const ESTILOS = leer('css/styles.css');
const SCRIPTS = ['js/perfil.js', 'js/usuario.js', 'js/personas.js', 'js/shared/experiencias.js'].map(leer);

test('las pantallas sociales tienen navegación de sesión, acceso por teclado y sin código en línea', () => {
  // Preparación: se cargan los tres HTML que una persona puede visitar con sesión.
  // Acción: se busca su navegación y la estructura común que interpreta el navegador.
  // Resultado: las tres conservan los destinos comunes, identifican la navegación y no añaden
  // código que la política de seguridad bloquearía.
  for (const html of PERFILES) {
    expect(html).toContain('<body class="pagina-sesion">');
    expect(html).toContain('class="saltar-contenido" href="#contenido-principal"');
    expect(html).toContain('<nav class="barra-sesion" aria-label="Navegación principal">');
    expect(html).toContain('href="bienvenida.html">Inicio</a>');
    expect(html).toMatch(/href="personas\.html"(?: aria-current="page")?>Buscar personas<\/a>/);
    expect(html).toMatch(/href="perfil\.html"(?: aria-current="page")?>Mi perfil<\/a>/);
    expect(html).not.toMatch(/\sstyle=/i);
    expect(html).not.toMatch(/\son\w+\s*=/i);
    expect(html).not.toMatch(/bootstrap(?:\.bundle)?(?:\.min)?\.js/i);
  }
});

test('el perfil propio, el ajeno y la búsqueda siguen sus distribuciones aprobadas', () => {
  const [perfil, usuario, personas] = PERFILES;
  expect(perfil).toContain('class="rejilla-perfil-propio"');
  expect(perfil).toContain('<details class="bloque-password">');
  expect(perfil).toContain('aria-current="page"');
  expect(usuario).toMatch(/class="[^"]*rejilla-perfil-publico[^"]*"/);
  expect(usuario).toContain('class="tarjeta-perfil-publico"');
  expect(personas).toContain('class="buscador-personas"');
  expect(personas).toContain('aria-current="page"');
  expect(ESTILOS).toMatch(/\.rejilla-perfil-propio[\s\S]*?grid-template-columns/);
  expect(ESTILOS).toMatch(/\.rejilla-perfil-publico[\s\S]*?grid-template-columns/);
  expect(ESTILOS).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.rejilla-perfil-publico[\s\S]*?grid-template-columns:\s*1fr/);
  expect(SCRIPTS.join('\n')).toContain('tarjeta-experiencia-social');
  expect(SCRIPTS.join('\n')).toContain('resultado-persona');
});
