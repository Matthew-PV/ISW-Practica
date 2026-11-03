const assert = require('node:assert/strict');
const { Given, When, Then, After, AfterAll } = require('@cucumber/cucumber');
const request = require('supertest');
const bcrypt = require('bcrypt');
const captchaService = require('../../src/services/captchaService');
const crypto = require('node:crypto');
const emailRepository = require('../../src/repositories/emailRepository');

// Seguridad: jamás ejecutar estas pruebas contra la BD compartida.
if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL para las pruebas BDD');
}

const base = new URL(process.env.DATABASE_URL);

if (
  !['localhost', '127.0.0.1'].includes(base.hostname) ||
  base.pathname !== '/planb'
) {
  throw new Error('BDD solo puede utilizar la base de datos local planb');
}

process.env.SESSION_SECRET = 'clave-local-exclusiva-para-bdd';

const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

Given('que existe un usuario registrado', async function () {
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const nombreUsuario = `bdd_${sufijo}`;
  const passwordHash = await bcrypt.hash('Correcta123', 4);

  this.usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash,
    },
  });

  this.agente = request.agent(app);
});

When('intenta iniciar sesión con una contraseña incorrecta', async function () {
  this.respuesta = await this.agente
    .post('/api/auth/login')
    .send({
      email: this.usuario.email,
      password: 'Incorrecta123',
    });
});

Then('recibe un error 401', function () {
  assert.equal(this.respuesta.status, 401);
});

Then('no se inicia ninguna sesión', async function () {
  const respuesta = await this.agente.get('/api/auth/yo');
  assert.equal(respuesta.status, 401);
});

// Eliminamos los datos creados por cada escenario.
After(async function () {
  if (this.usuario) {
    await prisma.usuario.deleteMany({
      where: { id: this.usuario.id },
    });
  }
});

AfterAll(async function () {
  await prisma.$disconnect();
});


When('introduce su email y contraseña correctos', async function () {
  this.respuesta = await this.agente
    .post('/api/auth/login')
    .send({
      email: this.usuario.email,
      password: 'Correcta123',
    });
});

Then('puede iniciar sesión', function () {
  assert.equal(this.respuesta.status, 200);
  assert.equal(this.respuesta.body.id, this.usuario.id);
});

Then('puede consultar sus datos de usuario', async function () {
  const respuesta = await this.agente.get('/api/auth/yo');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.id, this.usuario.id);
  assert.equal(respuesta.body.email, this.usuario.email);
  assert.equal(respuesta.body.passwordHash, undefined);
});

Given('que un usuario tiene una sesión iniciada', async function () {
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const nombreUsuario = `bdd_${sufijo}`;

  this.usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash('Correcta123', 4),
    },
  });

  this.agente = request.agent(app);

  const respuesta = await this.agente
    .post('/api/auth/login')
    .send({
      email: this.usuario.email,
      password: 'Correcta123',
    });

  assert.equal(respuesta.status, 200);
});

When('cierra su sesión', async function () {
  this.respuesta = await this.agente.post('/api/auth/logout');
});

Then('recibe una respuesta 204', function () {
  assert.equal(this.respuesta.status, 204);
});

Then('deja de poder consultar sus datos privados', async function () {
  const respuesta = await this.agente.get('/api/auth/yo');

  assert.equal(respuesta.status, 401);
});


Given('que una persona no tiene cuenta en PlanB', async function () {
  const sufijo = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  this.registro = {
    nombreUsuario: `bddreg_${sufijo}`,
    email: `bddreg_${sufijo}@prueba.local`,
    password: 'Correcta123',
    captcha: 'token-de-prueba',
  };

  const existente = await prisma.usuario.findUnique({
    where: { email: this.registro.email },
  });

  assert.equal(existente, null);
  this.agente = request.agent(app);
});

Given('proporciona datos válidos', function () {
  assert.ok(this.registro);
  assert.ok(this.registro.nombreUsuario);
  assert.ok(this.registro.email);
  assert.ok(this.registro.password);
});

