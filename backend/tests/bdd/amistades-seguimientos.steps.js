const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Given, When, Then, After } = require('@cucumber/cucumber');
const request = require('supertest');
const bcrypt = require('bcrypt');

// Seguridad: nunca usar la base de datos compartida.
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
    'BDD de relaciones solo permite 127.0.0.1:3308/planb'
  );
}

process.env.SESSION_SECRET ??= 'clave-local-exclusiva-para-bdd';

const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const PASSWORD = 'Correcta123';

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function nombreTemporal(prefijo) {
  const fecha = Date.now().toString(36);
  const aleatorio = crypto.randomBytes(3).toString('hex');
  return `bdd${prefijo}_${fecha}_${aleatorio}`;
}

async function crearUsuario(mundo, prefijo) {
  const nombreUsuario = nombreTemporal(prefijo);

  const usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash(PASSWORD, 4),
    },
  });

  mundo.usuariosRelacionesIds ??= [];
  mundo.usuariosRelacionesIds.push(usuario.id);

  return usuario;
}

async function iniciarSesion(usuario) {
  const agente = request.agent(app);

  const respuesta = await agente
    .post('/api/auth/login')
    .send({
      email: usuario.email,
      password: PASSWORD,
    });

  assert.equal(respuesta.status, 200);

  return agente;
}

async function prepararPareja(mundo) {
  mundo.ana = await crearUsuario(mundo, 'ana');
  mundo.beatriz = await crearUsuario(mundo, 'bea');

  mundo.agente = await iniciarSesion(mundo.ana);
  mundo.agenteBeatriz = await iniciarSesion(mundo.beatriz);
}

async function enviarSolicitud(mundo) {
  const respuesta = await mundo.agente
    .post('/api/amistades')
    .send({ destinatarioId: mundo.beatriz.id });

  assert.equal(respuesta.status, 201);

  mundo.solicitudId = respuesta.body.id;
  return respuesta;
}

async function resumen(agente) {
  const respuesta = await agente.get('/api/perfil/resumen');

  assert.equal(respuesta.status, 200);
  return respuesta.body;
}

async function contarRelaciones(mundo) {
  return prisma.amistad.count({
    where: {
      parejaClave: [
        Math.min(mundo.ana.id, mundo.beatriz.id),
        Math.max(mundo.ana.id, mundo.beatriz.id),
      ].join('-'),
    },
  });
}

async function listaAmigos(agente) {
  const respuesta = await agente.get('/api/perfil/amigos');

  assert.equal(respuesta.status, 200);
  return respuesta.body.personas;
}

async function listaSeguidores(agente) {
  const respuesta = await agente.get('/api/perfil/seguidores');

  assert.equal(respuesta.status, 200);
  return respuesta.body.personas;
}

// =====================================================
// DATOS INICIALES
// =====================================================

Given(
  'que Ana ha iniciado sesión para gestionar relaciones',
  async function () {
    this.ana = await crearUsuario(this, 'ana');
    this.agente = await iniciarSesion(this.ana);
  }
);

Given(
  'que Beatriz es otra usuaria registrada',
  async function () {
    this.beatriz = await crearUsuario(this, 'bea');
    this.agenteBeatriz = await iniciarSesion(this.beatriz);
  }
);

Given(
  'que Ana ha enviado una solicitud de amistad a Beatriz',
  async function () {
    await prepararPareja(this);

    this.amigosAntesAna = (await resumen(this.agente)).amigos;
    this.amigosAntesBeatriz =
      (await resumen(this.agenteBeatriz)).amigos;

    await enviarSolicitud(this);
  }
);

Given(
  'que Ana y Beatriz tienen una amistad aceptada',
  async function () {
    await prepararPareja(this);
    await enviarSolicitud(this);

    const respuesta = await this.agenteBeatriz
      .patch(`/api/amistades/${this.solicitudId}`)
      .send({ aceptar: true });

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.estado, 'ACEPTADA');

    this.amigosAntesAna = (await resumen(this.agente)).amigos;
    this.amigosAntesBeatriz =
      (await resumen(this.agenteBeatriz)).amigos;
  }
);

Given('que Ana sigue a Beatriz', async function () {
  await prepararPareja(this);

  const respuesta = await this.agente
    .post('/api/seguimientos')
    .send({ seguidoId: this.beatriz.id });

  assert.equal(respuesta.status, 201);

  this.seguimientoId = respuesta.body.id;
  this.seguidoresAntes =
    (await resumen(this.agenteBeatriz)).seguidores;
});

// =====================================================
// ENVÍO DE SOLICITUDES
// =====================================================

When(
  'Ana envía una solicitud de amistad a Beatriz',
  async function () {
    this.respuesta = await enviarSolicitud(this);
  }
);

