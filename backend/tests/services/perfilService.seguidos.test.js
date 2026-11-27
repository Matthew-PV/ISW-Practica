// CS-72, objetivo 1: el resumen del perfil dice cuántas personas sigue el usuario
// y el listado paginado (por cursor) de esas personas.
jest.mock('../../src/repositories/amistadRepository', () => ({
  contarAmigos: jest.fn(),
}));
jest.mock('../../src/repositories/seguimientoRepository', () => ({
  contarSeguidores: jest.fn(),
  contarSeguidos: jest.fn(),
  listarSeguidos: jest.fn(),
}));

const amistadRepository = require('../../src/repositories/amistadRepository');
const seguimientoRepository = require('../../src/repositories/seguimientoRepository');
const perfilService = require('../../src/services/perfilService');
const { FOTO_POR_DEFECTO } = require('../../src/services/shared/fotoPorDefecto');

const ANA = { id: 2, nombreUsuario: 'ana', foto: 'https://res.cloudinary.com/demo/ana.png' };
const LUIS = { id: 3, nombreUsuario: 'luis', foto: null };

describe('CS-72 · resumen del perfil con las personas que sigo', () => {
  beforeEach(() => jest.clearAllMocks());

  test('el resumen incluye cuántas personas sigue el usuario', async () => {
    amistadRepository.contarAmigos.mockResolvedValue(2);
    seguimientoRepository.contarSeguidores.mockResolvedValue(5);
    seguimientoRepository.contarSeguidos.mockResolvedValue(4);

    const resumen = await perfilService.obtenerResumenRelaciones(7);

    expect(resumen).toEqual({ amigos: 2, seguidores: 5, seguidos: 4 });
    expect(seguimientoRepository.contarSeguidos).toHaveBeenCalledWith(7);
  });
});

describe('CS-72 · listado de las personas que sigo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    seguimientoRepository.listarSeguidos.mockResolvedValue([]);
  });

  test('lista una página con la foto por defecto de quien no tiene y el cursor de la siguiente', async () => {
    seguimientoRepository.listarSeguidos.mockResolvedValue([
      { id: 30, persona: ANA }, { id: 29, persona: LUIS }, { id: 28, persona: ANA },
    ]);

    const resultado = await perfilService.listarSeguidosPropios(7, { despuesDe: '31', limite: '2' });

    expect(seguimientoRepository.listarSeguidos).toHaveBeenCalledWith(7, 31, 3);
    expect(resultado).toEqual({ personas: [ANA, { ...LUIS, foto: FOTO_POR_DEFECTO }], siguiente: 29 });
  });

  test('quien no sigue a nadie recibe una lista vacía y ningún cursor, empezando por el principio con 20', async () => {
    const resultado = await perfilService.listarSeguidosPropios(7, {});

    expect(seguimientoRepository.listarSeguidos).toHaveBeenCalledWith(7, null, 21);
    expect(resultado).toEqual({ personas: [], siguiente: null });
  });

  test('rechaza la paginación no válida con un 400 y no consulta la base de datos', async () => {
    await expect(perfilService.listarSeguidosPropios(7, { despuesDe: 'abc' })).rejects.toMatchObject({
      status: 400, message: 'La paginación no es válida',
    });
    expect(seguimientoRepository.listarSeguidos).not.toHaveBeenCalled();
  });
});