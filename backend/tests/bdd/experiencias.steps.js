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
    'BDD de experiencias solo permite 127.0.0.1:3308/planb'
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
  const sufijo = crypto.randomBytes(6).toString('hex');
  return `bddexp_${prefijo}_${sufijo}`;
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

  mundo.bddExpUsuarios ??= [];
  mundo.bddExpUsuarios.push(usuario.id);

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

async function prepararAna(mundo) {
  if (mundo.expAna) return;

  mundo.expCiudad = await prisma.ciudad.findFirst({
    orderBy: { id: 'asc' },
  });

  assert.ok(
    mundo.expCiudad,
    'No hay ciudades: carga el catálogo en MySQL local'
  );

  mundo.expAna = await crearUsuario(mundo, 'ana');
  mundo.expAgenteAna = await iniciarSesion(mundo.expAna);
}

async function prepararPareja(mundo) {
  await prepararAna(mundo);

  if (mundo.expBeatriz) return;

  mundo.expBeatriz = await crearUsuario(mundo, 'bea');
  mundo.expAgenteBeatriz = await iniciarSesion(mundo.expBeatriz);
}

function datosExperiencia(mundo, cambios = {}) {
  return {
    titulo: 'Ruta cultural de prueba',
    descripcion: 'Una experiencia creada mediante BDD',
    ciudadId: mundo.expCiudad.id,
    ...cambios,
  };
}

async function publicar(mundo, agente, cambios = {}) {
  const respuesta = await agente
    .post('/api/experiencias')
    .send(datosExperiencia(mundo, cambios));

  assert.equal(
    respuesta.status,
    201,
    `No se pudo crear la experiencia: ${JSON.stringify(respuesta.body)}`
  );

  mundo.bddExpExperiencias ??= [];
  mundo.bddExpExperiencias.push(respuesta.body.id);

  return respuesta.body;
}

async function contarExperienciasAna(mundo) {
  return prisma.experiencia.count({
    where: { autorId: mundo.expAna.id },
  });
}

async function consultarExperiencia(mundo) {
  mundo.expRespuesta = await mundo.expAgenteAna
    .get(`/api/experiencias/${mundo.expExperiencia.id}`);
}

async function comprobarVisibilidad(mundo, id, esperada) {
  const experiencia = await prisma.experiencia.findUnique({
    where: { id },
  });

  assert.ok(experiencia);
  assert.equal(experiencia.visibilidad, esperada);
}

// =====================================================
// DATOS INICIALES
// =====================================================

Given(
  'que Ana ha iniciado sesión para gestionar experiencias',
  async function () {
    await prepararAna(this);
  }
);

Given(
  'que existe una ciudad válida para las experiencias',
  function () {
    assert.ok(this.expCiudad);
    assert.ok(this.expCiudad.id > 0);
  }
);

Given(
  'que Ana ha publicado una experiencia propia',
  async function () {
    await prepararAna(this);

    this.expExperiencia = await publicar(
      this,
      this.expAgenteAna
    );
  }
);

Given(
  'que Beatriz ha publicado una experiencia para comprobar permisos',
  async function () {
    await prepararPareja(this);

    this.expExperiencia = await publicar(
      this,
      this.expAgenteBeatriz,
      {
        titulo: 'Experiencia de Beatriz',
        visibilidad: 'PUBLICA',
      }
    );

    this.expTituloAnterior = this.expExperiencia.titulo;
    this.expDescripcionAnterior = this.expExperiencia.descripcion;
  }
);

Given(
  'que Beatriz ha publicado una experiencia {word} para Ana',
  async function (visibilidad) {
    await prepararPareja(this);

    this.expExperiencia = await publicar(
      this,
      this.expAgenteBeatriz,
      {
        titulo: `Experiencia ${visibilidad} de Beatriz`,
        visibilidad,
      }
    );
  }
);

// =====================================================
// CREACIÓN
// =====================================================

When(
  'Ana crea una experiencia con datos válidos',
  async function () {
    this.expRespuesta = await this.expAgenteAna
      .post('/api/experiencias')
      .send(datosExperiencia(this));

    if (this.expRespuesta.status === 201) {
      this.expExperiencia = this.expRespuesta.body;
    }
  }
);

Then(
  'la experiencia se crea con estado 201',
  function () {
    assert.equal(
      this.expRespuesta.status,
      201,
      JSON.stringify(this.expRespuesta.body)
    );
    assert.ok(this.expRespuesta.body.id);
  }
);

