// CS-01: reglas de negocio para crear y modificar una valoración.
// CS-48: consulta de valoraciones hechas por amigos y seguidores.
// Se simulan los repositorios, sin necesitar MySQL.

jest.mock('../src/repositories/usuarioRepository', () => ({
  buscarPorId: jest.fn(),
}));

jest.mock('../src/repositories/experienciaRepository', () => ({
  buscarPorId: jest.fn(),
}));

jest.mock('../src/repositories/valoracionRepository', () => ({
  guardar: jest.fn(),
  listarDeUsuarios: jest.fn(),
}));

jest.mock('../src/repositories/amistadRepository', () => ({
  listarAmigosIds: jest.fn(),
}));

jest.mock('../src/repositories/seguimientoRepository', () => ({
  listarSeguidoresIds: jest.fn(),
}));

jest.mock('../src/services/amistadService', () => ({
  sonAmigos: jest.fn(),
}));

const usuarioRepository = require('../src/repositories/usuarioRepository');
const experienciaRepository = require('../src/repositories/experienciaRepository');
const valoracionRepository = require('../src/repositories/valoracionRepository');
const amistadRepository = require('../src/repositories/amistadRepository');
const seguimientoRepository = require('../src/repositories/seguimientoRepository');
const amistadService = require('../src/services/amistadService');

const {
  valorarExperiencia,
  listarValoracionesRelacionadas,
} = require('../src/services/valoracionService');

// Experiencia pública de otro autor (id 2): el usuario 1 puede verla y valorarla.
const EXPERIENCIA = {
  id: 10,
  autorId: 2,
  visibilidad: 'PUBLICA',
};

// Experiencias de otro autor que el usuario 1 no puede ver.
const PRIVADA = {
  id: 11,
  autorId: 2,
  visibilidad: 'PRIVADA',
};

const DE_AMIGOS = {
  id: 12,
  autorId: 2,
  visibilidad: 'AMIGOS',
};

const EXPERIENCIAS = {
  10: EXPERIENCIA,
  11: PRIVADA,
  12: DE_AMIGOS,
};

beforeEach(() => {
  jest.resetAllMocks();

  usuarioRepository.buscarPorId.mockImplementation(
    async (id) => (id === 1 || id === 2 ? { id } : null)
  );

  experienciaRepository.buscarPorId.mockImplementation(
    async (id) => (EXPERIENCIAS[id] ? { ...EXPERIENCIAS[id] } : null)
  );

  amistadService.sonAmigos.mockResolvedValue(false);

  valoracionRepository.guardar.mockImplementation(
    async (datos) => ({
      valoracion: {
        id: 50,
        ...datos,
      },
      creada: true,
    })
  );

  amistadRepository.listarAmigosIds.mockResolvedValue([]);
  seguimientoRepository.listarSeguidoresIds.mockResolvedValue([]);

  valoracionRepository.listarDeUsuarios.mockResolvedValue({
    valoraciones: [],
    total: 0,
  });
});

describe('crear una valoración', () => {
  test('si aún no había valorado la experiencia, se guarda una valoración nueva asociada a ambos', async () => {
    const resultado = await valorarExperiencia(
      1,
      10,
      {
        puntuacion: 4,
        comentario: 'Muy recomendable',
      }
    );

    expect(resultado.creada).toBe(true);

    expect(resultado.valoracion).toMatchObject({
      usuarioId: 1,
      experienciaId: 10,
      puntuacion: 4,
      comentario: 'Muy recomendable',
    });

    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);

    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1,
      experienciaId: 10,
      puntuacion: 4,
      comentario: 'Muy recomendable',
    });
  });

  test('el comentario es opcional: sin él se guarda como null', async () => {
    const resultado = await valorarExperiencia(
      1,
      10,
      {
        puntuacion: 3,
      }
    );

    expect(resultado.creada).toBe(true);

    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1,
      experienciaId: 10,
      puntuacion: 3,
      comentario: null,
    });
  });
});

describe('modificar una valoración', () => {
  test('si ya la había valorado, se actualiza la existente con los nuevos datos y no se crea otra', async () => {
    valoracionRepository.guardar.mockImplementation(
      async (datos) => ({
        valoracion: {
          id: 50,
          ...datos,
        },
        creada: false,
      })
    );

    const resultado = await valorarExperiencia(
      1,
      10,
      {
        puntuacion: 2,
        comentario: 'Ha empeorado',
      }
    );

    expect(resultado.creada).toBe(false);

    expect(resultado.valoracion).toMatchObject({
      id: 50,
      puntuacion: 2,
      comentario: 'Ha empeorado',
    });

    expect(valoracionRepository.guardar).toHaveBeenCalledTimes(1);

    expect(valoracionRepository.guardar).toHaveBeenCalledWith({
      usuarioId: 1,
      experienciaId: 10,
      puntuacion: 2,
      comentario: 'Ha empeorado',
    });
  });
});

