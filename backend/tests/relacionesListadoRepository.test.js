// CS-45, objetivos 1 y 3: listados paginados (por cursor) de amigos y seguidores.
jest.mock('../src/repositories/shared/prisma', () => ({
  amistad: { findMany: jest.fn() },
  seguimiento: { findMany: jest.fn() },
}));

const prisma = require('../src/repositories/shared/prisma');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');

const DATOS_PUBLICOS = { id: true, nombreUsuario: true, foto: true };
const YO = { id: 7, nombreUsuario: 'yo', foto: null };
const ANA = { id: 2, nombreUsuario: 'ana', foto: null };
const LUIS = { id: 3, nombreUsuario: 'luis', foto: null };

beforeEach(() => jest.resetAllMocks());

test('listarAmigos pide las amistades aceptadas anteriores al cursor, sin emails y de la más reciente a la más antigua', async () => {
  prisma.amistad.findMany.mockResolvedValue([]);

  await amistadRepository.listarAmigos(7, 40, 21);

  expect(prisma.amistad.findMany).toHaveBeenCalledWith({
    where: {
      estado: 'ACEPTADA',
      OR: [{ solicitanteId: 7 }, { destinatarioId: 7 }],
      id: { lt: 40 },
    },
    select: {
      id: true,
      solicitanteId: true,
      solicitante: { select: DATOS_PUBLICOS },
      destinatario: { select: DATOS_PUBLICOS },
    },
    orderBy: { id: 'desc' },
    take: 21,
  });
});

test('listarAmigos sin cursor empieza por la amistad más reciente', async () => {
  prisma.amistad.findMany.mockResolvedValue([]);

  await amistadRepository.listarAmigos(7, null, 21);

  expect(prisma.amistad.findMany.mock.calls[0][0].where).not.toHaveProperty('id');
});

test('listarAmigos devuelve a la otra persona de cada amistad, la enviara quien la enviara, con el id de la amistad', async () => {
  prisma.amistad.findMany.mockResolvedValue([
    { id: 9, solicitanteId: 7, solicitante: YO, destinatario: ANA },
    { id: 8, solicitanteId: 3, solicitante: LUIS, destinatario: YO },
  ]);

  await expect(amistadRepository.listarAmigos(7, null, 20)).resolves.toEqual([
    { id: 9, persona: ANA }, { id: 8, persona: LUIS },
  ]);
});

test('listarSeguidores pide los seguimientos anteriores al cursor, sin emails y del más reciente al más antiguo', async () => {
  prisma.seguimiento.findMany.mockResolvedValue([]);

  await seguimientoRepository.listarSeguidores(7, 30, 11);

  expect(prisma.seguimiento.findMany).toHaveBeenCalledWith({
    where: { seguidoId: 7, id: { lt: 30 } },
    select: { id: true, seguidor: { select: DATOS_PUBLICOS } },
    orderBy: { id: 'desc' },
    take: 11,
  });
});

test('listarSeguidores devuelve los datos públicos de cada seguidor con el id del seguimiento', async () => {
  prisma.seguimiento.findMany.mockResolvedValue([{ id: 5, seguidor: ANA }, { id: 4, seguidor: LUIS }]);

  await expect(seguimientoRepository.listarSeguidores(7, null, 20)).resolves.toEqual([
    { id: 5, persona: ANA }, { id: 4, persona: LUIS },
  ]);
});
