# Presupuesto y duración en la búsqueda son máximos

**Fecha:** 2026-11-26 · **Historia:** CS-10 · **Decidió:** Flavia, a propuesta de Claude

- **Contexto:** el criterio de CS-10 pide filtrar por presupuesto y duración, pero no dice cómo. La búsqueda se hizo antes de que existieran la tarifa y la duración (CS-53) y no los tenía.
- **Decisión:** `GET /api/experiencias` admite `tarifaMax` (euros) y `duracionMax` (minutos). Los dos son un máximo que incluye el límite; `tarifaMax=0` busca planes gratuitos. Un plan sin tarifa o sin duración no aparece al usar ese filtro. Se validan como al crear un plan.
- **Alternativas:** un rango con mínimo y máximo (más controles y nadie lo pide); incluir los planes sin dato (se mostrarían como si cumplieran un límite que no se conoce).
- **Consecuencias:** sin migración. Los planes sin esos datos quedan fuera al filtrar, así que conviene rellenarlos. La exclusión de experiencias retiradas del criterio sigue pendiente de CS-06.
