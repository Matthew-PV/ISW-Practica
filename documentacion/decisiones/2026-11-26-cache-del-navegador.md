# Caché del navegador para archivos estáticos y catálogos

**Fecha:** 2026-11-26 · **Historia:** sin historia · **Decidió:** Joaquín de Vicente, a propuesta de Claude

- **Contexto:** cada pantalla revalidaba todos sus archivos y volvía a pedir los catálogos.
- **Decisión:** `vendor/` e `img/` se guardan una semana; CSS y JS, cinco minutos; el HTML se revalida siempre. `/api/ciudades` y `/api/experiencias/opciones` se guardan una hora (las ciudades, además, en memoria del servidor). No se guarda ningún dato de usuarios.
- **Alternativas:** comprimir con el paquete `compression` (dependencia nueva, no añadida); poner la versión en el nombre de los archivos (necesita un paso de construcción).
- **Consecuencias:** tras una entrega, un navegador puede usar CSS o JS antiguos hasta cinco minutos, y un catálogo nuevo tarda hasta una hora (o un reinicio) en verse. En desarrollo, recarga forzada.