describe('la puntuación es un entero del 1 al 5', () => {
  test.each([1, 5])(
    'acepta los límites del rango (%p)',
    async (puntuacion) => {
      await expect(
        valorarExperiencia(
          1,
          10,
          { puntuacion }
        )
      ).resolves.toMatchObject({
        creada: true,
      });
    }
  );

  test.each([
    ['por debajo del rango', 0],
    ['por encima del rango', 6],
    ['decimal', 4.5],
    ['texto', '4'],
    ['ausente', undefined],
  ])(
    'rechaza una puntuación %s con 400 y no guarda nada',
    async (_caso, puntuacion) => {
      await expect(
        valorarExperiencia(
          1,
          10,
          { puntuacion }
        )
      ).rejects.toMatchObject({
        status: 400,
      });

      expect(valoracionRepository.guardar).not.toHaveBeenCalled();
    }
  );
});

describe('el comentario, si se envía, es texto', () => {
  test.each([
    [123],
    [{ texto: 'hola' }],
  ])(
    'rechaza un comentario que no es texto (%p) con 400',
    async (comentario) => {
      await expect(
        valorarExperiencia(
          1,
          10,
          {
            puntuacion: 4,
            comentario,
          }
        )
      ).rejects.toMatchObject({
        status: 400,
      });

      expect(valoracionRepository.guardar).not.toHaveBeenCalled();
    }
  );
});

describe('el comentario tiene como máximo 1000 caracteres y se guarda limpio', () => {
  const guardado = () => valoracionRepository.guardar.mock.calls[0][0].comentario;

  test('acepta 1000 caracteres y rechaza 1001 con 400', async () => {
    await valorarExperiencia(1, 10, { puntuacion: 4, comentario: 'a'.repeat(1000) });
    expect(guardado()).toHaveLength(1000);

    await expect(valorarExperiencia(1, 10, { puntuacion: 4, comentario: 'a'.repeat(1001) }))
      .rejects.toMatchObject({ status: 400, message: 'El comentario no puede superar los 1000 caracteres' });
  });

  test('se guarda sin los espacios de los extremos', async () => {
    await valorarExperiencia(1, 10, { puntuacion: 4, comentario: '  Muy bien  ' });

    expect(guardado()).toBe('Muy bien');
  });

  test('un comentario de solo espacios se guarda como sin comentario', async () => {
    await valorarExperiencia(1, 10, { puntuacion: 4, comentario: '   ' });

    expect(guardado()).toBeNull();
  });

  test('las letras con tilde se guardan en su forma compuesta (NFC)', async () => {
    await valorarExperiencia(1, 10, { puntuacion: 4, comentario: 'Cafe\u0301' });

    expect(guardado()).toBe('Café');
    expect(guardado()).toHaveLength(4);
  });
});

