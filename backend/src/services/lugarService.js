// Búsqueda y verificación de lugares del catálogo demo.
// Capa: servicios (services).
// Usa: repositories/lugarRepository.js y repositories/ciudadRepository.js.
const ciudadRepository = require('../repositories/ciudadRepository');
const lugarRepository = require('../repositories/lugarRepository');
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
  return lugarRepository.buscar(texto, ciudad);
}

function resolverLugares(lugares, ciudad) {
  if (lugares === undefined || lugares.length === 0) return lugares;

  const catalogo = lugarRepository.buscarPorProveedorIds(lugares.map((lugar) => lugar.proveedorId));
  const porId = new Map(catalogo.map((lugar) => [lugar.proveedorId, lugar]));
  const canonicos = lugares.map(({ proveedorId, nota }) => {
    const ficha = porId.get(proveedorId);
    if (!ficha) throw crearError('El lugar seleccionado no está en el catálogo', 400);
    return { ...ficha, nota };
  });

  if (!lugarRepository.perteneceACiudad(ciudad)) {
    throw crearError('Los lugares deben pertenecer a la ciudad del plan', 400);
  }
  return canonicos;
}

function comprobarCompatibilidad(lugares, ciudad) {
  const proveedorIds = (lugares ?? []).map((lugar) => lugar.proveedorId);
  if (proveedorIds.length === 0) return;
  resolverLugares(proveedorIds.map((proveedorId) => ({ proveedorId, nota: null })), ciudad);
}

module.exports = { buscar, resolverLugares, comprobarCompatibilidad };
