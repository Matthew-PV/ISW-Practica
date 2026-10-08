// CS-01: crear y modificar una valoración por HTTP.
// CS-63 y CS-48: rutas de consulta (mi valoración, todas y las de amigos y seguidores).
// El filtro de amigos y seguidores se prueba con MySQL real (tests/mysql/valoracionesExperiencia).
// Se simulan los repositorios, sin necesitar MySQL.

jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/experienciaRepository');

jest.mock('../../src/repositories/valoracionRepository', () => ({
  guardar: jest.fn(),
  listar: jest.fn(),
  listarDeRelacionados: jest.fn(),
  obtenerPorUsuarioYExperiencia: jest.fn(),
}));

// Sin amistades guardadas por defecto.
jest.mock('../../src/repositories/amistadRepository');

// Sin seguimientos guardados por defecto.
jest.mock('../../src/repositories/seguimientoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');

const usuarioRepository = require('../../src/repositories/usuarioRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');
const valoracionRepository = require('../../src/repositories/valoracionRepository');
const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');

let usuario;

// Valoraciones «guardadas», con la clave usuarioId-experienciaId.
let valoraciones;

// Seguimientos «guardados», con la clave seguidorId-seguidoId.
let seguimientos;

beforeAll(async () => {
  usuario = {
    id: 1,
    nombreUsuario: 'ana',
    email: 'ana@ejemplo.com',
    passwordHash: await bcrypt.hash('secreta123', 4),
  };
});

beforeEach(() => {
  jest.resetAllMocks();

  valoraciones = new Map();
  seguimientos = new Set();

  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);

  // 10: pública de otro autor.
  // 11: privada de otro autor.
  // 12: de amigos de otro autor.
  // 13: pública de la propia ana.
  const experiencias = {
    10: {
      id: 10,
      titulo: 'Tarde cultural',
      autorId: 2,
      visibilidad: 'PUBLICA',
    },
    11: {
      id: 11,
      titulo: 'Ruta secreta',
      autorId: 2,
      visibilidad: 'PRIVADA',
    },
    12: {
      id: 12,
      titulo: 'Cena entre amigos',
      autorId: 2,
      visibilidad: 'AMIGOS',
    },
    13: {
      id: 13,
      titulo: 'Mi paseo',
      autorId: 1,
      visibilidad: 'PUBLICA',
    },
  };

  experienciaRepository.buscarPorId.mockImplementation(
    async (id) => (
      experiencias[id]
        ? { ...experiencias[id] }
        : null
    )
  );

  // Igual que el repositorio real: crea si no existe y,
  // si existe, sustituye sus datos.
  valoracionRepository.guardar.mockImplementation(async (datos) => {
    const clave = `${datos.usuarioId}-${datos.experienciaId}`;
    const anterior = valoraciones.get(clave);

    const guardada = {
      id: anterior?.id ?? valoraciones.size + 1,
      ...datos,
    };

    valoraciones.set(clave, guardada);

    return {
      valoracion: { ...guardada },
      creada: !anterior,
    };
  });

  // Por defecto no hay valoraciones.
  valoracionRepository.listar.mockResolvedValue([]);
  valoracionRepository.listarDeRelacionados.mockResolvedValue([]);
  valoracionRepository.obtenerPorUsuarioYExperiencia.mockResolvedValue(null);

  // Necesario para las pruebas ya existentes de seguimiento.
  seguimientoRepository.sigueA.mockImplementation(
    async (a, b) => seguimientos.has(`${a}-${b}`)
  );

  seguimientoRepository.seguir.mockImplementation(
    async (a, b) => {
      seguimientos.add(`${a}-${b}`);

      return {
        id: seguimientos.size,
        seguidorId: a,
        seguidoId: b,
      };
    }
  );
});

// Devuelve un agente que conserva la cookie de sesión y ya está logueado.
async function agenteConSesion() {
  const agente = request.agent(app);

  const login = await agente
    .post('/api/auth/login')
    .send({
      email: usuario.email,
      password: 'secreta123',
    });

  expect(login.status).toBe(200);

  return agente;
}

describe('crear una valoración', () => {
  test('responde 201 con la valoración asociada al usuario de la sesión y a la experiencia', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 4,
        comentario: 'Muy recomendable',
      });

    expect(res.status).toBe(201);

    expect(res.body).toMatchObject({
      usuarioId: 1,
      experienciaId: 10,
      puntuacion: 4,
      comentario: 'Muy recomendable',
    });

    expect(valoraciones.size).toBe(1);
  });

  test('el usuario sale de la sesión: un usuarioId en el cuerpo se ignora', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 4,
        usuarioId: 99,
      });

    expect(res.status).toBe(201);
    expect(res.body.usuarioId).toBe(1);
  });
});

