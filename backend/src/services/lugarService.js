// Búsqueda externa y verificación de lugares. Conserva compatibilidad con fichas demo guardadas.
// Capa: servicios (services).
// Usa: repositories/lugarRepository.js y repositories/ciudadRepository.js.
const ciudadRepository = require('../repositories/ciudadRepository');
const lugarRepository = require('../repositories/lugarRepository');
const nominatimRepository = require('../repositories/nominatimRepository');
const { leerTextoCorto, ID_MAX } = require('./shared/datosExperiencia');
const { crearError } = require('../errores');

function leerCiudadId(valor) {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
    throw crearError('El identificador de la ciudad no es válido', 400);
  }
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id > ID_MAX) {
    throw crearError('El identificador de la ciudad no es válido', 400);
  }
  return id;
}

async function buscar({ q, ciudadId }) {
  const texto = leerTextoCorto(q, 'La búsqueda', true);
  const id = leerCiudadId(ciudadId);
  const ciudad = await ciudadRepository.buscarPorId(id);
  if (!ciudad) throw crearError('La ciudad seleccionada no existe', 400);
  return nominatimRepository.buscar(texto, ciudad);
}

async function resolverLugares(lugares, ciudad, existentes = []) {
  if (lugares === undefined || lugares.length === 0) return lugares;
  // Las fichas ya verificadas se conservan al editar nota/orden en la misma ciudad.
  const porId = new Map(existentes.map(({ id, orden, nota, ...ficha }) => [ficha.proveedorId, ficha]));
  const nuevos = lugares.filter(lugar => !porId.has(lugar.proveedorId));
  const demo = nuevos.filter(lugar => lugar.proveedorId.startsWith('demo-'));
  if (demo.length) {
    if (!lugarRepository.perteneceACiudad(ciudad)) {
      throw crearError('Los lugares deben pertenecer a la ciudad del plan', 400);
    }
    const catalogo = lugarRepository.buscarPorProveedorIds(demo.map(lugar => lugar.proveedorId));
    catalogo.forEach(ficha => porId.set(ficha.proveedorId, ficha));
  }
  const externos = nuevos.filter(lugar => !lugar.proveedorId.startsWith('demo-'));
  if (externos.length) {
    const fichas = await nominatimRepository.resolver(externos.map(lugar => lugar.proveedorId), ciudad);
    fichas.forEach(ficha => porId.set(ficha.proveedorId, ficha));
  }
  return lugares.map(({ proveedorId, nota }) => {
    const ficha = porId.get(proveedorId);
    if (!ficha) throw crearError('El lugar seleccionado no está en el catálogo', 400);
    return { ...ficha, nota };
  });
}

async function comprobarCompatibilidad(lugares, ciudad) {
  const proveedorIds = (lugares ?? []).map((lugar) => lugar.proveedorId);
  if (proveedorIds.length === 0) return;
  await resolverLugares(proveedorIds.map((proveedorId) => ({ proveedorId, nota: null })), ciudad);
}

module.exports = { buscar, resolverLugares, comprobarCompatibilidad };
