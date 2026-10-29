# «Plan» y «experiencia» en la interfaz

**Fecha:** 2026-10-29 · **Historia:** CS-66 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** la interfaz mezclaba «plan» y «experiencia» (hallazgo E2): títulos como «Detalle de Experiencia» o «Nueva experiencia» junto a «Mis planes» y «Crear plan».
- **Decisión:** «plan» en la marca, en las descripciones generales y en lo que se crea, se busca y se gestiona (Mis planes, Nuevo plan, Publicar plan, buscador, perfiles, detalle). «Experiencia» solo en lo que se sugiere para descubrir: las tiras de Inicio y la pantalla Explorar. El código, las rutas (`/experiencias`, `mis-planes.html`) y el modelo no cambian.
- **Alternativas:** todo «experiencia» (~100 textos, incluida la marca y la landing); todo «plan» (dejaba sin matiz la parte de descubrimiento).
- **Consecuencias:** un mismo objeto se llama «plan» en una pantalla y «experiencia» en otra; al añadir textos nuevos hay que aplicar este criterio.
