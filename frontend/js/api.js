// Llamadas a la API del backend. Devuelve el JSON o lanza un error con el mensaje del servidor.
async function api(ruta, opciones = {}) {
  const res = await fetch(`/api${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(datos?.error || `Error ${res.status}`);
  }
  return datos;
}
