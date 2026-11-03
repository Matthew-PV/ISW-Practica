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
    'BDD de búsqueda solo permite 127.0.0.1:3308/planb'
  );
}

process.env.SESSION_SECRET ??= 'clave-local-exclusiva-para-bdd';

const app = require('../../src/app');
const prisma = require('../../src/repositories/shared/prisma');

const PASSWORD = 'Correcta123';

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function identificador() {
  return crypto.randomBytes(6).toString('hex');
}

async function crearUsuario(mundo, prefijo) {
  const nombreUsuario = `bddbusq_${prefijo}_${identificador()}`;

  const usuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      email: `${nombreUsuario}@prueba.local`,
      passwordHash: await bcrypt.hash(PASSWORD, 4),
    },
  });

  mundo.busqUsuarios ??= [];
  mundo.busqUsuarios.push(usuario.id);

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
  if (mundo.busqAna) return;

  mundo.busqMarca = `bddbusq_${identificador()}`;

  mundo.busqMadrid = await prisma.ciudad.findFirst({
    where: {
      nombre: 'Madrid',
      codigoPais: 'ES',
    },
  });

  assert.ok(
    mundo.busqMadrid,
    'No existe Madrid en el catálogo local de ciudades'
  );

  mundo.busqOtraCiudad = await prisma.ciudad.findFirst({
    where: {
      id: { not: mundo.busqMadrid.id },
    },
    orderBy: { id: 'asc' },
  });

  assert.ok(
    mundo.busqOtraCiudad,
    'Se necesita una segunda ciudad para probar el filtro'
  );

  mundo.busqAna = await crearUsuario(mundo, 'ana');
  mundo.busqAgenteAna = await iniciarSesion(mundo.busqAna);
}

async function crearExperiencia(mundo, autor, opciones = {}) {
  const experiencia = await prisma.experiencia.create({
    data: {
      titulo: `${mundo.busqMarca} ${opciones.titulo ?? 'Plan'}`,
      descripcion: opciones.descripcion ?? 'Experiencia de prueba BDD',
      ciudadId: opciones.ciudadId ?? mundo.busqMadrid.id,
      tipo: opciones.tipo ?? null,
      momentoAdecuado: opciones.momentoAdecuado ?? null,
      visibilidad: opciones.visibilidad ?? 'PUBLICA',
      autorId: autor.id,
    },
  });

  mundo.busqExperiencias ??= [];
  mundo.busqExperiencias.push(experiencia.id);

  return experiencia;
}

async function buscar(mundo, filtros = {}) {
  mundo.busqRespuesta = await mundo.busqAgenteAna
    .get('/api/experiencias')
    .query({
      texto: mundo.busqMarca,
      ...filtros,
    });

  return mundo.busqRespuesta;
}

function obtenerIds(mundo) {
  assert.equal(
    mundo.busqRespuesta.status,
    200,
    JSON.stringify(mundo.busqRespuesta.body)
  );

  assert.ok(
    Array.isArray(mundo.busqRespuesta.body.experiencias)
  );

  return mundo.busqRespuesta.body.experiencias
    .map((experiencia) => experiencia.id);
}

function comprobarIdsExactos(mundo, esperados) {
  const obtenidos = obtenerIds(mundo);

  assert.equal(obtenidos.length, esperados.length);

  assert.deepEqual(
    new Set(obtenidos),
    new Set(esperados)
  );
}

async function crearAmistadAceptada(mundo) {
  const a = mundo.busqAna.id;
  const b = mundo.busqBeatriz.id;

  return prisma.amistad.create({
    data: {
      solicitanteId: a,
      destinatarioId: b,
      estado: 'ACEPTADA',
      parejaClave: `${Math.min(a, b)}-${Math.max(a, b)}`,
    },
  });
}

// =====================================================
// PREPARACIÓN DE BÚSQUEDA
// =====================================================

Given(
  'que Ana ha iniciado sesión para buscar experiencias',
  async function () {
    await prepararAna(this);
  }
);