Then(
  'la experiencia creada pertenece a Ana',
  async function () {
    const guardada = await prisma.experiencia.findUnique({
      where: { id: this.expExperiencia.id },
    });

    assert.ok(guardada);
    assert.equal(guardada.autorId, this.expAna.id);
    assert.equal(guardada.ciudadId, this.expCiudad.id);
  }
);

Then('es pública por defecto', async function () {
  await comprobarVisibilidad(
    this,
    this.expExperiencia.id,
    'PUBLICA'
  );
});

// =====================================================
// VALIDACIONES DE CREACIÓN
// =====================================================

When(
  'Ana intenta crear una experiencia sin título',
  async function () {
    this.expCantidadAntes = await contarExperienciasAna(this);

    this.expRespuesta = await this.expAgenteAna
      .post('/api/experiencias')
      .send(datosExperiencia(this, {
        titulo: '',
      }));
  }
);

When(
  'Ana intenta crear una experiencia con ciudad inexistente',
  async function () {
    this.expCantidadAntes = await contarExperienciasAna(this);

    const ultimaCiudad = await prisma.ciudad.findFirst({
      orderBy: { id: 'desc' },
    });

    const ciudadInexistente = ultimaCiudad.id + 100000;

    this.expRespuesta = await this.expAgenteAna
      .post('/api/experiencias')
      .send(datosExperiencia(this, {
        ciudadId: ciudadInexistente,
      }));
  }
);

Then(
  'la creación de experiencia devuelve error 400',
  function () {
    assert.equal(this.expRespuesta.status, 400);
  }
);

Then(
  'no se guarda ninguna experiencia nueva de Ana',
  async function () {
    const despues = await contarExperienciasAna(this);

    assert.equal(despues, this.expCantidadAntes);
  }
);

// =====================================================
// EDITAR EXPERIENCIA PROPIA
// =====================================================

When(
  'Ana modifica el título y la descripción de su experiencia',
  async function () {
    this.expTituloNuevo = 'Ruta cultural actualizada';
    this.expDescripcionNueva = 'Descripción modificada con BDD';

    this.expRespuesta = await this.expAgenteAna
      .patch(`/api/experiencias/${this.expExperiencia.id}`)
      .send({
        titulo: this.expTituloNuevo,
        descripcion: this.expDescripcionNueva,
      });
  }
);

Then(
  'los cambios de la experiencia se guardan en MySQL',
  async function () {
    assert.equal(this.expRespuesta.status, 200);

    const guardada = await prisma.experiencia.findUnique({
      where: { id: this.expExperiencia.id },
    });

    assert.equal(guardada.titulo, this.expTituloNuevo);
    assert.equal(
      guardada.descripcion,
      this.expDescripcionNueva
    );
  }
);

Then(
  'Ana puede ver los datos nuevos al recargarla',
  async function () {
    const respuesta = await this.expAgenteAna
      .get(`/api/experiencias/${this.expExperiencia.id}`);

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.titulo, this.expTituloNuevo);
    assert.equal(
      respuesta.body.descripcion,
      this.expDescripcionNueva
    );
  }
);

// =====================================================
// IMPEDIR EDITAR EXPERIENCIAS AJENAS
// =====================================================

When(
  'Ana intenta editar la experiencia de Beatriz',
  async function () {
    this.expRespuesta = await this.expAgenteAna
      .patch(`/api/experiencias/${this.expExperiencia.id}`)
      .send({
        titulo: 'Título que Ana no puede guardar',
      });
  }
);

Then(
  'la edición ajena devuelve error 403',
  function () {
    assert.equal(this.expRespuesta.status, 403);
  }
);

Then(
  'la experiencia de Beatriz conserva sus datos',
  async function () {
    const guardada = await prisma.experiencia.findUnique({
      where: { id: this.expExperiencia.id },
    });

    assert.equal(guardada.titulo, this.expTituloAnterior);
    assert.equal(
      guardada.descripcion,
      this.expDescripcionAnterior
    );
  }
);

// =====================================================
// CONSULTAR EXPERIENCIAS Y PERMISOS
// =====================================================

When(
  'Ana abre la experiencia de Beatriz',
  async function () {
    await consultarExperiencia(this);
  }
);

Then(
  'Ana recibe la experiencia con estado 200',
  function () {
    assert.equal(this.expRespuesta.status, 200);
    assert.equal(
      this.expRespuesta.body.id,
      this.expExperiencia.id
    );
  }
);

