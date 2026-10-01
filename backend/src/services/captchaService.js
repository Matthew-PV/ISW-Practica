// Verificación del CAPTCHA (Cloudflare Turnstile) en el servidor.
// El navegador resuelve el CAPTCHA y envía un token de un solo uso; aquí se pregunta a
// Cloudflare si ese token es válido usando la clave secreta (TURNSTILE_SECRET_KEY).
// Capa: servicios (services).
// Lo usa: services/authService.js (en el registro).
// Usa: la API de Cloudflare, por internet.
//
// Que el frontend muestre el CAPTCHA no protege nada por sí solo: un programa podría
// llamar a la API directamente. Por eso el servidor comprueba el token con Cloudflare.
// En las pruebas se sustituye por uno que siempre acepta (tests/setup.js).
const URL_VERIFICACION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Devuelve true si Cloudflare da el token por bueno. Si no hay token, o no se puede
// contactar con Cloudflare, devuelve false: sin verificación no se deja pasar.
// - `token`: la respuesta del CAPTCHA que envía el formulario de registro.
// - `ip`: la IP del navegador; Cloudflare la usa como dato extra para detectar abusos.
async function verificar(token, ip) {
  if (typeof token !== 'string' || token === '') {
    return false;
  }

  try {
    // Cloudflare espera los datos como formulario (URLSearchParams), no como JSON
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
    // Sin red, Cloudflare caído o respuesta que no es JSON
    return false;
  }
}

module.exports = { verificar };