// =====================================================
// BÚSQUEDA POR TEXTO
// =====================================================

Given(
  'que existen planes de prueba de distintas temáticas',
  async function () {
    this.busqMuseoTitulo = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: `museo ${this.busqMarca} histórico`,
        descripcion: 'Visita cultural',
      }
    );

    this.busqMuseoDescripcion = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Ruta urbana',
        descripcion: `Visita al museo ${this.busqMarca}`,
      }
    );

    this.busqSinMuseo = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Sendero natural',
        descripcion: 'Paseo por el bosque',
      }
    );
  }
);

When(
  'Ana busca planes que mencionan un museo',
  async function () {
    await buscar(this, {
      texto: `museo ${this.busqMarca}`,
    });
  }
);

Then(
  'aparecen los planes de museo esperados',
  function () {
    comprobarIdsExactos(this, [
      this.busqMuseoTitulo.id,
      this.busqMuseoDescripcion.id,
    ]);
  }
);

Then(
  'no aparecen los planes que no coinciden con el texto',
  function () {
    const ids = obtenerIds(this);

    assert.ok(!ids.includes(this.busqSinMuseo.id));
  }
);

// =====================================================
// FILTRO POR CIUDAD
// =====================================================

Given(
  'que existen planes de prueba en Madrid y otra ciudad',
  async function () {
    this.busqPlanMadrid = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Plan en Madrid',
        ciudadId: this.busqMadrid.id,
      }
    );

    this.busqPlanOtraCiudad = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Plan en otra ciudad',
        ciudadId: this.busqOtraCiudad.id,
      }
    );
  }
);

When(
  'Ana filtra los planes de prueba por Madrid',
  async function () {
    await buscar(this, {
      ciudadId: this.busqMadrid.id,
    });
  }
);

Then(
  'solo aparecen los planes de prueba de Madrid',
  function () {
    comprobarIdsExactos(this, [
      this.busqPlanMadrid.id,
    ]);

    for (const experiencia of this.busqRespuesta.body.experiencias) {
      assert.equal(
        experiencia.ciudadId,
        this.busqMadrid.id
      );
    }
  }
);

// =====================================================
// FILTRO POR CATEGORÍA
// =====================================================

Given(
  'que existen planes de Cultura y Naturaleza para buscar',
  async function () {
    this.busqCultura = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Visita cultural',
        tipo: 'Cultura',
      }
    );

    this.busqNaturaleza = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Excursión natural',
        tipo: 'Naturaleza',
      }
    );
  }
);

When(
  'Ana filtra los planes de prueba por Cultura',
  async function () {
    await buscar(this, {
      categoria: 'Cultura',
    });
  }
);

Then(
  'aparecen únicamente los planes de Cultura',
  function () {
    comprobarIdsExactos(this, [
      this.busqCultura.id,
    ]);

    const [experiencia] =
      this.busqRespuesta.body.experiencias;

    assert.equal(experiencia.tipo, 'Cultura');
  }
);

// =====================================================
// FILTROS COMBINADOS
// =====================================================

Given(
  'que existen planes con distintas ciudades y categorías',
  async function () {
    this.busqMadridGastronomia = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Restaurante en Madrid',
        ciudadId: this.busqMadrid.id,
        tipo: 'Gastronomía',
      }
    );

    this.busqMadridCultura = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Museo en Madrid',
        ciudadId: this.busqMadrid.id,
        tipo: 'Cultura',
      }
    );

    this.busqOtraGastronomia = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Restaurante en otra ciudad',
        ciudadId: this.busqOtraCiudad.id,
        tipo: 'Gastronomía',
      }
    );
  }
);

When(
  'Ana filtra por Madrid y Gastronomía',
  async function () {
    await buscar(this, {
      ciudadId: this.busqMadrid.id,
      categoria: 'Gastronomía',
    });
  }
);

