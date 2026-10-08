// Función común para hablar con el backend. La cargan todas las páginas antes que su propio
// script, así que `api` está disponible como función global en el JS de cada página.
//
// Uso: `await api('/auth/login', { method: 'POST', body: JSON.stringify(datos) })`.
//  - `ruta`: la parte que va detrás de /api (por ejemplo '/auth/yo').
//  - `opciones`: las mismas que acepta fetch (method, body...). Si no se indica, es un GET.
// Devuelve el JSON de la respuesta (o null si no trae cuerpo). Si algo va mal, lanza un Error
// cuyo mensaje ya se puede enseñar al usuario tal cual. Si el servidor respondió con un error,
// el Error lleva además su código HTTP en `status` (por ejemplo, 404), para que la página pueda
// distinguir los casos sin depender del texto del mensaje.
async function api(ruta, opciones = {}) {
  let res;
  try {
    // La ruta es relativa (mismo servidor que sirve la página), así que el navegador envía
    // sola la cookie de sesión y no hace falta gestionarla aquí.
    res = await fetch(`/api${ruta}`, {
      // Por defecto se envía JSON. Con un archivo (FormData) no se pone: la cabecera la pone
      // el navegador, con el separador del formulario multipart. Las opciones de quien llama
      // van después y pueden cambiarlo
      headers: opciones.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    // fetch solo falla así si no llega al servidor (caído o sin red); su mensaje es en inglés
    throw new Error('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
  }
  // Se lee el cuerpo como JSON; si viene vacío o no es JSON, se queda en null en vez de fallar
  const datos = await res.json().catch(() => null);
  // Códigos 4xx/5xx: el backend manda { error: 'mensaje' }; si no lo trae, se usa el código
  if (!res.ok) {
    const error = new Error(datos?.error || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return datos;
}

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
window.api = api;
