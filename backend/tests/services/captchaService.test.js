// Servicio real del CAPTCHA, simulando la respuesta de Cloudflare (setup.js lo sustituye en el resto)
jest.unmock('../../src/services/captchaService');

const captchaService = require('../../src/services/captchaService');

afterEach(() => {
  jest.restoreAllMocks();
});

// Sustituye fetch para que «Cloudflare» responda `datos`, sin salir a internet.
// Devuelve el espía para comprobar después qué se le envió.
function cloudflareResponde(datos) {
  return jest.spyOn(global, 'fetch').mockResolvedValue({ json: async () => datos });
}

test('token válido según Cloudflare → true, enviando la clave secreta y el token', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'secreto';
  const fetch = cloudflareResponde({ success: true });

  expect(await captchaService.verificar('token', '1.2.3.4')).toBe(true);
  const cuerpo = fetch.mock.calls[0][1].body;
  expect(cuerpo.get('secret')).toBe('secreto');
  expect(cuerpo.get('response')).toBe('token');
});

test('token rechazado por Cloudflare → false', async () => {
  cloudflareResponde({ success: false });

  expect(await captchaService.verificar('token')).toBe(false);
});

test('sin token → false, sin llamar a Cloudflare', async () => {
  const fetch = cloudflareResponde({ success: true });

  expect(await captchaService.verificar(undefined)).toBe(false);
  expect(fetch).not.toHaveBeenCalled();
});

test('si no se puede contactar con Cloudflare → false', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('sin red'));

  expect(await captchaService.verificar('token')).toBe(false);
});
