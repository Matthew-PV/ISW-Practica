# Renovación de la sesión cada 10 minutos

**Fecha:** 2026-11-26 · **Historia:** sin historia · **Decidió:** Joaquín de Vicente, a propuesta de Claude

- **Contexto:** cada petición a la API renovaba la caducidad de la sesión, con dos consultas de más a la base remota.
- **Decisión:** `sesionStore.js` renueva cada sesión como mucho una vez cada 10 minutos, recordando en memoria la última renovación.
- **Alternativas:** no renovar nunca (echaría a quien está usando la web); guardar sesiones en memoria (se pierden al reiniciar).
- **Consecuencias:** la sesión puede caducar hasta 10 minutos antes de lo que tocaría desde el último uso. Con varios procesos, cada uno lleva su propia cuenta.