Then(
  'aparecen únicamente los planes que cumplen ambos filtros',
  function () {
    comprobarIdsExactos(this, [
      this.busqMadridGastronomia.id,
    ]);

    const [experiencia] =
      this.busqRespuesta.body.experiencias;

    assert.equal(experiencia.ciudadId, this.busqMadrid.id);
    assert.equal(experiencia.tipo, 'Gastronomía');
  }
);

// =====================================================
// FILTRO DE AMIGOS
// =====================================================

Given(
  'que Beatriz es amiga de Ana para la búsqueda',
  async function () {
    this.busqBeatriz = await crearUsuario(this, 'bea');

    await crearAmistadAceptada(this);
  }
);

Given(
  'que Carlos no es amigo de Ana para la búsqueda',
  async function () {
    this.busqCarlos = await crearUsuario(this, 'carlos');

    const cantidad = await prisma.amistad.count({
      where: {
        OR: [
          {
            solicitanteId: this.busqAna.id,
            destinatarioId: this.busqCarlos.id,
          },
          {
            solicitanteId: this.busqCarlos.id,
            destinatarioId: this.busqAna.id,
          },
        ],
      },
    });

    assert.equal(cantidad, 0);
  }
);

Given(
  'que Beatriz y Carlos tienen planes públicos de prueba',
  async function () {
    this.busqPlanBeatriz = await crearExperiencia(
      this,
      this.busqBeatriz,
      {
        titulo: 'Plan de Beatriz',
      }
    );

    this.busqPlanCarlos = await crearExperiencia(
      this,
      this.busqCarlos,
      {
        titulo: 'Plan de Carlos',
      }
    );
  }
);

When(
  'Ana activa el filtro de experiencias de amigos',
  async function () {
    await buscar(this, {
      amigos: 'true',
    });
  }
);

Then(
  'aparecen los planes de Beatriz',
  function () {
    comprobarIdsExactos(this, [
      this.busqPlanBeatriz.id,
    ]);
  }
);

Then(
  'no aparecen los planes de Carlos',
  function () {
    const ids = obtenerIds(this);

    assert.ok(!ids.includes(this.busqPlanCarlos.id));
  }
);

// =====================================================
// VISIBILIDAD
// =====================================================

Given(
  'que existen planes públicos y privados de prueba',
  async function () {
    this.busqOtroAutor = await crearUsuario(this, 'otro');

    this.busqPublicaAjena = await crearExperiencia(
      this,
      this.busqOtroAutor,
      {
        titulo: 'Plan público ajeno',
        visibilidad: 'PUBLICA',
      }
    );

    this.busqPrivadaAjena = await crearExperiencia(
      this,
      this.busqOtroAutor,
      {
        titulo: 'Plan privado ajeno',
        visibilidad: 'PRIVADA',
      }
    );

    this.busqPrivadaPropia = await crearExperiencia(
      this,
      this.busqAna,
      {
        titulo: 'Plan privado propio',
        visibilidad: 'PRIVADA',
      }
    );
  }
);

When(
  'Ana busca todas las experiencias de prueba',
  async function () {
    await buscar(this);
  }
);

Then(
  'aparecen los planes públicos y los privados propios',
  function () {
    comprobarIdsExactos(this, [
      this.busqPublicaAjena.id,
      this.busqPrivadaPropia.id,
    ]);
  }
);

Then(
  'no aparecen los planes privados ajenos',
  function () {
    const ids = obtenerIds(this);

    assert.ok(!ids.includes(this.busqPrivadaAjena.id));
  }
);

// =====================================================
// PAGINACIÓN
// =====================================================

Given(
  'que existen cinco experiencias visibles de prueba',
  async function () {
    this.busqCincoPlanes = [];

    for (let i = 1; i <= 5; i++) {
      const experiencia = await crearExperiencia(
        this,
        this.busqAna,
        {
          titulo: `Plan número ${i}`,
        }
      );

      this.busqCincoPlanes.push(experiencia.id);
    }
  }
);

