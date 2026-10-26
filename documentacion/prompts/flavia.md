# Prompts de Flavia Méndez Tsutsumi

Identificador habitual: FLA / flaviamendez.

Las interacciones siguientes proceden de la conversación con Claude Code de los días 1 y 2 de octubre de 2026. En los prompts se ha corregido la ortografía y la puntuación; el contenido no se ha modificado. Cuando solo se cita una parte de un mensaje, se indica como extracto. Se omiten los mensajes de cortesía y las confirmaciones que no influyeron en el trabajo.

**Pendiente:** añadir, si se conservan los prompts, las interacciones de las primeras tareas de FLA05 (consulta del perfil propio, su prueba, edición del perfil y primera versión de la pantalla «Mi perfil»), realizadas entre el 28 de septiembre y el 1 de octubre.

## 2026-10-26 — CS-65: estados que faltaban en las pantallas (lagunas del inventario)

- **Historia u objetivo:** CS-65, objetivo 5: cubrir las lagunas detectadas en el inventario de pantallas (estado «Cargando», mensaje de vacío, ayuda antes de buscar y avisos de error accesibles).
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code), terminal zsh y Docker Desktop.
- **Contexto aportado:** el inventario de pantallas (`documentacion/inventario-pantallas.md`) con sus cinco lagunas, el código de `frontend/` y las pruebas de pantalla de `backend/tests/frontend/`.
- **Prompt inicial:**

  > Termínalas todas y registremos todos los prompts. Quiero que cada vez que subamos algo se suban los prompts en el mismo commit.

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** cuatro de las cinco lagunas: «Cargando…» en `bienvenida`, `perfil`, `personas` y `usuario`; el mensaje «Todavía no has publicado experiencias.» en la bienvenida; «Escribe parte de un nombre.» antes de buscar en `personas`; y `role="alert"` en los ocho avisos de error que no lo tenían, vigilado por una prueba sobre las nueve páginas. La quinta (los botones «Útil» y «Reportar», que no guardan nada) no se tocó porque depende de CS-02 y CS-04, que son de otras historias. Se corrigió además el inventario, que decía «cuatro pantallas» sin `role="alert"` cuando eran ocho avisos en seis pantallas.
- **TDD:** se escribió primero `backend/tests/frontend/estados.test.js` (22 pruebas). Fallaron 19, por no existir `#cargando`, `#sin-experiencias`, `#ayuda-busqueda` ni los `role="alert"`; las 3 que ya pasaban eran páginas que sí tenían el rol y quedan como caracterización. Con los cambios mínimos pasaron las 22. No hubo refactorización.
- **Comprensión humana de las pruebas:** *(a confirmar y completar por Flavia con sus palabras)*. La prueba general lee el HTML de las nueve páginas y comprueba que todo aviso cuyo `id` empieza por `error-` lleva `role="alert"`. Las de cada pantalla simulan el servidor con `fetch`: dejan la respuesta pendiente para ver que se muestra «Cargando…», la resuelven para ver que desaparece, y también la hacen fallar. Las de la bienvenida comprueban que el mensaje de vacío aparece sin experiencias y desaparece al crear la primera.
- **Intervención humana:** Flavia pidió terminar las lagunas y que, desde ahora, los prompts se suban en el mismo commit que el trabajo. *(A confirmar y completar por Flavia: si ha revisado los cambios en las pantallas y qué modificó o rechazó.)*
- **Decisiones:** [2026-10-26, «CS-65: estados que faltaban en las pantallas (lagunas del inventario)»](../modificaciones.md): un «Cargando…» común, `usuario.html` oculto hasta que llega el perfil, lista vacía según sus propios elementos y `role="alert"` vigilado por una prueba.
- **Comprobación final:** `npm test` desde `backend/`: 53 suites y 590 pruebas. `npm run test:cobertura` (con las pruebas de MySQL real): 68 suites y 651 pruebas, con 96,36 % de líneas y 94,95 % de ramas, por encima de los mínimos. **Sin comprobar:** el aspecto en el navegador con los textos nuevos y el comportamiento con un lector de pantalla real.
- **Resultado en Git:** este registro viaja en el mismo commit que el trabajo, como pidió Flavia; el hash se conoce al subirlo.

