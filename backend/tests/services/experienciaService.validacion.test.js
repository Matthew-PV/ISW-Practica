// LUC01: campos obligatorios y ciudad válida antes de crear una experiencia.
jest.mock('../../src/repositories/ciudadRepository', () => ({ buscarPorId: jest.fn() }));

const ciudadRepository = require('../../src/repositories/ciudadRepository');
const { validarCreacion, validarEdicion } = require('../../src/services/experienciaService');

const VALIDA = { titulo: 'Tarde cultural', descripcion: 'Visita al museo y paseo', ciudadId: 1 };

beforeEach(() => {
  jest.resetAllMocks();
  ciudadRepository.buscarPorId.mockResolvedValue({ id: 1, nombre: 'Madrid' });
});

describe('LUC01: rechazar datos incorrectos antes de consultar la ciudad', () => {
  test.each([undefined, null, [], 'texto', 42])('cuerpo incorrecto: %p', async (datos) => {
    await expect(validarCreacion(datos)).rejects.toMatchObject({ status: 400 });
    expect(ciudadRepository.buscarPorId).not.toHaveBeenCalled();
  });

  test.each([
    ['título ausente', { titulo: undefined }],
    ['título nulo', { titulo: null }],
    ['título vacío', { titulo: '' }],
    ['título con espacios', { titulo: ' \n\t ' }],
    ['título no textual', { titulo: 123 }],
    ['descripción ausente', { descripcion: undefined }],
    ['descripción nula', { descripcion: null }],
    ['descripción vacía', { descripcion: '' }],
    ['descripción con espacios', { descripcion: ' \n\t ' }],
    ['descripción no textual', { descripcion: ['paseo'] }],
    ['ciudad ausente', { ciudadId: undefined }],
    ['ciudad nula', { ciudadId: null }],
    ['nombre de ciudad en lugar de identificador', { ciudadId: 'Madrid' }],
    ['identificador como texto', { ciudadId: '1' }],
    ['varias ciudades', { ciudadId: [1, 2] }],
    ['ciudad cero', { ciudadId: 0 }],
    ['ciudad negativa', { ciudadId: -1 }],
    ['ciudad decimal', { ciudadId: 1.5 }],
    ['ciudad fuera del rango de MySQL', { ciudadId: 2147483648 }],
    ['título demasiado largo', { titulo: 'a'.repeat(192) }],
    ['tipo demasiado largo', { tipo: 'a'.repeat(192) }],
    ['momento demasiado largo', { momentoAdecuado: 'a'.repeat(192) }],
    ['descripción demasiado larga', { descripcion: 'a'.repeat(65536) }],
    ['descripción con demasiados bytes Unicode', { descripcion: '😀'.repeat(16384) }],
    ['tipo no textual', { tipo: {} }],
    ['momento no textual', { momentoAdecuado: false }],
  ])('%s', async (_, cambios) => {
    await expect(validarCreacion({ ...VALIDA, ...cambios })).rejects.toMatchObject({
      status: 400, message: expect.any(String),
    });
    expect(ciudadRepository.buscarPorId).not.toHaveBeenCalled();
  });
});

test('LUC01: rechaza una ciudad que no está registrada', async () => {
  ciudadRepository.buscarPorId.mockResolvedValue(null);
  await expect(validarCreacion(VALIDA)).rejects.toMatchObject({
    status: 400, message: 'La ciudad seleccionada no existe',
  });
  expect(ciudadRepository.buscarPorId).toHaveBeenCalledWith(1);
});

test('acepta los obligatorios sin tipo ni momento', async () => {
  await expect(validarCreacion(VALIDA)).resolves.toEqual({
    ...VALIDA, tipo: null, momentoAdecuado: null, visibilidad: 'PUBLICA',
  });
});

test('acepta visibilidad válida y usa pública por defecto', async () => {
  await expect(validarCreacion({ ...VALIDA, visibilidad: 'AMIGOS' })).resolves.toEqual({
    ...VALIDA, tipo: null, momentoAdecuado: null, visibilidad: 'AMIGOS',
  });

  await expect(validarCreacion(VALIDA)).resolves.toEqual({
    ...VALIDA, tipo: null, momentoAdecuado: null, visibilidad: 'PUBLICA',
  });
});

test('rechaza una visibilidad no permitida', async () => {
  await expect(validarCreacion({ ...VALIDA, visibilidad: 'SECRETA' })).rejects.toMatchObject({
    status: 400, message: expect.stringMatching(/visibilidad/i),
  });
});

test('normaliza textos y conserva los opcionales con contenido', async () => {
  await expect(validarCreacion({
    ...VALIDA, titulo: '  Cafe\u0301  ', descripcion: '  Primera parada\nSegunda parada  ',
    tipo: ' Cultural ', momentoAdecuado: ' Tarde ', id: 999,
  })).resolves.toEqual({
    titulo: 'Café', descripcion: 'Primera parada\nSegunda parada', ciudadId: 1,
    tipo: 'Cultural', momentoAdecuado: 'Tarde', visibilidad: 'PUBLICA',
  });
});

test('los opcionales vacíos se guardarán como ausencia de valor', async () => {
  await expect(validarCreacion({ ...VALIDA, tipo: '   ', momentoAdecuado: null }))
    .resolves.toEqual({ ...VALIDA, tipo: null, momentoAdecuado: null, visibilidad: 'PUBLICA' });
});

test('acepta los límites de caracteres y bytes de MySQL', async () => {
  const datos = {
    ...VALIDA, titulo: '😀'.repeat(191), descripcion: 'a'.repeat(65535),
    tipo: 'a'.repeat(191), momentoAdecuado: 'a'.repeat(191), visibilidad: 'PUBLICA',
  };
  await expect(validarCreacion(datos)).resolves.toEqual(datos);
});

test('un fallo de base de datos no se presenta como ciudad inexistente', async () => {
  const error = new Error('Base de datos no disponible');
  ciudadRepository.buscarPorId.mockRejectedValue(error);
  await expect(validarCreacion(VALIDA)).rejects.toBe(error);
});

test('validarEdicion acepta visibilidad válida y rechaza valores no permitidos', async () => {
  await expect(validarEdicion({ visibilidad: 'amigos' })).resolves.toEqual({ visibilidad: 'AMIGOS' });
  await expect(validarEdicion({ visibilidad: 'SECRETA' })).rejects.toMatchObject({
    status: 400, message: expect.stringMatching(/visibilidad/i),
  });
});
