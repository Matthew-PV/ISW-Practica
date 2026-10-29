# El origen de la navegación solo viaja dentro de PlanB

**Fecha:** 2026-10-29 · **Historia:** CS-32, CS-66 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** «← Volver» en el detalle de una experiencia llevaba siempre a Inicio. Para volver a la pantalla de origen (Explorar, la búsqueda, un perfil…) la página necesita `document.referrer`, pero Helmet enviaba `Referrer-Policy: no-referrer` y el navegador lo dejaba vacío.
- **Decisión:** Helmet con `referrerPolicy: { policy: 'same-origin' }` (`backend/src/app.js`). El navegador comunica la página anterior solo entre páginas de PlanB; a otros sitios no envía nada, igual que antes.
- **Alternativas:** guardar la última pantalla en `sessionStorage` desde la cabecera común (más código en todas las páginas, sin cambiar la seguridad); dejar «Volver» fijo a Inicio (no resolvía D3).
- **Consecuencias:** las URL internas con parámetros de búsqueda (`?q=`) quedan visibles para nuestras propias páginas, no para terceros. Si se llega desde fuera o con un enlace directo, «Volver» sigue yendo a Inicio.
