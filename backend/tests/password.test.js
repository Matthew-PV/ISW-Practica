// CS-64: reglas de una contraseña segura (services/shared/password.js). Son las mismas en el
// registro, en el cambio de contraseña y en el restablecimiento.
const { validarPassword } = require('../src/services/shared/password');

const rechazo = (password, nombreUsuario = 'ana') => {
  try {
    validarPassword(password, nombreUsuario);
  } catch (err) {
    return err;
  }
  return null;
};

test('acepta una contraseña que cumple todos los requisitos', () => {
  expect(rechazo('Secreta123')).toBeNull();
});

test.each([
  ['Sec1', 'entre 8 y 72 caracteres'],
  ['secreta123', 'al menos una mayúscula'],
  ['SECRETA123', 'al menos una minúscula'],
  ['Secretaaaa', 'al menos un número'],
  ['MiAna2026x', 'sin el nombre de usuario'],
])('%s responde 400 indicando qué requisito falla («%s»)', (password, requisito) => {
  const err = rechazo(password);

  expect(err).toMatchObject({ status: 400, message: `La contraseña no cumple estos requisitos: ${requisito}.` });
});

test('si fallan varios requisitos, los indica todos', () => {
  expect(rechazo('ana').message).toBe(
    'La contraseña no cumple estos requisitos: entre 8 y 72 caracteres, al menos una mayúscula, al menos un número, sin el nombre de usuario.'
  );
});

test('el nombre de usuario se detecta sin distinguir mayúsculas', () => {
  expect(rechazo('ANAmaria12', 'Ana')).not.toBeNull();
  expect(rechazo('Contraseña1', 'Ana')).toBeNull();
});

test.each([
  ['7 bytes', 'Abcde1x', false],
  ['8 bytes', 'Abcdef1x', true],
  ['72 bytes', `Aa1${'x'.repeat(69)}`, true],
  ['73 bytes', `Aa1${'x'.repeat(70)}`, false],
  ['72 bytes con letras de dos bytes', `Aa1${'á'.repeat(34)}x`, true],
  ['74 bytes con letras de dos bytes', `Aa1${'á'.repeat(35)}x`, false],
])('longitud: %s', (_descripcion, password, aceptada) => {
  expect(rechazo(password) === null).toBe(aceptada);
});