Then(
  'puede consultar su título y su autora',
  function () {
    assert.equal(
      this.expRespuesta.body.titulo,
      this.expExperiencia.titulo
    );

    assert.equal(
      this.expRespuesta.body.autor.id,
      this.expBeatriz.id
    );

    assert.equal(
      this.expRespuesta.body.autor.email,
      undefined
    );
  }
);

Then(
  'el acceso a la experiencia devuelve error 404',
  function () {
    assert.equal(this.expRespuesta.status, 404);
  }
);

Then(
  'no se revelan los datos de la experiencia',
  function () {
    assert.deepEqual(this.expRespuesta.body, {
      error: 'Contenido no disponible',
    });
  }
);

// =====================================================
// VISIBILIDAD PARA AMIGOS
// =====================================================

Given(
  'que Ana y Beatriz tienen una amistad aceptada para experiencias',
  async function () {
    const solicitud = await this.expAgenteAna
      .post('/api/amistades')
      .send({
        destinatarioId: this.expBeatriz.id,
      });

    assert.equal(solicitud.status, 201);

    const aceptada = await this.expAgenteBeatriz
      .patch(`/api/amistades/${solicitud.body.id}`)
      .send({ aceptar: true });

    assert.equal(aceptada.status, 200);
    assert.equal(aceptada.body.estado, 'ACEPTADA');
  }
);

Given(
  'que Ana tiene una solicitud pendiente para experiencias',
  async function () {
    const solicitud = await this.expAgenteAna
      .post('/api/amistades')
      .send({
        destinatarioId: this.expBeatriz.id,
      });

    assert.equal(solicitud.status, 201);
    assert.equal(solicitud.body.estado, 'PENDIENTE');
  }
);

// =====================================================
// CAMBIAR VISIBILIDAD
// =====================================================

Given(
  'que Ana puede consultarla inicialmente',
  async function () {
    const respuesta = await this.expAgenteAna
      .get(`/api/experiencias/${this.expExperiencia.id}`);

    assert.equal(respuesta.status, 200);
  }
);

When(
  'Beatriz convierte la experiencia en PRIVADA',
  async function () {
    const respuesta = await this.expAgenteBeatriz
      .patch(`/api/experiencias/${this.expExperiencia.id}`)
      .send({
        visibilidad: 'PRIVADA',
      });

    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.visibilidad, 'PRIVADA');
  }
);

Then(
  'Ana pierde el acceso en la siguiente consulta',
  async function () {
    const respuesta = await this.expAgenteAna
      .get(`/api/experiencias/${this.expExperiencia.id}`);

    assert.equal(respuesta.status, 404);

    assert.deepEqual(respuesta.body, {
      error: 'Contenido no disponible',
    });

    await comprobarVisibilidad(
      this,
      this.expExperiencia.id,
      'PRIVADA'
    );
  }
);

// =====================================================
// CATEGORÍAS Y MOMENTOS
// =====================================================

When(
  'Ana consulta las opciones de experiencias',
  async function () {
    this.expRespuesta = await this.expAgenteAna
      .get('/api/experiencias/opciones');
  }
);

Then(
  'las opciones responden con estado 200',
  function () {
    assert.equal(this.expRespuesta.status, 200);
  }
);

Then(
  'aparece la categoría {string}',
  function (categoria) {
    assert.ok(
      this.expRespuesta.body.categorias.includes(categoria)
    );
  }
);

Then(
  'aparece el momento {string}',
  function (momento) {
    const momentos = this.expRespuesta.body.momentos
      .flatMap((grupo) => grupo.valores);

    assert.ok(momentos.includes(momento));
  }
);

// =====================================================
// CREACIÓN CON CATEGORÍA Y MOMENTO
// =====================================================

When(
  'Ana prepara una experiencia de categoría {string}',
  function (categoria) {
    this.expCategoriaElegida = categoria;
  }
);

When(
  'la publica para el momento {string}',
  async function (momento) {
    this.expMomentoElegido = momento;

    this.expRespuesta = await this.expAgenteAna
      .post('/api/experiencias')
      .send(datosExperiencia(this, {
        tipo: this.expCategoriaElegida,
        momentoAdecuado: momento,
      }));

    if (this.expRespuesta.status === 201) {
      this.expExperiencia = this.expRespuesta.body;
    }
  }
);

Then(
  'conserva la categoría y el momento seleccionados',
  async function () {
    const guardada = await prisma.experiencia.findUnique({
      where: { id: this.expExperiencia.id },
    });

    assert.equal(
      guardada.tipo,
      this.expCategoriaElegida
    );

    assert.equal(
      guardada.momentoAdecuado,
      this.expMomentoElegido
    );
  }
);

