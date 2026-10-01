// Almacenamiento de las fotos en Cloudinary (fuera de la base de datos).
// El SDK lee las credenciales de la variable CLOUDINARY_URL de .env.
const { v2: cloudinary } = require('cloudinary');

// Sube la foto de perfil y devuelve su URL pública (https). Cada usuario tiene una sola foto:
// se guarda siempre con el mismo nombre, así que una nueva sustituye a la anterior.
// Si Cloudinary la rechaza, la anterior se conserva.
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
      .end(contenido);
  });
}

module.exports = { subirFotoPerfil };
