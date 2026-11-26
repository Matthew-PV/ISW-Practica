# Lectura de la sesión: solo en la API y con errores visibles

**Fecha:** 2026-11-26 · **Historia:** sin historia · **Decidió:** Joaquín de Vicente, a propuesta de Claude

- **Contexto:** la librería del almacén responde «sin sesión» si la base falla, y la web mandaba al login a quien tenía la sesión viva. Además, cada CSS, JS e imagen consultaba la sesión en la base remota.
- **Decisión:** `sesionStore.js` sustituye el `get` de la librería por uno que propaga el error (500). La sesión solo se carga en `/api`. El frontend solo va al login con un 401.
- **Alternativas:** cambiar de librería (dependencia nueva); poner `express.static` antes de la sesión (no evita que otras rutas fuera de la API la carguen).
- **Consecuencias:** una ruta fuera de `/api` que necesite sesión tendría que cargarla. Al actualizar la librería hay que comprobar que el formato guardado sigue siendo JSON.
