# Implementación de Verbena: iconos en SVG propio y categoría deducida de `tipo`

**Fecha:** 2026-10-27 · **Historia:** sin historia · **Decidió:** Joaquín (aprobó implementar con detalle), a propuesta de Claude (SVG en línea y deducción por palabras clave)

- **Contexto:** la decisión de identidad dejaba abierto Tabler o SVG propios y suponía que las experiencias tienen categoría. `Experiencia.tipo` es texto libre (`String?`), sin catálogo.
- **Decisión:** los iconos son SVG en línea (landing y `crearBloqueCategoria`), sin dependencia nueva. La categoría de una tarjeta se deduce de `tipo` con palabras clave (gastronomía, cultura, naturaleza, noche, deporte) y, si no encaja ninguna, se usa «rincones». Logo, favicon, foto por defecto y las cinco ilustraciones son SVG propios en `frontend/img/`.
- **Alternativas:** Tabler por CDN (otra dependencia para seis iconos); crear un catálogo de categorías en el modelo (cambio de datos, fuera de alcance); asignar color por id (sin significado).
- **Consecuencias:** un `tipo` poco habitual cae en «rincones» y las palabras clave habrá que ampliarlas a mano; si el equipo crea un catálogo de categorías, `crearBloqueCategoria` se simplifica. La decisión de identidad deja de pedir Tabler.
