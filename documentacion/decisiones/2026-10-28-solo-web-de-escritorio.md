# PlanB es solo una web de escritorio

**Fecha:** 2026-10-28 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** la documentación hablaba de una web «responsive», de que «no hay aplicación móvil nativa» y de que el móvil estaba «aparcado», lo que dejaba dudas sobre si PlanB es una web o una app móvil.
- **Decisión:** PlanB es una aplicación web para el navegador de escritorio. Se eliminan de `arquitectura.md`, `diseno.md`, `frontend.md` y `AGENTS.md` las menciones al móvil (como posibilidad, como aparcado o como comprobación); la interfaz se comprueba solo en escritorio.
- **Alternativas:** dejar el móvil «aparcado» (mantiene la duda sobre el alcance); web responsive (trabajo de CSS y pruebas sin necesidad actual).
- **Consecuencias:** no se escriben media queries ni pruebas en anchos de móvil. Si se quisiera soportar móvil más adelante, requiere una decisión nueva. El histórico de `anexo/` y `decisiones/` no se reescribe.
