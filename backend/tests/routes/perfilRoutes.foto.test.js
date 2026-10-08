// Subida de la foto de perfil (PUT /api/perfil/foto). Se simulan MySQL y Cloudinary.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/fotoRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const fotoRepository = require('../../src/repositories/fotoRepository');

const URL_FOTO = 'https://res.cloudinary.com/demo/image/upload/v1/planb/perfiles/usuario-1.png';
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: URL_FOTO, ciudad: null };

// Archivos mínimos de cada formato: solo importan sus primeros bytes (la firma)
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);
const GIF = Buffer.from('GIF89a\0\0\0\0');

let usuario;

beforeAll(async () => {
  usuario = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', passwordHash: await bcrypt.hash('secreta123', 4) };
});

beforeEach(() => {
  jest.resetAllMocks();
  fotoRepository.subirFotoPerfil.mockResolvedValue(URL_FOTO);
  usuarioRepository.actualizarFoto.mockResolvedValue(PERFIL);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  // requiereSesion comprueba que el usuario de la sesión sigue existiendo
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  const agente = request.agent(app);
  await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  return agente;
}

// Comprueba que no se ha subido nada a Cloudinary ni se ha cambiado la foto en MySQL
function noSeHaGuardadoNada() {
  expect(fotoRepository.subirFotoPerfil).not.toHaveBeenCalled();
  expect(usuarioRepository.actualizarFoto).not.toHaveBeenCalled();
}

test('sin sesión responde 401 y no sube nada', async () => {
  const res = await request(app).put('/api/perfil/foto').attach('foto', PNG, 'foto.png');

  expect(res.status).toBe(401);
  noSeHaGuardadoNada();
});

test.each([
  ['PNG', PNG, 'foto.png'],
  ['JPG', JPG, 'foto.jpg'],
  ['WebP', WEBP, 'foto.webp'],
])('una foto %s se sube a Cloudinary y en el perfil se guarda solo su URL', async (_, contenido, nombre) => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/foto').attach('foto', contenido, nombre);

  expect(res.status).toBe(200);
  expect(res.body).toEqual(PERFIL);
  expect(fotoRepository.subirFotoPerfil).toHaveBeenCalledWith(1, contenido);
  expect(usuarioRepository.actualizarFoto).toHaveBeenCalledWith(1, URL_FOTO);
});

test('sin foto responde 400', async () => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/foto');

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Falta la foto');
  noSeHaGuardadoNada();
});

test.each([
  ['un GIF', GIF, 'foto.gif'],
  ['un texto con extensión .png', Buffer.from('no soy una imagen'), 'foto.png'],
  ['un archivo vacío', Buffer.alloc(0), 'foto.jpg'],
])('con %s responde 400 y conserva la foto anterior', async (_, contenido, nombre) => {
  const agente = await agenteConSesion();

  const res = await agente.put('/api/perfil/foto').attach('foto', contenido, nombre);

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La foto debe ser JPG, PNG o WebP');
  noSeHaGuardadoNada();
});

test('una foto de más de 5 MB responde 400 y conserva la anterior', async () => {
  const agente = await agenteConSesion();
  const grande = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);

  const res = await agente.put('/api/perfil/foto').attach('foto', grande, 'foto.png');

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La foto no puede superar los 5 MB');
  noSeHaGuardadoNada();
});

test.each([
  ['la foto en otro campo', (peticion) => peticion.attach('imagen', PNG, 'foto.png')],
  ['dos fotos', (peticion) => peticion.attach('foto', PNG, 'a.png').attach('foto', PNG, 'b.png')],
])('con %s responde 400', async (_, adjuntar) => {
  const agente = await agenteConSesion();

  const res = await adjuntar(agente.put('/api/perfil/foto'));

  expect(res.status).toBe(400);
  noSeHaGuardadoNada();
});

test('si Cloudinary rechaza la imagen (dañada) responde 400 y no cambia el perfil', async () => {
  const agente = await agenteConSesion();
  fotoRepository.subirFotoPerfil.mockRejectedValue({ http_code: 400, message: 'Invalid image file' });

  const res = await agente.put('/api/perfil/foto').attach('foto', PNG, 'foto.png');

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('La foto no es una imagen válida');
  expect(usuarioRepository.actualizarFoto).not.toHaveBeenCalled();
});

test('si Cloudinary no responde, 500 sin revelar detalles y no cambia el perfil', async () => {
  const agente = await agenteConSesion();
  const error = { http_code: 500, message: 'Detalle interno de Cloudinary' };
  fotoRepository.subirFotoPerfil.mockRejectedValue(error);
  const registro = jest.spyOn(console, 'error').mockImplementation(() => {});

  const res = await agente.put('/api/perfil/foto').attach('foto', PNG, 'foto.png');

  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: 'Error interno del servidor' });
  expect(registro).toHaveBeenCalledWith(error);
  expect(usuarioRepository.actualizarFoto).not.toHaveBeenCalled();
});
