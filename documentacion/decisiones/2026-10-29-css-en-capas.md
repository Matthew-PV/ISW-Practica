# CSS dividido en tokens, base y componentes, con capas

**Fecha:** 2026-10-29 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude (las capas las pidió Joaquín al preguntar por qué no usarlas; Bootstrap dentro de una capa, a propuesta de Claude)

- **Contexto:** `styles.css` (1409 líneas) mezclaba variables, estilos base y componentes, con colores sueltos. La fase 3 del plan de mejora de UI/UX pide tokens y una base sin cambiar el aspecto.
- **Decisión:** `styles.css` se reparte en `tokens.css` (variables, y declara el orden de capas), `base.css` y `componentes.css`. Orden de capas: `sombras, bootstrap, tokens, base, componentes`. Bootstrap se importa desde `tokens.css` con `@import … layer(bootstrap)` y deja de enlazarse en cada HTML. El CSS propio de cada página (`acceso.css`, `buscar.css`…) queda sin capa, así que gana siempre a lo anterior. Fuera de `tokens.css` no hay colores literales. Comprobado: el hash de estilos computados coincide con el de antes en 13 de las 14 pantallas (la otra, en las consecuencias).
- **Alternativas:** archivos sin `@layer` (menos novedad, pero el orden de carga y la especificidad siguen decidiendo); Bootstrap sin capa (un CSS sin capa gana a cualquier capa, así que las capas no servirían de nada).
- **Consecuencias:**
  - Con Bootstrap en capa, las reglas propias ganan sin depender de la especificidad. Dos casos que antes ganaba Bootstrap por especificidad se fijaron para conservar el aspecto: las esquinas del campo y el botón de `buscar.css`, y la regla de sin sombras, que lleva `!important` y por eso va en la capa `sombras`, la primera (con `!important` gana la capa más temprana).
  - Único cambio visible: el comentario de una experiencia mide 44 px de alto mínimo (lo que ya decía `experiencia.css`) en lugar de 42 px.
  - Un archivo CSS nuevo con reglas que deban vencer a las de la capa `componentes` va sin capa.
  - Queda un fallo previo sin tocar: el patrón de puntos de `body::after` usa un `rgb()` inválido y no se pinta.
