# Una tarjeta de plan y unos botones de amistad para todas las pantallas

**Fecha:** 2026-11-26 · **Historia:** sin historia · **Decidió:** Joaquín de Vicente, a propuesta de Claude

- **Contexto:** había tres tarjetas de plan distintas, unas pulsables enteras y otras solo en «Ver detalle», y la amistad se respondía con botones y textos distintos según la pantalla.
- **Decisión:** `crearTarjetaPlan` pinta todas las tarjetas y se pulsa entera; desaparece «Ver detalle». La visibilidad y «Editar» son añadidos opcionales. `crearBotonesAmistad` fija textos y estilos: «Aceptar» principal y «Rechazar» secundario, también en el buscador.
- **Alternativas:** mantener «Ver detalle» además de la tarjeta pulsable (dos enlaces al mismo sitio); rechazar en rojo (no borra nada).
- **Consecuencias:** un cambio en la tarjeta se ve en las cinco pantallas. Las páginas que las pintan cargan `shared/planes.js`.
