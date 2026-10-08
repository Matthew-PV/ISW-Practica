// CS-61, objetivo 11: criterio completo de amistades y seguimientos por HTTP.
// Los repositorios se simulan en memoria: las rutas y servicios se ejecutan de verdad.
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/amistadRepository');
jest.mock('../src/repositories/seguimientoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');

let usuarios;
let amistades;
let seguimientos;
let siguienteAmistadId;
let siguienteSeguimientoId;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secreta123', 4);
  usuarios = [
    { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash, foto: null },
    { id: 2, nombreUsuario: 'beatriz', email: 'bea@ejemplo.com', passwordHash, foto: null },
    { id: 3, nombreUsuario: 'carlos', email: 'carlos@ejemplo.com', passwordHash, foto: null },
    ...Array.from({ length: 22 }, (_, indice) => ({
      id: indice + 4,
      nombreUsuario: `ana_${indice + 1}`,
      email: `ana_${indice + 1}@ejemplo.com`,
      passwordHash,
      foto: null,
    })),
  ];
});

beforeEach(() => {
  jest.resetAllMocks();
  amistades = [];
  seguimientos = [];
  siguienteAmistadId = 1;
  siguienteSeguimientoId = 1;

  usuarioRepository.buscarPorEmail.mockImplementation(async (email) => usuarios.find((u) => u.email === email) ?? null);
  usuarioRepository.buscarPorId.mockImplementation(async (id) => usuarios.find((u) => u.id === id) ?? null);
  usuarioRepository.buscarPorNombre.mockImplementation(async (texto, usuarioExcluidoId) => usuarios
    .filter((u) => u.id !== usuarioExcluidoId && u.nombreUsuario.includes(texto))
    .slice(0, 20)
    .map(({ id, nombreUsuario, foto }) => ({ id, nombreUsuario, foto })));

  amistadRepository.crear.mockImplementation(async (solicitanteId, destinatarioId) => {
    const amistad = { id: siguienteAmistadId++, solicitanteId, destinatarioId, estado: 'PENDIENTE' };
    amistades.push(amistad);
    return amistad;
  });
  amistadRepository.buscarEntreUsuarios.mockImplementation(async (a, b) => amistades
    .find((amistad) => (amistad.solicitanteId === a && amistad.destinatarioId === b)
      || (amistad.solicitanteId === b && amistad.destinatarioId === a)) ?? null);
  amistadRepository.buscarPorId.mockImplementation(async (id) => amistades.find((amistad) => amistad.id === id) ?? null);
  amistadRepository.aceptar.mockImplementation(async (id) => {
    const amistad = amistades.find((item) => item.id === id);
    amistad.estado = 'ACEPTADA';
    return amistad;
  });
  amistadRepository.borrar.mockImplementation(async (id) => {
    const indice = amistades.findIndex((amistad) => amistad.id === id);
    return amistades.splice(indice, 1)[0];
  });
  amistadRepository.listarSolicitudesRecibidas.mockImplementation(async (destinatarioId) => amistades
    .filter((amistad) => amistad.destinatarioId === destinatarioId && amistad.estado === 'PENDIENTE')
    .map((amistad) => ({
      ...amistad,
      solicitante: (({ id, nombreUsuario, foto }) => ({ id, nombreUsuario, foto }))(
        usuarios.find((usuario) => usuario.id === amistad.solicitanteId)
      ),
    })));

  seguimientoRepository.sigueA.mockImplementation(async (seguidorId, seguidoId) => seguimientos
    .some((seguimiento) => seguimiento.seguidorId === seguidorId && seguimiento.seguidoId === seguidoId));
  seguimientoRepository.seguir.mockImplementation(async (seguidorId, seguidoId) => {
    const seguimiento = { id: siguienteSeguimientoId++, seguidorId, seguidoId };
    seguimientos.push(seguimiento);
    return seguimiento;
  });
  seguimientoRepository.dejarDeSeguir.mockImplementation(async (seguidorId, seguidoId) => {
    const indice = seguimientos.findIndex((seguimiento) => seguimiento.seguidorId === seguidorId && seguimiento.seguidoId === seguidoId);
    return seguimientos.splice(indice, 1)[0];
  });
});

async function agente(usuarioId) {
  const usuario = usuarios.find((item) => item.id === usuarioId);
  const cliente = request.agent(app);
  await cliente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return cliente;
}

test('sin sesión, todas las operaciones de CS-61 responden 401', async () => {
  const invitado = request(app);
  const respuestas = await Promise.all([
    invitado.get('/api/usuarios?texto=ana'),
    invitado.post('/api/amistades').send({ destinatarioId: 2 }),
    invitado.get('/api/amistades/solicitudes'),
    invitado.patch('/api/amistades/1').send({ aceptar: true }),
    invitado.delete('/api/amistades/1'),
    invitado.post('/api/seguimientos').send({ seguidoId: 2 }),
    invitado.delete('/api/seguimientos/2'),
  ]);

  expect(respuestas.map((respuesta) => respuesta.status)).toEqual([401, 401, 401, 401, 401, 401, 401]);
});

