# Una ciudad que no existe no muestra planes

**Fecha:** 2026-11-26 · **Historia:** CS-74 · **Decidió:** Flavia, a propuesta de Claude

- **Contexto:** el criterio de la página de ciudad pide explicar una ciudad sin planes o inexistente y no enseñar planes de otra. Con una ciudad inexistente en la URL, Explorar mostraba los planes de todas.
- **Decisión:** si la ciudad de `?ciudad=` no está en el catálogo, no se piden planes: se avisa y se ofrece «Limpiar filtros». Si el catálogo no se puede cargar, no se afirma que no exista.
- **Alternativas:** mostrar todos con un aviso, como hace «Planes en mi ciudad» con la ciudad del perfil (se verían planes de otras ciudades bajo una dirección que pide una).
- **Consecuencias:** sin migración ni cambios en la API. «Mi ciudad» sigue mostrando todas, porque su texto lo escribe la persona en el perfil.
