/**
 * @jest-environment jsdom
 */

// Requisitos de la contraseña: el estado de cada uno debe llegar también a quien no ve los colores
// ni los símbolos (WCAG 1.4.1), así que va escrito en texto.
const { cargarScripts } = require('../../helpers/pantalla');

function montar() {
  document.body.innerHTML = '<input id="p"><ul id="l"></ul>';
  cargarScripts(['js/shared/password.js']);
  const campo = document.getElementById('p');
  window.mostrarRequisitosPassword(campo, document.getElementById('l'), () => '');
  return { campo, items: () => [...document.querySelectorAll('#l li')] };
}

test('con el campo vacío cada requisito dice que está pendiente', () => {
  const { items } = montar();

  expect(items()).toHaveLength(5);
  for (const li of items()) expect(li.textContent).toContain('pendiente');
});

test('al cumplirse un requisito dice que está cumplido y los símbolos no se leen', () => {
  const { campo, items } = montar();

  campo.value = 'Abcdefg1';
  campo.dispatchEvent(new Event('input'));

  const [longitud] = items();
  expect(longitud.textContent).toContain('cumplido');
  expect(longitud.textContent).not.toContain('pendiente');
  expect(longitud.querySelector('[aria-hidden="true"]')).not.toBeNull();
});
