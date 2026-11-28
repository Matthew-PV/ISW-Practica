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

const MADRID = { id: 1, nombre: 'Madrid', pais: 'España' };
const PARIS = { id: 2, nombre: 'Paris', pais: 'Francia' };
const CIUDADES = { 1: MADRID, 2: PARIS };
const GRAN_VIA = {
  proveedorId: 'demo-gran-via',
  nombre: 'Gran Vía',
  tipo: 'Calle',
  direccion: 'Gran Vía',
  lat: 40.42,
  lon: -3.70361,
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/MADRID_100206_UDCI_019.jpg/330px-MADRID_100206_UDCI_019.jpg',
  web: null,
};
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
    tipo: 'Cultura', momentoAdecuado: 'Por la tarde', autorId: 1,
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
  test('la experiencia pública de otro usuario responde 403 y no cambia nada', async () => {
    guardada.autorId = 2;
    guardada.visibilidad = 'PUBLICA';
    const antes = { ...guardada };
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Título ajeno' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No puedes editar un plan de otro usuario');
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
    expect(guardada).toEqual(antes);
  });

  test('la experiencia privada de otro usuario responde 404 como si no existiera, sin revelar que existe', async () => {
    guardada.autorId = 2;
    guardada.visibilidad = 'PRIVADA';
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Título ajeno' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Contenido no disponible');
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
  });

  test('visibilidad null al editar → 400 y no se hace pública', async () => {
    guardada.visibilidad = 'PRIVADA';
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ visibilidad: null });

    expect(res.status).toBe(400);
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
  });

  test('una experiencia antigua sin autor tampoco se puede editar', async () => {
    guardada.autorId = null;
    guardada.visibilidad = 'PUBLICA';
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

describe('Concurrencia al editar', () => {
  test('si la ciudad desaparece entre la validación y el guardado → 400, no 500', async () => {
    experienciaRepository.actualizar.mockRejectedValue(Object.assign(new Error('fk'), { code: 'P2003' }));
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ ciudadId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La ciudad seleccionada ya no está disponible');
  });
});

describe('Objetivo 7 - los cambios sustituyen a los datos anteriores', () => {
  test('los campos enviados sustituyen a los anteriores y los demás se conservan', async () => {
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({
      titulo: '  Tarde de museos  ', ciudadId: 2, momentoAdecuado: 'Invierno',
    });

    expect(res.status).toBe(200);
    // Solo se mandan a guardar los campos cambiados, ya limpios
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, {
      titulo: 'Tarde de museos', ciudadId: 2, momentoAdecuado: 'Invierno',
    });
    expect(res.body).toEqual({
      id: 10, titulo: 'Tarde de museos', descripcion: 'Museo y paseo', ciudadId: 2, ciudad: PARIS,
      tipo: 'Cultura', momentoAdecuado: 'Invierno', autorId: 1,
    });
  });

  test('al volver a consultarla aparecen los datos nuevos y no los anteriores', async () => {
    const agente = await agenteConSesion();
    await agente.patch('/api/experiencias/10').send({ titulo: 'Tarde de museos', descripcion: 'Solo el Prado' });

    const res = await agente.get('/api/experiencias/10');

    expect(res.body.titulo).toBe('Tarde de museos');
    expect(res.body.descripcion).toBe('Solo el Prado');
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

  test('enviar lugares sustituye la lista y normaliza la nota', async () => {
    guardada.lugares = [{ id: 20, ...GRAN_VIA, nota: 'Anterior', orden: 0 }];
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({
      lugares: [{ ...GRAN_VIA, nombre: 'Ficha manipulada', nota: '  Nueva nota  ' }],
    });

    expect(res.status).toBe(200);
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, {
      lugares: [{ ...GRAN_VIA, nota: 'Nueva nota' }],
    });
    expect(res.body.lugares).toEqual([{ ...GRAN_VIA, nota: 'Nueva nota' }]);
  });

  test('enviar una lista vacía vacía los lugares', async () => {
    guardada.lugares = [{ id: 20, ...GRAN_VIA, nota: 'Anterior', orden: 0 }];
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ lugares: [] });

    expect(res.status).toBe(200);
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, { lugares: [] });
    expect(res.body.lugares).toEqual([]);
  });

  test('omitir lugares conserva los actuales al cambiar otros campos', async () => {
    guardada.lugares = [{ id: 20, ...GRAN_VIA, nota: 'Anterior', orden: 0 }];
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ titulo: 'Nuevo título' });

    expect(res.status).toBe(200);
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, { titulo: 'Nuevo título' });
    expect(res.body.lugares).toEqual([{ id: 20, ...GRAN_VIA, nota: 'Anterior', orden: 0 }]);
  });

  test('rechaza cambiar la ciudad si se conservarían lugares incompatibles', async () => {
    guardada.lugares = [{ id: 20, ...GRAN_VIA, nota: null, orden: 0 }];
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ ciudadId: 2 });

    expect(res.status).toBe(400);
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
    expect(guardada.ciudadId).toBe(1);
  });

  test('rechaza un identificador de catálogo desconocido sin guardar otros cambios', async () => {
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({
      titulo: 'Título que no debe guardarse',
      lugares: [{ ...GRAN_VIA, proveedorId: 'demo-inexistente', nota: null }],
    });

    expect(res.status).toBe(400);
    expect(experienciaRepository.actualizar).not.toHaveBeenCalled();
    expect(guardada.titulo).toBe('Tarde cultural');
  });

  test('traduce un conflicto de unicidad de Prisma a 400 sin error interno', async () => {
    experienciaRepository.actualizar.mockRejectedValue({ code: 'P2002' });
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({
      lugares: [{ ...GRAN_VIA, nota: null }],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No puedes añadir el mismo lugar más de una vez');
  });

  test('cambiar ciudad junto con [] permite quitar lugares incompatibles en la misma operación', async () => {
    guardada.lugares = [{ id: 20, ...GRAN_VIA, nota: null, orden: 0 }];
    const agente = await agenteConSesion();

    const res = await agente.patch('/api/experiencias/10').send({ ciudadId: 2, lugares: [] });

    expect(res.status).toBe(200);
    expect(experienciaRepository.actualizar).toHaveBeenCalledWith(10, { ciudadId: 2, lugares: [] });
    expect(res.body.lugares).toEqual([]);
    expect(res.body.ciudad).toEqual(PARIS);
  });
});