test('la búsqueda contiene el texto, excluye a quien busca, limita a 20 y no muestra emails', async () => {
  const ana = await agente(1);

  const respuesta = await ana.get('/api/usuarios?texto=ana');

  expect(respuesta.status).toBe(200);
  expect(respuesta.body).toHaveLength(20);
  expect(respuesta.body).not.toContainEqual(expect.objectContaining({ id: 1 }));
  expect(respuesta.body.every((usuario) => usuario.nombreUsuario.includes('ana') && usuario.email === undefined)).toBe(true);
});

test('la búsqueda sin texto responde 400 en lugar de devolver usuarios cualesquiera', async () => {
  const ana = await agente(1);

  const respuestas = await Promise.all([ana.get('/api/usuarios?texto='), ana.get('/api/usuarios')]);

  expect(respuestas.map((respuesta) => respuesta.status)).toEqual([400, 400]);
});

test('una solicitud pendiente aparece solo entre las recibidas del destinatario', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);

  expect((await ana.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(201);
  const recibidas = await beatriz.get('/api/amistades/solicitudes');

  expect(recibidas.status).toBe(200);
  expect(recibidas.body).toHaveLength(1);
  expect(recibidas.body[0]).toMatchObject({ estado: 'PENDIENTE', solicitante: { id: 1, nombreUsuario: 'ana' } });
  expect(recibidas.body[0].solicitante.email).toBeUndefined();
});

test('impide solicitudes a uno mismo y duplicadas en ambos sentidos', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);

  expect((await ana.post('/api/amistades').send({ destinatarioId: 1 })).status).toBe(400);
  expect((await ana.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(201);
  expect((await ana.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(400);
  expect((await beatriz.post('/api/amistades').send({ destinatarioId: 1 })).status).toBe(400);
});

test('solo el destinatario puede aceptar o rechazar una solicitud', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 2 })).body;

  expect((await ana.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true })).status).toBe(403);
  expect((await beatriz.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true })).body.estado).toBe('ACEPTADA');
});

test('al rechazar desaparece la solicitud y se puede enviar otra vez', async () => {
  const ana = await agente(1);
  const carlos = await agente(3);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 3 })).body;

  expect((await carlos.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: false })).status).toBe(200);
  expect((await carlos.get('/api/amistades/solicitudes')).body).toEqual([]);
  expect((await ana.post('/api/amistades').send({ destinatarioId: 3 })).status).toBe(201);
});

test('cualquiera de los dos puede eliminar una amistad aceptada', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 2 })).body;
  await beatriz.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true });

  expect((await ana.delete(`/api/amistades/${solicitud.id}`)).status).toBe(204);
  expect((await ana.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(201);
});

test('seguir es inmediato, no se duplica, no permite seguirse y no crea una amistad', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);

  expect((await ana.post('/api/seguimientos').send({ seguidoId: 2 })).status).toBe(201);
  expect((await ana.post('/api/seguimientos').send({ seguidoId: 2 })).status).toBe(400);
  expect((await ana.post('/api/seguimientos').send({ seguidoId: 1 })).status).toBe(400);
  // Seguir no cuenta como amistad: todavía se puede enviar una solicitud a esa persona.
  expect((await ana.post('/api/amistades').send({ destinatarioId: 2 })).status).toBe(201);
  expect((await beatriz.delete('/api/seguimientos/1')).status).toBe(404);
  expect((await ana.delete('/api/seguimientos/2')).status).toBe(204);
});

test('un identificador que no es un número entero responde 400 con un mensaje claro', async () => {
  const ana = await agente(1);

  const respuestas = await Promise.all([
    ana.patch('/api/amistades/abc').send({ aceptar: true }),
    ana.delete('/api/amistades/abc'),
    ana.delete('/api/seguimientos/abc'),
    ana.post('/api/amistades').send({ destinatarioId: '2' }),
    ana.post('/api/seguimientos').send({ seguidoId: 2.5 }),
  ]);

  expect(respuestas.map((respuesta) => [respuesta.status, respuesta.body.error])).toEqual([
    [400, 'El identificador de la solicitud de amistad no es válido'],
    [400, 'El identificador de la amistad no es válido'],
    [400, 'El identificador del usuario no es válido'],
    [400, 'El identificador del usuario no es válido'],
    [400, 'El identificador del usuario no es válido'],
  ]);
});

test.each([['el texto "si"', { aceptar: 'si' }], ['el número 1', { aceptar: 1 }], ['la ausencia del campo', {}]])(
  'aceptar con %s responde 400 y la solicitud sigue pendiente',
  async (_descripcion, cuerpo) => {
    const ana = await agente(1);
    const beatriz = await agente(2);
    const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 2 })).body;

    const respuesta = await beatriz.patch(`/api/amistades/${solicitud.id}`).send(cuerpo);

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe('Indica si aceptas la solicitud con true o false');
    expect((await beatriz.get('/api/amistades/solicitudes')).body).toHaveLength(1);
  }
);
