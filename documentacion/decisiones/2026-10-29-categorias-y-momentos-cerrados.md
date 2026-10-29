# Categoría y momento adecuado con valores cerrados

**Fecha:** 2026-10-29 · **Historia:** CS-55, CS-56 · **Decidió:** Claude dentro de la fase 2 del plan aprobado por Joaquín (pendiente de su revisión)

- **Contexto:** `tipo` y `momentoAdecuado` eran texto libre, pero la interfaz adivinaba la categoría con palabras clave y lo que no encajaba caía en «Rincones». CS-56 pide rechazar los momentos fuera de las opciones permitidas y CS-55, clasificar con categorías definidas.
- **Decisión:** el backend solo acepta las seis categorías de Explorar (Gastronomía, Cultura, Naturaleza, Noche, Deporte, Rincones) y un único momento de tres grupos (franja del día, día de la semana, estación). La lista vive en `services/shared/opcionesExperiencia.js` y el formulario la pide a `GET /api/experiencias/opciones`. Ambos campos siguen siendo opcionales y se comparan tal cual.
- **Alternativas:** un archivo JavaScript compartido entre `frontend/` y el backend (cruza las capas y la carpeta servida); una tabla o enum en la base (exige migración en la base compartida); varios momentos por experiencia (la columna guarda uno y no hay criterio que lo pida).
- **Consecuencias:** sin migración. Las experiencias ya guardadas con otros valores se conservan, pero al editarlas hay que elegir uno de la lista. El día de la semana se reduce a «Entre semana» y «Fin de semana».
