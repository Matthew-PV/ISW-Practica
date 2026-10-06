// CS-48, objetivo 9: criterio completo de valoraciones de amigos y seguidores por HTTP.
// Los repositorios se simulan en memoria: las rutas y servicios se ejecutan de verdad.

jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/experienciaRepository');
jest.mock('../src/repositories/valoracionRepository');
jest.mock('../src/repositories/amistadRepository');
jest.mock('../src/repositories/seguimientoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');

const usuarioRepository = require('../src/repositories/usuarioRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const valoracionRepository = require('../src/repositories/valoracionRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');

let usuarios;
let experiencias;
let amistades;
let seguimientos;
let valoraciones;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secreta123', 4);

  usuarios = [
    {
      id: 1,
      nombreUsuario: 'ana',
      email: 'ana@ejemplo.com',
      passwordHash,
      foto: null,
    },
    {
      id: 2,
      nombreUsuario: 'beatriz',
      email: 'bea@ejemplo.com',
      passwordHash,
      foto: null,
    },
    {
      id: 3,
      nombreUsuario: 'carlos',
      email: 'carlos@ejemplo.com',
      passwordHash,
      foto: null,
    },
    {
      id: 4,
      nombreUsuario: 'david',
      email: 'david@ejemplo.com',
      passwordHash,
      foto: null,
    },
    {
      id: 5,
      nombreUsuario: 'elena',
      email: 'elena@ejemplo.com',
      passwordHash,
      foto: null,
    },
  ];
});

beforeEach(() => {
  jest.resetAllMocks();

  experiencias = [
    {
      id: 10,
      titulo: 'Tarde cultural',
      autorId: 5,
      visibilidad: 'PUBLICA',
    },
    {
      id: 11,
      titulo: 'Plan privado',
      autorId: 5,
      visibilidad: 'PRIVADA',
    },
  ];

  amistades = [];
  seguimientos = [];
  valoraciones = [];

  usuarioRepository.buscarPorEmail.mockImplementation(
    async (email) =>
      usuarios.find((usuario) => usuario.email === email) ?? null
  );

  usuarioRepository.buscarPorId.mockImplementation(
    async (id) =>
      usuarios.find((usuario) => usuario.id === id) ?? null
  );

  experienciaRepository.buscarPorId.mockImplementation(
    async (id) =>
      experiencias.find((experiencia) => experiencia.id === id) ?? null
  );

  // Relación de amistad entre dos usuarios, en cualquiera de los dos sentidos.
  amistadRepository.buscarEntreUsuarios.mockImplementation(
    async (usuarioAId, usuarioBId) =>
      amistades.find(
        (amistad) =>
          (
            amistad.solicitanteId === usuarioAId &&
            amistad.destinatarioId === usuarioBId
          ) ||
          (
            amistad.solicitanteId === usuarioBId &&
            amistad.destinatarioId === usuarioAId
          )
      ) ?? null
  );

  // IDs de las amistades aceptadas del solicitante.
  amistadRepository.listarAmigosIds.mockImplementation(
    async (usuarioId) =>
      amistades
        .filter(
          (amistad) =>
            amistad.estado === 'ACEPTADA' &&
            (
              amistad.solicitanteId === usuarioId ||
              amistad.destinatarioId === usuarioId
            )
        )
        .map((amistad) =>
          amistad.solicitanteId === usuarioId
            ? amistad.destinatarioId
            : amistad.solicitanteId
        )
  );

  // IDs de quienes siguen al solicitante.
  seguimientoRepository.listarSeguidoresIds.mockImplementation(
    async (usuarioId) =>
      seguimientos
        .filter(
          (seguimiento) =>
            seguimiento.seguidoId === usuarioId
        )
        .map(
          (seguimiento) =>
            seguimiento.seguidorId
        )
  );

  // Igual que el repositorio real:
  // filtra por experiencia y usuarios relacionados y después pagina.
  valoracionRepository.listarDeUsuarios.mockImplementation(
    async (experienciaId, usuarioIds, pagina, limite) => {
      const filtradas = valoraciones.filter(
        (valoracion) =>
          valoracion.experienciaId === experienciaId &&
          usuarioIds.includes(valoracion.usuarioId)
      );

      const inicio = (pagina - 1) * limite;

      const paginaValoraciones = filtradas
        .slice(inicio, inicio + limite)
        .map((valoracion) => {
          const usuario = usuarios.find(
            (item) => item.id === valoracion.usuarioId
          );

          return {
            ...valoracion,
            usuario: {
              id: usuario.id,
              nombreUsuario: usuario.nombreUsuario,
              foto: usuario.foto,
            },
          };
        });

      return {
        valoraciones: paginaValoraciones,
        total: filtradas.length,
      };
    }
  );
});

