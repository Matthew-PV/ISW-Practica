# Prompts de Flavia Méndez Tsutsumi

Identificador habitual: FLA / flaviamendez.

Las interacciones siguientes proceden de la conversación con Claude Code de los días 1 y 2 de octubre de 2026. En los prompts se ha corregido la ortografía y la puntuación; el contenido no se ha modificado. Cuando solo se cita una parte de un mensaje, se indica como extracto. Se omiten los mensajes de cortesía y las confirmaciones que no influyeron en el trabajo.

**Pendiente:** añadir, si se conservan los prompts, las interacciones de las primeras tareas de FLA05 (consulta del perfil propio, su prueba, edición del perfil y primera versión de la pantalla «Mi perfil»), realizadas entre el 28 de septiembre y el 1 de octubre.

## 2026-10-02 — Completar la ficha de metodología y el registro de prompts

- **Historia u objetivo:** documentación de la metodología del equipo; sin historia de usuario asociada.
- **Agente/herramienta:** Claude Code; modelo exacto no registrado.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh).
- **Contexto aportado:** `AGENTS.md`, `documentacion/metodologia.md`, `documentacion/prompts/` y la conversación de los días anteriores.
- **Prompt inicial:**

  > Lee AGENTS.md y ponme en contexto.

- **Correcciones relevantes:**

  > Mi entorno es Visual Studio Code. Crea esas dos cosas pendientes siguiendo la estructura de AGENTS.md.

  > Pásame el paso a paso y escríbelo todo bien: que sea profesional, claro y sencillo.

- **Resultado propuesto por la IA:** ficha personal en la sección 6.2 de `documentacion/metodologia.md` y este registro de prompts con las interacciones de los días 1 y 2 de octubre.
- **TDD:** no aplicable, ya que solo cambia la documentación.
- **Comprensión humana de las pruebas:** no se incorporan pruebas de software.
- **Intervención humana:** Flavia confirmó su entorno, pidió que el texto fuese profesional, claro y sencillo, eligió qué prompts incluir en el registro, lo revisó y lo incorporó ella misma al repositorio.
- **Comprobación final:** formato Markdown y contenido revisados antes del commit.
- **Resultado en Git:** pendiente.

## 2026-10-01 — FLA05: subir la foto desde «Mi perfil» y mostrar las fotos de Cloudinary

- **Historia u objetivo:** FLA05, crear mi perfil. Criterios afectados: «si el usuario sube una foto permitida, al consultar el perfil aparece» y «al editar el nombre o la foto, el cambio se refleja».
- **Agente/herramienta:** Claude Code; modelo exacto no registrado.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh), Docker Desktop.
- **Contexto aportado:** repositorio completo, historia FLA05 del Excel y estado de `main` tras los cambios de otros compañeros.
- **Prompt inicial (extracto):**

  > Dime qué tareas fallan y las solucionamos.

- **Correcciones relevantes:**

  > ¿Lo puedo solucionar?

  > Dámelo para hacerlo por terminal.

  > Crea la documentación para que la gente sepa qué hemos hecho.

- **Resultado propuesto por la IA:** se detectaron dos fallos del criterio de FLA05: la política de contenido de Helmet bloqueaba las fotos de Cloudinary y la foto no se podía subir desde la pantalla. La propuesta fue añadir Cloudinary a `imgSrc` en `backend/src/app.js`, incorporar un formulario de foto en `frontend/perfil.html` y `frontend/js/perfil.js`, y hacer que `frontend/js/shared/api.js` no fije la cabecera `Content-Type` al enviar un `FormData`.
- **TDD:** no se aplicó. Los cambios eran de configuración y de pantalla y se comprobaron después de realizarlos; no se escribió antes una prueba que fallara. Más adelante, Joaquín añadió las pruebas de la pantalla con jsdom (`perfilPantalla.test.js`).
- **Comprensión humana de las pruebas:** no se incorporaron pruebas nuevas en esta tarea.
- **Intervención humana:** Flavia limitó el trabajo a los fallos de su historia, decidió modificar `app.js` y `api.js` (archivos de otros compañeros) y avisar después a Joaquín, escribió ella misma cada cambio en la terminal y revisó cada `git diff`. En la documentación pidió no modificar la entrada de otra compañera.
- **Comprobación final:** `npm test` con 147 pruebas superadas; la cabecera `Content-Security-Policy` incluye `img-src 'self' data: https://res.cloudinary.com`; en el navegador, un archivo que no es una imagen muestra «La foto debe ser JPG, PNG o WebP» y el formulario sigue disponible. Queda sin verificar la subida real de una foto, porque no hay una clave de Cloudinary en el `.env` local.
- **Resultado en Git:** commits `8287ef0`, `743cc07` y `5f4b881`. Posteriormente, Joaquín cambió la subida para que se realice al elegir el archivo (`8102a6a`).

