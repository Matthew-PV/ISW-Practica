# Capa expresiva con más libertad que la guía de marca

**Fecha:** 2026-10-28 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** tras añadir movimiento a la landing, Joaquín señala que falta carácter: formas distintas, dibujos y diagramas (por ejemplo, en «Cómo funciona»), y que las pantallas de acceso son donde más se puede captar al usuario con fondos dibujados y microanimaciones. En esas zonas no hay que seguir al pie de la letra la guía de marca.
- **Decisión:** la landing y la columna de marca de las pantallas de acceso forman la «capa expresiva»: admite formas orgánicas, tonos extra solo para formas (`--expr-*`), pegatinas y dibujos SVG animados con CSS (`img/escena-acceso.svg`, `svg.paso-dibujo`). El texto sigue con una sola tipografía y contraste AA; el texto sobre la escena va en una tarjeta blanca. Todo es decorativo (`aria-hidden`, sin texto) y se desactiva con `prefers-reduced-motion`.
- **Alternativas:** ilustración pequeña estática (estado anterior, se veía pequeña y plana); una imagen de fondo sin animar (menos captativa).
- **Consecuencias:** `arte.md` recoge esta capa. La escena de acceso es un único SVG compartido por las cuatro pantallas. Llevarla a otras pantallas (zonas con interacción) requiere una decisión nueva. Solo se ha comprobado en escritorio.
