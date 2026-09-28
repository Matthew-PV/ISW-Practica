// Llamadas a la API del backend. Devuelve el JSON o lanza un error con el mensaje del servidor.
async function api(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`/api${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    // fetch solo falla así si no llega al servidor (caído o sin red); su mensaje es en inglés
    throw new Error('No se ha podido conectar con el servidor. Inténtalo de nuevo.');
  }
  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(datos?.error || `Error ${res.status}`);
  }
  return datos;
}
