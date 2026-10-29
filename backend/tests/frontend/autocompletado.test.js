/**
 * @jest-environment jsdom
 */

// Propósito de cada campo de identidad para el navegador y los gestores de contraseñas (WCAG 1.3.5).
const { leer } = require('../helpers/pantalla');

const CAMPOS = [
  ['acceso/iniciar-sesion.html', '#email', 'username'],
  ['acceso/iniciar-sesion.html', '#password', 'current-password'],
  ['acceso/registro.html', '#nombreUsuario', 'username'],
  ['acceso/registro.html', '#email', 'email'],
  ['acceso/registro.html', '#password', 'new-password'],
  ['cuenta/ajustes.html', '#nombreUsuario', 'username'],
  ['cuenta/ajustes.html', '#ciudad', 'address-level2'],
];

test.each(CAMPOS)('%s %s declara autocomplete=%s', (pagina, selector, valor) => {
  document.documentElement.innerHTML = leer(pagina);

  expect(document.querySelector(selector).getAttribute('autocomplete')).toBe(valor);
});