Given('supera la comprobación CAPTCHA', function () {
  // Solo se simula el servicio externo de Cloudflare.
  this.verificadorCaptchaOriginal = captchaService.verificar;
  captchaService.verificar = async () => true;
});

When('solicita registrarse', async function () {
  this.respuesta = await this.agente
    .post('/api/auth/registro')
    .send(this.registro);
});

Then('se crea su cuenta', async function () {
  assert.equal(this.respuesta.status, 201);

  const usuario = await prisma.usuario.findUnique({
    where: { email: this.registro.email },
  });

  assert.ok(usuario);
  assert.equal(usuario.nombreUsuario, this.registro.nombreUsuario);
  assert.equal(this.respuesta.body.id, usuario.id);
});

Then('se inicia su sesión automáticamente', async function () {
  const respuesta = await this.agente.get('/api/auth/yo');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.email, this.registro.email);
});

// Restaurar CAPTCHA y borrar el usuario temporal.
After(async function () {
  if (this.verificadorCaptchaOriginal) {
    captchaService.verificar = this.verificadorCaptchaOriginal;
  }

  if (this.registro?.email) {
    await prisma.usuario.deleteMany({
      where: { email: this.registro.email },
    });
  }
});


Given('que Ana tiene una cuenta registrada', async function () {
  const sufijo = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const nombreUsuario = `bddrec_${sufijo}`;

  this.usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash('Antigua123', 4),
    },
  });

  // Capturamos el email sin enviarlo realmente.
  this.envioEmailOriginal = emailRepository.enviar;
  this.correoRecuperacion = null;

  emailRepository.enviar = async (correo) => {
    this.correoRecuperacion = correo;
  };
});

When('solicita recuperar su contraseña mediante su email', async function () {
  this.respuesta = await request(app)
    .post('/api/auth/recuperar')
    .send({ email: this.usuario.email });

  // Permite finalizar la tarea de envío asíncrono.
  await new Promise((resolve) => setImmediate(resolve));
});

Then('recibe una respuesta 200', function () {
  assert.equal(this.respuesta.status, 200);
});

Then('se genera un enlace de recuperación válido durante 30 minutos', async function () {
  assert.ok(this.correoRecuperacion);

  const contenido = this.correoRecuperacion.texto;
  const coincidencia = contenido.match(/token=([0-9a-f]{64})/);

  assert.ok(coincidencia, 'El correo debe contener un token válido');

  const token = coincidencia[1];
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const enlace = await prisma.tokenRecuperacion.findFirst({
    where: { usuarioId: this.usuario.id },
  });

  assert.ok(enlace, 'El enlace debe existir en MySQL');
  assert.equal(enlace.tokenHash, hash);
  assert.equal(enlace.usadoEn, null);

  const minutos = (enlace.caducaEn - enlace.creadoEn) / 60000;

  assert.ok(minutos > 29 && minutos < 31);
});

// Restauramos el envío original al acabar el escenario.
After(function () {
  if (this.envioEmailOriginal) {
    emailRepository.enviar = this.envioEmailOriginal;
  }
});


Given('que Ana ha solicitado recuperar su contraseña', async function () {
  const sufijo = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const nombreUsuario = `bddpass_${sufijo}`;

  // Creamos un usuario temporal en la base de datos local.
  this.usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash('Antigua123', 4),
    },
  });

  // Simulamos el envío del correo sin utilizar SMTP real.
  this.envioEmailOriginal = emailRepository.enviar;
  this.correoRecuperacion = null;

  emailRepository.enviar = async (correo) => {
    this.correoRecuperacion = correo;
  };

  this.respuesta = await request(app)
    .post('/api/auth/recuperar')
    .send({ email: this.usuario.email });

  assert.equal(this.respuesta.status, 200);

  // Esperamos a que termine la tarea asíncrona del envío.
  await new Promise((resolve) => setImmediate(resolve));
});

