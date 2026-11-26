# «Volver» restaura la pantalla anterior

**Fecha:** 2026-11-26 · **Historia:** sin historia · **Decidió:** Joaquín de Vicente, a propuesta de Claude

- **Contexto:** «← Volver» abría la pantalla anterior de cero: se perdían filtros, tarjetas cargadas, posición y pestaña.
- **Decisión:** si se llegó desde PlanB, «Volver» retrocede en el historial. Explorar guarda sus filtros en la URL y lo cargado y la posición en `history.state`; las pestañas, en `?pestana=`.
- **Alternativas:** `sessionStorage` (no distingue entradas del historial); confiar en la caché de retroceso del navegador (hoy no restaura estas páginas).
- **Consecuencias:** complementa `2026-10-29-referrer-dentro-de-planb.md`. Al volver a Explorar se repiten las peticiones de las páginas cargadas.
