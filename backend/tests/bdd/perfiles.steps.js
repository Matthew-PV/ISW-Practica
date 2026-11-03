const assert = require('node:assert/strict');
const {
  Given,
  When,
  Then,
  After,
  setDefaultTimeout,
} = require('@cucumber/cucumber');

const request = require('supertest');
const bcrypt = require('bcrypt');

// Seguridad: estas pruebas crean y eliminan usuarios.
// Solo permitimos la base local de Docker en el puerto 3308.
if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL para las pruebas BDD');
}

const destino = new URL(process.env.DATABASE_URL);

if (
  destino.hostname !== '127.0.0.1' ||
  destino.port !== '3308' ||
  destino.pathname !== '/planb'
) {
  throw new Error(
    'Las pruebas BDD de perfiles solo pueden usar 127.0.0.1:3308/planb'
  );
}

process.env.SESSION_SECRET ??= 'clave-local-exclusiva-para-bdd';

const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');
const fotoRepository = require('../../src/repositories/fotoRepository');

setDefaultTimeout(20000);

const PASSWORD = 'Correcta123';

// PNG pequeño válido para probar la subida.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/nfoAAAAASUVORK5CYII=',
  'base64'
);

const GIF = Buffer.from('GIF89a\0\0\0\0');

let contador = 0;

// Genera un nombre distinto para cada usuario de prueba.
function nombreTemporal(prefijo) {
  const sufijo =
    Date.now().toString(36) +
    (contador++).toString(36) +
    Math.random().toString(36).slice(2, 6);

  return `${prefijo}_${sufijo}`;
}

// Crea usuarios reales en MySQL y guarda sus ID
// para eliminarlos al finalizar el escenario.
async function crearUsuario(mundo, prefijo, datosExtra = {}) {
  const nombreUsuario = nombreTemporal(prefijo);

  const usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash(PASSWORD, 4),
      ...datosExtra,
    },
  });

  mundo.usuariosPerfilIds ??= [];
  mundo.usuariosPerfilIds.push(usuario.id);

  return usuario;
}

// Inicia sesión mediante la API real.
async function iniciarSesion(mundo) {
  mundo.agente = request.agent(app);

  const respuesta = await mundo.agente
    .post('/api/auth/login')
    .send({
      email: mundo.ana.email,
      password: PASSWORD,
    });

  assert.equal(
    respuesta.status,
    200,
    `No se pudo iniciar sesión: ${JSON.stringify(respuesta.body)}`
  );
}

// Sustituye únicamente Cloudinary por una función local.
// La actualización del perfil sigue usando MySQL real.
function simularCloudinary(mundo) {
  mundo.subidaFotoOriginal = fotoRepository.subirFotoPerfil;
  mundo.numeroSubidas = 0;

  mundo.urlFotoNueva =
    `https://res.cloudinary.com/demo/image/upload/bdd-${mundo.ana.id}.png`;

  fotoRepository.subirFotoPerfil = async (usuarioId, archivo) => {
    mundo.numeroSubidas++;

    assert.equal(usuarioId, mundo.ana.id);
    assert.ok(Buffer.isBuffer(archivo));

    return mundo.urlFotoNueva;
  };
}

// Establece una foto anterior conocida para comprobar
// que los errores no la modifican.
async function prepararFotoAnterior(mundo) {
  mundo.fotoAnterior =
    `https://res.cloudinary.com/demo/image/upload/anterior-${mundo.ana.id}.png`;

  await prisma.usuario.update({
    where: { id: mundo.ana.id },
    data: { foto: mundo.fotoAnterior },
  });
}

// =====================================================
// DATOS INICIALES
// =====================================================

Given('que Ana ha iniciado sesión', async function () {
  this.ana = await crearUsuario(this, 'bddana', {
    ciudad: 'Madrid',
  });

  await iniciarSesion(this);
});

Given('que Ana no ha iniciado sesión', async function () {
  this.ana = await crearUsuario(this, 'bddana', {
    ciudad: 'Madrid',
  });

  this.agente = request.agent(app);

  // Impide cualquier subida externa incluso si fallara
  // inesperadamente la protección de la ruta.
  simularCloudinary(this);

  this.fotoAnterior = this.ana.foto;
});

