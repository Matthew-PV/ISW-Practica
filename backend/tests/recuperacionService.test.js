// CS-64: reglas del servicio de recuperación que no necesitan base de datos. El flujo completo
// (enlace de un solo uso, caducidad, solo el hash guardado) se prueba con MySQL real en
// tests/mysql/recuperacionPassword.test.js.
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/tokenRecuperacionRepository');
jest.mock('../src/repositories/emailRepository', () => ({ enviar: jest.fn() }));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const tokenRecuperacionRepository = require('../src/repositories/tokenRecuperacionRepository');
const emailRepository = require('../src/repositories/emailRepository');
const { solicitarRecuperacion } = require('../src/services/authService');

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue({ id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com' });
  tokenRecuperacionRepository.crear.mockResolvedValue({ id: 5 });
});

test('no espera al envío del email: la respuesta no tarda más si el email existe', async () => {
  emailRepository.enviar.mockReturnValue(new Promise(() => {})); // un envío que no termina nunca

  await expect(solicitarRecuperacion({ email: 'ana@ejemplo.com' })).resolves.toBeUndefined();
  expect(emailRepository.enviar).toHaveBeenCalled();
});

test('si el envío falla, la petición no falla (se anota en la consola del servidor)', async () => {
  const consola = jest.spyOn(console, 'error').mockImplementation(() => {});
  emailRepository.enviar.mockRejectedValue(new Error('SMTP caído'));

  await expect(solicitarRecuperacion({ email: 'ana@ejemplo.com' })).resolves.toBeUndefined();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(consola).toHaveBeenCalled();
  consola.mockRestore();
});

test('el enlace lleva a restablecer.html con un token aleatorio de 64 caracteres', async () => {
  emailRepository.enviar.mockResolvedValue();

  await solicitarRecuperacion({ email: '  Ana@Ejemplo.com ' });

  expect(usuarioRepository.buscarPorEmail).toHaveBeenCalledWith('ana@ejemplo.com');
  expect(emailRepository.enviar.mock.calls[0][0].texto).toMatch(/\/restablecer\.html\?token=[0-9a-f]{64}/);
});

test('sin email responde 400', async () => {
  await expect(solicitarRecuperacion({})).rejects.toMatchObject({ status: 400 });
});
