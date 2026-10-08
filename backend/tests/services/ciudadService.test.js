// Cobertura del catálogo inicial y carga preparada por el servicio.
jest.mock('../../src/repositories/ciudadRepository', () => ({ cargarCapitales: jest.fn() }));

const catalogo = require('../../data/capitales.json');
const ciudadRepository = require('../../src/repositories/ciudadRepository');
const { cargarCatalogoInicial } = require('../../src/services/ciudadService');

test('cubre 195 países con códigos distintos y al menos una capital o sede', () => {
  expect(catalogo.paises).toHaveLength(195);
  expect(new Set(catalogo.paises.map((p) => p.codigoPais)).size).toBe(195);
  for (const pais of catalogo.paises) {
    expect(pais.codigoPais).toMatch(/^[A-Z]{2}$/);
    expect(pais.pais.trim()).not.toBe('');
    expect(pais.capitales.length).toBeGreaterThan(0);
    expect(new Set(pais.capitales).size).toBe(pais.capitales.length);
    for (const nombre of pais.capitales) {
      expect(nombre.trim()).not.toBe('');
      expect(Array.from(nombre).length).toBeLessThanOrEqual(191);
    }
  }
});

test('incluye los observadores y las capitales o sedes de los casos especiales', () => {
  const capitales = (codigo) => catalogo.paises.find((p) => p.codigoPais === codigo).capitales;
  expect(capitales('VA')).toEqual(['Vatican City']);
  expect(capitales('PS')).toEqual(['East Jerusalem', 'Ramallah']);
  expect(capitales('ZA')).toEqual(expect.arrayContaining(['Pretoria', 'Bloemfontein', 'Cape Town']));
  expect(capitales('LK')).toEqual(expect.arrayContaining(['Sri Jayawardenepura Kotte', 'Colombo']));
  expect(capitales('NR')).toEqual(['Yaren']);
  expect(capitales('ES')).toEqual(['Madrid']);
  expect(capitales('GQ')).toEqual(['Ciudad de la Paz']);
});

test('el servicio entrega las 201 entradas al repositorio sin acceder a Prisma', async () => {
  ciudadRepository.cargarCapitales.mockResolvedValue({ creadas: 201, reutilizadas: 0, existentes: 0 });
  await expect(cargarCatalogoInicial()).resolves.toEqual({ creadas: 201, reutilizadas: 0, existentes: 0 });
  const entradas = ciudadRepository.cargarCapitales.mock.calls[0][0];
  expect(entradas).toHaveLength(201);
  expect(entradas).toContainEqual({ codigoPais: 'ES', pais: 'España', nombre: 'Madrid' });
  expect(new Set(entradas.map((x) => `${x.codigoPais}:${x.nombre}`)).size).toBe(201);
});
