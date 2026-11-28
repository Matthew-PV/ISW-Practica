jest.mock('../../src/repositories/nominatimRepository');
jest.mock('../../src/repositories/ciudadRepository');
const nominatim = require('../../src/repositories/nominatimRepository');
const ciudades = require('../../src/repositories/ciudadRepository');
const servicio = require('../../src/services/lugarService');
const MADRID = { id: 1, nombre: 'Madrid', pais: 'España', codigoPais: 'ES' };
const ficha = { proveedorId: 'osm:R2:tourism', nombre: 'Museo', tipo: 'museum',
  direccion: 'Museo, Madrid', lat: 5, lon: 5, imagen: null, web: null };
beforeEach(() => jest.resetAllMocks());

test('la búsqueda consulta al proveedor externo con la ciudad del servidor', async () => {
  ciudades.buscarPorId.mockResolvedValue(MADRID);
  nominatim.buscar.mockResolvedValue([ficha]);
  expect(await servicio.buscar({ q: 'museo', ciudadId: '1' })).toEqual([ficha]);
  expect(nominatim.buscar).toHaveBeenCalledWith('museo', MADRID);
});

test('resuelve una ficha nueva en el proveedor y conserva solo la nota del autor', async () => {
  nominatim.resolver.mockResolvedValue([ficha]);
  expect(await servicio.resolverLugares([{ proveedorId: ficha.proveedorId, nota: 'Visitar' }], MADRID))
    .toEqual([{ ...ficha, nota: 'Visitar' }]);
});

test('editar notas u orden de fichas existentes no depende de internet ni acepta cambios de ficha', async () => {
  const existente = { id: 99, ...ficha, nota: 'Vieja' };
  expect(await servicio.resolverLugares([{ proveedorId: ficha.proveedorId, nota: 'Nueva' }], MADRID, [existente]))
    .toEqual([{ ...ficha, nota: 'Nueva' }]);
  expect(nominatim.resolver).not.toHaveBeenCalled();
});

test('cambiar de ciudad vuelve a verificar los lugares existentes', async () => {
  nominatim.resolver.mockRejectedValue(Object.assign(new Error('Fuera de ciudad'), { status: 400 }));
  await expect(servicio.comprobarCompatibilidad([{ ...ficha }], { ...MADRID, id: 2, nombre: 'Paris', codigoPais: 'FR' }))
    .rejects.toMatchObject({ status: 400 });
});

test('los IDs demo guardados siguen resolviéndose sin proveedor', async () => {
  const resultado = await servicio.resolverLugares([{ proveedorId: 'demo-plaza-mayor', nota: 'Aquí' }], MADRID);
  expect(resultado[0]).toMatchObject({ nombre: 'Plaza Mayor', nota: 'Aquí' });
  expect(nominatim.resolver).not.toHaveBeenCalled();
});