// =====================================================
// CATEGORÍA INCORRECTA
// =====================================================

When(
  'Ana intenta crear una experiencia con categoría inexistente',
  async function () {
    this.expCantidadAntes = await contarExperienciasAna(this);

    this.expRespuesta = await this.expAgenteAna
      .post('/api/experiencias')
      .send(datosExperiencia(this, {
        tipo: 'CategoriaInexistenteBDD',
      }));
  }
);

// =====================================================
// LISTADO DE EXPERIENCIAS PROPIAS
// =====================================================

Given(
  'que Ana ha publicado planes con las tres visibilidades',
  async function () {
    this.expPropias = [];

    for (const visibilidad of ['PUBLICA', 'AMIGOS', 'PRIVADA']) {
      const experiencia = await publicar(
        this,
        this.expAgenteAna,
        {
          titulo: `Plan propio ${visibilidad}`,
          visibilidad,
        }
      );

      this.expPropias.push(experiencia);
    }
  }
);

When(
  'Ana consulta sus experiencias publicadas',
  async function () {
    this.expRespuesta = await this.expAgenteAna
      .get('/api/experiencias')
      .query({
        autor: this.expAna.nombreUsuario,
      });
  }
);

Then(
  'aparecen sus tres experiencias',
  function () {
    assert.equal(this.expRespuesta.status, 200);

    const ids = new Set(
      this.expRespuesta.body.experiencias.map((e) => e.id)
    );

    for (const experiencia of this.expPropias) {
      assert.ok(
        ids.has(experiencia.id),
        `No aparece la experiencia ${experiencia.id}`
      );
    }
  }
);

Then(
  'se conserva la visibilidad de cada experiencia propia',
  function () {
    const experiencias = this.expRespuesta.body.experiencias;

    for (const original of this.expPropias) {
      const encontrada = experiencias.find(
        (e) => e.id === original.id
      );

      assert.ok(encontrada);
      assert.equal(
        encontrada.visibilidad,
        original.visibilidad
      );
    }
  }
);

// =====================================================
// LISTADO DE EXPERIENCIAS AJENAS
// =====================================================

Given(
  'que Beatriz ha publicado planes públicos y privados para Ana',
  async function () {
    await prepararPareja(this);

    this.expPublicaBeatriz = await publicar(
      this,
      this.expAgenteBeatriz,
      {
        titulo: 'Plan público de Beatriz',
        visibilidad: 'PUBLICA',
      }
    );

    this.expPrivadaBeatriz = await publicar(
      this,
      this.expAgenteBeatriz,
      {
        titulo: 'Plan privado de Beatriz',
        visibilidad: 'PRIVADA',
      }
    );
  }
);

Given(
  'que Ana no tiene amistad con Beatriz',
  async function () {
    const relaciones = await prisma.amistad.count({
      where: {
        OR: [
          {
            solicitanteId: this.expAna.id,
            destinatarioId: this.expBeatriz.id,
          },
          {
            solicitanteId: this.expBeatriz.id,
            destinatarioId: this.expAna.id,
          },
        ],
      },
    });

    assert.equal(relaciones, 0);
  }
);

When(
  'Ana consulta las experiencias publicadas por Beatriz',
  async function () {
    this.expRespuesta = await this.expAgenteAna
      .get('/api/experiencias')
      .query({
        autor: this.expBeatriz.nombreUsuario,
      });
  }
);

Then(
  'aparece el plan público de Beatriz',
  function () {
    assert.equal(this.expRespuesta.status, 200);

    const ids = this.expRespuesta.body.experiencias
      .map((e) => e.id);

    assert.ok(ids.includes(this.expPublicaBeatriz.id));
  }
);

Then(
  'no aparece el plan privado de Beatriz',
  function () {
    const ids = this.expRespuesta.body.experiencias
      .map((e) => e.id);

    assert.ok(!ids.includes(this.expPrivadaBeatriz.id));
  }
);

// =====================================================
// LIMPIEZA DE DATOS TEMPORALES
// =====================================================

After(async function () {
  const ids = this.bddExpUsuarios;

  if (!ids?.length) return;

  // Eliminar relaciones entre los usuarios temporales.
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

  // Eliminar experiencias de esos usuarios.
  await prisma.experiencia.deleteMany({
    where: {
      autorId: { in: ids },
    },
  });

  // Eliminar los usuarios creados para este escenario.
  await prisma.usuario.deleteMany({
    where: {
      id: { in: ids },
    },
  });
});

// No añadir AfterAll aquí.
// El archivo de autenticación ya desconecta Prisma.
