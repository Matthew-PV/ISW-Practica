// CS-01 (base de CS-02, CS-30 y CS-63): quién puede ver una experiencia según su visibilidad.
// Se simula sonAmigos, que ya se prueba en amistadService.test.js.
jest.mock('../src/services/amistadService', () => ({ sonAmigos: jest.fn() }));

const amistadService = require('../src/services/amistadService');
const { puedeVerExperiencia } = require('../src/services/shared/visibilidad');

beforeEach(() => {
  jest.resetAllMocks();
  amistadService.sonAmigos.mockResolvedValue(false);
});

test('una experiencia pública la puede ver cualquier usuario', async () => {
  await expect(puedeVerExperiencia(1, { autorId: 2, visibilidad: 'PUBLICA' })).resolves.toBe(true);
});

test('una experiencia privada no la puede ver otro usuario', async () => {
  await expect(puedeVerExperiencia(1, { autorId: 2, visibilidad: 'PRIVADA' })).resolves.toBe(false);
});

test('el autor siempre puede ver su experiencia, aunque sea privada', async () => {
  await expect(puedeVerExperiencia(2, { autorId: 2, visibilidad: 'PRIVADA' })).resolves.toBe(true);
});

test('una experiencia de amigos la ve un amigo con la amistad aceptada', async () => {
  amistadService.sonAmigos.mockResolvedValue(true);

  await expect(puedeVerExperiencia(1, { autorId: 2, visibilidad: 'AMIGOS' })).resolves.toBe(true);
  expect(amistadService.sonAmigos).toHaveBeenCalledWith(1, 2);
});

test('una experiencia de amigos no la ve quien no es amigo (o tiene la solicitud pendiente)', async () => {
  // sonAmigos devuelve false tanto sin relación como con la solicitud pendiente
  await expect(puedeVerExperiencia(1, { autorId: 2, visibilidad: 'AMIGOS' })).resolves.toBe(false);
});