## 2026-10-26 — CS-65: inventario de las nueve pantallas (objetivo 5)

- **Historia u objetivo:** CS-65, objetivo 5: inventario de las nueve pantallas con sus estados y flujos, a partir de `frontend.md`, la identidad visual y el sitemap.
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code), terminal zsh y Docker Desktop.
- **Contexto aportado:** `documentacion/frontend.md`, `sitemap.mmd`, `arte.md` y el código de `frontend/`.
- **Prompt inicial:**

  > Quiero que completemos la historia 65 completa, solo nos queda el último objetivo.

- **Correcciones relevantes:**

  > ¿Estos cambios no deberían reflejarse en la web? (Tras ver la demo con la aplicación sin el diseño nuevo.)

- **Resultado propuesto por la IA:** `documentacion/inventario-pantallas.md` con las nueve pantallas, una matriz de estados comprobada en el código, los flujos del sitemap, los componentes de la guía de estilo y las lagunas encontradas; y su enlace desde el README, `diseno.md` y `frontend.md`. A la pregunta sobre la web, la respuesta fue que el diseño se aplica en la siguiente historia, la de implementarlo, una vez aprobado.
- **TDD:** no aplicable: es documentación.
- **Comprensión humana de las pruebas:** no se incorporan pruebas.
- **Intervención humana:** Flavia indicó cuál era el último objetivo y pidió cerrarlo. *(A confirmar por Flavia: si revisó el inventario.)*
- **Decisiones:** [2026-10-26, «CS-65: inventario de las nueve pantallas (objetivo 5)»](../modificaciones.md): hacerlo revisando el código y en un documento propio.
- **Comprobación final:** estados revisados en el HTML y el JavaScript de las nueve páginas y flujos comparados con el sitemap; enlaces comprobados; `npm test` en verde. **Sin comprobar:** cada pantalla abierta en el navegador.
- **Resultado en Git:** commit `6496eab`.

## 2026-10-26 — CS-65: criterio de público joven, aprobaciones y demostración

- **Historia u objetivo:** CS-65, decisiones de diseño (navegación en móvil, `usuario.html`, landing page y archivos) y una demostración de lo hecho en CS-62 y CS-65.
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code), terminal zsh y Docker Desktop.
- **Contexto aportado:** las decisiones recomendadas en `diseno.md`, los esquemas y la guía de estilo.
- **Prompt inicial:**

  > Elige la recomendación que consideres correcta para nuestra app, que tiene un público joven.

- **Correcciones relevantes:**

  > Aprueba las que sean más cercanas a nuestro proyecto.

  > Enseña cómo funciona todo lo que hemos hecho: una demo.

- **Otros prompts del día, sin cambios en Git:**

  > Prepara un documento para el equipo actualizándoles con todo lo que hemos hecho y mencionando los siguientes pasos y las cosas que están por hacer. Que sea con bullet points y solo texto por terminal. (Con indicaciones de qué no incluir y de no proponer nada todavía.)

- **Resultado propuesto por la IA:** se confirmaron con el criterio del público joven la barra inferior en móvil, la cabecera de perfil de `usuario.html` y la ausencia de landing page, y «Crear cuenta» pasó a ser un botón visible en el inicio de sesión. Se aprobaron esas tres decisiones, por encajar con las nueve pantallas del libro y con los esquemas dados por buenos, y se dejó pendiente la de los dos archivos, que contradice la tarjeta del objetivo 3. La demostración recorrió con la aplicación real el inicio de sesión, la búsqueda, la amistad, el seguimiento, la visibilidad de las experiencias y las protecciones, y se compararon con la propuesta de diseño. También se redactó el mensaje de actualización para el equipo.
- **TDD:** no aplicable: son decisiones de diseño y una demostración, sin código nuevo.
- **Comprensión humana de las pruebas:** no se incorporan pruebas.
- **Intervención humana:** Flavia delegó las elecciones en el agente y pidió aprobar solo las que encajaran con el proyecto. La aprobación es suya y no sustituye a la del equipo. *(A confirmar por Flavia.)* Durante la demostración se crearon una amistad y un seguimiento entre dos usuarios de prueba y se eliminaron al terminar.
- **Decisiones:** [2026-10-26, «CS-65: esquemas de las nueve pantallas…»](../modificaciones.md), en la decisión «Criterio de público joven para las decisiones de diseño», y el estado de las decisiones en `diseno.md`.
- **Comprobación final:** `index.svg` válido y revisado a la vista; durante la demostración todos los flujos funcionaron y la base de datos de prueba quedó limpia. **Sin comprobar:** que el equipo haya confirmado las tres decisiones aprobadas.
- **Resultado en Git:** commits `0a58199` (criterio de público joven y botón «Crear cuenta») y `eadaf3c` (decisiones aprobadas).

