// La foto de perfil se sirve reducida desde Cloudinary.
jest.mock('cloudinary', () => ({
  v2: { uploader: { upload_stream: (opciones, listo) => ({
    end: () => listo(null, { secure_url: 'https://res.cloudinary.com/x/image/upload/v1/planb/perfiles/usuario-1.jpg' }),
  }) } },
}));
const { subirFotoPerfil } = require('../../src/repositories/fotoRepository');

test('devuelve la URL recortada a 300 px con formato y calidad automáticos', async () => {
  await expect(subirFotoPerfil(1, Buffer.from(''))).resolves.toBe(
    'https://res.cloudinary.com/x/image/upload/c_fill,g_face,w_300,h_300,f_auto,q_auto/v1/planb/perfiles/usuario-1.jpg'
  );
});
