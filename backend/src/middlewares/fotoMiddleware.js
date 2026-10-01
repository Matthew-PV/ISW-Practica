// Recepción de la foto de perfil: un único archivo en el campo `foto` de un formulario
// multipart. Se guarda en memoria (no en disco) porque se sube directamente a Cloudinary.
const multer = require('multer');
const { crearError } = require('../errores');

const FOTO_MAX_MB = 5;

// multer deja de leer en cuanto el archivo supera el límite, sin cargarlo entero en memoria
const recibir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FOTO_MAX_MB * 1024 * 1024, files: 1 },
}).single('foto');

// Deja la foto en req.file. Cualquier error al leer el formulario es culpa de la petición: 400.
function recibirFoto(req, res, next) {
  recibir(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(crearError(`La foto no puede superar los ${FOTO_MAX_MB} MB`, 400));
    }
    next(crearError('Envía una sola foto en el campo «foto»', 400));
  });
}

module.exports = { recibirFoto };
