// Valida la forma de los lugares antes de consultar la base de datos o el catálogo.
const { crearError } = require('../../errores');

const MAXIMO_LUGARES = 20;
const MAXIMO_NOTA = 300;
const MAXIMO_TEXTO = 191;
const MAXIMO_DIRECCION = 512;
const MAXIMO_URL = 2048;

function textoObligatorio(valor, nombre, maximo) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw crearError(`${nombre} es obligatorio`, 400);
  }
  const texto = valor.normalize('NFC').trim();
  if (Array.from(texto).length > maximo) {
    throw crearError(`${nombre} no puede superar los ${maximo} caracteres`, 400);
  }
}

function validarUrl(valor, nombre) {
  if (valor === undefined || valor === null) return;
  if (typeof valor !== 'string' || valor.length > MAXIMO_URL) {
    throw crearError(`${nombre} debe ser una URL válida`, 400);
  }
  let url;
  try {
    url = new URL(valor);
  } catch {
    throw crearError(`${nombre} debe ser una URL válida`, 400);
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw crearError(`${nombre} debe usar HTTP o HTTPS`, 400);
  }
}

function leerListaLugares(valor) {
  if (!Array.isArray(valor)) {
    throw crearError('Los lugares deben enviarse como una lista', 400);
  }
  if (valor.length > MAXIMO_LUGARES) {
    throw crearError(`Un plan no puede tener más de ${MAXIMO_LUGARES} lugares`, 400);
  }

  const identificadores = new Set();
  return valor.map((lugar) => {
    if (!lugar || typeof lugar !== 'object' || Array.isArray(lugar)) {
      throw crearError('Cada lugar debe ser un objeto válido', 400);
    }

    textoObligatorio(lugar.proveedorId, 'El identificador del lugar', MAXIMO_TEXTO);
    textoObligatorio(lugar.nombre, 'El nombre del lugar', MAXIMO_TEXTO);
    textoObligatorio(lugar.tipo, 'El tipo del lugar', MAXIMO_TEXTO);
    textoObligatorio(lugar.direccion, 'La dirección del lugar', MAXIMO_DIRECCION);

    if (identificadores.has(lugar.proveedorId)) {
      throw crearError('No puedes añadir el mismo lugar más de una vez', 400);
    }
    identificadores.add(lugar.proveedorId);

    if (typeof lugar.lat !== 'number' || !Number.isFinite(lugar.lat) || lugar.lat < -90 || lugar.lat > 90) {
      throw crearError('La latitud del lugar no es válida', 400);
    }
    if (typeof lugar.lon !== 'number' || !Number.isFinite(lugar.lon) || lugar.lon < -180 || lugar.lon > 180) {
      throw crearError('La longitud del lugar no es válida', 400);
    }

    validarUrl(lugar.imagen, 'La imagen del lugar');
    validarUrl(lugar.web, 'La web del lugar');

    let nota = null;
    if (lugar.nota !== undefined && lugar.nota !== null) {
      if (typeof lugar.nota !== 'string') {
        throw crearError('La nota del lugar debe ser un texto', 400);
      }
      nota = lugar.nota.normalize('NFC').trim() || null;
      if (nota && Array.from(nota).length > MAXIMO_NOTA) {
        throw crearError(`La nota del lugar no puede superar los ${MAXIMO_NOTA} caracteres`, 400);
      }
    }

    return { proveedorId: lugar.proveedorId, nota };
  });
}

module.exports = { leerListaLugares };
