// CS-64: límite de intentos al cambiar la contraseña, con el limitador real (setup.js lo desactiva).
// Va en su propio archivo: los contadores son por IP y viven mientras se ejecuta el archivo, así
// que los intentos de login de tests/limites.test.js impedirían iniciar la sesión que hace falta.
jest.unmock('../../src/middlewares/limitesMiddleware');
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');

test('cambiar la contraseña con la actual incorrecta 11 veces seguidas responde 429 (CS-64)', async () => {
  const bcrypt = require('bcrypt');
  const usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('Antigua123', 4) };
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: usuario.email, password: 'Antigua123' });
  const intento = () => agente.put('/api/perfil/password').send({ actual: 'Equivocada1', nueva: 'Nueva12345' });

  for (let i = 0; i < 10; i++) {
    expect((await intento()).status).toBe(400);
  }
  const res = await intento();

  expect(res.status).toBe(429);
});