describe('quién puede valorar', () => {
  test('si el usuario de la sesión ya no existe responde 401', async () => {
    await expect(
      valorarExperiencia(
        99,
        10,
        { puntuacion: 4 }
      )
    ).rejects.toMatchObject({
      status: 401,
    });

    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('un identificador de experiencia no válido responde 400', async () => {
    await expect(
      valorarExperiencia(
        1,
        NaN,
        { puntuacion: 4 }
      )
    ).rejects.toMatchObject({
      status: 400,
    });

    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia inexistente responde 404', async () => {
    await expect(
      valorarExperiencia(
        1,
        999,
        { puntuacion: 4 }
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Contenido no disponible',
    });

    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia privada de otro usuario responde 404, igual que si no existiera', async () => {
    await expect(
      valorarExperiencia(
        1,
        11,
        { puntuacion: 4 }
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Contenido no disponible',
    });

    expect(valoracionRepository.guardar).not.toHaveBeenCalled();
  });

  test('una experiencia de amigos sin ser amigos del autor responde 404', async () => {
    await expect(
      valorarExperiencia(
        1,
        12,
        { puntuacion: 4 }
      )
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(
      amistadService.sonAmigos
    ).toHaveBeenCalledWith(1, 2);

    expect(
      valoracionRepository.guardar
    ).not.toHaveBeenCalled();
  });

  test('una experiencia de amigos siendo amigo del autor sí se puede valorar', async () => {
    amistadService.sonAmigos.mockResolvedValue(true);

    await expect(
      valorarExperiencia(
        1,
        12,
        { puntuacion: 4 }
      )
    ).resolves.toMatchObject({
      creada: true,
    });
  });

  test('el autor no puede valorar su propia experiencia: 403', async () => {
    await expect(
      valorarExperiencia(
        2,
        10,
        { puntuacion: 5 }
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'No puedes valorar tu propia experiencia',
    });

    expect(
      valoracionRepository.guardar
    ).not.toHaveBeenCalled();
  });
});

describe('valoraciones de amigos y seguidores - CS-48', () => {
  test('combina amigos y seguidores sin duplicados y devuelve sus valoraciones paginadas', async () => {
    amistadRepository.listarAmigosIds.mockResolvedValue([3, 4]);
    seguimientoRepository.listarSeguidoresIds.mockResolvedValue([4, 5]);

    valoracionRepository.listarDeUsuarios.mockResolvedValue({
      valoraciones: [
        {
          id: 100,
          usuarioId: 3,
        },
      ],
      total: 3,
    });

    const resultado = await listarValoracionesRelacionadas(
      1,
      10,
      2,
      5
    );

    expect(
      amistadRepository.listarAmigosIds
    ).toHaveBeenCalledWith(1);

    expect(
      seguimientoRepository.listarSeguidoresIds
    ).toHaveBeenCalledWith(1);

    expect(
      valoracionRepository.listarDeUsuarios
    ).toHaveBeenCalledWith(
      10,
      [3, 4, 5],
      2,
      5
    );

    expect(resultado).toEqual({
      valoraciones: [
        {
          id: 100,
          usuarioId: 3,
        },
      ],
      total: 3,
    });
  });

  test('si no tiene amigos ni seguidores devuelve la sección vacía sin error', async () => {
    const resultado = await listarValoracionesRelacionadas(
      1,
      10,
      1,
      10
    );

    expect(
      valoracionRepository.listarDeUsuarios
    ).toHaveBeenCalledWith(
      10,
      [],
      1,
      10
    );

    expect(resultado).toEqual({
      valoraciones: [],
      total: 0,
    });
  });

  test('si la experiencia no es visible responde 404, igual que si no existiera', async () => {
    await expect(
      listarValoracionesRelacionadas(
        1,
        11,
        1,
        10
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Contenido no disponible',
    });

    expect(
      valoracionRepository.listarDeUsuarios
    ).not.toHaveBeenCalled();
  });

  test('si la experiencia no existe responde 404', async () => {
    await expect(
      listarValoracionesRelacionadas(
        1,
        999,
        1,
        10
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Contenido no disponible',
    });

    expect(
      valoracionRepository.listarDeUsuarios
    ).not.toHaveBeenCalled();
  });

  test('rechaza una paginación no válida con 400', async () => {
    await expect(
      listarValoracionesRelacionadas(
        1,
        10,
        0,
        10
      )
    ).rejects.toMatchObject({
      status: 400,
    });

    expect(
      valoracionRepository.listarDeUsuarios
    ).not.toHaveBeenCalled();
  });

  test('no incluye valoraciones de usuarios que no son amigos ni seguidores', async () => {
    // El usuario 3 es amigo y el 4 es seguidor.
    // El usuario 99 no tiene ninguna relación con el solicitante.
    amistadRepository.listarAmigosIds.mockResolvedValue([3]);
    seguimientoRepository.listarSeguidoresIds.mockResolvedValue([4]);

    valoracionRepository.listarDeUsuarios.mockResolvedValue({
      valoraciones: [
        {
          id: 20,
          usuarioId: 3,
          puntuacion: 5,
          comentario: 'Valoración de un amigo',
        },
        {
          id: 21,
          usuarioId: 4,
          puntuacion: 4,
          comentario: 'Valoración de un seguidor',
        },
      ],
      total: 2,
    });

    const resultado = await listarValoracionesRelacionadas(
      1,
      10,
      1,
      10
    );

    expect(
      valoracionRepository.listarDeUsuarios
    ).toHaveBeenCalledWith(
      10,
      [3, 4],
      1,
      10
    );

    expect(resultado.valoraciones).toHaveLength(2);

    expect(
      resultado.valoraciones.some(
        (valoracion) => valoracion.usuarioId === 99
      )
    ).toBe(false);
  });
});