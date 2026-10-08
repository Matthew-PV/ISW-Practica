// FLA05, objetivo 10: criterio de validación del perfil visto desde fuera. Cada caso edita el
// perfil y después lo vuelve a consultar (GET /api/perfil) para comprobar qué ha quedado.
// Se simulan MySQL y Cloudinary; el repositorio simulado guarda el perfil en memoria.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/fotoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const fotoRepository = require('../../src/repositories/fotoRepository');
const { FOTO_POR_DEFECTO } = require('../../src/services/perfilService');

const URL_FOTO = 'https://res.cloudinary.com/demo/image/upload/v1/planb/perfiles/usuario-1.png';
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const GIF = Buffer.from('GIF89a\0\0\0\0');
// Nombre que ya usa otra persona
const NOMBRE_OCUPADO = 'luis';

let usuario;
// El perfil «guardado»: lo leen obtenerPerfil y lo cambian actualizarPerfil y actualizarFoto
let guardado;

beforeAll(async () => {
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('secreta123', 4) };
});

beforeEach(() => {
  jest.resetAllMocks();
  guardado = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: null, ciudad: null };
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.obtenerPerfil.mockImplementation(async () => ({ ...guardado }));
  // Como MySQL: un nombre repetido falla con P2002 y no cambia nada; los campos undefined no se tocan
  usuarioRepository.actualizarPerfil.mockImplementation(async (id, { nombreUsuario, ciudad }) => {
    if (nombreUsuario === NOMBRE_OCUPADO) throw { code: 'P2002' };
    if (nombreUsuario !== undefined) guardado.nombreUsuario = nombreUsuario;
    if (ciudad !== undefined) guardado.ciudad = ciudad;
    return { ...guardado };
  });
  usuarioRepository.actualizarFoto.mockImplementation(async (id, foto) => {
    guardado.foto = foto;
    return { ...guardado };
  });
  fotoRepository.subirFotoPerfil.mockResolvedValue(URL_FOTO);
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return agente;
}

test('con un nombre válido y una foto permitida, al consultar aparecen los dos', async () => {
  const agente = await agenteConSesion();
  expect((await agente.get('/api/perfil')).body.foto).toBe(FOTO_POR_DEFECTO);

  expect((await agente.put('/api/perfil').send({ nombreUsuario: 'ana_viajera' })).status).toBe(200);
  expect((await agente.put('/api/perfil/foto').attach('foto', PNG, 'foto.png')).status).toBe(200);
  const perfil = (await agente.get('/api/perfil')).body;

  expect(perfil.nombreUsuario).toBe('ana_viajera');
  expect(perfil.foto).toBe(URL_FOTO);
});

test('un nombre que ya usa otra persona se rechaza y al consultar sigue el anterior', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil').send({ nombreUsuario: NOMBRE_OCUPADO, ciudad: 'Madrid' });
  const perfil = (await agente.get('/api/perfil')).body;

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('El nombre de usuario ya está en uso');
  expect(perfil.nombreUsuario).toBe('ana');
  // No se guarda nada de esa petición, tampoco la ciudad
  expect(perfil.ciudad).toBeNull();
});

test('un nombre con caracteres no permitidos se rechaza y al consultar sigue el anterior', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil').send({ nombreUsuario: 'ana pérez!' });

  expect(res.status).toBe(400);
  expect((await agente.get('/api/perfil')).body.nombreUsuario).toBe('ana');
});

test('una foto con formato no permitido se rechaza y al consultar sigue la anterior', async () => {
  const agente = await agenteConSesion();
  await agente.put('/api/perfil/foto').attach('foto', PNG, 'foto.png');

  const res = await agente.put('/api/perfil/foto').attach('foto', GIF, 'foto.gif');

  expect(res.status).toBe(400);
  expect((await agente.get('/api/perfil')).body.foto).toBe(URL_FOTO);
});

test('una foto de más de 5 MB se rechaza y al consultar sigue la anterior', async () => {
  const agente = await agenteConSesion();
  await agente.put('/api/perfil/foto').attach('foto', PNG, 'foto.png');
  const grande = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);

  const res = await agente.put('/api/perfil/foto').attach('foto', grande, 'foto.png');

  expect(res.status).toBe(400);
  expect((await agente.get('/api/perfil')).body.foto).toBe(URL_FOTO);
});
