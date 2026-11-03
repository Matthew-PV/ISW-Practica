
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Given, When, Then, After } = require('@cucumber/cucumber');
const request = require('supertest');
const bcrypt = require('bcrypt');

// =====================================================
// SEGURIDAD: SOLO MYSQL LOCAL
// =====================================================

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
    'BDD de valoraciones solo permite 127.0.0.1:3308/planb'
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
  return `bddv_${prefijo}_${crypto.randomBytes(5).toString('hex')}`;
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

  mundo.valUsuariosIds ??= [];
  mundo.valUsuariosIds.push(usuario.id);

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

  assert.equal(
    respuesta.status,
    200,
    `Error de login: ${JSON.stringify(respuesta.body)}`
  );

  return agente;
}

async function preparar(mundo) {
  if (mundo.valAna) return;

  mundo.valCiudad = await prisma.ciudad.findFirst({
    orderBy: { id: 'asc' },
  });

  assert.ok(
    mundo.valCiudad,
    'No hay ciudades cargadas en MySQL local'
  );

  mundo.valAna = await crearUsuario(mundo, 'ana');
  mundo.valBeatriz = await crearUsuario(mundo, 'bea');

  mundo.valAgenteAna = await iniciarSesion(mundo.valAna);
  mundo.valAgenteBeatriz = await iniciarSesion(mundo.valBeatriz);
}

async function publicar(mundo, agente, visibilidad = 'PUBLICA') {
  const respuesta = await agente
    .post('/api/experiencias')
    .send({
      titulo: `Plan BDD ${crypto.randomBytes(5).toString('hex')}`,
      descripcion: 'Experiencia temporal para probar valoraciones',
      ciudadId: mundo.valCiudad.id,
      visibilidad,
    });

  assert.equal(
    respuesta.status,
    201,
    `Error creando experiencia: ${JSON.stringify(respuesta.body)}`
  );

  mundo.valExperiencia = respuesta.body;

  return respuesta.body;
}

async function prepararPlanDeBeatriz(mundo, visibilidad = 'PUBLICA') {
  await preparar(mundo);
  await publicar(mundo, mundo.valAgenteBeatriz, visibilidad);
}

async function prepararPlanDeEva(mundo) {
  await preparar(mundo);

  mundo.valEva = await crearUsuario(mundo, 'eva');
  mundo.valAgenteEva = await iniciarSesion(mundo.valEva);

  await publicar(mundo, mundo.valAgenteEva);
}

async function crearValoracion(mundo, usuario, puntuacion, comentario = null) {
  return prisma.valoracion.create({
    data: {
      usuarioId: usuario.id,
      experienciaId: mundo.valExperiencia.id,
      puntuacion,
      comentario,
    },
  });
}

async function contarValoracionesDeAna(mundo) {
  return prisma.valoracion.count({
    where: {
      usuarioId: mundo.valAna.id,
      experienciaId: mundo.valExperiencia.id,
    },
  });
}

async function consultarRelacionadas(mundo) {
  mundo.valRespuesta = await mundo.valAgenteAna
    .get(
      `/api/experiencias/${mundo.valExperiencia.id}/valoraciones/amigos`
    );
}

function idsUsuariosEnRespuesta(mundo) {
  assert.equal(
    mundo.valRespuesta.status,
    200,
    JSON.stringify(mundo.valRespuesta.body)
  );

  return mundo.valRespuesta.body.valoraciones
    .map((valoracion) => valoracion.usuario.id);
}

function parejaClave(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

// =====================================================
// CREAR VALORACIÓN
// =====================================================

Given(
  'que Ana ha iniciado sesión para gestionar valoraciones',
  async function () {
    await preparar(this);
  }
);

Given(
  'que Beatriz ha publicado una experiencia pública para valorar',
  async function () {
    await prepararPlanDeBeatriz(this);
  }
);

When(
  'Ana valora el plan con cinco estrellas y un comentario',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .put(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      )
      .send({
        puntuacion: 5,
        comentario: 'Una experiencia excelente',
      });
  }
);

Then(
  'se guarda una valoración de Ana en MySQL',
  async function () {
    const guardada = await prisma.valoracion.findUnique({
      where: {
        usuarioId_experienciaId: {
          usuarioId: this.valAna.id,
          experienciaId: this.valExperiencia.id,
        },
      },
    });

    assert.ok(guardada);
    assert.equal(guardada.puntuacion, 5);
    assert.equal(guardada.comentario, 'Una experiencia excelente');
    assert.equal(this.valRespuesta.body.id, guardada.id);
  }
);

Then('el alta de la valoración responde 201', function () {
  assert.equal(this.valRespuesta.status, 201);
});