describe('modificar una valoración', () => {
  test('volver a valorar responde 200, actualiza la existente y sigue habiendo una sola', async () => {
    const agente = await agenteConSesion();

    const primera = await agente
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 4,
        comentario: 'Muy recomendable',
      });

    const res = await agente
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 2,
        comentario: 'Ha empeorado',
      });

    expect(res.status).toBe(200);

    expect(res.body).toMatchObject({
      id: primera.body.id,
      puntuacion: 2,
      comentario: 'Ha empeorado',
    });

    expect(valoraciones.size).toBe(1);
  });
});

describe('peticiones rechazadas: no se guarda nada', () => {
  test('sin sesión responde 401', async () => {
    const res = await request(app)
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 4,
      });

    expect(res.status).toBe(401);
    expect(valoraciones.size).toBe(0);
  });

  test('una puntuación fuera del rango 1-5 responde 400', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/10/valoracion')
      .send({
        puntuacion: 6,
      });

    expect(res.status).toBe(400);
    expect(valoraciones.size).toBe(0);
  });

  test('una experiencia inexistente responde 404', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/999/valoracion')
      .send({
        puntuacion: 4,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Contenido no disponible');
    expect(valoraciones.size).toBe(0);
  });

  test('una experiencia privada de otro usuario responde 404 con el mismo mensaje que una inexistente', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/11/valoracion')
      .send({
        puntuacion: 4,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Contenido no disponible');
    expect(valoraciones.size).toBe(0);
  });

  test('una experiencia de amigos sin ser amigo del autor responde 404', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/12/valoracion')
      .send({
        puntuacion: 4,
      });

    expect(res.status).toBe(404);
    expect(valoraciones.size).toBe(0);
  });

  test('el autor no puede valorar su propia experiencia: 403', async () => {
    const agente = await agenteConSesion();

    const res = await agente
      .put('/api/experiencias/13/valoracion')
      .send({
        puntuacion: 5,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      'No puedes valorar tu propia experiencia'
    );

    expect(valoraciones.size).toBe(0);
  });
});

describe('seguir a alguien no da acceso a sus experiencias de amigos', () => {
  test('ana sigue al autor, pero no es su amiga: valorar su experiencia de amigos responde 404', async () => {
    const agente = await agenteConSesion();

    const seguir = await agente
      .post('/api/seguimientos')
      .send({
        seguidoId: 2,
      });

    expect(seguir.status).toBe(201);

    const res = await agente
      .put('/api/experiencias/12/valoracion')
      .send({
        puntuacion: 4,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Contenido no disponible');
    expect(valoraciones.size).toBe(0);
  });
});

describe('consultar valoraciones - CS-63 y CS-48', () => {
  const VALORACION = { id: 7, puntuacion: 5, comentario: 'Genial', usuario: { id: 3, nombreUsuario: 'carlos', foto: null } };

  test('GET /valoracion devuelve mi valoración, o null si todavía no he valorado', async () => {
    const agente = await agenteConSesion();

    expect((await agente.get('/api/experiencias/10/valoracion')).body).toBeNull();
    valoracionRepository.obtenerPorUsuarioYExperiencia.mockResolvedValue({ id: 3, puntuacion: 4 });
    expect((await agente.get('/api/experiencias/10/valoracion')).body).toEqual({ id: 3, puntuacion: 4 });
    expect(valoracionRepository.obtenerPorUsuarioYExperiencia).toHaveBeenCalledWith(1, 10);
  });

  test.each([
    ['/valoraciones', 'listar', [10, 40, 3]],
    ['/valoraciones/amigos', 'listarDeRelacionados', [10, 1, 40, 3]],
  ])('GET %s pasa el cursor y el límite de la dirección y responde { valoraciones, siguiente }', async (ruta, metodo, argumentos) => {
    valoracionRepository[metodo].mockResolvedValue([VALORACION, { ...VALORACION, id: 6 }, { ...VALORACION, id: 5 }]);
    const agente = await agenteConSesion();

    const res = await agente.get(`/api/experiencias/10${ruta}?despuesDe=40&limite=2`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valoraciones: [VALORACION, { ...VALORACION, id: 6 }], siguiente: 6 });
    expect(valoracionRepository[metodo]).toHaveBeenCalledWith(...argumentos);
  });

  test.each(['/valoracion', '/valoraciones', '/valoraciones/amigos'])(
    'GET %s de una experiencia no visible responde 404 «Contenido no disponible»', async (ruta) => {
      const agente = await agenteConSesion();

      const res = await agente.get(`/api/experiencias/11${ruta}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contenido no disponible');
    }
  );

  test('una paginación no válida responde 400', async () => {
    const agente = await agenteConSesion();

    const res = await agente.get('/api/experiencias/10/valoraciones/amigos?limite=0');

    expect(res.status).toBe(400);
    expect(valoracionRepository.listarDeRelacionados).not.toHaveBeenCalled();
  });

  test.each(['/valoracion', '/valoraciones', '/valoraciones/amigos'])('sin sesión, GET %s responde 401', async (ruta) => {
    const res = await request(app).get(`/api/experiencias/10${ruta}`);

    expect(res.status).toBe(401);
  });
});
