/**
 * @jest-environment jsdom
 */
// CS-66: ningún enlace, hoja de estilos, script ni imagen de los HTML del frontend apunta a un
// archivo que no existe, ni tampoco las direcciones .html que asigna el JavaScript.
// El HTML se analiza con el navegador simulado (jsdom); el JavaScript se lee como texto.
const fs = require('node:fs');
const path = require('node:path');
const { FRONTEND, leer } = require('../helpers/pantalla');

// Todos los archivos con la extensión indicada, dentro de una carpeta y sus subcarpetas
function listar(carpeta, extension) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name);
    if (e.isDirectory()) return listar(ruta, extension);
    return ruta.endsWith(extension) ? [ruta] : [];
  });
}

// Deja solo el archivo de una dirección (sin ? ni #); «/» equivale a index.html
function archivoDe(direccion) {
  const limpia = direccion.split('#')[0].split('?')[0];
  return limpia === '/' || limpia === '' ? 'index.html' : limpia.replace(/^\//, '');
}

const externa = (d) => /^(https?:|#|data:|mailto:)/.test(d);

const HTMLS = listar(FRONTEND, '.html').map((r) => path.relative(FRONTEND, r));
const JS = listar(path.join(FRONTEND, 'js'), '.js');

test('existen la portada y la pantalla de inicio de sesión', () => {
  expect(fs.existsSync(path.join(FRONTEND, 'index.html'))).toBe(true);
  expect(fs.existsSync(path.join(FRONTEND, 'acceso/iniciar-sesion.html'))).toBe(true);
});

test.each(HTMLS)('%s: todos sus enlaces, estilos, scripts e imágenes existen', (pagina) => {
  const documento = new DOMParser().parseFromString(leer(pagina), 'text/html');
  const direcciones = [...documento.querySelectorAll('a[href], link[href], script[src], img[src]')]
    .map((e) => e.getAttribute('href') ?? e.getAttribute('src'))
    .filter((d) => !externa(d));

  const rotas = direcciones.filter((d) => !fs.existsSync(path.join(FRONTEND, archivoDe(d))));

  expect(rotas).toEqual([]);
});

test.each(JS.map((r) => path.relative(FRONTEND, r)))('%s: las direcciones .html que asigna existen', (js) => {
  const texto = leer(js);
  // Cadenas literales asignadas a `location.href` o a `.href`
  const asignadas = [...texto.matchAll(/\.href\s*=\s*(['"`])([^'"`]*)\1/g)].map((m) => m[2]);
  // Las plantillas con ${...} (/social/usuario.html?nombre=...) se comprueban por su archivo
  const htmls = asignadas.filter((d) => /\.html/.test(d)).map((d) => d.replace(/\$\{[^}]*\}/g, ''));

  const rotas = htmls.filter((d) => !fs.existsSync(path.join(FRONTEND, archivoDe(d))));

  expect(rotas).toEqual([]);
});

test('ningún JavaScript asigna «/» a location.href', () => {
  const culpables = JS.filter((ruta) => /location\.href\s*=\s*['"`]\/['"`]/.test(fs.readFileSync(ruta, 'utf8')));

  expect(culpables.map((r) => path.relative(FRONTEND, r))).toEqual([]);
});

test('irAlLogin lleva a /acceso/iniciar-sesion.html (un 401 no debe acabar en la portada)', () => {
  const texto = leer('js/shared/pantalla.js');
  const funcion = texto.match(/function irAlLogin\(\) \{([\s\S]*?)\n\}/)[1];

  expect(funcion).toMatch(/href\s*=\s*'\/acceso\/iniciar-sesion\.html'/);
});