async function agente(usuarioId) {
  const usuario = usuarios.find(
    (item) => item.id === usuarioId
  );

  const cliente = request.agent(app);

  const login = await cliente
    .post('/api/auth/login')
    .send({
      email: usuario.email,
      password: 'secreta123',
    });

  expect(login.status).toBe(200);

  return cliente;
}

test('muestra valoraciones de amigos y seguidores y excluye a personas no relacionadas', async () => {
  const ana = await agente(1);

  // Beatriz es amiga de Ana.
  amistades.push({
    id: 1,
    solicitanteId: 1,
    destinatarioId: 2,
    estado: 'ACEPTADA',
  });

  // Carlos sigue a Ana.
  seguimientos.push({
    id: 1,
    seguidorId: 3,
    seguidoId: 1,
  });

  // David no es ni amigo ni seguidor.
  valoraciones.push(
    {
      id: 20,
      usuarioId: 2,
      experienciaId: 10,
      puntuacion: 5,
      comentario: 'Valoración de una amiga',
    },
    {
      id: 21,
      usuarioId: 3,
      experienciaId: 10,
      puntuacion: 4,
      comentario: 'Valoración de un seguidor',
    },
    {
      id: 22,
      usuarioId: 4,
      experienciaId: 10,
      puntuacion: 1,
      comentario: 'Esta no debe aparecer',
    }
  );

  const respuesta = await ana
    .get('/api/experiencias/10/valoracion');

  expect(respuesta.status).toBe(200);

  expect(respuesta.body.total).toBe(2);

  expect(
    respuesta.body.valoraciones.map(
      (valoracion) => valoracion.usuarioId
    )
  ).toEqual([2, 3]);

  expect(
    respuesta.body.valoraciones
  ).not.toContainEqual(
    expect.objectContaining({
      usuarioId: 4,
    })
  );

  expect(
    respuesta.body.valoraciones[0]
  ).toMatchObject({
    puntuacion: 5,
    comentario: 'Valoración de una amiga',
    usuario: {
      id: 2,
      nombreUsuario: 'beatriz',
    },
  });

  expect(
    respuesta.body.valoraciones[1]
  ).toMatchObject({
    puntuacion: 4,
    comentario: 'Valoración de un seguidor',
    usuario: {
      id: 3,
      nombreUsuario: 'carlos',
    },
  });
});

test('si ningún amigo o seguidor ha valorado devuelve la sección vacía sin error', async () => {
  const ana = await agente(1);

  amistades.push({
    id: 1,
    solicitanteId: 1,
    destinatarioId: 2,
    estado: 'ACEPTADA',
  });

  const respuesta = await ana
    .get('/api/experiencias/10/valoracion');

  expect(respuesta.status).toBe(200);

  expect(respuesta.body).toEqual({
    valoraciones: [],
    total: 0,
    pagina: 1,
    limite: 10,
  });
});

test('una experiencia que no es visible para el usuario responde 403', async () => {
  const ana = await agente(1);

  const respuesta = await ana
    .get('/api/experiencias/11/valoracion');

  expect(respuesta.status).toBe(403);

  expect(respuesta.body.error).toBe(
    'No tienes permiso para ver esta experiencia'
  );

  expect(
    valoracionRepository.listarDeUsuarios
  ).not.toHaveBeenCalled();
});

test('una valoración nueva de un amigo aparece en la siguiente consulta', async () => {
  const ana = await agente(1);

  amistades.push({
    id: 1,
    solicitanteId: 1,
    destinatarioId: 2,
    estado: 'ACEPTADA',
  });

  const primera = await ana
    .get('/api/experiencias/10/valoracion');

  expect(primera.status).toBe(200);
  expect(primera.body.valoraciones).toEqual([]);

  valoraciones.push({
    id: 30,
    usuarioId: 2,
    experienciaId: 10,
    puntuacion: 5,
    comentario: 'Acabo de añadirla',
  });

  const segunda = await ana
    .get('/api/experiencias/10/valoracion');

  expect(segunda.status).toBe(200);
  expect(segunda.body.total).toBe(1);

  expect(
    segunda.body.valoraciones[0]
  ).toMatchObject({
    usuarioId: 2,
    puntuacion: 5,
    comentario: 'Acabo de añadirla',
    usuario: {
      nombreUsuario: 'beatriz',
    },
  });
});

test('sin sesión no permite consultar las valoraciones relacionadas', async () => {
  const respuesta = await request(app)
    .get('/api/experiencias/10/valoracion');

  expect(respuesta.status).toBe(401);
});