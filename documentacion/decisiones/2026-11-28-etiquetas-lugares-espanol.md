# Etiquetas de lugares en español

**Fecha:** 2026-11-28 · **Historia:** CS-50 · **Decidió:** Matthew-PV, a propuesta de Codex

- **Contexto:** el usuario pide sustituir las etiquetas técnicas de Nominatim por nombres comprensibles, distinguiendo los tipos de parada por su categoría completa.
- **Decisión:** traducir en la ficha compartida del frontend la combinación de categoría OSM (incluida en `proveedorId`) y `tipo`. Por ejemplo, `railway/stop` indica un punto de parada de tren o metro y `highway/stop` una señal de STOP. Un tipo sin traducción usa la etiqueta general de su categoría o «Lugar». Las fichas del catálogo anterior conservan su tipo en español.
- **Alternativas:** traducir únicamente `tipo` resulta ambiguo; traducir en el backend cambiaría los valores del contrato y mezclaría presentación y datos.
- **Consecuencias:** búsqueda, selección y detalle comparten las etiquetas. No cambia la API ni los datos guardados ni se requieren migraciones. El diccionario es ampliable y no cubre todas las etiquetas OSM. La categoría sola no permite distinguir tren de metro, por lo que se muestra una etiqueta conjunta.