## 2026-10-26 — CS-65: esquemas de las nueve pantallas, navegación en móvil y requisitos mínimos

- **Historia u objetivo:** CS-65, objetivo 2 del libro de historias (bocetos y wireframes para móvil y escritorio, incluida la navegación en móvil). Es la numeración actual: en la entrada del 25/10 figuraba como objetivos 3 y 4 porque el libro se reordenó después.
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code) y terminal zsh.
- **Contexto aportado:** el enlace al libro de historias online y capturas de su tabla de objetivos. El agente no pudo abrir el libro porque SharePoint pide verificar la identidad; se trabajó con las capturas. También `documentacion/diseno.md`, `documentacion/arte.md` y los esquemas del día anterior.
- **Prompt inicial:**

  > ¿Cómo marco esta tarea en el Excel? Comprueba y dime.

- **Correcciones relevantes:**

  > No, terminemos esta tarea. Quiero que sigas donde nos quedamos y que elijas lo que mejor nos convenga, y también actúa como un creador de frontend experto: asegúrate de que cumples los requisitos mínimos para un buen diseño de frontend.

  > Hazlo. (Para preparar esta entrada del registro, con solo mis mensajes.)

  > Decídelo de acuerdo con lo que es más acertado para nuestro proyecto. (Sobre las decisiones que seguían abiertas: landing page y uno o dos archivos.)

  > Vale, también quiero que dejemos todo hasta este objetivo terminado: mira qué nos falta por subir para darla como hecha y subimos todo lo que falta.
- **Resultado propuesto por la IA:** orientación sobre cómo marcar el objetivo en el libro (sin «Finalizado» hasta la revisión del equipo); decisión de la navegación en móvil (barra inferior fija en móvil y barra superior desde 768 px); un `usuario.svg` que combina las variantes A (móvil) y B (escritorio); la barra inferior aplicada a los esquemas de las pantallas con sesión; `navegacion-movil.svg` rehecho con medidas y reglas; una lista de 11 requisitos mínimos de frontend en `diseno.md`, con una revisión del código actual; los datos de contraste en `arte.md`; y la decisión de no crear una landing page (con una frase de presentación en el inicio de sesión) y de mantener dos archivos, `diseno.md` y `arte.md`.
- **TDD:** no aplicable: es documentación y dibujos vectoriales, sin código.
- **Comprensión humana de las pruebas:** no se incorporan pruebas.
- **Intervención humana:** Flavia delegó en el agente la elección de la navegación en móvil, de la variante de `usuario.html`, de la landing page y de los archivos, y pidió que se revisara el diseño con criterio de experto en frontend. No quiso corregir en ese momento los números de objetivo de las entradas anteriores. *(A confirmar y completar por Flavia: si ha revisado los esquemas y la lista de requisitos, y qué cambió o rechazó.)* Las cuatro elecciones son recomendaciones: el equipo debe confirmarlas.
- **Decisiones:** [2026-10-26, «CS-65: esquemas de las nueve pantallas, navegación en móvil y requisitos mínimos de diseño»](../modificaciones.md): barra inferior fija en móvil, combinación de las variantes A y B de `usuario.html`, revisión con una lista de requisitos mínimos, sin landing page y dos archivos de documentación.
- **Comprobación final:** los doce SVG son XML válido y usan solo negro y blanco; se revisaron a la vista y se corrigió un diálogo que se solapaba con el marco del móvil; el contraste se calculó con la fórmula de WCAG y el HTML de las nueve páginas se revisó con `grep`; `npm test` desde `backend/` pasó con 52 suites y 568 pruebas. **Sin comprobar:** que el equipo haya revisado los esquemas, los tamaños de los botones medidos en pantalla (se calcularon con los valores por defecto de Bootstrap) y el comportamiento con un lector de pantalla.
- **Resultado en Git:** commits `9716265` (esquemas, navegación y requisitos), `df0ab40` (entrada del registro) y `8df7ed5` (decisiones de landing page y archivos). Esta ampliación del registro se sube en el commit de cierre del objetivo.

