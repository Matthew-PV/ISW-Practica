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

module.exports = { subirFotoPerfil };