## 2026-10-01 — Revisar el estado del proyecto y las tareas pendientes del equipo

- **Historia u objetivo:** seguimiento de la primera versión (FLA05, LUC01, LUC09 y MAT16); sin cambios de código.
- **Agente/herramienta:** Claude Code; modelo exacto no registrado.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh).
- **Contexto aportado:** repositorio completo, documentación de `documentacion/`, Excel de historias de usuario, ramas y commits de todo el equipo.
- **Prompt inicial:**

  > Lee toda la documentación y mira lo que hemos hecho, así ves cómo hemos trabajado. También observa todo el código, por favor.

- **Correcciones relevantes:**

  > Mira todo y comprueba qué queda por hacer.

  > Dime en texto todo lo que falta. Matt también ha hecho cosas; compruébalo todo.

  > Vuelve a comprobar todo y fíjate en qué tareas se han hecho.

  > Lucía ha completado lo que faltaba.

- **Resultado propuesto por la IA:** resumen del funcionamiento del equipo y del estado de cada historia de la primera versión (qué estaba hecho, qué faltaba y de quién era cada tarea), comprobado contra los commits, el código, las pruebas y el Excel. En una de las revisiones detectó que faltaba subir la imagen por defecto de FLA05 (`frontend/img/foto-por-defecto.svg`), que después subió Lucía.
- **TDD:** no aplicable; solo se revisó el estado del repositorio, sin cambiar código.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas nuevas.
- **Intervención humana:** Flavia pidió revisar también el trabajo de Matthew, corrigió el estado de las tareas que otra persona estaba haciendo sin haberlas subido todavía y avisó cuando Lucía completó lo pendiente.
- **Comprobación final:** la batería completa se ejecutó en una copia aparte del repositorio en cada revisión, con todas las pruebas superadas (145 y después 147).
- **Resultado en Git:** sin commits; solo revisión.

## 2026-10-01 — FLA05: revisar el proyecto y mejorar la pantalla «Mi perfil»

- **Historia u objetivo:** FLA05, objetivo 11 (pantalla de perfil en el frontend) y objetivo 8 (editar el perfil) en el Excel.
- **Agente/herramienta:** Claude Code; modelo exacto no registrado.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh), Docker Desktop.
- **Contexto aportado:** repositorio completo, documentación de `documentacion/`, Excel de historias de usuario e historial de commits.
- **Prompt inicial:**

  > Mira todo el proyecto. Nunca cambies nada sin preguntarme; yo lo escribo todo.

- **Correcciones relevantes:**

  > Solo dime cómo mejorar mis tareas, y mira en los commits qué tareas son mías y cuáles son de Joaquín, porque las has mezclado con las mías.

  > Solo cambiemos lo que he hecho yo; todavía no hagamos una tarea nueva, porque puede ser de otro compañero.

  > Dímelo paso a paso para escribirlo por terminal.

  > Dejemos las cookies; por ahora da igual.

- **Resultado propuesto por la IA:** separar mediante los commits el trabajo propio del ajeno y mejorar solo el propio. En `perfil.js`: nombres iguales que en el resto de páginas, botón desactivado durante el envío y formulario actualizado con la respuesta del servidor. En `perfil.html`: clase de estilo común, límites de longitud y etiqueta del email. Además, una nueva entrada en `modificaciones.md`.
- **TDD:** no se aplicó; los cambios de pantalla se comprobaron manualmente en el navegador.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas nuevas en esta tarea.
- **Intervención humana:** Flavia exigió que no se cambiara nada sin su permiso ni se mezclara su trabajo con el de otros, decidió dejar `cookies.txt` para más adelante, escribió los cambios en su terminal y revisó cada `git diff`.
- **Comprobación final:** en el navegador, la ciudad escrita con espacios se guarda sin ellos, un nombre no válido muestra el error y el botón vuelve a estar disponible, y el nombre no admite más de 30 caracteres.
- **Resultado en Git:** commits `d4d291d` y `b586f0b` (Excel, FLA05 objetivo 8).