## 2026-10-25 — CS-65: borradores de diseño y arte y esquemas de las pantallas sociales

- **Historia u objetivo:** CS-65 (diseño visual de PlanB), aportación a los objetivos 3 (esquemas de las pantallas, en móvil y escritorio) y 4 (guía de estilo). Es un borrador: ningún objetivo queda cerrado. *(Numeración de esa fecha: tras reordenarse el libro, son los objetivos 2 y 3.)*
- **Agente/herramienta:** Claude Code; modelo Claude Sonnet 5.5.
- **Entorno:** macOS, aplicación de escritorio de Claude (pestaña Code) y terminal zsh.
- **Contexto aportado:** capturas de las fichas de las historias nuevas del libro de historias online (diseño visual, implementación del diseño y base de datos online), `documentacion/frontend.md` y el sitemap de Matthew (`documentacion/sitemap.mmd`). También pasé mensajes del equipo sobre cómo repartir el trabajo de diseño; por decisión mía **no se transcriben en este registro**.
- **Prompt inicial:**

  > Estas son las nuevas tareas que tenemos que hacer, ¿cuál ves que podemos hacer?

- **Correcciones relevantes:**

  > No, puedo elegir. (Al preguntarme el agente si tenía alguna tarea asignada.)

  > Espera, primero, ¿qué objetivo crees que podemos empezar?

  > Enséñamelo por aquí. (El inventario de pantallas, antes de crear ningún archivo.)

  > ¿Me puedes dar ejemplos de webs parecidas o cómo podríamos hacerlo?

  > Dime ideas.

  > Quiero más bocetos.

  > ¿Qué es un sitemap?

  > Hazlo tú y lo documentamos para que todos sepan.

- **Resultado propuesto por la IA:** inventario de las 9 pantallas con sus estados y flujos, a partir de `frontend.md`; referencias de productos parecidos y tres estilos posibles; ideas de diseño para `usuario.html`, `perfil.html` y `personas.html`; bocetos de esas pantallas en móvil y escritorio, con dos variantes para `usuario.html`; y dos borradores de documentos, `diseno.md` (estructura) y `arte.md` (aspecto, vacío a propósito). Los esquemas se guardaron como SVG en blanco y negro en `documentacion/diseno/`.
- **TDD:** no aplicable: es documentación y dibujos vectoriales, sin código.
- **Comprensión humana de las pruebas:** no se incorporan pruebas.
- **Intervención humana:** Flavia eligió trabajar sobre las pantallas sociales, pidió ver primero el inventario y los bocetos en la conversación, y pidió que se documentara para el equipo. *(A confirmar y completar por Flavia: si ha revisado el contenido de los dos documentos y los esquemas, y qué cambió o rechazó.)* Los esquemas son una propuesta del agente a partir del inventario, **no un dibujo a mano de Flavia**, que es lo que describe el reparto del equipo.
- **Decisiones:** [2026-10-25, «CS-65: borradores de diseño y arte, y esquemas de las pantallas sociales»](../modificaciones.md): separar la estructura (`diseno.md`) del aspecto (`arte.md`), con nombres provisionales, y guardar los esquemas como SVG en blanco y negro.
- **Comprobación final:** los cuatro SVG son XML válido y usan solo negro y blanco; los enlaces de los documentos apuntan a archivos existentes; no hay marcadores de conflicto ni credenciales; `npm test` desde `backend/` pasó con 52 suites y 568 pruebas. **Sin comprobar:** que el equipo haya revisado los documentos y esquemas, que los nombres de archivo sean los definitivos y cualquier decisión de colores o estilo, que sigue por tomar.
- **Resultado en Git:** commit `75452b7`. La entrada de este registro: pendiente.

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