Then(
  'Ana puede consultar su propia valoración',
  async function () {
    const respuesta = await this.valAgenteAna
      .get(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      );

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.usuarioId, this.valAna.id);
    assert.equal(respuesta.body.puntuacion, 5);
  }
);

// =====================================================
// ACTUALIZAR VALORACIÓN EXISTENTE
// =====================================================

Given(
  'que Ana ya ha valorado un plan ajeno con tres estrellas',
  async function () {
    await prepararPlanDeBeatriz(this);

    const respuesta = await this.valAgenteAna
      .put(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      )
      .send({
        puntuacion: 3,
        comentario: 'Está bien',
      });

    assert.equal(respuesta.status, 201);

    this.valIdOriginal = respuesta.body.id;
  }
);

When(
  'Ana actualiza su valoración a cinco estrellas',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .put(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      )
      .send({
        puntuacion: 5,
        comentario: 'Ahora me gusta más',
      });
  }
);

Then(
  'la actualización de la valoración responde 200',
  function () {
    assert.equal(this.valRespuesta.status, 200);
    assert.equal(this.valRespuesta.body.puntuacion, 5);
    assert.equal(this.valRespuesta.body.id, this.valIdOriginal);
  }
);

Then(
  'sigue existiendo una sola valoración de Ana para el plan',
  async function () {
    assert.equal(await contarValoracionesDeAna(this), 1);

    const guardada = await prisma.valoracion.findUnique({
      where: { id: this.valIdOriginal },
    });

    assert.equal(guardada.puntuacion, 5);
    assert.equal(guardada.comentario, 'Ahora me gusta más');
  }
);

// =====================================================
// PUNTUACIÓN NO VÁLIDA
// =====================================================

When(
  'Ana intenta valorarla con seis estrellas',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .put(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      )
      .send({ puntuacion: 6 });
  }
);

Then(
  'la puntuación incorrecta devuelve error 400',
  function () {
    assert.equal(this.valRespuesta.status, 400);
  }
);

Then(
  'no se guarda ninguna valoración de Ana',
  async function () {
    assert.equal(await contarValoracionesDeAna(this), 0);
  }
);

// =====================================================
// IMPEDIR VALORAR EXPERIENCIA PROPIA
// =====================================================

Given(
  'que Ana ha publicado un plan propio para valorar',
  async function () {
    await preparar(this);
    await publicar(this, this.valAgenteAna);
  }
);

When(
  'Ana intenta valorar su propio plan',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .put(
        `/api/experiencias/${this.valExperiencia.id}/valoracion`
      )
      .send({ puntuacion: 5 });
  }
);

Then(
  'se rechaza la valoración propia con estado 403',
  function () {
    assert.equal(this.valRespuesta.status, 403);
    assert.equal(
      this.valRespuesta.body.error,
      'No puedes valorar tu propia experiencia'
    );
  }
);

// =====================================================
// CONSULTAR TODAS LAS VALORACIONES
// =====================================================

Given(
  'que una experiencia pública contiene tres valoraciones',
  async function () {
    await prepararPlanDeBeatriz(this);

    this.valCarlos = await crearUsuario(this, 'carlos');
    this.valDavid = await crearUsuario(this, 'david');

    this.valTresValoraciones = [];

    for (const [usuario, puntuacion] of [
      [this.valAna, 5],
      [this.valCarlos, 4],
      [this.valDavid, 3],
    ]) {
      const valoracion = await crearValoracion(
        this,
        usuario,
        puntuacion,
        `Comentario de ${usuario.nombreUsuario}`
      );

      this.valTresValoraciones.push(valoracion.id);
    }
  }
);

When(
  'Ana solicita todas las valoraciones del plan',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .get(
        `/api/experiencias/${this.valExperiencia.id}/valoraciones`
      );
  }
);

Then(
  'aparecen las tres valoraciones registradas',
  function () {
    assert.equal(this.valRespuesta.status, 200);

    const ids = this.valRespuesta.body.valoraciones
      .map((valoracion) => valoracion.id);

    assert.equal(ids.length, 3);

    assert.deepEqual(
      new Set(ids),
      new Set(this.valTresValoraciones)
    );
  }
);

Then(
  'se muestran de la más reciente a la más antigua',
  function () {
    const ids = this.valRespuesta.body.valoraciones
      .map((valoracion) => valoracion.id);

    assert.deepEqual(
      ids,
      [...this.valTresValoraciones].reverse()
    );
  }
);

