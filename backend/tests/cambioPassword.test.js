// CS-64, objetivos 4 a 6: cambiar la contraseña desde el perfil (PUT /api/perfil/password).
// El repositorio de usuarios se simula en memoria; rutas, servicios y bcrypt son los reales, así
// que se puede comprobar de principio a fin que el login funciona con la nueva y no con la antigua.
jest.mock('../src/repositories/usuarioRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');

let usuario;

beforeEach(async () => {
  jest.resetAllMocks();
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('Antigua123', 4) };
  usuarioRepository.buscarPorEmail.mockImplementation(async (email) => (email === usuario.email ? { ...usuario } : null));
  usuarioRepository.buscarPorId.mockImplementation(async (id) => (id === usuario.id ? { ...usuario } : null));
  usuarioRepository.actualizarPassword.mockImplementation(async (id, passwordHash) => {
    usuario.passwordHash = passwordHash;
  });
});

const login = (password) => request(app).post('/api/auth/login').send({ email: usuario.email, password });

async function agenteConSesion() {
  const agente = request.agent(app);
  expect((await agente.post('/api/auth/login').send({ email: usuario.email, password: 'Antigua123' })).status).toBe(200);
  return agente;
}

test('sin sesión responde 401', async () => {
  const res = await request(app).put('/api/perfil/password').send({ actual: 'Antigua123', nueva: 'Nueva12345' });

  expect(res.status).toBe(401);
});

test.each([[{ nueva: 'Nueva12345' }], [{ actual: 'Antigua123' }], [{ actual: 'Antigua123', nueva: 12345678 }]])(
  'si falta un dato (%p) responde 400 y no cambia nada', async (cuerpo) => {
    const agente = await agenteConSesion();

    const res = await agente.put('/api/perfil/password').send(cuerpo);

    expect(res.status).toBe(400);
    expect(usuarioRepository.actualizarPassword).not.toHaveBeenCalled();
  }
);

test('con la contraseña actual incorrecta no cambia nada', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/password').send({ actual: 'Equivocada1', nueva: 'Nueva12345' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La contraseña actual no es correcta');
  expect(usuarioRepository.actualizarPassword).not.toHaveBeenCalled();
  expect((await login('Antigua123')).status).toBe(200);
});

test('una contraseña nueva que no cumple los requisitos se rechaza indicando cuáles', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/password').send({ actual: 'Antigua123', nueva: 'ana12345' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La contraseña no cumple estos requisitos: al menos una mayúscula, sin el nombre de usuario.');
  expect(usuarioRepository.actualizarPassword).not.toHaveBeenCalled();
});

test('con la actual correcta, después el login funciona con la nueva y falla con la antigua', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/password').send({ actual: 'Antigua123', nueva: 'Nueva12345' });

  expect(res.status).toBe(204);
  expect((await login('Nueva12345')).status).toBe(200);
  expect((await login('Antigua123')).status).toBe(401);
  // Solo se guarda el hash, nunca la contraseña
  expect(usuarioRepository.actualizarPassword.mock.calls[0][1]).not.toContain('Nueva12345');
});
