// CS-45, objetivo 6: criterio completo de contadores y listados del perfil propio por HTTP.
// Los repositorios se simulan en memoria: las rutas y servicios se ejecutan de verdad.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/amistadRepository');
jest.mock('../../src/repositories/seguimientoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');

const FOTO_POR_DEFECTO = '/img/foto-por-defecto.svg';
const SIN_RELACIONES = { amigos: 0, seguidores: 0 };

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
    // 25 usuarios más (ids 4 a 28) para probar la paginación
    ...Array.from({ length: 25 }, (_, indice) => ({
      id: indice + 4,
      nombreUsuario: `seguidor_${indice + 1}`,
      email: `seguidor_${indice + 1}@ejemplo.com`,
      passwordHash,
      foto: null,
    })),
  ];
});

// Datos públicos de un usuario, como los devuelven los repositorios reales (sin email).
function datosPublicos(usuarioId) {
  const { id, nombreUsuario, foto } = usuarios.find((usuario) => usuario.id === usuarioId);
  return { id, nombreUsuario, foto };
}

// Amistades aceptadas de un usuario, las haya enviado o recibido.
function amistadesAceptadas(usuarioId) {
  return amistades.filter((amistad) => amistad.estado === 'ACEPTADA'
    && (amistad.solicitanteId === usuarioId || amistad.destinatarioId === usuarioId));
}

// Página por cursor, como la consulta real: de id mayor a menor, solo las anteriores a
// `despuesDe` (si se indica) y como mucho `cantidad` filas.
function paginaPorCursor(filas, despuesDe, cantidad) {
  return filas
    .filter((fila) => despuesDe === null || fila.id < despuesDe)
    .sort((a, b) => b.id - a.id)
    .slice(0, cantidad);
}

beforeEach(() => {
  jest.resetAllMocks();
  amistades = [];
  seguimientos = [];
  siguienteAmistadId = 1;
  siguienteSeguimientoId = 1;

  usuarioRepository.buscarPorEmail.mockImplementation(async (email) => usuarios.find((u) => u.email === email) ?? null);
  usuarioRepository.buscarPorId.mockImplementation(async (id) => usuarios.find((u) => u.id === id) ?? null);

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
  amistadRepository.contarAmigos.mockImplementation(async (usuarioId) => amistadesAceptadas(usuarioId).length);
  amistadRepository.listarAmigos.mockImplementation(async (usuarioId, despuesDe, cantidad) => paginaPorCursor(
    amistadesAceptadas(usuarioId), despuesDe, cantidad
  ).map((amistad) => ({
    id: amistad.id,
    persona: datosPublicos(amistad.solicitanteId === usuarioId ? amistad.destinatarioId : amistad.solicitanteId),
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
  seguimientoRepository.contarSeguidores.mockImplementation(async (seguidoId) => seguimientos
    .filter((seguimiento) => seguimiento.seguidoId === seguidoId).length);
  seguimientoRepository.listarSeguidores.mockImplementation(async (usuarioId, despuesDe, cantidad) => paginaPorCursor(
    seguimientos.filter((seguimiento) => seguimiento.seguidoId === usuarioId), despuesDe, cantidad
  ).map((seguimiento) => ({ id: seguimiento.id, persona: datosPublicos(seguimiento.seguidorId) })));
});

async function agente(usuarioId) {
  const usuario = usuarios.find((item) => item.id === usuarioId);
  const cliente = request.agent(app);
  await cliente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return cliente;
}

// Contadores que ve un usuario en su perfil.
async function resumen(cliente) {
  return (await cliente.get('/api/perfil/resumen')).body;
}

test('un usuario sin amigos ni seguidores ve ceros y listas vacías, sin error', async () => {
  const ana = await agente(1);

  const amigos = await ana.get('/api/perfil/amigos');
  const seguidores = await ana.get('/api/perfil/seguidores');

  expect(await resumen(ana)).toEqual(SIN_RELACIONES);
  expect(amigos.status).toBe(200);
  expect(amigos.body).toEqual({ personas: [], siguiente: null });
  expect(seguidores.status).toBe(200);
  expect(seguidores.body).toEqual({ personas: [], siguiente: null });
});

test('una solicitud pendiente no cuenta; al aceptarla, los dos suben en uno', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 2 })).body;

  expect(await resumen(ana)).toEqual(SIN_RELACIONES);
  expect(await resumen(beatriz)).toEqual(SIN_RELACIONES);

  await beatriz.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true });

  expect(await resumen(ana)).toEqual({ amigos: 1, seguidores: 0 });
  expect(await resumen(beatriz)).toEqual({ amigos: 1, seguidores: 0 });
  expect((await ana.get('/api/perfil/amigos')).body).toEqual({
    personas: [{ id: 2, nombreUsuario: 'beatriz', foto: FOTO_POR_DEFECTO }],
    siguiente: null,
  });
});

test('una solicitud rechazada no cuenta', async () => {
  const ana = await agente(1);
  const carlos = await agente(3);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 3 })).body;

  await carlos.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: false });

  expect(await resumen(ana)).toEqual(SIN_RELACIONES);
  expect(await resumen(carlos)).toEqual(SIN_RELACIONES);
});

test('al eliminar una amistad, la cifra baja en uno para los dos', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);
  const solicitud = (await ana.post('/api/amistades').send({ destinatarioId: 2 })).body;
  await beatriz.patch(`/api/amistades/${solicitud.id}`).send({ aceptar: true });
  expect((await resumen(ana)).amigos).toBe(1);

  await ana.delete(`/api/amistades/${solicitud.id}`);

  expect(await resumen(ana)).toEqual(SIN_RELACIONES);
  expect(await resumen(beatriz)).toEqual(SIN_RELACIONES);
  expect((await beatriz.get('/api/perfil/amigos')).body.personas).toEqual([]);
});

test('seguir sube en uno los seguidores del seguido y dejar de seguir los baja', async () => {
  const ana = await agente(1);
  const beatriz = await agente(2);

  await ana.post('/api/seguimientos').send({ seguidoId: 2 });

  // Cuenta para la persona seguida, no para quien sigue, y no crea una amistad.
  expect(await resumen(beatriz)).toEqual({ amigos: 0, seguidores: 1 });
  expect(await resumen(ana)).toEqual(SIN_RELACIONES);
  expect((await beatriz.get('/api/perfil/seguidores')).body.personas).toEqual([
    { id: 1, nombreUsuario: 'ana', foto: FOTO_POR_DEFECTO },
  ]);

  await ana.delete('/api/seguimientos/2');

  expect(await resumen(beatriz)).toEqual(SIN_RELACIONES);
});

test('el listado de seguidores se pagina sin repetir personas', async () => {
  // Preparación directa en memoria: los usuarios 4 a 28 siguen a Ana (25 seguidores).
  for (let seguidorId = 4; seguidorId <= 28; seguidorId += 1) {
    seguimientos.push({ id: siguienteSeguimientoId++, seguidorId, seguidoId: 1 });
  }
  const ana = await agente(1);

  const primera = (await ana.get('/api/perfil/seguidores?limite=20')).body;
  const segunda = (await ana.get(`/api/perfil/seguidores?limite=20&despuesDe=${primera.siguiente}`)).body;

  expect(await resumen(ana)).toEqual({ amigos: 0, seguidores: 25 });
  expect(primera.personas).toHaveLength(20);
  expect(segunda.personas).toHaveLength(5);
  expect(segunda.siguiente).toBeNull();
  const ids = [...primera.personas, ...segunda.personas].map((persona) => persona.id);
  expect(new Set(ids).size).toBe(25);
});