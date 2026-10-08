// CS-64: recuperar la contraseña por email, con MySQL real. El envío del email se simula para
// leer el enlace que recibiría el usuario. Se ejecuta con `npm run test:mysql`; crea y borra sus datos.
jest.mock('../../src/repositories/emailRepository', () => ({ enviar: jest.fn(async () => {}) }));

const crypto = require('node:crypto');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');
const emailRepository = require('../../src/repositories/emailRepository');

const sufijo = `${Date.now()}`;
let usuario;

jest.setTimeout(60000);

const sha256 = (texto) => crypto.createHash('sha256').update(texto).digest('hex');
const pedirEnlace = (email) => request(app).post('/api/auth/recuperar').send({ email });
const restablecer = (token, nueva) => request(app).post('/api/auth/restablecer').send({ token, nueva });
const login = (password) => request(app).post('/api/auth/login').send({ email: usuario.email, password });
// El token del último enlace enviado: restablecer.html?token=<64 caracteres hexadecimales>
const tokenEnviado = () => emailRepository.enviar.mock.calls.at(-1)[0].texto.match(/token=([0-9a-f]{64})/)[1];

beforeEach(async () => {
  emailRepository.enviar.mockClear();
  usuario = await prisma.usuario.create({
    data: {
      nombreUsuario: `ana_${sufijo}_${Math.random().toString(36).slice(2, 7)}`,
      email: `ana_${Math.random().toString(36).slice(2, 9)}_${sufijo}@prueba.local`,
      passwordHash: await bcrypt.hash('Antigua123', 4),
    },
  });
});

afterEach(async () => {
  await prisma.tokenRecuperacion.deleteMany({ where: { usuarioId: usuario.id } });
  await prisma.usuario.delete({ where: { id: usuario.id } });
});

afterAll(() => prisma.$disconnect());

test('la respuesta es la misma exista o no el email, y solo se envía el enlace si existe', async () => {
  const existente = await pedirEnlace(usuario.email);
  const inexistente = await pedirEnlace(`nadie_${sufijo}@prueba.local`);

  expect(existente.status).toBe(200);
  expect(inexistente.status).toBe(200);
  expect(inexistente.body).toEqual(existente.body);
  expect(emailRepository.enviar).toHaveBeenCalledTimes(1);
  expect(emailRepository.enviar.mock.calls[0][0].para).toBe(usuario.email);
});

test('en la base de datos solo se guarda el hash del enlace, que caduca a los 30 minutos', async () => {
  await pedirEnlace(usuario.email);
  const token = tokenEnviado();

  const guardados = await prisma.tokenRecuperacion.findMany({ where: { usuarioId: usuario.id } });
  expect(guardados).toHaveLength(1);
  expect(guardados[0].tokenHash).toBe(sha256(token));
  expect(guardados[0].tokenHash).not.toContain(token);
  const minutos = (guardados[0].caducaEn - guardados[0].creadoEn) / 60000;
  expect(minutos).toBeGreaterThan(29.9);
  expect(minutos).toBeLessThan(30.1);
});

test('el enlace funciona una sola vez: después el login funciona con la nueva y falla con la antigua', async () => {
  await pedirEnlace(usuario.email);
  const token = tokenEnviado();

  expect((await restablecer(token, 'Nueva12345')).status).toBe(200);
  expect((await login('Nueva12345')).status).toBe(200);
  expect((await login('Antigua123')).status).toBe(401);

  const otraVez = await restablecer(token, 'Otra123456');
  expect(otraVez.status).toBe(400);
  expect(otraVez.body.error).toBe('El enlace no es válido o ha caducado');
  expect((await login('Nueva12345')).status).toBe(200);
});

test('un enlace caducado o inventado se rechaza y no cambia nada', async () => {
  await pedirEnlace(usuario.email);
  await prisma.tokenRecuperacion.updateMany({
    where: { usuarioId: usuario.id }, data: { caducaEn: new Date(Date.now() - 1000) },
  });

  expect((await restablecer(tokenEnviado(), 'Nueva12345')).status).toBe(400);
  expect((await restablecer(crypto.randomBytes(32).toString('hex'), 'Nueva12345')).status).toBe(400);
  expect((await login('Antigua123')).status).toBe(200);
});

test('si la nueva contraseña no cumple los requisitos no cambia nada y el enlace sigue sirviendo', async () => {
  await pedirEnlace(usuario.email);
  const token = tokenEnviado();

  const debil = await restablecer(token, 'nueva');
  expect(debil.status).toBe(400);
  expect(debil.body.error).toMatch(/^La contraseña no cumple estos requisitos/);

  expect((await restablecer(token, 'Nueva12345')).status).toBe(200);
});

test('dos restablecimientos simultáneos con el mismo enlace: solo uno funciona', async () => {
  await pedirEnlace(usuario.email);
  const token = tokenEnviado();

  const respuestas = await Promise.all([restablecer(token, 'Primera123'), restablecer(token, 'Segunda123')]);

  expect(respuestas.map((respuesta) => respuesta.status).sort()).toEqual([200, 400]);
});
