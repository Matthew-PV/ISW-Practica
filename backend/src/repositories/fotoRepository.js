// Almacenamiento de las fotos en Cloudinary (fuera de la base de datos).
// El SDK lee las credenciales de la variable CLOUDINARY_URL de .env.
// Capa: repositorios (repositories). Es un repositorio aunque no use MySQL: guarda datos
//       (las imágenes) en un servicio externo.
// Lo usa: services/perfilService.js.
// Usa: la librería cloudinary (por internet).
//
// En MySQL solo se guarda la URL que devuelve esta función (columna Usuario.foto).
const { v2: cloudinary } = require('cloudinary');

// Sube la foto de perfil y devuelve su URL pública (https). Cada usuario tiene una sola foto:
// se guarda siempre con el mismo nombre, así que una nueva sustituye a la anterior.
// Si Cloudinary la rechaza, la anterior se conserva.
// - `usuarioId`: da nombre al archivo (planb/perfiles/usuario-<id>).
// - `contenido`: el archivo en memoria (Buffer), ya validado por el servicio.
// El SDK de Cloudinary usa callbacks; se envuelve en una promesa para poder usar await.
function subirFotoPerfil(usuarioId, contenido) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'planb/perfiles',
          public_id: `usuario-${usuarioId}`,
          overwrite: true,
          invalidate: true, // que la CDN deje de servir la versión antigua
          resource_type: 'image',
        },
        (err, resultado) => (err ? reject(err) : resolve(resultado.secure_url))
      )
      // upload_stream abre la subida; .end() le pasa el archivo y la termina
      .end(contenido);
  });
}

// Sube a Cloudinary una foto que ya está en internet (la descarga Cloudinary) y devuelve su URL.
// Solo para los datos de demo (prisma/seed-demo.js): van a su propia carpeta y con nombre fijo,
// así no pisan las fotos reales (planb/perfiles/usuario-<id>) y repetir la carga no duplica.
// - `nombre`: da nombre al archivo (planb/demo/<nombre>).
// - `urlOrigen`: dirección https de la imagen original. Se guarda recortada en cuadrado de 400 px,
//   centrada en la cara.
async function subirFotoDemo(nombre, urlOrigen) {
  const resultado = await cloudinary.uploader.upload(urlOrigen, {
    folder: 'planb/demo',
    public_id: nombre,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });
  return resultado.secure_url;
}

module.exports = { subirFotoPerfil, subirFotoDemo };
