/**
 * @jest-environment jsdom
 */
// CS-64, objetivos 13 y 15: pantallas para recuperar la contraseña (recuperar.html y
// restablecer.html) y el enlace desde el inicio de sesión, con jsdom y el servidor simulado.
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND = path.join(__dirname, '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const visible = (selector) => !$(selector).classList.contains('d-none');
const terminar = () => new Promise((resolve) => setTimeout(resolve, 0));

// Abre una página con su script y un servidor simulado que responde según el método y la ruta
async function abrir(pagina, scripts, rutas, direccion) {
  window.history.pushState({}, '', direccion);
  document.documentElement.innerHTML = leer(pagina);
  window.fetch = jest.fn((ruta, opciones = {}) => {
    const clave = `${opciones.method ?? 'GET'} ${ruta}`;
    return respuesta(...(rutas[clave] ?? [404, { error: `Ruta no simulada: ${clave}` }]));
  });
  (0, eval)(scripts.map(leer).join('\n'));
  await terminar();
}
const enviar = async (formulario) => {
  $(formulario).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();
};
const escribir = (campo, valor) => {
  $(campo).value = valor;
  $(campo).dispatchEvent(new Event('input'));
};
const cuerpoEnviado = () => JSON.parse(window.fetch.mock.calls.at(-1)[1].body);

test('el inicio de sesión enlaza a «¿Has olvidado tu contraseña?»', () => {
  document.documentElement.innerHTML = leer('index.html');

  const enlace = [...document.querySelectorAll('a')].find((a) => a.textContent.includes('¿Has olvidado tu contraseña?'));
  expect(enlace.getAttribute('href')).toBe('recuperar.html');
});

describe('recuperar.html', () => {
  const SCRIPTS = ['js/shared/api.js', 'js/recuperar.js'];
  const MENSAJE = 'Si el email está registrado, te hemos enviado un enlace para restablecer la contraseña.';

  test('envía el email y muestra la respuesta del servidor, la misma exista o no', async () => {
    await abrir('recuperar.html', SCRIPTS, { 'POST /api/auth/recuperar': [200, { mensaje: MENSAJE }] }, '/recuperar.html');
    $('#email').value = 'ana@ejemplo.com';

    await enviar('#form-recuperar');

    expect(cuerpoEnviado()).toEqual({ email: 'ana@ejemplo.com' });
    expect(visible('#exito-recuperar')).toBe(true);
    expect($('#exito-recuperar').textContent).toBe(MENSAJE);
  });

  test('si falla, muestra el error y no se pierde el email', async () => {
    await abrir('recuperar.html', SCRIPTS, {
      'POST /api/auth/recuperar': [429, { error: 'Demasiados intentos. Vuelve a intentarlo dentro de unos minutos.' }],
    }, '/recuperar.html');
    $('#email').value = 'ana@ejemplo.com';

    await enviar('#form-recuperar');

    expect($('#error-recuperar').textContent).toBe('Demasiados intentos. Vuelve a intentarlo dentro de unos minutos.');
    expect($('#email').value).toBe('ana@ejemplo.com');
  });
});

describe('restablecer.html', () => {
  const SCRIPTS = ['js/shared/api.js', 'js/shared/password.js', 'js/restablecer.js'];
  const abrirConToken = (rutas = {}) => abrir('restablecer.html', SCRIPTS, rutas, '/restablecer.html?token=abc123');

  test('marca los requisitos mientras se escribe la nueva contraseña', async () => {
    await abrirConToken();

    escribir('#password-nueva', 'Nueva12345');

    const cumplidos = [...document.querySelectorAll('#requisitos-password li')].filter((li) => li.dataset.cumple === 'true');
    expect(cumplidos).toHaveLength(5);
  });

  test('si las dos contraseñas no coinciden se avisa y no se envía nada', async () => {
    await abrirConToken();
    escribir('#password-nueva', 'Nueva12345');
    escribir('#password-repetida', 'Nueva12346');

    await enviar('#form-restablecer');

    expect($('#error-restablecer').textContent).toBe('Las dos contraseñas no coinciden');
    expect(window.fetch).not.toHaveBeenCalled();
  });

  test('envía el token de la dirección y la nueva contraseña, y después enlaza al inicio de sesión', async () => {
    await abrirConToken({ 'POST /api/auth/restablecer': [200, { mensaje: 'Contraseña cambiada. Ya puedes iniciar sesión con la nueva.' }] });
    escribir('#password-nueva', 'Nueva12345');
    escribir('#password-repetida', 'Nueva12345');

    await enviar('#form-restablecer');

    expect(cuerpoEnviado()).toEqual({ token: 'abc123', nueva: 'Nueva12345' });
    expect($('#exito-restablecer').textContent).toContain('Contraseña cambiada.');
    expect($('#exito-restablecer a').getAttribute('href')).toBe('index.html');
    expect(visible('#form-restablecer')).toBe(false);
  });

  test('un enlace usado, caducado o inventado muestra el mensaje del servidor', async () => {
    await abrirConToken({ 'POST /api/auth/restablecer': [400, { error: 'El enlace no es válido o ha caducado' }] });
    escribir('#password-nueva', 'Nueva12345');
    escribir('#password-repetida', 'Nueva12345');

    await enviar('#form-restablecer');

    expect($('#error-restablecer').textContent).toBe('El enlace no es válido o ha caducado');
    expect($('#password-nueva').value).toBe('Nueva12345');
  });

  test('sin token en la dirección avisa y no muestra el formulario', async () => {
    await abrir('restablecer.html', SCRIPTS, {}, '/restablecer.html');

    expect(visible('#form-restablecer')).toBe(false);
    expect($('#error-restablecer').textContent).toBe('El enlace no es válido. Pide uno nuevo desde «¿Has olvidado tu contraseña?».');
  });
});
