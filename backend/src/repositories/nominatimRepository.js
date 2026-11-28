// Adaptador de Nominatim (CS-50). Solo este repositorio llama al proveedor.
// Un único backend debe atender el tráfico de PlanB al servicio público: su límite es global.
const { crearError } = require('../errores');

const BASE = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org/';
const IDENTIDAD = 'PlanB-ISW/1.0 (https://github.com/Matthew-PV/ISW-Practica)';
const cache = new Map();
let cola = Promise.resolve();
let ultimoInicio = -Infinity;
let pendientes = 0;
const normalizar = texto => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
const tipos = { node: 'N', way: 'W', relation: 'R' };
const leerId = id => /^osm:([NWR]\d+):([a-z_]+)$/.exec(id);

// Cola única y caché limitada: las pruebas y la interfaz no deben disparar consultas masivas.
function consultar(ruta, parametros) {
  const url = new URL(ruta, BASE.endsWith('/') ? BASE : `${BASE}/`);
  url.search = new URLSearchParams({ format: 'jsonv2', addressdetails: '1',
    extratags: '1', namedetails: '1', 'accept-language': 'es,en', ...parametros });
  const clave = url.href;
  const anterior = cache.get(clave);
  if (anterior && anterior.hasta > Date.now()) return anterior.promesa;
  if (pendientes >= 20) return Promise.reject(crearError('El buscador está ocupado. Inténtalo de nuevo.', 503));
  pendientes++;
  const promesa = cola.then(async () => {
    const espera = Math.max(0, 1100 - (Date.now() - ultimoInicio));
    if (espera) await new Promise(resolve => setTimeout(resolve, espera));
    ultimoInicio = Date.now();
    try {
      const res = await fetch(clave, {
        headers: { 'User-Agent': IDENTIDAD }, signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error('Respuesta del proveedor no válida');
      const datos = await res.json();
      if (!Array.isArray(datos)) throw new Error('Formato no válido');
      return datos;
    } catch {
      cache.delete(clave);
      throw crearError('No se puede consultar el proveedor de lugares. Inténtalo de nuevo.', 503);
    }
  }).finally(() => { pendientes--; });
  cola = promesa.catch(() => {});
  if (cache.size >= 128) cache.delete(cache.keys().next().value);
  cache.set(clave, { hasta: Date.now() + 15 * 60 * 1000, promesa });
  return promesa;
}

function urlSegura(valor) {
  try {
    const url = new URL(valor);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      && url.href.length <= 2048 ? url.href : null;
  } catch { return null; }
}

function fichaDe(dato) {
  const tipo = tipos[dato.osm_type];
  const clase = dato.category;
  const lat = Number(dato.lat), lon = Number(dato.lon);
  if (!tipo || !/^\d+$/.test(String(dato.osm_id)) || !/^[a-z_]+$/.test(clase)
      || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180
      || typeof dato.name !== 'string' || !dato.name.trim()
      || typeof dato.type !== 'string' || !dato.type
      || typeof dato.display_name !== 'string' || !dato.display_name) return null;
  // No se recortan fichas silenciosamente ni se usan imágenes con licencia desconocida.
  if (Array.from(dato.name).length > 191 || Array.from(dato.type).length > 191
      || Array.from(dato.display_name).length > 512) return null;
  return { proveedorId: `osm:${tipo}${dato.osm_id}:${clase}`, nombre: dato.name,
    tipo: dato.type, direccion: dato.display_name, lat, lon, imagen: null,
    web: urlSegura(dato.extratags?.website || dato.extratags?.['contact:website']) };
}

// Punto dentro de Polygon/MultiPolygon, incluidos huecos. No se usa la caja como municipio.
function enAnillo([x, y], puntos) {
  let dentro = false;
  for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
    const [xi, yi] = puntos[i], [xj, yj] = puntos[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
function enPoligono(punto, anillos) {
  return enAnillo(punto, anillos[0]) && !anillos.slice(1).some(a => enAnillo(punto, a));
}
function pertenece(dato, municipio) {
  const ficha = fichaDe(dato);
  if (!ficha || dato.address?.country_code?.toLowerCase() !== municipio.pais) return false;
  const punto = [ficha.lon, ficha.lat], g = municipio.geometria;
  return g.type === 'Polygon' ? enPoligono(punto, g.coordinates)
    : g.coordinates.some(p => enPoligono(punto, p));
}

async function municipioDe(ciudad) {
  if (!/^[a-z]{2}$/i.test(ciudad.codigoPais || '')) {
    throw crearError('Esta ciudad necesita un país identificado para buscar lugares.', 400);
  }
  const pais = ciudad.codigoPais.toLowerCase();
  const resultados = await consultar('search', { q: ciudad.nombre, countrycodes: pais,
    featureType: 'city', polygon_geojson: '1', limit: '10' });
  const candidatos = resultados.filter(dato => {
    const nombres = [dato.name, ...Object.values(dato.namedetails || {})].filter(n => typeof n === 'string');
    return dato.type === 'administrative' && ['Polygon', 'MultiPolygon'].includes(dato.geojson?.type)
      && dato.address?.country_code?.toLowerCase() === pais
      && nombres.some(n => normalizar(n) === normalizar(ciudad.nombre));
  });
  // El mismo objeto puede aparecer con varias clasificaciones.
  const unicos = [...new Map(candidatos.map(d => [`${d.osm_type}:${d.osm_id}`, d])).values()];
  if (unicos.length !== 1) {
    throw crearError('No se puede identificar con seguridad el municipio de esta ciudad.', 400);
  }
  const dato = unicos[0];
  return { geometria: dato.geojson, pais, caja: dato.boundingbox };
}

async function buscar(texto, ciudad) {
  const municipio = await municipioDe(ciudad);
  const [sur, norte, oeste, este] = municipio.caja;
  const resultados = await consultar('search', { q: `${texto}, ${ciudad.nombre}`,
    countrycodes: municipio.pais, viewbox: `${oeste},${norte},${este},${sur}`,
    bounded: '1', limit: '10' });
  return [...new Map(resultados.filter(d => pertenece(d, municipio))
    .map(d => { const ficha = fichaDe(d); return [ficha.proveedorId, ficha]; })).values()];
}

async function resolver(ids, ciudad) {
  if (!ids.length) return [];
  const referencias = ids.map(id => leerId(id));
  if (referencias.some(id => !id)) throw crearError('El identificador del lugar no es válido.', 400);
  const municipio = await municipioDe(ciudad);
  const resultados = await consultar('lookup', { osm_ids: [...new Set(referencias.map(id => id[1]))].join(',') });
  const porId = new Map(resultados.filter(d => pertenece(d, municipio))
    .map(d => { const ficha = fichaDe(d); return [ficha.proveedorId, ficha]; }));
  return ids.map(id => {
    const ficha = porId.get(id);
    if (!ficha) throw crearError('El lugar no existe o no pertenece a la ciudad del plan.', 400);
    return ficha;
  });
}

module.exports = { buscar, resolver };
