// CS-45, objetivos 1 y 4: servicio de contadores y listados paginados (por cursor) del perfil propio.
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
  amistadRepository.listarAmigos.mockResolvedValue([]);
  seguimientoRepository.listarSeguidores.mockResolvedValue([]);
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

// Los repositorios devuelven filas { id, persona } (id de la amistad o del seguimiento) y una
// fila de más de las que se muestran: si llega, hay página siguiente (paginación por cursor).
test('lista una página de amigos con la foto por defecto de quien no tiene y el cursor de la siguiente', async () => {
  amistadRepository.listarAmigos.mockResolvedValue([
    { id: 30, persona: ANA }, { id: 29, persona: LUIS }, { id: 28, persona: ANA },
  ]);

  const resultado = await listarAmigosPropios(7, { despuesDe: '31', limite: '2' });

  expect(amistadRepository.listarAmigos).toHaveBeenCalledWith(7, 31, 3);
  expect(resultado).toEqual({ personas: [ANA, { ...LUIS, foto: FOTO_POR_DEFECTO }], siguiente: 29 });
});

test('sin cursor ni límite empieza por el principio con 20 personas', async () => {
  await listarAmigosPropios(7, {});

  expect(amistadRepository.listarAmigos).toHaveBeenCalledWith(7, null, 21);
});

test('lista una página de seguidores; si no llega una fila de más, no hay página siguiente', async () => {
  seguimientoRepository.listarSeguidores.mockResolvedValue([{ id: 5, persona: ANA }]);

  const resultado = await listarSeguidoresPropios(7, { limite: '20' });

  expect(seguimientoRepository.listarSeguidores).toHaveBeenCalledWith(7, null, 21);
  expect(resultado).toEqual({ personas: [ANA], siguiente: null });
});

test('sin amigos devuelve una lista vacía y ningún cursor', async () => {
  amistadRepository.listarAmigos.mockResolvedValue([]);

  await expect(listarAmigosPropios(7, {})).resolves.toEqual({ personas: [], siguiente: null });
});

test.each([
  ['despuesDe', '0'],
  ['despuesDe', '-1'],
  ['despuesDe', 'abc'],
  ['despuesDe', '1.5'],
  ['limite', '0'],
  ['limite', '51'],
  ['limite', 'abc'],
])('rechaza la paginación no válida (%s=%s) con un 400', async (parametro, valor) => {
  await expect(listarAmigosPropios(7, { [parametro]: valor })).rejects.toMatchObject({
    status: 400, message: 'La paginación no es válida',
  });
  expect(amistadRepository.listarAmigos).not.toHaveBeenCalled();
});

test('los seguidores también rechazan la paginación no válida', async () => {
  await expect(listarSeguidoresPropios(7, { despuesDe: '0' })).rejects.toMatchObject({ status: 400 });
  expect(seguimientoRepository.listarSeguidores).not.toHaveBeenCalled();
});
