# Prompts de Flavia Méndez Tsutsumi

Identificador habitual: FLA / flaviamendez.

Las interacciones siguientes proceden de la conversación con Claude Code de los días 1 y 2 de octubre de 2026. En los prompts se ha corregido la ortografía y la puntuación; el contenido no se ha modificado. Cuando solo se cita una parte de un mensaje, se indica como extracto. Se omiten los mensajes de cortesía y las confirmaciones que no influyeron en el trabajo.

**Pendiente:** añadir, si se conservan los prompts, las interacciones de las primeras tareas de FLA05 (consulta del perfil propio, su prueba, edición del perfil y primera versión de la pantalla «Mi perfil»), realizadas entre el 28 de septiembre y el 1 de octubre.

## 2026-10-06 — CS-62: perfil de otro usuario (objetivos 1 a 7, 9, 11 y 12)

- **Historia u objetivo:** CS-62, «Perfil de otro usuario». Criterios afectados: ver nombre, foto, ciudad y contadores sin email; botón de amistad según la relación; botón de seguir; sus experiencias visibles; «Usuario no encontrado» y redirección si es el propio perfil. Los objetivos 8 y 10 los cubrieron otras historias (ver «Comprobación final»).
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code), terminal zsh y Docker Desktop.
- **Contexto aportado:** `AGENTS.md`, el repositorio y un resumen del proyecto que pegué al empezar. Los 12 objetivos de CS-62 se leyeron de la copia del Excel que aún estaba en el repositorio el 05/10, y yo confirmé que eran 12; no se contrastaron con la versión de OneDrive.
- **Prompt inicial:**

  > Vale, primero estima según cómo trabajo las tareas que he cogido.

- **Correcciones relevantes:**

  > No estás confundiéndote, vuelve a observar el enlace que te he dado, yo tengo la CS-62 y dentro hay 12 tareas que hacer.

  > Vale, empecemos de cero paso a paso.

  > Solo haz lo que pida la tarea, no hagas más extras.

  > Para los test puedes usar extras, para lo demás no.

  > Antes de hacer los push pregúntame, no lo hagas sin confirmación.

  > Si depende de una tarea no hecha, no la hagas y pasamos a la siguiente.

  > Comprueba todo lo que sea necesario.

  > Antes de seguir, yo hago los commit y los push.

  > ¿Por qué apareces como contribuidor en el repo? [...] No lo vuelvas a hacer.

  > Intenta solucionarlo sin hacer eso. (Sobre mover el proyecto fuera de iCloud para arreglar los fallos de lectura de `node_modules`.)

- **Resultado propuesto por la IA:** repositorio `obtenerPerfilPublico`, contadores `contarAmigos` y `contarSeguidores`, servicio `perfilService.obtenerPerfilPublico`, ruta `GET /api/usuarios/:nombreUsuario`, pantalla `usuario.html` con `js/usuario.js` (botones de amistad y de seguir, «Usuario no encontrado» y redirección al perfil propio) y sus pruebas. Además se añadieron dos campos al servicio, `relacion.amistadId` (objetivo 6) y `esPropio` (objetivo 9), que obligaron a actualizar de forma justificada dos expectativas exactas de las pruebas de los objetivos 2 y 4.
- **TDD:** en los objetivos 1, 2, 3, 5, 6, 7 y 9 se escribió primero la prueba y se vio fallar por el motivo esperado (por ejemplo `obtenerPerfilPublico is not a function`, o la ausencia de `usuario.html`) antes de implementar lo mínimo para que pasara. En el objetivo 3, la prueba de 401 ya pasaba porque `requiereSesion` lo cubría, y se dejó como caracterización. El objetivo 4 (pruebas de API) y el 11 son de caracterización, porque el comportamiento ya existía: para demostrar que la prueba detecta fallos se intercambiaron a propósito `enviada` y `recibida` en el servicio y fallaron justo esas dos pruebas. El 11 no tuvo commit propio: sus pruebas están en los de los objetivos 5, 6, 7 y 9. El objetivo 12 es comprobación manual.
- **Comprensión humana de las pruebas:** *(a confirmar y completar por Flavia con sus palabras)*. Las de repositorio simulan Prisma y comprueban que solo se piden los campos públicos, sin email. Las de servicio simulan los tres repositorios y comprueban datos, contadores, imagen por defecto, cada estado de la relación y el 404. Las de ruta y API comprueban 401 sin sesión, 200 con el perfil y 404. Las de pantalla (jsdom, con `fetch` simulado) comprueban qué botón aparece en cada estado, que al pulsarlo se hace la petición correcta y la pantalla se actualiza, y los casos de error, usuario inexistente y perfil propio.
- **Intervención humana:** Flavia limitó el alcance a lo que pide cada objetivo (con casos extra solo en las pruebas), pidió pasar a la tarea siguiente cuando una dependía de otra no hecha, exigió confirmación antes de cada push y después pasó a hacer ella los commits y los push. Decidió no tocar `backend/cookies.txt` ni reescribir los commits ya publicados, y rechazó mover el proyecto fuera de iCloud, por lo que se reinstaló `node_modules` en su sitio. Ejecutó ella los comandos de Docker y de Homebrew en su terminal. Los commits de las tareas 1 a 7 y 9 incluyen por error una línea `Co-Authored-By` de Claude que añadió el agente sin consultarlo; Flavia lo detectó y pidió que no se repitiera.
- **Comprobación final:** `npm test` desde `backend/` pasa con 61 suites y 561 pruebas el 08/10/2026. Con servidor, MySQL y navegador reales se comprobaron todos los estados de los botones en escritorio (1280 px), tablet (768 px) y móvil (375 px), la persistencia al recargar, los errores del servidor, el usuario inexistente, el perfil propio con otras mayúsculas y el recorrido desde «Buscar personas». **Sin comprobar:** el aspecto de la ventana de `confirm()` (el navegador integrado la cancela sin mostrarla) y la causa exacta de dos fallos intermitentes de Jest que coincidieron con lecturas lentas de disco en una carpeta sincronizada con iCloud. **Objetivos 8 y 10:** al principio no se pudieron hacer porque dependían de CS-44; después los cubrieron Joaquín (CS-44 y `experiencia.html`) y Matthew (CS-61, búsqueda de personas). El 08/10/2026 se comprobaron con servidor y datos reales: sin relación solo se ve la experiencia pública; siendo amigos también la de amigos, y la privada nunca; desde una experiencia, el autor enlaza al perfil.
- **Resultado en Git:** commits `df45061` (objetivo 1), `0f1d24c` (2), `b2af2c4` (3), `3f18efd` (4), `af674d2` (5), `c82caa3` (6), `6bf68bf` (7) y `065991a` (9). La documentación de esta entrada y la de `modificaciones.md`: pendiente.

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
