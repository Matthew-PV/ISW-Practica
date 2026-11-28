// Acceso al catálogo demo de lugares. Solo este repositorio conoce su ubicación y contenido.
// Capa: repositorios (repositories).
const catalogo = require('../../data/lugares-madrid.json');

const MAXIMO_RESULTADOS = 10;

const normalizar = (texto) => texto
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase();

function perteneceACiudad(ciudad) {
  if (!ciudad || typeof ciudad.nombre !== 'string' || typeof ciudad.pais !== 'string') return false;
  return normalizar(ciudad.nombre) === normalizar(catalogo.ciudad.nombre)
    && normalizar(ciudad.pais) === normalizar(catalogo.ciudad.pais);
}

function buscar(texto, ciudad) {
  if (!perteneceACiudad(ciudad)) return [];

  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  return catalogo.lugares
    .filter((lugar) => {
      const datos = normalizar(`${lugar.nombre} ${lugar.tipo} ${lugar.direccion}`);
      return palabras.every((palabra) => datos.includes(palabra));
    })
    .slice(0, MAXIMO_RESULTADOS);
}

function buscarPorProveedorIds(proveedorIds) {
  const ids = new Set(proveedorIds);
  return catalogo.lugares.filter((lugar) => ids.has(lugar.proveedorId));
}

module.exports = { buscar, buscarPorProveedorIds, perteneceACiudad };
