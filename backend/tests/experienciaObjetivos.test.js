const ciudadRepository = require('../src/repositories/ciudadRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const usuarioRepository = require('../src/repositories/usuarioRepository');
const { crearExperiencia, obtenerExperiencia } = require('../src/services/experienciaService');

jest.mock('../src/repositories/ciudadRepository');
jest.mock('../src/repositories/experienciaRepository');
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/services/shared/visibilidad', () => ({
  puedeVerExperiencia: jest.fn(),
}));

const { puedeVerExperiencia } = require('../src/services/shared/visibilidad');

const USUARIO_ID = 1;
const CIUDAD_ID = 10;

const datosValidos = {
  titulo: 'Paseo por el casco antiguo',
  descripcion: 'Una ruta tranquila por las calles históricas.',
  ciudadId: CIUDAD_ID,
  tipo: 'Cultural',
  momentoAdecuado: 'Primavera',
};

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorId.mockResolvedValue({ id: USUARIO_ID });
  ciudadRepository.buscarPorId.mockResolvedValue({ id: CIUDAD_ID });
  experienciaRepository.crear.mockImplementation(async (d) => ({ id: 99, ...d }));
  puedeVerExperiencia.mockResolvedValue(true);
});

describe('Objetivo 5 - rechazar si falta un campo obligatorio', () => {
  test.each(['titulo', 'descripcion', 'ciudadId'])('falta %s', async (campo) => {
    const datos = { ...datosValidos };
    delete datos[campo];
    await expect(crearExperiencia(USUARIO_ID, datos)).rejects.toMatchObject({ status: 400 });
    expect(experienciaRepository.crear).not.toHaveBeenCalled();
  });
});

describe('Objetivo 6 - experiencia asociada solo a su ciudad', () => {
  test('se guarda con la ciudad indicada', async () => {
    const resultado = await crearExperiencia(USUARIO_ID, datosValidos);
    expect(ciudadRepository.buscarPorId).toHaveBeenCalledWith(CIUDAD_ID);
    expect(experienciaRepository.crear.mock.calls[0][0].ciudadId).toBe(CIUDAD_ID);
    expect(resultado.ciudadId).toBe(CIUDAD_ID);
  });

  test('no se crea si la ciudad no existe', async () => {
    ciudadRepository.buscarPorId.mockResolvedValue(null);
    await expect(crearExperiencia(USUARIO_ID, datosValidos)).rejects.toMatchObject({ status: 400 });
    expect(experienciaRepository.crear).not.toHaveBeenCalled();
  });
});

describe('Objetivo 7 - creación con datos válidos', () => {
  test('crea la experiencia con el autor de la sesión', async () => {
    const resultado = await crearExperiencia(USUARIO_ID, datosValidos);
    expect(experienciaRepository.crear).toHaveBeenCalledWith({ ...datosValidos, visibilidad: 'PUBLICA', autorId: USUARIO_ID });
    expect(resultado).toMatchObject({ id: 99, autorId: USUARIO_ID, visibilidad: 'PUBLICA' });
  });
});

describe('Objetivo 4 - leer una experiencia por su id', () => {
  test('devuelve la experiencia si el usuario puede verla', async () => {
    const experiencia = {
      id: 7,
      autorId: 2,
      visibilidad: 'PUBLICA',
      titulo: 'Ruta por el río',
      descripcion: 'Un paseo tranquilo.',
      ciudad: { id: 10, nombre: 'Sevilla' },
    };

    experienciaRepository.buscarPorId.mockResolvedValue(experiencia);

    await expect(obtenerExperiencia(USUARIO_ID, 7)).resolves.toMatchObject(experiencia);
    expect(puedeVerExperiencia).toHaveBeenCalledWith(USUARIO_ID, experiencia);
  });

  test('rechaza una experiencia que no existe', async () => {
    experienciaRepository.buscarPorId.mockResolvedValue(null);

    await expect(obtenerExperiencia(USUARIO_ID, 999)).rejects.toMatchObject({
      status: 404,
      message: 'La experiencia no existe',
    });
  });

  test('rechaza una experiencia invisible para ese usuario', async () => {
    const experiencia = {
      id: 8,
      autorId: 2,
      visibilidad: 'PRIVADA',
      titulo: 'Experiencia privada',
      descripcion: 'No debe verse.',
      ciudad: { id: 10, nombre: 'Sevilla' },
    };

    experienciaRepository.buscarPorId.mockResolvedValue(experiencia);
    puedeVerExperiencia.mockResolvedValue(false);

    await expect(obtenerExperiencia(USUARIO_ID, 8)).rejects.toMatchObject({
      status: 403,
      message: 'No tienes permiso para ver esta experiencia',
    });
  });
});
