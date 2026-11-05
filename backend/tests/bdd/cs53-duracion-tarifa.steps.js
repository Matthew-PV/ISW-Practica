
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Given, When, Then, After } = require('@cucumber/cucumber');
const request = require('supertest');
const bcrypt = require('bcrypt');

// =====================================================
// CS-53: DURACIÓN Y TARIFA DE EXPERIENCIAS
// SEGURIDAD: SOLO MYSQL LOCAL
// =====================================================

if (!process.env.DATABASE_URL) {
  throw new Error('CS-53 BDD necesita DATABASE_URL');
}

const destino = new URL(process.env.DATABASE_URL);

if (
  destino.hostname !== '127.0.0.1' ||
  destino.port !== '3308' ||
  destino.pathname !== '/planb'
) {
  throw new Error(
    'CS-53 BDD solo permite MySQL local: 127.0.0.1:3308/planb'
  );
}

process.env.SESSION_SECRET ??= 'clave-local-exclusiva-cs53';

const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const PASSWORD = 'Correcta123';

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function datosExperiencia(mundo, adicionales = {}) {
  return {
    titulo: 'Experiencia BDD CS-53',
    descripcion: 'Prueba de duración y tarifa',
    ciudadId: mundo.cs53Ciudad.id,
    ...adicionales,
  };
}

async function publicar(mundo, adicionales = {}) {
  const respuesta = await mundo.cs53Agente
    .post('/api/experiencias')
    .send(datosExperiencia(mundo, adicionales));

  mundo.cs53Respuesta = respuesta;

  if (respuesta.status === 201) {
    mundo.cs53ExperienciaId = respuesta.body.id;
  }

  return respuesta;
}

// =====================================================
// PREPARACIÓN DE LOS ESCENARIOS
// =====================================================

Given(
  'que una usuaria inicia sesión local para CS-53',
  async function () {
    this.cs53Ciudad = await prisma.ciudad.findFirst({
      orderBy: { id: 'asc' },
    });

    assert.ok(
      this.cs53Ciudad,
      'No hay ciudades en MySQL local'
    );

    const identificador = crypto
      .randomBytes(6)
      .toString('hex');

    const nombreUsuario = `bddcs53_${identificador}`;

    const usuario = await prisma.usuario.create({
      data: {
        nombreUsuario,
        email: `${nombreUsuario}@prueba.local`,
        passwordHash: await bcrypt.hash(PASSWORD, 4),
      },
    });

    this.cs53UsuarioId = usuario.id;
    this.cs53Agente = request.agent(app);

    const login = await this.cs53Agente
      .post('/api/auth/login')
      .send({
        email: usuario.email,
        password: PASSWORD,
      });

    assert.equal(
      login.status,
      200,
      JSON.stringify(login.body)
    );
  }
);

Given(
  'que ha publicado una experiencia CS-53 de {int} minutos y tarifa {string}',
  async function (minutos, tarifa) {
    const respuesta = await publicar(this, {
      duracionMinutos: minutos,
      tarifa,
    });

    assert.equal(
      respuesta.status,
      201,
      JSON.stringify(respuesta.body)
    );
  }
);

// =====================================================
// CREACIÓN DE EXPERIENCIAS
// =====================================================

When(
  'publica una experiencia CS-53 de {int} minutos y tarifa {string}',
  async function (minutos, tarifa) {
    await publicar(this, {
      duracionMinutos: minutos,
      tarifa,
    });
  }
);

When(
  'publica una experiencia CS-53 sin duración ni tarifa',
  async function () {
    await publicar(this);
  }
);

// =====================================================
// EDICIÓN DE EXPERIENCIAS
// =====================================================

When(
  'modifica la experiencia CS-53 a {int} minutos y tarifa {string}',
  async function (minutos, tarifa) {
    assert.ok(this.cs53ExperienciaId);

    this.cs53Respuesta = await this.cs53Agente
      .patch(`/api/experiencias/${this.cs53ExperienciaId}`)
      .send({
        duracionMinutos: minutos,
        tarifa,
      });
  }
);

// =====================================================
// CONSULTA DE EXPERIENCIAS
// =====================================================