Then(
  'los autores se muestran sin email ni contraseña',
  function () {
    for (const valoracion of this.valRespuesta.body.valoraciones) {
      assert.deepEqual(
        Object.keys(valoracion.usuario).sort(),
        ['foto', 'id', 'nombreUsuario']
      );

      assert.equal(valoracion.usuario.email, undefined);
      assert.equal(valoracion.usuario.passwordHash, undefined);
    }
  }
);

// =====================================================
// VALORACIONES DE AMIGOS Y SEGUIDORES
// =====================================================

Given(
  'que Beatriz es amiga de Ana para consultar valoraciones',
  async function () {
    await preparar(this);

    await prisma.amistad.create({
      data: {
        solicitanteId: this.valAna.id,
        destinatarioId: this.valBeatriz.id,
        estado: 'ACEPTADA',
        parejaClave: parejaClave(
          this.valAna.id,
          this.valBeatriz.id
        ),
      },
    });
  }
);

Given(
  'que Carlos sigue a Ana para consultar valoraciones',
  async function () {
    this.valCarlos = await crearUsuario(this, 'carlos');

    await prisma.seguimiento.create({
      data: {
        seguidorId: this.valCarlos.id,
        seguidoId: this.valAna.id,
      },
    });
  }
);

Given(
  'que David no tiene relación con Ana para consultar valoraciones',
  async function () {
    this.valDavid = await crearUsuario(this, 'david');

    const seguimientos = await prisma.seguimiento.count({
      where: {
        seguidorId: this.valDavid.id,
        seguidoId: this.valAna.id,
      },
    });

    assert.equal(seguimientos, 0);
  }
);

Given(
  'que los tres han valorado un plan público de Eva',
  async function () {
    await prepararPlanDeEva(this);

    await crearValoracion(this, this.valBeatriz, 5);
    await crearValoracion(this, this.valCarlos, 4);
    await crearValoracion(this, this.valDavid, 3);
  }
);

When(
  'Ana solicita las valoraciones de amigos y seguidores',
  async function () {
    await consultarRelacionadas(this);
  }
);

Then(
  'aparecen las valoraciones de Beatriz y Carlos',
  function () {
    const ids = idsUsuariosEnRespuesta(this);

    assert.equal(ids.length, 2);

    assert.deepEqual(
      new Set(ids),
      new Set([this.valBeatriz.id, this.valCarlos.id])
    );
  }
);

Then(
  'no aparece la valoración de David',
  function () {
    const ids = idsUsuariosEnRespuesta(this);

    assert.ok(!ids.includes(this.valDavid.id));
  }
);

// =====================================================
// SOLICITUDES DE AMISTAD PENDIENTES
// =====================================================

Given(
  'que Ana tiene una solicitud de amistad pendiente con Beatriz para valoraciones',
  async function () {
    await preparar(this);

    const respuesta = await this.valAgenteAna
      .post('/api/amistades')
      .send({ destinatarioId: this.valBeatriz.id });

    assert.equal(respuesta.status, 201);
    assert.equal(respuesta.body.estado, 'PENDIENTE');
  }
);

Given(
  'que Beatriz no sigue a Ana en la prueba de valoraciones',
  async function () {
    const cantidad = await prisma.seguimiento.count({
      where: {
        seguidorId: this.valBeatriz.id,
        seguidoId: this.valAna.id,
      },
    });

    assert.equal(cantidad, 0);
  }
);

Given(
  'que Beatriz ha valorado un plan público de Eva',
  async function () {
    await prepararPlanDeEva(this);
    await crearValoracion(this, this.valBeatriz, 5);
  }
);

Then(
  'no aparece ninguna valoración de Beatriz',
  function () {
    const ids = idsUsuariosEnRespuesta(this);

    assert.deepEqual(ids, []);
  }
);

// =====================================================
// LISTA VACÍA SIN RELACIONES
// =====================================================

Given(
  'que Ana no tiene amistades ni seguidores para consultar valoraciones',
  async function () {
    await preparar(this);

    const amistades = await prisma.amistad.count({
      where: {
        OR: [
          { solicitanteId: this.valAna.id },
          { destinatarioId: this.valAna.id },
        ],
      },
    });

    const seguidores = await prisma.seguimiento.count({
      where: { seguidoId: this.valAna.id },
    });

    assert.equal(amistades, 0);
    assert.equal(seguidores, 0);
  }
);

Given(
  'que existe un plan público con valoraciones ajenas',
  async function () {
    await prepararPlanDeEva(this);

    const carlos = await crearUsuario(this, 'carlos');
    await crearValoracion(this, carlos, 4);
  }
);

Then(
  'la lista de valoraciones relacionadas está vacía',
  function () {
    assert.deepEqual(idsUsuariosEnRespuesta(this), []);
  }
);