Given('dispone de un enlace de recuperación válido', async function () {
  assert.ok(this.correoRecuperacion, 'No se ha generado el correo');

  const coincidencia = this.correoRecuperacion.texto.match(
    /token=([0-9a-f]{64})/
  );

  assert.ok(coincidencia, 'No se encuentra el token de recuperación');

  this.tokenRecuperacion = coincidencia[1];

  const hash = crypto.createHash('sha256')
    .update(this.tokenRecuperacion)
    .digest('hex');

  const enlace = await prisma.tokenRecuperacion.findFirst({
    where: {
      usuarioId: this.usuario.id,
      tokenHash: hash,
      usadoEn: null,
      caducaEn: { gt: new Date() },
    },
  });

  assert.ok(enlace, 'El enlace no existe o no está vigente');
});

When('establece una nueva contraseña que cumple los requisitos', async function () {
  this.respuesta = await request(app)
    .post('/api/auth/restablecer')
    .send({
      token: this.tokenRecuperacion,
      nueva: 'Nueva12345',
    });
});

Then('la contraseña se actualiza correctamente', async function () {
  assert.equal(this.respuesta.status, 200);

  const usuarioActualizado = await prisma.usuario.findUnique({
    where: { id: this.usuario.id },
  });

  assert.ok(usuarioActualizado);

  const nuevaFunciona = await bcrypt.compare(
    'Nueva12345',
    usuarioActualizado.passwordHash
  );

  const antiguaFunciona = await bcrypt.compare(
    'Antigua123',
    usuarioActualizado.passwordHash
  );

  assert.equal(nuevaFunciona, true);
  assert.equal(antiguaFunciona, false);
});

Then('el enlace de recuperación no puede volver a utilizarse', async function () {
  const respuesta = await request(app)
    .post('/api/auth/restablecer')
    .send({
      token: this.tokenRecuperacion,
      nueva: 'Otra123456',
    });

  assert.equal(respuesta.status, 400);
  assert.equal(
    respuesta.body.error,
    'El enlace no es válido o ha caducado'
  );

  // La nueva contraseña debe seguir funcionando.
  const login = await request(app)
    .post('/api/auth/login')
    .send({
      email: this.usuario.email,
      password: 'Nueva12345',
    });

  assert.equal(login.status, 200);
});


Given('que existe un email que no pertenece a ningún usuario', async function () {
  const sufijo = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  this.emailInexistente = `nadie_${sufijo}@prueba.local`;

  // Creamos también una cuenta real para comparar respuestas.
  this.usuario = await prisma.usuario.create({
    data: {
      nombreUsuario: `bddpriv_${sufijo}`,
      email: `bddpriv_${sufijo}@prueba.local`,
      passwordHash: await bcrypt.hash('Correcta123', 4),
    },
  });

  const inexistente = await prisma.usuario.findUnique({
    where: { email: this.emailInexistente },
  });

  assert.equal(inexistente, null);

  // Evitamos enviar correos reales durante la prueba.
  this.envioEmailOriginal = emailRepository.enviar;
  this.correosCapturados = [];

  emailRepository.enviar = async (correo) => {
    this.correosCapturados.push(correo);
  };
});

When('se solicita recuperar la contraseña de ese email', async function () {
  // Primero solicitamos recuperar una cuenta existente.
  this.respuestaExistente = await request(app)
    .post('/api/auth/recuperar')
    .send({ email: this.usuario.email });

  // Después solicitamos recuperar una cuenta inexistente.
  this.respuestaInexistente = await request(app)
    .post('/api/auth/recuperar')
    .send({ email: this.emailInexistente });

  await new Promise((resolve) => setImmediate(resolve));
});

Then('el servidor responde con estado 200', function () {
  assert.equal(this.respuestaExistente.status, 200);
  assert.equal(this.respuestaInexistente.status, 200);
});

Then('muestra el mismo mensaje que para un email registrado', function () {
  assert.deepEqual(
    this.respuestaInexistente.body,
    this.respuestaExistente.body
  );

  // Solo debe generarse un correo para la cuenta real.
  assert.equal(this.correosCapturados.length, 1);
  assert.equal(this.correosCapturados[0].para, this.usuario.email);
});
