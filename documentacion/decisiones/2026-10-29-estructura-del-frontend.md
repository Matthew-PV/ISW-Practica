# Estructura del frontend: páginas, scripts y estilos por área

**Fecha:** 2026-10-29 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** `frontend/` mezclaba dos criterios: `css/`, `js/` e `img/` por tipo de archivo, y `acceso/`, `cuenta/`, `experiencias/` y `social/` por área con los HTML dentro. Joaquín pidió que al entrar en una carpeta se supiera qué tipo de archivo hay y que `js/` también se organizara.
- **Decisión:** los HTML van en `frontend/paginas/<área>/` (`index.html` sigue en la raíz, es la ruta «/»); cada script en `frontend/js/<área>/` con el mismo nombre que su página (`landing.js` queda en `js/` junto a `shared/`); los estilos en `css/nucleo/` (tokens, base, componentes) y `css/pantallas/` (el resto). Las URL de las páginas pasan a ser `/paginas/<área>/x.html`.
- **Alternativas:** dejar la estructura como estaba; mover solo `js/` y `css/` sin cambiar las URL de las páginas; renombrar los scripts para que coincidan con sus HTML (`solicitudes.js` sirve a `amigos.html`; no se hizo por no ser necesario).
- **Consecuencias:** cambian todas las URL de página (el enlace del correo de recuperación incluido); no hay redirecciones desde las antiguas porque la aplicación aún no está desplegada. Se actualizaron enlaces, pruebas y documentación. Los planes locales de `.planes/` conservan las rutas antiguas.
