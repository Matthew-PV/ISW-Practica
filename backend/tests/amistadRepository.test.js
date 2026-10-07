// CS-61, objetivo 3: contrato de acceso a la tabla Amistad.
jest.mock('../src/repositories/shared/prisma', () => ({
  amistad: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require('../src/repositories/shared/prisma');
const amistadRepository = require('../src/repositories/amistadRepository');

beforeEach(() => jest.resetAllMocks());

test('crea una solicitud pendiente entre dos usuarios', async () => {
  prisma.amistad.create.mockResolvedValue({ id: 10 });

  await amistadRepository.crear(1, 2);

  expect(prisma.amistad.create).toHaveBeenCalledWith({
    data: { solicitanteId: 1, destinatarioId: 2 },
  });
});

test('busca la relación entre dos usuarios en ambos sentidos', async () => {
  prisma.amistad.findFirst.mockResolvedValue({ id: 10 });

  await amistadRepository.buscarEntreUsuarios(1, 2);

  expect(prisma.amistad.findFirst).toHaveBeenCalledWith({
    where: {
      OR: [
        { solicitanteId: 1, destinatarioId: 2 },
        { solicitanteId: 2, destinatarioId: 1 },
      ],
    },
  });
});

test('busca una solicitud por su identificador', async () => {
  prisma.amistad.findUnique.mockResolvedValue({ id: 10 });

  await amistadRepository.buscarPorId(10);

  expect(prisma.amistad.findUnique).toHaveBeenCalledWith({
    where: { id: 10 },
  });
});

test('acepta una solicitud', async () => {
  prisma.amistad.update.mockResolvedValue({
    id: 10,
    estado: 'ACEPTADA',
  });

  await amistadRepository.aceptar(10);

  expect(prisma.amistad.update).toHaveBeenCalledWith({
    where: { id: 10 },
    data: { estado: 'ACEPTADA' },
  });
});

test('borra una relación por su identificador', async () => {
  prisma.amistad.delete.mockResolvedValue({ id: 10 });

  await amistadRepository.borrar(10);

  expect(prisma.amistad.delete).toHaveBeenCalledWith({
    where: { id: 10 },
  });
});

test('lista las solicitudes pendientes recibidas con datos seguros del solicitante', async () => {
  prisma.amistad.findMany.mockResolvedValue([]);

  await amistadRepository.listarSolicitudesRecibidas(2);

  expect(prisma.amistad.findMany).toHaveBeenCalledWith({
    where: {
      destinatarioId: 2,
      estado: 'PENDIENTE',
    },
    include: {
      solicitante: {
        select: {
          id: true,
          nombreUsuario: true,
          foto: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });
});

test('lista los identificadores de los amigos aceptados en ambos sentidos', async () => {
  prisma.amistad.findMany.mockResolvedValue([
    {
      solicitanteId: 1,
      destinatarioId: 2,
    },
    {
      solicitanteId: 3,
      destinatarioId: 1,
    },
  ]);

  const resultado = await amistadRepository.listarAmigosIds(1);

  expect(resultado).toEqual([2, 3]);

  expect(prisma.amistad.findMany).toHaveBeenCalledWith({
    where: {
      estado: 'ACEPTADA',
      OR: [
        { solicitanteId: 1 },
        { destinatarioId: 1 },
      ],
    },
    select: {
      solicitanteId: true,
      destinatarioId: true,
    },
  });
});