Then(
  'la solicitud queda en estado PENDIENTE',
  async function () {
    assert.equal(this.respuesta.status, 201);
    assert.equal(this.respuesta.body.estado, 'PENDIENTE');

    const solicitud = await prisma.amistad.findUnique({
      where: { id: this.solicitudId },
    });

    assert.ok(solicitud);
    assert.equal(solicitud.estado, 'PENDIENTE');
    assert.equal(solicitud.solicitanteId, this.ana.id);
    assert.equal(solicitud.destinatarioId, this.beatriz.id);
  }
);

Then(
  'Beatriz puede verla entre sus solicitudes recibidas',
  async function () {
    const respuesta = await this.agenteBeatriz
      .get('/api/amistades/solicitudes');

    assert.equal(respuesta.status, 200);

    const solicitud = respuesta.body.find(
      (item) => item.id === this.solicitudId
    );

    assert.ok(solicitud);
    assert.equal(solicitud.estado, 'PENDIENTE');
    assert.equal(solicitud.solicitante.id, this.ana.id);
    assert.equal(solicitud.solicitante.email, undefined);
  }
);

// =====================================================
// ACEPTAR SOLICITUDES
// =====================================================

When('Beatriz acepta la solicitud', async function () {
  this.respuesta = await this.agenteBeatriz
    .patch(`/api/amistades/${this.solicitudId}`)
    .send({ aceptar: true });
});

Then('ambas usuarias quedan como amigas', async function () {
  assert.equal(this.respuesta.status, 200);
  assert.equal(this.respuesta.body.estado, 'ACEPTADA');

  const amistad = await prisma.amistad.findUnique({
    where: { id: this.solicitudId },
  });

  assert.equal(amistad.estado, 'ACEPTADA');

  const amigosAna = await listaAmigos(this.agente);
  const amigosBeatriz = await listaAmigos(this.agenteBeatriz);

  assert.ok(amigosAna.some((u) => u.id === this.beatriz.id));
  assert.ok(amigosBeatriz.some((u) => u.id === this.ana.id));
});

Then(
  'el contador de amigos de ambas aumenta en uno',
  async function () {
    const ana = await resumen(this.agente);
    const beatriz = await resumen(this.agenteBeatriz);

    assert.equal(ana.amigos, this.amigosAntesAna + 1);
    assert.equal(beatriz.amigos, this.amigosAntesBeatriz + 1);
  }
);

// =====================================================
// RECHAZAR SOLICITUDES
// =====================================================

When('Beatriz rechaza la solicitud', async function () {
  this.respuesta = await this.agenteBeatriz
    .patch(`/api/amistades/${this.solicitudId}`)
    .send({ aceptar: false });
});

Then('la solicitud desaparece', async function () {
  assert.ok([200, 204].includes(this.respuesta.status));

  const solicitud = await prisma.amistad.findUnique({
    where: { id: this.solicitudId },
  });

  assert.equal(solicitud, null);

  const recibidas = await this.agenteBeatriz
    .get('/api/amistades/solicitudes');

  assert.equal(recibidas.status, 200);

  assert.ok(
    !recibidas.body.some((item) => item.id === this.solicitudId)
  );
});

Then('no se crea ninguna amistad', async function () {
  assert.equal(await contarRelaciones(this), 0);

  const ana = await resumen(this.agente);
  const beatriz = await resumen(this.agenteBeatriz);

  assert.equal(ana.amigos, 0);
  assert.equal(beatriz.amigos, 0);
});

// =====================================================
// SOLICITUDES DUPLICADAS
// =====================================================

When(
  'Ana intenta enviar otra solicitud a Beatriz',
  async function () {
    this.respuesta = await this.agente
      .post('/api/amistades')
      .send({ destinatarioId: this.beatriz.id });
  }
);

Then(
  'la operación de relaciones devuelve error 400',
  function () {
    assert.equal(this.respuesta.status, 400);
  }
);

Then('no se crea una segunda solicitud', async function () {
  assert.equal(await contarRelaciones(this), 1);

  const solicitud = await prisma.amistad.findUnique({
    where: { id: this.solicitudId },
  });

  assert.equal(solicitud.estado, 'PENDIENTE');
});

// =====================================================
// CANCELAR SOLICITUDES
// =====================================================

When('Ana cancela su solicitud pendiente', async function () {
  this.respuesta = await this.agente
    .delete(`/api/amistades/${this.solicitudId}`);
});

Then(
  'Ana puede volver a enviar otra solicitud',
  async function () {
    const anterior = this.solicitudId;

    const nueva = await this.agente
      .post('/api/amistades')
      .send({ destinatarioId: this.beatriz.id });

    assert.equal(nueva.status, 201);
    assert.equal(nueva.body.estado, 'PENDIENTE');
    assert.notEqual(nueva.body.id, anterior);

    assert.equal(await contarRelaciones(this), 1);
  }
);

