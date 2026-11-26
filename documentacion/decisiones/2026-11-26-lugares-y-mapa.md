# Lugares y mapa de un plan: el frontend fija el contrato

**Fecha:** 2026-11-26 · **Historia:** CS-50, CS-73 · **Decidió:** Joaquín (búsqueda tipo mapa, Leaflet copiado en el repositorio, búsqueda a través de nuestro backend, datos provisionales en ficheros); contrato, límites, CSP y referrer, a propuesta de Claude

- **Contexto:** al crear o editar un plan se quieren buscar lugares reales (calles, monumentos, negocios), verlos en un mapa y añadirlos con su ficha. El frontend se hace primero; otro integrante implementará el backend a partir de este contrato.
- **Decisión:**
  - La búsqueda pasa por nuestro backend, que es quien habla con el proveedor externo (desde un repositorio).
  - El plan guarda una copia de cada lugar (nombre, tipo, dirección, coordenadas, imagen y web) más la nota del autor.
  - Contrato:
    - `GET /api/lugares/buscar?q=<texto>&ciudadId=<id>` → `200 [{ proveedorId, nombre, tipo, direccion, lat, lon, imagen, web }]`, máximo 10 y solo de esa ciudad; `imagen` y `web` pueden ser `null`. `400` si falta `q` o la ciudad no es válida.
    - `POST /api/experiencias` y `PATCH /api/experiencias/:id` aceptan `lugares: [{ proveedorId, nombre, tipo, direccion, lat, lon, imagen, web, nota }]`. El orden es el de la lista; máximo 20; `nota` de hasta 300 caracteres. Un lugar fuera de la ciudad o una web que no sea http(s) → `400` sin guardar nada.
    - `GET /api/experiencias/:id` devuelve `lugares` con esos campos más `id`.
  - Mientras no exista el backend, `frontend/js/shared/lugares.js` es el único acceso a los lugares y lee los ficheros de `frontend/datos/`.
  - Leaflet 1.9.4 copiado en `frontend/vendor/leaflet/`, con teselas de OpenStreetMap.
  - CSP: `img-src` admite además `tile.openstreetmap.org` y `upload.wikimedia.org`. Los scripts siguen siendo solo propios y el CAPTCHA.
  - Las teselas se piden con `referrerPolicy: 'origin'`: OpenStreetMap exige saber desde qué web se piden. Recibe solo el origen, nunca la ruta ni la búsqueda; el resto de PlanB sigue en `same-origin`.
- **Alternativas:** llamar al proveedor desde el navegador (rompe la regla de externos solo en repositorios y obliga a abrir más la CSP); catálogo propio de lugares (habría que llenarlo); Leaflet desde un CDN (obliga a abrir `script-src`); guardar en `localStorage` o simular el backend (más código provisional).
- **Consecuencias:** pendiente en el backend: modelo, migración, guardado y búsqueda. Hasta entonces los lugares añadidos en el formulario se envían pero no se guardan. Al conectarlo cambia solo `lugares.js` y se borra `frontend/datos/`. Sin internet el mapa sale vacío y la lista sigue funcionando.
