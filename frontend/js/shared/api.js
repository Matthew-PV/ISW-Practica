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
const PLAZO_MS = 30000;
// Subir un archivo (foto) puede tardar bastante más
const PLAZO_ARCHIVO_MS = 120000;

// Peticiones GET en curso: quien pide lo mismo mientras tanto recibe la misma respuesta.
// No guarda datos: cada una se olvida al terminar, y cualquier escritura las olvida todas
const enCurso = new Map();

function api(ruta, opciones = {}) {
  if (opciones.method && opciones.method !== 'GET') enCurso.clear();
  if (Object.keys(opciones).length) return pedirAlServidor(ruta, opciones);
  if (!enCurso.has(ruta)) {
    const peticion = pedirAlServidor(ruta, opciones).finally(() => {
      if (enCurso.get(ruta) === peticion) enCurso.delete(ruta);
    });
    enCurso.set(ruta, peticion);
  }
  return enCurso.get(ruta);
}

async function pedirAlServidor(ruta, opciones) {
  let res;
  // Plazo máximo para que un servidor que no responde no deje la pantalla esperando siempre
  const plazo = new AbortController();
  const conArchivo = opciones.body instanceof FormData;
  const temporizador = setTimeout(() => plazo.abort(), conArchivo ? PLAZO_ARCHIVO_MS : PLAZO_MS);
  // Si se corta una escritura, puede que el servidor la haya guardado: repetirla podría duplicarla
  const tardanza = () => new Error(opciones.method && opciones.method !== 'GET'
    ? 'El servidor ha tardado demasiado en responder. Puede que se haya guardado: compruébalo antes de repetirlo.'
    : 'El servidor ha tardado demasiado en responder. Inténtalo de nuevo.');
  try {
    // La ruta es relativa (mismo servidor que sirve la página), así que el navegador envía
    // sola la cookie de sesión y no hace falta gestionarla aquí.
    res = await fetch(`/api${ruta}`, {
      // Por defecto se envía JSON. Con un archivo (FormData) no se pone: la cabecera la pone
      // el navegador, con el separador del formulario multipart. Las opciones de quien llama
      // van después y pueden cambiarlo
      headers: opciones.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      signal: plazo.signal,
      ...opciones,
    });
  } catch {
    // fetch solo falla así si no llega al servidor (caído o sin red); su mensaje es en inglés
    clearTimeout(temporizador);
    if (plazo.signal.aborted) throw tardanza();
    throw new Error('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
  }
  // Se lee el cuerpo como JSON; si viene vacío, no es JSON o el plazo vence a medias, se queda
  // en null en vez de fallar. El plazo cubre también esta lectura
  const datos = await res.json().catch(() => null);
  clearTimeout(temporizador);
  if (plazo.signal.aborted) {
    throw tardanza();
  }
  // Códigos 4xx/5xx: el backend manda { error: 'mensaje' }; si no lo trae, se usa el código
  if (!res.ok) {
    const error = new Error(datos?.error || `Error ${res.status}`);
    error.status = res.status;
    // Al guardar con la sesión caducada se avisa sin salir, para no perder lo escrito
    if (res.status === 401 && opciones.method && opciones.method !== 'GET' && enPaginaPrivada()) avisarSesionCaducada();
    throw error;
  }
  return datos;
}

// Funciones que usan los scripts de las páginas, que se cargan después de este. En el navegador
// ya serían globales; se dejan en window de forma explícita para que también lo sean cuando las
// pruebas cargan el archivo como módulo (para medir su cobertura).
window.api = api;

// Páginas con sesión: todo lo de /paginas/ menos las de acceso
function enPaginaPrivada() {
  return /^\/paginas\/(?!acceso\/)/.test(window.location.pathname);
}

function avisarSesionCaducada() {
  if (document.querySelector('.aviso-sesion')) return;
  const aviso = document.createElement('div');
  aviso.className = 'alert alert-warning aviso-sesion';
  aviso.setAttribute('role', 'alert');
  const enlace = document.createElement('a');
  enlace.href = '/paginas/acceso/iniciar-sesion.html';
  enlace.target = '_blank';
  enlace.textContent = 'Inicia sesión en otra pestaña';
  aviso.append('Tu sesión ha caducado. ', enlace, ' y vuelve a guardar.');
  document.body.append(aviso);
}

// Adonde ir tras entrar o registrarse: la pantalla de ?volver= si es una propia, o Inicio
function destinoTrasAcceso() {
  const volver = new URLSearchParams(window.location.search).get('volver') ?? '';
  return /^\/paginas\/(?!acceso\/)[\w-]+\/[\w-]+\.html(\?[^#]*)?$/.test(volver)
    ? volver
    : '/paginas/cuenta/bienvenida.html';
}
window.destinoTrasAcceso = destinoTrasAcceso;

// Los enlaces entre iniciar sesión y registro conservan la vuelta
function conservarVuelta(pagina) {
  if (!new URLSearchParams(window.location.search).has('volver')) return;
  for (const enlace of document.querySelectorAll(`a[href="/paginas/acceso/${pagina}"]`)) {
    enlace.href += window.location.search;
  }
}
window.conservarVuelta = conservarVuelta;

// Con «atrás», el navegador puede restaurar la pantalla tal como se dejó (botones desactivados, o
// datos privados tras cerrar sesión): se vuelve a cargar
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});