When(
  'Ana carga todas las páginas de dos resultados',
  async function () {
    this.busqPaginas = [];

    let cursor = null;

    for (let intento = 0; intento < 10; intento++) {
      const filtros = { limite: 2 };

      if (cursor !== null) {
        filtros.despuesDe = cursor;
      }

      const respuesta = await buscar(this, filtros);

      assert.equal(respuesta.status, 200);

      this.busqPaginas.push(respuesta.body);

      if (respuesta.body.siguiente === null) {
        break;
      }

      cursor = respuesta.body.siguiente;
    }

    assert.equal(
      this.busqPaginas.at(-1).siguiente,
      null,
      'La paginación no ha terminado correctamente'
    );
  }
);

Then(
  'obtiene las cinco experiencias de prueba',
  function () {
    const obtenidos = this.busqPaginas.flatMap(
      (pagina) => pagina.experiencias.map((e) => e.id)
    );

    assert.equal(obtenidos.length, 5);

    assert.deepEqual(
      obtenidos,
      [...this.busqCincoPlanes].reverse()
    );

    assert.equal(this.busqPaginas.length, 3);
  }
);

Then(
  'no se repite ninguna experiencia entre páginas',
  function () {
    const obtenidos = this.busqPaginas.flatMap(
      (pagina) => pagina.experiencias.map((e) => e.id)
    );

    assert.equal(
      new Set(obtenidos).size,
      obtenidos.length
    );

    assert.deepEqual(
      new Set(obtenidos),
      new Set(this.busqCincoPlanes)
    );
  }
);

// =====================================================
// BÚSQUEDA SIN RESULTADOS
// =====================================================

When(
  'Ana busca un texto sin coincidencias',
  async function () {
    await buscar(this, {
      texto: `sincoincidencias_${this.busqMarca}`,
    });
  }
);

Then(
  'recibe una lista de experiencias vacía',
  function () {
    assert.equal(this.busqRespuesta.status, 200);

    assert.deepEqual(
      this.busqRespuesta.body.experiencias,
      []
    );
  }
);

Then(
  'la búsqueda termina sin error',
  function () {
    assert.equal(this.busqRespuesta.status, 200);
    assert.equal(this.busqRespuesta.body.siguiente, null);
  }
);

// =====================================================
// FILTRO NO VÁLIDO
// =====================================================

When(
  'Ana intenta buscar con una categoría no permitida',
  async function () {
    await buscar(this, {
      categoria: 'CategoriaNoPermitidaBDD',
    });
  }
);

Then(
  'la búsqueda devuelve un error 400',
  function () {
    assert.equal(this.busqRespuesta.status, 400);
    assert.ok(this.busqRespuesta.body.error);
  }
);

// =====================================================
// SIN SESIÓN
// =====================================================

Given(
  'que Ana intenta buscar sin iniciar sesión',
  function () {
    this.busqAgenteInvitado = request.agent(app);
  }
);

When(
  'solicita el listado de experiencias sin sesión',
  async function () {
    this.busqRespuesta = await this.busqAgenteInvitado
      .get('/api/experiencias');
  }
);

Then(
  'la búsqueda devuelve un error 401',
  function () {
    assert.equal(this.busqRespuesta.status, 401);
  }
);

// =====================================================
// LIMPIEZA
// =====================================================

After(async function () {
  const ids = this.busqUsuarios;

  if (!ids?.length) return;

  // Se borran solo los datos creados por este escenario.
  if (this.busqExperiencias?.length) {
    await prisma.valoracion.deleteMany({
      where: {
        experienciaId: { in: this.busqExperiencias },
      },
    });

    await prisma.experiencia.deleteMany({
      where: {
        id: { in: this.busqExperiencias },
      },
    });
  }

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

  await prisma.tokenRecuperacion.deleteMany({
    where: {
      usuarioId: { in: ids },
    },
  });

  await prisma.usuario.deleteMany({
    where: {
      id: { in: ids },
    },
  });
});

// La desconexión de Prisma ya está configurada
// en autenticacion.steps.js.
