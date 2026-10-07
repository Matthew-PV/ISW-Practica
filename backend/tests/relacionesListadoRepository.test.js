// CS-45, objetivos 1 y 3: listados paginados de amigos y seguidores.
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

test('listarAmigos pide una página de amistades aceptadas, sin emails y en orden fijo', async () => {
  prisma.amistad.findMany.mockResolvedValue([]);

  await amistadRepository.listarAmigos(7, 2, 20);

  expect(prisma.amistad.findMany).toHaveBeenCalledWith({
    where: {
      estado: 'ACEPTADA',
      OR: [{ solicitanteId: 7 }, { destinatarioId: 7 }],
    },
    select: {
      solicitanteId: true,
      solicitante: { select: DATOS_PUBLICOS },
      destinatario: { select: DATOS_PUBLICOS },
    },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    skip: 20,
    take: 20,
  });
});

test('listarAmigos devuelve a la otra persona de cada amistad, la enviara quien la enviara', async () => {
  prisma.amistad.findMany.mockResolvedValue([
    { solicitanteId: 7, solicitante: YO, destinatario: ANA },
    { solicitanteId: 3, solicitante: LUIS, destinatario: YO },
  ]);

  await expect(amistadRepository.listarAmigos(7, 1, 20)).resolves.toEqual([ANA, LUIS]);
});

test('listarSeguidores pide una página de quienes siguen al usuario, sin emails y en orden fijo', async () => {
  prisma.seguimiento.findMany.mockResolvedValue([]);

  await seguimientoRepository.listarSeguidores(7, 3, 10);

  expect(prisma.seguimiento.findMany).toHaveBeenCalledWith({
    where: { seguidoId: 7 },
    select: { seguidor: { select: DATOS_PUBLICOS } },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    skip: 20,
    take: 10,
  });
});

test('listarSeguidores devuelve los datos públicos de cada seguidor', async () => {
  prisma.seguimiento.findMany.mockResolvedValue([{ seguidor: ANA }, { seguidor: LUIS }]);

  await expect(seguimientoRepository.listarSeguidores(7, 1, 20)).resolves.toEqual([ANA, LUIS]);
});