Given(
  'que Beatriz tiene un nombre de usuario registrado',
  async function () {
    this.beatriz = await crearUsuario(this, 'bddbea', {
      ciudad: 'Barcelona',
    });
  }
);

Given('que Beatriz tiene un perfil registrado', async function () {
  this.beatriz = await crearUsuario(this, 'bddbea', {
    ciudad: 'Barcelona',
    foto: 'https://res.cloudinary.com/demo/image/upload/beatriz.png',
  });
});

// =====================================================
// CONSULTAR MI PERFIL
// =====================================================

When('consulta su perfil', async function () {
  this.respuesta = await this.agente.get('/api/perfil');
});

Then('aparecen su nombre, email, foto y ciudad', function () {
  assert.equal(this.respuesta.status, 200);

  const perfil = this.respuesta.body;

  assert.equal(perfil.id, this.ana.id);
  assert.equal(perfil.nombreUsuario, this.ana.nombreUsuario);
  assert.equal(perfil.email, this.ana.email);
  assert.equal(perfil.ciudad, 'Madrid');
  assert.ok(perfil.foto);

  assert.equal(perfil.passwordHash, undefined);
});

// =====================================================
// ACTUALIZAR MI PERFIL
// =====================================================

When('modifica su nombre de usuario y su ciudad', async function () {
  this.nombreNuevo = nombreTemporal('nuevo');
  this.ciudadNueva = 'Valencia';

  this.respuesta = await this.agente
    .put('/api/perfil')
    .send({
      nombreUsuario: this.nombreNuevo,
      ciudad: this.ciudadNueva,
    });
});

Then('los cambios se guardan correctamente', async function () {
  assert.equal(this.respuesta.status, 200);

  const guardado = await prisma.usuario.findUnique({
    where: { id: this.ana.id },
  });

  assert.equal(guardado.nombreUsuario, this.nombreNuevo);
  assert.equal(guardado.ciudad, this.ciudadNueva);
});

Then('aparecen al volver a consultar su perfil', async function () {
  const respuesta = await this.agente.get('/api/perfil');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.nombreUsuario, this.nombreNuevo);
  assert.equal(respuesta.body.ciudad, this.ciudadNueva);
});

// =====================================================
// NOMBRE DE USUARIO DUPLICADO
// =====================================================

When(
  'Ana intenta cambiar su nombre por el de Beatriz',
  async function () {
    this.nombreAnterior = this.ana.nombreUsuario;

    this.respuesta = await this.agente
      .put('/api/perfil')
      .send({
        nombreUsuario: this.beatriz.nombreUsuario,
      });
  }
);

Then('recibe un error 400', function () {
  assert.equal(this.respuesta.status, 400);
});

Then('conserva su nombre anterior', async function () {
  const respuesta = await this.agente.get('/api/perfil');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.nombreUsuario, this.nombreAnterior);

  const guardado = await prisma.usuario.findUnique({
    where: { id: this.ana.id },
  });

  assert.equal(guardado.nombreUsuario, this.nombreAnterior);
});

// =====================================================
// PERFIL PÚBLICO DE OTRO USUARIO
// =====================================================

When('Ana consulta el perfil de Beatriz', async function () {
  this.respuesta = await this.agente.get(
    `/api/usuarios/${encodeURIComponent(this.beatriz.nombreUsuario)}`
  );
});

Then('puede ver su nombre, foto y ciudad', function () {
  assert.equal(this.respuesta.status, 200);

  const perfil = this.respuesta.body;

  assert.equal(perfil.id, this.beatriz.id);
  assert.equal(perfil.nombreUsuario, this.beatriz.nombreUsuario);
  assert.equal(perfil.ciudad, 'Barcelona');
  assert.ok(perfil.foto);
});

Then(
  'puede consultar sus contadores de amigos y seguidores',
  function () {
    const perfil = this.respuesta.body;

    assert.equal(perfil.amigos, 0);
    assert.equal(perfil.seguidores, 0);
  }
);

Then('no puede ver su email ni su contraseña', function () {
  const perfil = this.respuesta.body;

  assert.equal(perfil.email, undefined);
  assert.equal(perfil.password, undefined);
  assert.equal(perfil.passwordHash, undefined);

  assert.ok(!JSON.stringify(perfil).includes(this.beatriz.email));
});

// =====================================================
// USUARIO INEXISTENTE
// =====================================================

