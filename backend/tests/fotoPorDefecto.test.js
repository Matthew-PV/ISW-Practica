const usuarioRepository = require('../src/repositories/usuarioRepository');
const { obtenerPerfilPropio, FOTO_POR_DEFECTO } = require('../src/services/perfilService');

jest.mock('../src/repositories/usuarioRepository');
jest.mock('../src/repositories/fotoRepository');

const perfilBase = { id: 1, nombreUsuario: 'ana', email: 'ana@correo.com', ciudad: null };

beforeEach(() => jest.resetAllMocks());

describe('Foto por defecto', () => {
  test('sin foto devuelve la imagen por defecto', async () => {
    usuarioRepository.obtenerPerfil.mockResolvedValue({ ...perfilBase, foto: null });
    const perfil = await obtenerPerfilPropio(1);
    expect(perfil.foto).toBe(FOTO_POR_DEFECTO);
  });

  test('con foto devuelve la suya', async () => {
    const url = 'https://res.cloudinary.com/demo/usuario-1.png';
    usuarioRepository.obtenerPerfil.mockResolvedValue({ ...perfilBase, foto: url });
    const perfil = await obtenerPerfilPropio(1);
    expect(perfil.foto).toBe(url);
  });
});
