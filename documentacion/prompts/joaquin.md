# Prompts de Joaquín de Vicente Abad

Identificador habitual: JOA.

## 2026-10-06 — CS-01 Valorar una experiencia (con la parte necesaria de CS-22)

- **Historia u objetivo:** CS-01 «Valorar una experiencia». Como prerrequisito, el objetivo de CS-22 que añade el campo de visibilidad a `Experiencia`.
- **Agente/herramienta:** Claude Code en Visual Studio Code, con el modelo Claude Opus 5.5.
- **Entorno:** Linux, Visual Studio Code y terminal fish; MySQL en Docker.
- **Contexto aportado:** `AGENTS.md`, el repositorio actualizado y la copia local de `Customer_Stories_PlanB.xlsx`.
- **Prompt inicial:**

  > migra a la ultima version todo (BBDD etc..). Vamos a hacer 01. Quiero que, tarea a tarea me des un planteamiento. Y luego yo te doy el ok. Ademas de una evaluacion de como de intrusivo es con las estructuras de datos y partes de codigo. Lee Agents.MD antes de empezar

- **Correcciones relevantes:**
  - Tras el planteamiento, que detectó que la visibilidad (CS-22) aún no existía:

    > Cuantos objetivos tendria que hacer de la CS-22?

- **Resultado propuesto por la IA:** pendiente.
- **TDD:** pendiente.
- **Comprensión humana de las pruebas:** pendiente.
- **Intervención humana:** pendiente.
- **Comprobación final:** pendiente.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Reestructurar el Excel de customer stories

- **Historia u objetivo:** sin historia asociada; reestructuración de `customer-stories/Customer_Stories_PlanB.xlsx` antes de su traslado a OneDrive.
- **Agente/herramienta:** Claude Code en Visual Studio Code, con el modelo Claude Opus 5.5.
- **Entorno:** Linux, Visual Studio Code y LibreOffice Calc. El agente generó el libro con Python (openpyxl) y lo recalculó con LibreOffice sin interfaz.
- **Contexto aportado:** `AGENTS.md`, el Excel actual y su destino final en OneDrive.
- **Prompt inicial:** el mensaje se envió dos veces porque el primero quedó cortado; se registra la versión completa.

  > Pide todo el contexto que necesites. Es muy importante alcenzar el diseño final querido.
  >
  > Primero lee el agents.md
  >
  > Vamos a cambiar el excel, empezando por la pagina principal que contiene referencias al resto.
  >
  > Ten en cuenta que el destino final del fichero es online. Asi que todas las funciones avanzadas programadas deben ser onedrive compatible.
  >
  > Elimina la numeracion, y normaliza las referencias de todos, a partir de ahora son "CS-XX" donde XX simboliza un numero ascendente desde 1 (incluido)
  >
  > Automatiza el sistema que estamos montando. Automatizar significa que se pueden incluir nuevas referencias (una nueva linea) y esta se autocompleta con una referencia y con una nueva pagina.
  > Elimina la columna propietario.
  >
  > Añade las columnas detras del titulo "Riesgo" "Prioridad" "Tiempo estimado".
  >
  > Añade la columna tiempo total, esta se calcula automaticamente con la suma de la columna "tiempo total" de todos los objetivos relacionados a la pagina de la story.
  >
  > Ademas, debe haber algun tipo de sistema de filtrado. Igual con clases + colores pero quiero que se puedan ver que tareas estan finalizadas, en progreso / seleccionadas y en espera. La idea seria resaltar en las que trabajamos.
  >
  > Para las paginas indiviuales quiero que haya dos niveles. Uno primero superior con toda la informacion hasta ahora menos las notas. Luego el inferior. Donde se almacena los objetivos (que se introducen manualmente y pueden ser tantos como hagan falta), la descripcion de este, un campo para indicar si estan finalizados (De nuevo categorico si / no y con un esquema de colores aplicado automaticamente), quien toma la tarea, tiempo estimado y tiempo total.
  >
  > Recuerda, tanto para "objetivos" como nuevas stories puede haber ampliacion y esta debe ser lo menos manual posible, automatizable, mas como rellenar plantillas.

- **Correcciones relevantes:**
  - Respuestas a las preguntas del agente (opciones elegidas, no texto literal):
    - Office Scripts en la cuenta de OneDrive: «No lo sé». El agente prepara el script del botón y deja una alternativa manual.
    - Estado de cada historia: automático a partir de los objetivos.
    - Tiempo estimado del índice: manual, con el «Tech Estimate» que ya existía.
    - Códigos antiguos (FLA05, HJ-07...): borrarlos del todo y convertir sus menciones a `CS-XX`.
  - Aclaración sobre la prioridad:

    > I - most important
    > N - medium
    > M - Not reallly
    >
    > Just so you know

  - Petición final, que añadió la documentación del esquema:

    > Guarda el anterior prompt en prompts de joaquin. Ademas, añade en metodologia.md todo el esquema de colores y demas utilizado para crearlo. Ahora seguiremos

- **Resultado propuesto por la IA:** índice como tabla «Historias» con referencias `CS-01` a `CS-60`, Riesgo, Prioridad y Tiempo estimado editables, y Tiempo total y Estado calculados a partir de los objetivos, con colores y filtros. Cada historia tiene una página con su cabecera arriba y la tabla de objetivos abajo (Finalizado, Responsable y tiempos en minutos), y la hoja «Plantilla» sirve de base para las nuevas. Un Office Script («Crear páginas») asigna la referencia y crea la página de cada historia nueva. Los objetivos que ya existían se migraron, y la estructura y los colores quedaron documentados en los apartados 3.1 a 3.4 de la metodología.
- **TDD:** no aplicable; el cambio es un libro de Excel, no código de la aplicación. Como verificación alternativa, un script del agente comparó el libro nuevo con el original y comprobó los estados y tiempos recalculados con LibreOffice. Se confirmó que esas comprobaciones fallan con el libro sin recalcular.
- **Comprensión humana de las pruebas:** no se incorporan pruebas al repositorio.
- **Intervención humana:** Joaquín definió el diseño del índice y de las páginas, eligió el cálculo automático del estado, el tiempo estimado manual y la eliminación de los códigos antiguos, aclaró el significado de I, N y M y pidió documentar el esquema en la metodología.
- **Comprobación final:** las 60 historias, sus textos, objetivos y tiempos coinciden con el original; estados y tiempos recalculados correctos; una simulación de historia nueva y de objetivos que avanzan da los estados esperados; el Office Script pasa la comprobación de tipos de TypeScript; los colores de la metodología coinciden con los del libro. No se ha probado en Excel real: queda pendiente abrirlo en Excel para la web e instalar el botón.
- **Resultado en Git:** `c5bf426` (Excel, Office Script y registro de modificaciones) y `1826659` (metodología).