When(
  'consulta el perfil de un usuario inexistente',
  async function () {
    const nombre = nombreTemporal('ausente');

    this.respuesta = await this.agente.get(
      `/api/usuarios/${nombre}`
    );
  }
);

Then('recibe un error 404', function () {
  assert.equal(this.respuesta.status, 404);
});

// =====================================================
// ACCESO SIN SESIÓN
// =====================================================

When('intenta consultar su perfil', async function () {
  this.respuesta = await this.agente.get('/api/perfil');
});

// El paso "recibe un error 401" ya existe
// en autenticacion.steps.js y se reutiliza.

// =====================================================
// FOTO DE PERFIL CORRECTA
// =====================================================

Given('que dispone de una imagen PNG válida', function () {
  this.imagen = PNG;
  simularCloudinary(this);
});

When('Ana sube la imagen como foto de perfil', async function () {
  this.respuesta = await this.agente
    .put('/api/perfil/foto')
    .attach('foto', this.imagen, 'foto.png');
});

// El paso "el servidor responde con estado 200"
// ya existe en autenticacion.steps.js.

Then('la nueva foto aparece al consultar su perfil', async function () {
  assert.equal(this.numeroSubidas, 1);

  const respuesta = await this.agente.get('/api/perfil');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.foto, this.urlFotoNueva);

  const guardado = await prisma.usuario.findUnique({
    where: { id: this.ana.id },
  });

  assert.equal(guardado.foto, this.urlFotoNueva);
});

// =====================================================
// FOTO CON FORMATO NO PERMITIDO
// =====================================================

Given('que dispone de un archivo GIF', async function () {
  this.imagen = GIF;

  await prepararFotoAnterior(this);
  simularCloudinary(this);
});

When('intenta utilizarlo como foto de perfil', async function () {
  this.respuesta = await this.agente
    .put('/api/perfil/foto')
    .attach('foto', this.imagen, 'foto.gif');
});

Then('conserva su foto anterior', async function () {
  assert.equal(this.numeroSubidas, 0);

  const respuesta = await this.agente.get('/api/perfil');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.foto, this.fotoAnterior);

  const guardado = await prisma.usuario.findUnique({
    where: { id: this.ana.id },
  });

  assert.equal(guardado.foto, this.fotoAnterior);
});

// =====================================================
// FOTO DEMASIADO GRANDE
// =====================================================

Given(
  'que dispone de una imagen que supera los 5 MB',
  async function () {
    this.imagen = Buffer.concat([
      PNG,
      Buffer.alloc(5 * 1024 * 1024),
    ]);

    await prepararFotoAnterior(this);
    simularCloudinary(this);
  }
);

When('intenta subirla como foto de perfil', async function () {
  this.respuesta = await this.agente
    .put('/api/perfil/foto')
    .attach('foto', this.imagen, 'foto.png');
});

// Reutilizamos:
// - recibe un error 400
// - conserva su foto anterior

// =====================================================
// IMPEDIR CAMBIAR FOTO SIN SESIÓN
// =====================================================

When('intenta subir una nueva foto de perfil', async function () {
  this.respuesta = await this.agente
    .put('/api/perfil/foto')
    .attach('foto', PNG, 'foto.png');
});

Then('no se modifica ninguna foto', async function () {
  assert.equal(this.numeroSubidas, 0);

  const guardado = await prisma.usuario.findUnique({
    where: { id: this.ana.id },
  });

  assert.equal(guardado.foto, this.fotoAnterior);
});

// =====================================================
// LIMPIEZA DESPUÉS DE CADA ESCENARIO
// =====================================================

After(async function () {
  // Restauramos Cloudinary.
  if (this.subidaFotoOriginal) {
    fotoRepository.subirFotoPerfil = this.subidaFotoOriginal;
  }

  // Solo eliminamos los usuarios creados
  // por los escenarios de perfiles.
  if (this.usuariosPerfilIds?.length) {
    await prisma.usuario.deleteMany({
      where: {
        id: { in: this.usuariosPerfilIds },
      },
    });
  }
});

// No añadimos AfterAll:
// autenticacion.steps.js ya desconecta Prisma.

Then('la subida de la foto responde con estado 200', function () {
  assert.equal(this.respuesta.status, 200);
});