When(
  'consulta la experiencia registrada para CS-53',
  async function () {
    assert.ok(this.cs53ExperienciaId);

    this.cs53Respuesta = await this.cs53Agente
      .get(`/api/experiencias/${this.cs53ExperienciaId}`);
  }
);

// =====================================================
// VALIDACIÓN DE DATOS INCORRECTOS
// =====================================================

When(
  'intenta publicar una experiencia CS-53 con campo {string} y valor {string}',
  async function (campo, valor) {
    assert.ok(
      ['duracionMinutos', 'tarifa'].includes(campo),
      `Campo inesperado: ${campo}`
    );

    this.cs53CantidadAntes = await prisma.experiencia.count({
      where: {
        autorId: this.cs53UsuarioId,
      },
    });

    const valorEnviado = campo === 'duracionMinutos'
      ? Number(valor)
      : valor;

    this.cs53Respuesta = await this.cs53Agente
      .post('/api/experiencias')
      .send(
        datosExperiencia(this, {
          [campo]: valorEnviado,
        })
      );
  }
);

// =====================================================
// COMPROBACIÓN DEL ESTADO HTTP
// =====================================================

Then(
  'la respuesta de CS-53 es {int}',
  function (estado) {
    assert.equal(
      this.cs53Respuesta.status,
      estado,
      JSON.stringify(this.cs53Respuesta.body)
    );
  }
);

// =====================================================
// COMPROBACIÓN DE LOS DATOS EN MYSQL
// =====================================================

Then(
  'MySQL guarda {int} minutos y tarifa {string} para CS-53',
  async function (minutos, tarifa) {
    assert.ok(this.cs53ExperienciaId);

    const guardada = await prisma.experiencia.findUnique({
      where: {
        id: this.cs53ExperienciaId,
      },
    });

    assert.ok(guardada);

    assert.equal(
      guardada.duracionMinutos,
      minutos
    );

    // Prisma Decimal permite comparar con dos decimales.
    assert.equal(
      guardada.tarifa.toFixed(2),
      tarifa
    );
  }
);

// =====================================================
// COMPROBACIÓN DE LA CONSULTA HTTP
// =====================================================

Then(
  'la consulta CS-53 muestra {int} minutos y tarifa {string}',
  function (minutos, tarifa) {
    assert.equal(
      this.cs53Respuesta.status,
      200
    );

    assert.equal(
      this.cs53Respuesta.body.duracionMinutos,
      minutos
    );

    // CS-53: CORRECCIÓN
    // La API puede devolver "25.5" en lugar de "25.50",
    // o "30" en lugar de "30.00".
    // Ambos representan el mismo importe monetario.
    // Normalizamos a dos decimales antes de comparar.
    assert.equal(
      Number(this.cs53Respuesta.body.tarifa).toFixed(2),
      tarifa
    );
  }
);

// =====================================================
// COMPATIBILIDAD CON EXPERIENCIAS ANTIGUAS
// =====================================================

Then(
  'MySQL guarda duración y tarifa vacías para CS-53',
  async function () {
    assert.ok(this.cs53ExperienciaId);

    const guardada = await prisma.experiencia.findUnique({
      where: {
        id: this.cs53ExperienciaId,
      },
    });

    assert.ok(guardada);

    assert.equal(
      guardada.duracionMinutos,
      null
    );

    assert.equal(
      guardada.tarifa,
      null
    );
  }
);

// =====================================================
// NO GUARDAR DATOS INVÁLIDOS
// =====================================================

Then(
  'no se ha creado ninguna experiencia CS-53',
  async function () {
    const cantidadDespues = await prisma.experiencia.count({
      where: {
        autorId: this.cs53UsuarioId,
      },
    });

    assert.equal(
      cantidadDespues,
      this.cs53CantidadAntes
    );
  }
);

// =====================================================
// LIMPIEZA DE DATOS TEMPORALES
// =====================================================

After(async function () {
  if (!this.cs53UsuarioId) return;

  // Eliminar experiencias creadas para el escenario.
  await prisma.experiencia.deleteMany({
    where: {
      autorId: this.cs53UsuarioId,
    },
  });

  // Eliminar el usuario temporal.
  await prisma.usuario.delete({
    where: {
      id: this.cs53UsuarioId,
    },
  });
});
