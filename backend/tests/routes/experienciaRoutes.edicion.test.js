// CS-57: edición por HTTP (PATCH /api/experiencias/:id), objetivos 6 y 7.
// Se simulan los repositorios, sin necesitar MySQL. El de experiencias guarda una experiencia
// en memoria para poder comprobar cómo queda después de editarla.
jest.mock('../../src/repositories/usuarioRepository');
jest.mock('../../src/repositories/ciudadRepository');
jest.mock('../../src/repositories/experienciaRepository');

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuarioRepository');
const ciudadRepository = require('../../src/repositories/ciudadRepository');
const experienciaRepository = require('../../src/repositories/experienciaRepository');

const MADRID = { id: 1, nombre: 'Madrid' };
const PARIS = { id: 2, nombre: 'Paris' };
const CIUDADES = { 1: MADRID, 2: PARIS };
let usuario;
// La experiencia «guardada»: la leen buscarPorId y la cambia actualizar
let guardada;

beforeAll(async () => {
  usuario = {
    id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com',
    passwordHash: await bcrypt.hash('secreta123', 4),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  usuarioRepository.buscarPorEmail.mockResolvedValue(usuario);
  usuarioRepository.buscarPorId.mockResolvedValue(usuario);
  ciudadRepository.buscarPorId.mockImplementation(async (id) => CIUDADES[id] ?? null);
  guardada = {
    id: 10, titulo: 'Tarde cultural', descripcion: 'Museo y paseo', ciudadId: 1, ciudad: MADRID,
    tipo: 'Cultural', momentoAdecuado: 'Por la tarde', autorId: 1,
  };
  experienciaRepository.buscarPorId.mockImplementation(async (id) => (id === guardada.id ? { ...guardada } : null));
  // Igual que Prisma: sustituye los campos recibidos y devuelve la experiencia con su ciudad
  experienciaRepository.actualizar.mockImplementation(async (id, datos) => {
    guardada = { ...guardada, ...datos };
    guardada.ciudad = CIUDADES[guardada.ciudadId];
    return { ...guardada };
  });
});

// Devuelve un agente (guarda la cookie de sesión entre peticiones) ya logueado como `usuario`
async function agenteConSesion() {
  const agente = request.agent(app);
  const login = await agente.post('/api/auth/login').send({ email: usuario.email, password: 'secreta123' });
  expect(login.status).toBe(200);
  return agente;
}

describe('Objetivo 6 - un usuario que no es el autor no puede editar', () => {
  test('la experiencia de otro usuario responde 403 y no cambia nada', async () => {
    guardada.autorId = 2;
    const antes = { ...guardada };
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Título ajeno' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No puedes editar una experiencia de otro usuario');
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
    expect(guardada).toEqual(antes);
  });

  test('una experiencia antigua sin autor tampoco se puede editar', async () => {
    guardada.autorId = null;
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Nuevo' });

    expect(res.status).toBe(403);
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
  });

  test('sin sesión responde 401 y no consulta ni cambia la experiencia', async () => {
    const res = await request(app).patch('/api/experiencias/10').send({ titulo: 'Nuevo' });

    expect(res.status).toBe(401);
    expect(experienciaRepository.buscarPorId).not.toHaveBeenCalled();
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
  });
});

describe('Objetivo 7 - los cambios sustituyen a los datos anteriores', () => {
  test('los campos enviados sustituyen a los anteriores y los demás se conservan', async () => {
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({
      titulo: '  Tarde de museos  ', ciudadId: 2, momentoAdecuado: 'En invierno',
    });

    expect(res.status).toBe(200);
    // Solo se mandan a guardar los campos cambiados, ya limpios
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, {
      titulo: 'Tarde de museos', ciudadId: 2, momentoAdecuado: 'En invierno',
    });
    expect(res.body).toEqual({
      id: 10, titulo: 'Tarde de museos', descripcion: 'Museo y paseo', ciudadId: 2, ciudad: PARIS,
      tipo: 'Cultural', momentoAdecuado: 'En invierno', autorId: 1,
    });
  });

  test('al volver a consultarla aparecen los datos nuevos y no los anteriores', async () => {
    const agente = await agenteConSesion();
    await agente.patch('/api/experiencias/10').send({ titulo: 'Tarde de museos', descripcion: 'Solo el Prado' });

    experienciaRepository.listarPorAutor.mockImplementation(async () => [{ ...guardada }]);
    const res = await agente.get('/api/experiencias/mias');

    expect(res.body[0].titulo).toBe('Tarde de museos');
    expect(res.body[0].descripcion).toBe('Solo el Prado');
    expect(JSON.stringify(res.body)).not.toContain('Tarde cultural');
  });

  test('vaciar un campo opcional sustituye el valor anterior por ninguno', async () => {
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ tipo: '' });

    expect(res.status).toBe(200);
    expect(res.body.tipo).toBeNull();
  });

  test('no permite cambiar el autor ni el identificador', async () => {
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Nuevo', autorId: 2, id: 99 });

    expect(res.status).toBe(200);
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, { titulo: 'Nuevo' });
    expect(res.body).toMatchObject({ id: 10, autorId: 1 });
  });

  test('si algún dato no es válido no se sustituye nada', async () => {
    const antes = { ...guardada };
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Nuevo', ciudadId: 999 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La ciudad seleccionada no existe');
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
    expect(guardada).toEqual(antes);
  });
});
