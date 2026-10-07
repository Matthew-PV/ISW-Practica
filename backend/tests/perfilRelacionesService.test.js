// CS-45, objetivos 1 y 4: servicio de contadores y listados paginados del perfil propio.
jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/amistadRepository');
jest.mock('../src/repositories/seguimientoRepository');

const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');
const {
  obtenerResumenRelaciones, listarAmigosPropios, listarSeguidoresPropios, FOTO_POR_DEFECTO,
} = require('../src/services/perfilService');

const ANA = { id: 2, nombreUsuario: 'ana', foto: 'https://res.cloudinary.com/demo/ana.png' };
const LUIS = { id: 3, nombreUsuario: 'luis', foto: null };

beforeEach(() => {
  jest.resetAllMocks();
  amistadRepository.contarAmigos.mockResolvedValue(2);
  seguimientoRepository.contarSeguidores.mockResolvedValue(5);
  amistadRepository.listarAmigos.mockResolvedValue([ANA, LUIS]);
  seguimientoRepository.listarSeguidores.mockResolvedValue([ANA]);
});

test('el resumen devuelve el número de amigos y de seguidores del usuario', async () => {
  await expect(obtenerResumenRelaciones(7)).resolves.toEqual({ amigos: 2, seguidores: 5 });
  expect(amistadRepository.contarAmigos).toHaveBeenCalledWith(7);
  expect(seguimientoRepository.contarSeguidores).toHaveBeenCalledWith(7);
});

test('un usuario sin amigos ni seguidores ve ceros, sin error', async () => {
  amistadRepository.contarAmigos.mockResolvedValue(0);
  seguimientoRepository.contarSeguidores.mockResolvedValue(0);

  await expect(obtenerResumenRelaciones(7)).resolves.toEqual({ amigos: 0, seguidores: 0 });
});

test('lista una página de amigos con el total y la foto por defecto de quien no tiene', async () => {
  const resultado = await listarAmigosPropios(7, '2', '10');

  expect(amistadRepository.listarAmigos).toHaveBeenCalledWith(7, 2, 10);
  expect(resultado).toEqual({
    pagina: 2, limite: 10, total: 2,
    personas: [ANA, { ...LUIS, foto: FOTO_POR_DEFECTO }],
  });
});

test('sin página ni límite usa la página 1 y 20 personas', async () => {
  await listarAmigosPropios(7, undefined, undefined);

  expect(amistadRepository.listarAmigos).toHaveBeenCalledWith(7, 1, 20);
});

test('lista una página de seguidores con el total', async () => {
  const resultado = await listarSeguidoresPropios(7, '1', '20');

  expect(seguimientoRepository.listarSeguidores).toHaveBeenCalledWith(7, 1, 20);
  expect(resultado).toEqual({ pagina: 1, limite: 20, total: 5, personas: [ANA] });
});

test('sin amigos devuelve una lista vacía y total cero', async () => {
  amistadRepository.contarAmigos.mockResolvedValue(0);
  amistadRepository.listarAmigos.mockResolvedValue([]);

  await expect(listarAmigosPropios(7, '1', '20')).resolves.toEqual({
    pagina: 1, limite: 20, total: 0, personas: [],
  });
});

test.each([
  ['0', '20'],
  ['-1', '20'],
  ['abc', '20'],
  ['1.5', '20'],
  ['1', '0'],
  ['1', '51'],
  ['1', 'abc'],
])('rechaza la paginación no válida (página %s, límite %s) con un 400', async (pagina, limite) => {
  await expect(listarAmigosPropios(7, pagina, limite)).rejects.toMatchObject({ status: 400 });
  expect(amistadRepository.listarAmigos).not.toHaveBeenCalled();
});

test('los seguidores también rechazan la paginación no válida', async () => {
  await expect(listarSeguidoresPropios(7, '0', '20')).rejects.toMatchObject({ status: 400 });
  expect(seguimientoRepository.listarSeguidores).not.toHaveBeenCalled();
});