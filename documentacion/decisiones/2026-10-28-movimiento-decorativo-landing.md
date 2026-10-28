# Movimiento decorativo solo en la landing

**Fecha:** 2026-10-28 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** la web se percibía plana y «de plantilla». Joaquín quiere más carácter, pero sin perjudicar la legibilidad de las zonas con las que se interactúa (formularios, listas, menús).
- **Decisión:** se mantiene la identidad sobria y una sola tipografía. La expresividad se concentra en capas decorativas sin texto, solo en la landing: una ruta de puntos que se dibuja con el scroll, manchas y pines flotantes, y entradas de bloques al verse. Todo en CSS, sin scripts, con `aria-hidden` y desactivado con `prefers-reduced-motion`.
- **Alternativas:** tipografías distintas por sección y estilo collage (rechazadas: confunden en las zonas de lectura); no tocar nada (se queda plana).
- **Consecuencias:** `arte.md` admite esta excepción a «nada se anima más». Sin soporte de `animation-timeline` la landing queda estática. Extender el movimiento a otras pantallas requiere una decisión nueva.
