// CS-01, objetivo 5: guardar una valoración de forma atómica, sin duplicados.
// Se intenta crear; si MySQL rechaza el duplicado (P2002), se actualiza la existente.
// Se simula Prisma: la prueba con MySQL real y peticiones simultáneas es la del objetivo 10.
jest.mock('../src/repositories/shared/prisma', () => ({
  valoracion: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const prisma = require('../src/repositories/shared/prisma');
const valoracionRepository = require('../src/repositories/valoracionRepository');

const DATOS = { usuarioId: 1, experienciaId: 10, puntuacion: 4, comentario: 'Muy recomendable' };

beforeEach(() => jest.resetAllMocks());

test('si el usuario aún no había valorado la experiencia, la crea y no actualiza nada', async () => {
  prisma.valoracion.create.mockResolvedValue({ id: 50, ...DATOS });

  const resultado = await valoracionRepository.guardar(DATOS);

  expect(resultado).toEqual({ valoracion: { id: 50, ...DATOS }, creada: true });
  expect(prisma.valoracion.create).toHaveBeenCalledWith({ data: DATOS });
  expect(prisma.valoracion.update).not.toHaveBeenCalled();
});

test('si MySQL rechaza el duplicado (P2002), actualiza la valoración de esa pareja', async () => {
  prisma.valoracion.create.mockRejectedValue(Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }));
  prisma.valoracion.update.mockResolvedValue({ id: 50, ...DATOS });

  const resultado = await valoracionRepository.guardar(DATOS);

  expect(resultado).toEqual({ valoracion: { id: 50, ...DATOS }, creada: false });
  expect(prisma.valoracion.update).toHaveBeenCalledWith({
    where: { usuarioId_experienciaId: { usuarioId: 1, experienciaId: 10 } },
    data: { puntuacion: 4, comentario: 'Muy recomendable' },
  });
});

test('cualquier otro error al crear se relanza sin intentar actualizar', async () => {
  const error = Object.assign(new Error('Foreign key constraint failed'), { code: 'P2003' });
  prisma.valoracion.create.mockRejectedValue(error);

  await expect(valoracionRepository.guardar(DATOS)).rejects.toBe(error);
  expect(prisma.valoracion.update).not.toHaveBeenCalled();
});
