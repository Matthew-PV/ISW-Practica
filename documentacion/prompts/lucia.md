# Prompts de Lucía Alexandra Guzmán Álvarez

Identificador habitual: LUC.


## 2026-10-07 — CS-45: mi número de amigos y seguidores

- **Historia u objetivo:** CS-45, objetivos 1 y 3 a 10. Criterio: el perfil propio muestra el número de amigos y de seguidores y el listado paginado de ambos; solo cuentan las amistades aceptadas; las cifras cambian al aceptar, eliminar, seguir o dejar de seguir; sin relaciones se ven ceros.
- **Agente/herramienta:** Claude en la aplicación de escritorio (modo Cowork); modelo configurado `claude-opus-5-5`.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh), Docker Desktop y Chrome.
- **Contexto aportado:** `AGENTS.md` y la documentación del repositorio; una copia actual de `Customer_Stories_PlanB.xlsx`, solo para consulta; el contenido de los archivos y la salida de la terminal, que pegué yo cuando el agente necesitaba ver el código vigente; y el mensaje de Matthew con las rutas acordadas y el orden de trabajo sobre `perfil.html`.
- **Prompt inicial:**

  > tengo que hacer CS-45

- **Correcciones relevantes:**

  > a ver, poco a poco, vamos objetivo por objetivo, el uno como lo hacemos

  > perfe ya he cambiado en el excel a flavia ese objetivo ya que lo hizo ella, vamos al 3

  > seguimos con el 4, hacemos caso a tu propuesta.

  > y joaquin y matt han dicho que modifique lo que quiera

- **Resultado propuesto por la IA:** consultas paginadas `listarAmigos` y `listarSeguidores` en los repositorios; `obtenerResumenRelaciones`, `listarAmigosPropios` y `listarSeguidoresPropios` en `perfilService.js`, con validación de la paginación (20 por defecto, máximo 50); rutas `GET /api/perfil/resumen`, `/amigos` y `/seguidores`; y la sección «Amigos y seguidores» en `perfil.html` y `perfil.js`, con contadores, listas, «Cargar más» y mensajes de error. La primera propuesta del agente incluía escribir los contadores; se descartó al comprobar que Flavia ya los había subido.
- **TDD:** cada parte empezó por su prueba. Repositorios: 4 pruebas fallaron porque las funciones no existían y pasaron al añadirlas. Servicio: 14 fallaron por el mismo motivo y pasaron al escribirlo. Rutas: 5 fallaron con 404 y pasaron al añadirlas; otras 3, las de «sin sesión», pasaron desde el principio porque `perfilRoutes.js` ya exige sesión. Pantalla: 8 fallaron por elementos inexistentes, siguieron fallando por contenido al añadir el HTML y pasaron al añadir el JavaScript. Las 6 pruebas del criterio por HTTP (objetivo 6) pasaron a la primera, porque caracterizan código ya escrito; comprobación de que fallan al romper el código a propósito: [COMPLETAR: hecha, con 2 fallos / no realizada]. No hizo falta refactorizar.
- **Comprensión humana de las pruebas:** las pruebas de repositorio simulan la base de datos y comprueban que se pide solo lo aceptado, sin emails, por páginas y en orden fijo. Las del servicio simulan los repositorios y comprueban los valores por defecto, la foto por defecto y que una paginación no válida da 400 sin consultar la base de datos. Las de rutas simulan el servicio y comprueban que el usuario sale de la sesión. Las del criterio guardan amistades y seguimientos en memoria y siguen la secuencia completa: pendiente, aceptar, rechazar, eliminar, seguir y dejar de seguir. Las de pantalla abren `perfil.html` en un navegador simulado y miran lo que se vería.
- **Intervención humana:** pedí trabajar objetivo por objetivo y con pasos más cortos; reasigné el objetivo 2 a Flavia en el Excel; consulté a Matthew las rutas y quién tocaba antes `perfil.html`; acepté la paginación propuesta; decidí mantener todo el JavaScript en `perfil.js` en lugar de crear un archivo aparte, y pedí permiso a Matthew y Joaquín para ajustar tres líneas de sus pruebas de pantalla. Escribí yo todos los cambios, ejecuté los comandos, revisé `git status` y `git diff` antes de cada commit y resolví con una fusión una divergencia con `main`.
- **Comprobación final:** `npm test` con 49 suites y 402 pruebas correctas. Las tres rutas respondieron bien en el navegador contra MySQL. Prueba manual con dos cuentas (ventana normal e incógnito): la solicitud pendiente no cuenta; al aceptarla, las dos cuentas pasan a 1 amigo; seguir sube a 1 solo los seguidores de la persona seguida; al dejar de seguir y eliminar la amistad vuelven a 0. Sin comprobar a mano: «Cargar más» con más de 20 personas reales. Pantalla en ancho de móvil: [COMPLETAR: comprobada / sin comprobar].
- **Resultado en Git:** `b65abf4` (objetivos 1 y 3), [COMPLETAR: commit del objetivo 4], `28c2441` (objetivo 5), `60eb1d4` (objetivo 6), `14a9b00` (ajuste de las pruebas de pantalla existentes) y `4a01b95` (objetivos 7, 8 y 9).

## 2026-10-06 — Ponerme en contexto y preparar el entorno

- **Historia u objetivo:** sin historia asociada; puesta en marcha de PlanB en mi equipo.
- **Agente/herramienta:** Claude en la aplicación de escritorio (modo Cowork); modelo configurado `claude-opus-5-5`.
- **Entorno:** macOS, Visual Studio Code y su terminal integrada (zsh) y Docker Desktop.
- **Contexto aportado:** `AGENTS.md`, `README.md` y la metodología del repositorio.
- **Prompt inicial:**

  > accede a agents.md y dame contexto

- **Correcciones relevantes:**

  > tengo docker pero no he inciiado sesion ni se que es ni nada

- **Resultado propuesto por la IA:** resumen del proyecto y de las reglas de `AGENTS.md`, y los pasos para actualizar el repositorio, arrancar MySQL en Docker, aplicar las migraciones, cargar el catálogo de ciudades y ejecutar las pruebas.
- **TDD:** no aplicable; no cambió código.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas.
- **Intervención humana:** ejecuté cada comando y pegué el resultado. Al fallar Docker porque el puerto 3306 estaba ocupado, localicé un MySQL instalado en el Mac y lo paré desde Ajustes del Sistema.
- **Comprobación final:** migraciones aplicadas, `npm test` correcto y PlanB visible en `http://localhost:3000`.
- **Resultado en Git:** sin cambios.