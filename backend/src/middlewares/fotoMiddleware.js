// Recepción de la foto de perfil: un único archivo en el campo `foto` de un formulario
// multipart. Se guarda en memoria (no en disco) porque se sube directamente a Cloudinary.
// Capa: middlewares (se ejecutan antes de la ruta, dentro de la capa de rutas).
// Lo usa: routes/perfilRoutes.js (PUT /foto).
// Usa: la librería multer y errores.js.
//
// express.json() (en app.js) solo entiende JSON. Los archivos llegan en formato multipart
// (como un formulario HTML con <input type="file">) y para leerlos hace falta multer.
// Aquí solo se recibe el archivo y se comprueba el tamaño; si es una imagen válida
// lo decide services/perfilService.js.
const multer = require('multer');
const { crearError } = require('../errores');

const FOTO_MAX_MB = 5;

// Lector de multer ya configurado: guarda el archivo en memoria, como mucho uno, del tamaño
// máximo indicado, y solo del campo `foto`.
// multer deja de leer en cuanto el archivo supera el límite, sin cargarlo entero en memoria
const recibir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FOTO_MAX_MB * 1024 * 1024, files: 1 },
}).single('foto');

// Deja la foto en req.file. Cualquier error al leer el formulario es culpa de la petición: 400.
// `req.file.buffer` tiene el contenido del archivo; si no se envió ninguno, req.file es undefined
// y es el servicio quien responde «Falta la foto».
function recibirFoto(req, res, next) {
  recibir(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(crearError(`La foto no puede superar los ${FOTO_MAX_MB} MB`, 400));
    }
    // Otros errores de multer: más de un archivo, campo con otro nombre, formulario roto...
    next(crearError('Envía una sola foto en el campo «foto»', 400));
  });
}

module.exports = { recibirFoto };
