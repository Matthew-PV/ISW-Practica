// Validación de los datos de registro y login, y respuestas ante peticiones mal formadas.
jest.mock('../../src/repositories/usuarioRepository');

const request = require('supertest');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');

const VALIDO = { nombreUsuario: 'ana', email: 'ana@ejemplo.com', password: 'Secreta123' };

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.crear.mockImplementation(async (datos) => ({ id: 1, ...datos }));
});

// Envía un registro con los datos de VALIDO, cambiando solo los campos de `cambios`
function registrar(cambios) {
  return request(app).post('/api/auth/registro').send({ ...VALIDO, ...cambios });
}

describe('registro: se rechaza con 400 y no se crea nada', () => {
  test.each([
    ['nombre que no es texto', { nombreUsuario: 123 }],
    ['contraseña que no es texto', { password: { a: 1 } }],
    ['email que no es texto', { email: ['ana@ejemplo.com'] }],
    ['nombre de solo espacios', { nombreUsuario: '   ' }],
    ['nombre de 2 caracteres', { nombreUsuario: 'ab' }],
    ['nombre de 31 caracteres', { nombreUsuario: 'a'.repeat(31) }],
    ['nombre con espacios', { nombreUsuario: 'ana maría' }],
    ['nombre con carácter invisible', { nombreUsuario: 'ad​min' }],
    ['nombre con inversión de texto', { nombreUsuario: 'ana‮' }],
    ['nombre con salto de línea', { nombreUsuario: 'ana\n' }],
    ['nombre con emoji', { nombreUsuario: 'ana😀' }],
    ['email sin formato de email', { email: 'no-es-un-email' }],
    ['email demasiado largo', { email: `${'a'.repeat(190)}@ejemplo.com` }],
    ['contraseña de 7 caracteres', { password: '1234567' }],
    ['contraseña de más de 72 bytes', { password: 'x'.repeat(73) }],
  ])('%s', async (_, cambios) => {
    const res = await registrar(cambios);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });
});

describe('registro: contraseña segura (CS-64)', () => {
  test.each([
    ['sin mayúscula', 'secreta123', 'al menos una mayúscula'],
    ['sin número', 'Secretaaaa', 'al menos un número'],
    ['con el nombre de usuario', 'Ana2026xyz', 'sin el nombre de usuario'],
  ])('una contraseña %s responde 400 indicando el requisito y no crea nada', async (_, password, requisito) => {
    const res = await registrar({ password });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(`La contraseña no cumple estos requisitos: ${requisito}.`);
    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });
});

describe('registro: datos que sí se aceptan', () => {
  test.each([
    ['letras con tilde y ñ', 'josé_muñoz'],
    ['otros alfabetos', 'Σοφία'],
    ['números, punto y guion', 'ana.m-2'],
  ])('nombre con %s', async (_, nombreUsuario) => {
    const res = await registrar({ nombreUsuario });

    expect(res.status).toBe(201);
  });

  test('normaliza el nombre a NFC (é como un solo carácter)', async () => {
    await registrar({ nombreUsuario: 'José' });

    expect(usuarioRepository.crear.mock.calls[0][0].nombreUsuario).toBe('José');
  });

  test('quita los espacios del email y lo pasa a minúsculas', async () => {
    await registrar({ email: '  Ana@Ejemplo.COM ' });

    expect(usuarioRepository.crear.mock.calls[0][0].email).toBe('ana@ejemplo.com');
  });

  test('contraseña de 72 bytes exactos', async () => {
    const res = await registrar({ password: `Aa1${'x'.repeat(69)}` });

    expect(res.status).toBe(201);
  });
});

describe('login: datos no válidos', () => {
  test.each([
    ['sin cuerpo', undefined],
    ['email que no es texto', { email: { contains: '@' }, password: 'x' }],
    ['contraseña que no es texto', { email: 'ana@ejemplo.com', password: 123 }],
  ])('%s responde 400', async (_, cuerpo) => {
    const res = await request(app).post('/api/auth/login').send(cuerpo);

    expect(res.status).toBe(400);
    expect(usuarioRepository.buscarPorEmail).not.toHaveBeenCalled();
  });

  test('contraseña de más de 72 bytes responde 401 sin consultar la base de datos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@ejemplo.com', password: 'x'.repeat(73) });

    expect(res.status).toBe(401);
    expect(usuarioRepository.buscarPorEmail).not.toHaveBeenCalled();
  });
});

describe('peticiones mal formadas', () => {
  test('JSON roto responde 400 con un mensaje en español', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{mal');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La petición no es válida');
  });
});