Then(
  'la consulta de valoraciones relacionadas responde 200',
  function () {
    assert.equal(this.valRespuesta.status, 200);
    assert.equal(this.valRespuesta.body.siguiente, null);
  }
);

// =====================================================
// PAGINACIÓN SIN DUPLICADOS
// =====================================================

Given(
  'que Ana dispone de tres valoraciones de seguidores',
  async function () {
    await prepararPlanDeEva(this);

    this.valIdsPaginacion = [];

    for (let i = 1; i <= 3; i++) {
      const seguidor = await crearUsuario(this, `seg${i}`);

      await prisma.seguimiento.create({
        data: {
          seguidorId: seguidor.id,
          seguidoId: this.valAna.id,
        },
      });

      const valoracion = await crearValoracion(
        this,
        seguidor,
        i + 1
      );

      this.valIdsPaginacion.push(valoracion.id);
    }
  }
);

When(
  'Ana solicita dos valoraciones en la primera página',
  async function () {
    this.valPrimeraPagina = await this.valAgenteAna
      .get(
        `/api/experiencias/${this.valExperiencia.id}/valoraciones/amigos`
      )
      .query({ limite: 2 });

    assert.equal(this.valPrimeraPagina.status, 200);
    assert.equal(this.valPrimeraPagina.body.valoraciones.length, 2);
    assert.ok(this.valPrimeraPagina.body.siguiente);
  }
);

When(
  'solicita la siguiente página usando el cursor',
  async function () {
    this.valSegundaPagina = await this.valAgenteAna
      .get(
        `/api/experiencias/${this.valExperiencia.id}/valoraciones/amigos`
      )
      .query({
        limite: 2,
        despuesDe: this.valPrimeraPagina.body.siguiente,
      });

    assert.equal(this.valSegundaPagina.status, 200);
  }
);

Then(
  'recibe las tres valoraciones entre ambas páginas',
  function () {
    const primera = this.valPrimeraPagina.body.valoraciones;
    const segunda = this.valSegundaPagina.body.valoraciones;

    assert.equal(primera.length, 2);
    assert.equal(segunda.length, 1);
    assert.equal(this.valSegundaPagina.body.siguiente, null);

    const ids = [...primera, ...segunda].map((v) => v.id);

    assert.deepEqual(
      ids,
      [...this.valIdsPaginacion].reverse()
    );
  }
);

Then(
  'no se repiten valoraciones entre las páginas',
  function () {
    const todas = [
      ...this.valPrimeraPagina.body.valoraciones,
      ...this.valSegundaPagina.body.valoraciones,
    ];

    const ids = todas.map((valoracion) => valoracion.id);

    assert.equal(ids.length, 3);
    assert.equal(new Set(ids).size, 3);
  }
);

// =====================================================
// VALORACIONES DE UNA EXPERIENCIA PRIVADA
// =====================================================

Given(
  'que Beatriz ha publicado un plan privado para comprobar valoraciones',
  async function () {
    await prepararPlanDeBeatriz(this, 'PRIVADA');
  }
);

Given(
  'que Ana no tiene acceso a ese plan',
  async function () {
    const respuesta = await this.valAgenteAna
      .get(`/api/experiencias/${this.valExperiencia.id}`);

    assert.equal(respuesta.status, 404);
  }
);

When(
  'Ana consulta las valoraciones del plan privado',
  async function () {
    this.valRespuesta = await this.valAgenteAna
      .get(
        `/api/experiencias/${this.valExperiencia.id}/valoraciones`
      );
  }
);

Then(
  'la consulta de valoraciones devuelve error 404',
  function () {
    assert.equal(this.valRespuesta.status, 404);
  }
);

Then(
  'la respuesta no revela información del plan ni sus valoraciones',
  function () {
    assert.deepEqual(this.valRespuesta.body, {
      error: 'Contenido no disponible',
    });
  }
);

// =====================================================
// LIMPIEZA DE DATOS TEMPORALES
// =====================================================

After(async function () {
  const ids = this.valUsuariosIds;

  if (!ids?.length) return;

  // Primero se eliminan las valoraciones.
  await prisma.valoracion.deleteMany({
    where: {
      usuarioId: { in: ids },
    },
  });

  // Después, las relaciones.
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

  // Después, las experiencias.
  await prisma.experiencia.deleteMany({
    where: {
      autorId: { in: ids },
    },
  });

  // Por último, los usuarios temporales.
  await prisma.usuario.deleteMany({
    where: {
      id: { in: ids },
    },
  });
});

// No añadimos AfterAll.
// autenticacion.steps.js ya desconecta Prisma.