// =====================================================
// ELIMINAR UNA AMISTAD
// =====================================================

When('Ana elimina la amistad', async function () {
  this.respuesta = await this.agente
    .delete(`/api/amistades/${this.solicitudId}`);
});

Then('ambas dejan de aparecer como amigas', async function () {
  assert.equal(this.respuesta.status, 204);
  assert.equal(await contarRelaciones(this), 0);

  const amigosAna = await listaAmigos(this.agente);
  const amigosBeatriz = await listaAmigos(this.agenteBeatriz);

  assert.ok(!amigosAna.some((u) => u.id === this.beatriz.id));
  assert.ok(!amigosBeatriz.some((u) => u.id === this.ana.id));
});

Then(
  'sus contadores de amigos disminuyen en uno',
  async function () {
    const ana = await resumen(this.agente);
    const beatriz = await resumen(this.agenteBeatriz);

    assert.equal(ana.amigos, this.amigosAntesAna - 1);
    assert.equal(beatriz.amigos, this.amigosAntesBeatriz - 1);
  }
);

// =====================================================
// SEGUIR A OTRO USUARIO
// =====================================================

When('Ana comienza a seguir a Beatriz', async function () {
  this.seguidoresAntes =
    (await resumen(this.agenteBeatriz)).seguidores;

  this.respuesta = await this.agente
    .post('/api/seguimientos')
    .send({ seguidoId: this.beatriz.id });
});

Then(
  'Ana aparece entre los seguidores de Beatriz',
  async function () {
    assert.equal(this.respuesta.status, 201);

    const seguidores = await listaSeguidores(
      this.agenteBeatriz
    );

    assert.ok(
      seguidores.some((usuario) => usuario.id === this.ana.id)
    );

    const guardado = await prisma.seguimiento.findUnique({
      where: {
        seguidorId_seguidoId: {
          seguidorId: this.ana.id,
          seguidoId: this.beatriz.id,
        },
      },
    });

    assert.ok(guardado);
  }
);

Then(
  'el contador de seguidores de Beatriz aumenta en uno',
  async function () {
    const despues = await resumen(this.agenteBeatriz);

    assert.equal(
      despues.seguidores,
      this.seguidoresAntes + 1
    );
  }
);

Then(
  'no se crea una amistad automáticamente',
  async function () {
    assert.equal(await contarRelaciones(this), 0);

    const amigos = await listaAmigos(this.agente);
    assert.equal(amigos.length, 0);
  }
);

// =====================================================
// DEJAR DE SEGUIR
// =====================================================

When('Ana deja de seguir a Beatriz', async function () {
  this.respuesta = await this.agente
    .delete(`/api/seguimientos/${this.beatriz.id}`);
});

Then(
  'Ana desaparece de sus seguidores',
  async function () {
    assert.equal(this.respuesta.status, 204);

    const seguidores = await listaSeguidores(
      this.agenteBeatriz
    );

    assert.ok(
      !seguidores.some((u) => u.id === this.ana.id)
    );

    const seguimiento = await prisma.seguimiento.findUnique({
      where: {
        seguidorId_seguidoId: {
          seguidorId: this.ana.id,
          seguidoId: this.beatriz.id,
        },
      },
    });

    assert.equal(seguimiento, null);
  }
);

Then(
  'el contador de seguidores de Beatriz disminuye en uno',
  async function () {
    const despues = await resumen(this.agenteBeatriz);

    assert.equal(
      despues.seguidores,
      this.seguidoresAntes - 1
    );
  }
);

// =====================================================
// IMPEDIR SEGUIRSE A UNO MISMO
// =====================================================

When('Ana intenta seguirse a sí misma', async function () {
  this.respuesta = await this.agente
    .post('/api/seguimientos')
    .send({ seguidoId: this.ana.id });
});

Then('no se crea ningún seguimiento', async function () {
  const cantidad = await prisma.seguimiento.count({
    where: {
      seguidorId: this.ana.id,
      seguidoId: this.ana.id,
    },
  });

  assert.equal(cantidad, 0);
});

// =====================================================
// LIMPIEZA DE LOS DATOS DE RELACIONES
// =====================================================

After(async function () {
  const ids = this.usuariosRelacionesIds;

  if (!ids?.length) return;

  // Primero eliminamos las relaciones entre usuarios.
  await prisma.amistad.deleteMany({
    where: {
      OR: [
        { solicitanteId: { in: ids } },
        { destinatarioId: { in: ids } },
      ],
    },
  });

  await prisma.seguimiento.deleteMany({
    where: {
      OR: [
        { seguidorId: { in: ids } },
        { seguidoId: { in: ids } },
      ],
    },
  });

  // Después eliminamos solo los usuarios de esta prueba.
  await prisma.usuario.deleteMany({
    where: { id: { in: ids } },
  });
});
