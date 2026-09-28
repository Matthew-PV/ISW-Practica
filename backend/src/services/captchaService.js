// Verificación del CAPTCHA (Cloudflare Turnstile) en el servidor.
// El navegador resuelve el CAPTCHA y envía un token de un solo uso; aquí se pregunta a
// Cloudflare si ese token es válido usando la clave secreta (TURNSTILE_SECRET_KEY).
const URL_VERIFICACION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Devuelve true si Cloudflare da el token por bueno. Si no hay token, o no se puede
// contactar con Cloudflare, devuelve false: sin verificación no se deja pasar.
async function verificar(token, ip) {
  if (typeof token !== 'string' || token === '') {
    return false;
  }

  try {
    const res = await fetch(URL_VERIFICACION, {
      method: 'POST',
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: token,
        remoteip: ip ?? '',
      }),
    });
    const datos = await res.json();
    return datos.success === true;
  } catch {
    return false;
  }
}

module.exports = { verificar };
