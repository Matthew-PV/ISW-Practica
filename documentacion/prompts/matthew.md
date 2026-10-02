# Prompts de Matthew Puente Villegas Michavil

Identificador habitual: MAT / Matthew-PV.

Las interacciones siguientes proceden de la conversación conservada en Codex. Cuando no consta la fecha exacta de la interacción, `2026-10-02` indica la fecha en la que se incorporó al registro, no necesariamente la fecha en que se escribió el prompt original. Se omiten mensajes de cortesía y confirmaciones que no influyeron en el trabajo.

## 2026-10-02 — Planificar el aprendizaje de PlanB y Bootstrap

- **Historia u objetivo:** comprender y explicar las herramientas de PlanB y preparar la próxima revisión.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows y copia local del repositorio.
- **Contexto aportado:** disponibilidad habitual de 4 horas semanales, hasta 12 si fuese necesario; dos semanas; revisión dentro de siete días; conocimientos de Java, HTML, Git y teoría de MySQL; PlanB ya funciona en el equipo de Matthew.
- **Prompt inicial:**

  > Planea una hoja de ruta para que pueda comprender todas las herramientas del proyecto lo mejor posible. Para hacerla lo más realista y acertada posible, preguntame antes cosas como el tiempo disponible, el nivel de profundidad de conocimientos u otras cosas que consideres relevantes para crear esta hoja de ruta

- **Corrección relevante:**

  > En algún momento incorporaremos desarrollo de frontend mediante Bootstrap. ¿Puedes incluir eso en la hoja de ruta y generar un documento con todo el contenido y los ejercicios prácticos? Este será el que seguiré paso a paso para alcanzar los objetivos propuestos

- **Resultado propuesto por la IA:** guía de dos semanas con sesiones de 4 horas, ampliaciones hasta 12 horas, ejercicios sobre el repositorio, práctica de Bootstrap y ensayo de la demostración.
- **TDD:** no aplicable a la redacción; la guía incluye aprendizaje de pruebas y TDD.
- **Comprensión humana de las pruebas:** una sesión enseña a identificar preparación, acción y resultado esperado en una prueba existente.
- **Intervención humana:** Matthew concretó tiempo, experiencia previa, objetivo de comprensión, revisión próxima y necesidad de añadir desarrollo frontend con Bootstrap.
- **Comprobación final:** tiempos, archivos, comandos y enlaces de la guía contrastados con el repositorio.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Configurar la puesta en contexto de chats nuevos

- **Historia u objetivo:** mejorar el inicio de las sesiones de trabajo del equipo.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** `AGENTS.md`, metodología por integrante y procedimientos distintos según el entorno.
- **Prompt inicial:**

  > Me gustaría que al crear un nuevo chat de IA y pedir al agente que me ponga en contexto, me pregunté quién soy y me de los pasos necesarios para empezar a trabajar. ¿Eso es configurable?

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** añadir a `AGENTS.md` un protocolo activado por peticiones de puesta en contexto, con identificación del integrante, lectura de su ficha y pasos específicos para comenzar.
- **TDD:** no aplicable; solo cambia documentación e instrucciones para agentes.
- **Comprensión humana de las pruebas:** no se incorporan pruebas de software.
- **Intervención humana:** Matthew definió el comportamiento de inicio que necesita en chats nuevos.
- **Comprobación final:** formato, numeración y enlaces Markdown comprobados.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Registrar la implementación de LUC01 y el catálogo inicial de ciudades

- **Historia u objetivo:** LUC01, creación de experiencias; objetivos 1–4 y tarea intermedia de catálogo de ciudades.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell, Prisma y MySQL en Docker.
- **Contexto aportado:** conversación realizada entre el 30/09 y el 01/10, tarjeta de la historia con sus criterios de validación y reglas pedagógicas, de arquitectura y seguridad para trabajar con PlanB.
- **Prompt inicial:**

  > Genial. Ahora, con ello, ¿puedes ayudarme a implementar las tareas del 1 al 4 de la creación de experiencias? Las haremos de 1 en 1, de modo que cuando te indique implementes la siguiente. Esto es para seguir el ritmo de cómo lo vas implementando.

- **Correcciones relevantes:**

  > Puedes pasar a la tarea 2. Mientras avanzas, ¿es necesario que actualice la base de datos ahora mismo con "docker compose up -d"?

  > Pasemos a la tarea 3. Mientras avanzas, ¿necesito modificar los valores de las claves del ".env"? De momento tienen los valores por defecto.

  > Perfecto, pasemos a la 4.

  > ¿Podemos crear un primer catálogo de ciudades con las capitales de todos los países del mundo? Lo asignaré a una nueva tarea intermedia que no estaba prevista. Después, ¿puedes integrar todos los cambios de esta sesión (tareas 1-4 y esta última) en un mismo cambio del registro de modificaciones?

  > ¿Puedes acortar el texto incluido en el registro de modificaciones?

- **Resultado propuesto por la IA:** incorporar la entidad Experiencia, su relación obligatoria con una ciudad, la validación de los campos, la creación autenticada por API y un catálogo repetible de 201 capitales o sedes para 195 países. También se agruparon y resumieron los cambios en una sola entrada de `documentacion/modificaciones.md`.
- **TDD:** no se completó el ciclo rojo de forma demostrable. Las pruebas unitarias y de API se añadieron durante la implementación y se ejecutaron en verde, pero no quedó registrada una ejecución previa en la que fallaran por faltar el comportamiento. Las comprobaciones posteriores en MySQL temporal sí validaron migraciones, restricciones, conservación de datos y repetición de la carga. En futuras tareas debe escribirse y ejecutarse primero cada prueba para conservar la evidencia roja.
- **Comprensión humana de las pruebas:** la preparación simula usuarios, ciudades y repositorios; la acción valida o envía `POST /api/experiencias`; el resultado esperado es crear con estado 201 y el autor de la sesión, o rechazar con 400/401 sin guardar. Las pruebas del catálogo comprueban cobertura, casos especiales y que una segunda carga no duplique ciudades.
- **Intervención humana:** Matthew decidió avanzar objetivo por objetivo, preguntó cuándo actualizar MySQL y qué valores de `.env` debía cambiar, añadió la tarea del catálogo y pidió reducir la documentación final.
- **Comprobación final:** 114 pruebas superadas en el estado de la sesión. Se probaron las migraciones y los repositorios reales con MySQL 8.4 temporal; el catálogo se cargó dos veces sin duplicados. No se modificó la base local de PlanB ni se realizó una prueba HTTP completa con repositorios reales.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Completar la metodología personal y el registro histórico

- **Historia u objetivo:** documentación de la metodología del equipo.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** metodología y registro de prompts creados en las interacciones anteriores.
- **Prompt inicial:**

  > Completa mi metodología y registra mis prompts anteriores. ¿A qué cuestionario de equipo te refieres?

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** completar la ficha de Matthew en primera persona y registrar únicamente los prompts sustantivos cuyo texto consta en la conversación.
- **TDD:** no aplicable; solo cambia documentación.
- **Comprensión humana de las pruebas:** no se incorporan pruebas de software.
- **Intervención humana:** Matthew pidió completar su propia ficha y aclarar el concepto de cuestionario antes de proponerlo al equipo.
- **Comprobación final:** revisión de enlaces Markdown y del estado de Git.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Ampliar la metodología con TDD, OneDrive y distintos entornos

- **Historia u objetivo:** documentación de la metodología del equipo.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows; lectura del Excel actual y del repositorio.
- **Contexto aportado:** documentación recién creada y decisiones nuevas del equipo.
- **Prompt inicial:**

  > Genial, hay un par de cosas que se me olvidó mencionarte:
  >
  > - Externalizaremos el Excel de Customer Stories a OneDrive para trabajar en una versión sincronizada en tiempo real. Este cambio todavía no está hecho, pues el Excel también se reestructurará.
  > - Nos gustaría seguir un TDD, aunque sea mediante el uso de los agentes. Es importante que el humano entienda al menos el bloque de Test que se incorporan para cada tarea.
  > - Falta un integrante de grupo que todavía no ha hecho commits, pero debe quedar registrado en la documentación para cuando haga su primera aportación.
  > - Sería relevante incluir los pasos concretos de actualización de la copia del repositorio de la metodología, en la parte de preparación humana. Cómo cada uno sigue una metodología con distintos sistemas operativos o entornos de desarrollo, ¿podemos incluir los pasos que yo necesito seguir en concreto para actualizar el repositorio y dejar un PLACEHOLDER a completar para el resto de integrantes?
  > - De momento puedo adelantarte que algunos de los integrantes usan sus agentes desde Visual Studio, otros usan git desde la terminal de Visual Studio también. Algunos trabajan con Sistemas Operativos Mac y otros con Linux.
  > - Seguramente yo pase a trabajar con un agente integrado en Visual Studio también, pero seguiré recurriendo a la aplicación Códex de ChatGPT para tareas sencillas o que no requieran código.
  > - Cuando avance el proyecto, cada integrante tendrá un registro grande de prompts. ¿Sería sensato incluir un documento distinto para cada integrante, para que no sea un único archivo gigantesco y difícil de leer?
  >
  > Modifica por favor los documentos para que quede todo esto reflejado.

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** añadir TDD, documentar la futura migración a OneDrive, incluir el procedimiento de actualización de Matthew, crear plantillas para otros entornos y dividir el registro por integrante.
- **TDD:** no aplicable; solo cambia documentación.
- **Comprensión humana de las pruebas:** se acordó que en futuras tareas el humano debe entender preparación, acción y resultado esperado de cada prueba.
- **Intervención humana:** Matthew aportó las decisiones y límites; el agente evitó inventar el nombre del sexto integrante y dejó su ficha pendiente.
- **Comprobación final:** Excel leído sin modificar; enlaces Markdown locales y formato comprobados.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Crear la metodología y el contexto común para agentes

- **Historia u objetivo:** documentación de la forma de trabajo del equipo.
- **Agente/herramienta:** Codex de ChatGPT con acceso al repositorio de GitHub.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** arquitectura, documentación, historial y estructura de PlanB.
- **Prompt inicial:**

  > En el equipo hemos decidido reestructurar la forma de trabajo. Dado que todos trabajamos con agentes de IA, creemos que es importante reflejar este trabajo de alguna forma. Por tanto, me gustaría crear un registro de los prompts que ha ido utilizando cada compañero del proyecto, un documento de metodología que incluya la forma en la que trabaja cada integrante, y un "AGENTS.md" que haga de contexto para las nuevas IAs que trabajen en el proyecto.

- **Correcciones relevantes:** el prompt posterior sobre TDD, OneDrive, distintos entornos y el sexto integrante amplió el alcance.
- **Resultado propuesto por la IA:** crear `AGENTS.md`, la metodología y el registro de prompts, y enlazarlos desde el README.
- **TDD:** no aplicable; solo cambia documentación.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas de software.
- **Intervención humana:** Matthew decidió que el uso de IA debía quedar explícito y posteriormente concretó cómo debía registrarse.
- **Comprobación final:** estructura, enlaces y formato de la documentación comprobados.
- **Resultado en Git:** pendiente.

## 2026-10-02 — Revisar la arquitectura y actualizar el contexto para chats nuevos

- **Historia u objetivo:** disponer de instrucciones actualizadas para agentes nuevos.
- **Agente/herramienta:** Codex de ChatGPT con acceso a GitHub.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** un prompt previo completo con reglas pedagógicas, arquitectura, seguridad, pruebas y documentación.
- **Prompt inicial:**

  > Revisa la nueva arquitectura y documentación del repositorio, y considera si es necesario cambiar el prompt de contexto para nuevos chats.

- **Texto de contexto incluido en el mismo prompt:**

  > El equipo que desarrolla PlanB está formado por estudiantes con poca experiencia práctica en desarrollo y despliegue de aplicaciones. Al colaborar en este proyecto:
  >
  > - No presupongas conocimientos técnicos avanzados.
  > - Explica en lenguaje claro los conceptos y términos técnicos la primera vez que aparezcan.
  > - Cuando realices un cambio, explica brevemente qué se ha cambiado, para qué sirve, cómo encaja en la arquitectura y cómo puede comprobarse.
  > - Señala las decisiones relevantes, alternativas y consecuencias, especialmente en seguridad, base de datos, autenticación, despliegue y cambios difíciles de revertir.
  > - Distingue claramente entre lo imprescindible para la práctica, las mejoras recomendables y las ampliaciones opcionales.
  > - Proporciona instrucciones concretas y ordenadas cuando sea necesaria alguna acción manual.
  > - No introduzcas tecnologías o complejidad adicional sin una necesidad clara.
  > - Respeta la arquitectura acordada: rutas → servicios → repositorios → Prisma → MySQL. Solo los repositorios deben acceder a Prisma.
  > - Usa como referencia, por este orden: las instrucciones actuales del equipo, los criterios de validación de las historias de usuario, la arquitectura documentada y la propuesta conceptual.
  > - Relaciona las pruebas con los criterios de validación de cada historia.
  > - Revisa que el código generado sea comprensible y mantenible por estudiantes, evitando abstracciones innecesarias.
  > - Si la documentación y el código se contradicen, indícalo antes de asumir cuál es correcto.
  > - No modifiques ni elimines trabajo existente que no forme parte de la tarea.
  > - Nunca incluyas secretos, contraseñas o archivos `.env` en Git.
  > - No menciones en la documentación ni en los entregables el uso de agentes de inteligencia artificial, salvo que el usuario lo solicite expresamente.
  >
  > El objetivo no es únicamente terminar funcionalidades. También debes ayudar al usuario a entender el proyecto, conservar el control sobre las decisiones y poder explicárselas al resto del equipo.

- **Correcciones relevantes:** ninguna dentro de esa interacción; la decisión de documentar expresamente la IA llegó después.
- **Resultado propuesto por la IA:** actualizar el contexto para reflejar rutas, middlewares, servicios, repositorios, código compartido, frontend, Cloudinary, migraciones, semillas y diferencias entre funcionalidad implementada y futura.
- **TDD:** no aplicable; fue una revisión y redacción de instrucciones.
- **Comprensión humana de las pruebas:** el agente ejecutó la batería existente para contrastar la documentación; no se añadieron pruebas nuevas.
- **Intervención humana:** Matthew proporcionó el contexto anterior y decidió conservar externamente la versión revisada para chats nuevos.
- **Comprobación final:** 145 pruebas superadas en la revisión registrada entonces; se señalaron inconsistencias documentales sin modificar código.
- **Resultado en Git:** sin cambios en Git; el resultado fue un prompt reutilizable entregado en la conversación.

## 2026-10-02 — Entender la actualización habitual del repositorio

- **Historia u objetivo:** preparación del entorno de desarrollo.
- **Agente/herramienta:** Codex de ChatGPT.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** repositorio PlanB y cambios recientes del equipo.
- **Prompt inicial:**

  > ¿Puedes explicarme qué pasos son necesarios para trabajar cada vez que haga un "git pull"?

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** explicar cómo revisar cambios locales, actualizar Git, dependencias, `.env`, Docker, migraciones, semillas, pruebas y servidor.
- **TDD:** no aplicable; fue una explicación operativa.
- **Comprensión humana de las pruebas:** se explicó que `npm test` comprueba el estado recibido antes de empezar una tarea.
- **Intervención humana:** este procedimiento se incorporó después a la sección 4.1 de la metodología.
- **Comprobación final:** contrastado posteriormente con los scripts y la arquitectura actuales.
- **Resultado en Git:** sin cambios en aquella interacción; incorporado más tarde a `documentacion/metodologia.md`.

## 2026-10-02 — Entender el archivo de configuración local

- **Historia u objetivo:** aprendizaje sobre configuración y seguridad.
- **Agente/herramienta:** Codex de ChatGPT.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** entorno de desarrollo de PlanB.
- **Prompt inicial:**

  > ¿Para qué sirve el ".env"?

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** explicar que `.env` contiene configuración privada local, que `.env.example` es la plantilla pública y que nunca debe subirse el archivo real.
- **TDD:** no aplicable; fue una explicación conceptual.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas.
- **Intervención humana:** la precaución se mantuvo en el contexto común y en la metodología.
- **Comprobación final:** contrastado con `backend/.env.example`, `.gitignore` y la arquitectura.
- **Resultado en Git:** sin cambios.

## 2026-10-02 — Revisar los cambios del repositorio

- **Historia u objetivo:** comprender la evolución reciente de PlanB.
- **Agente/herramienta:** Codex de ChatGPT con acceso a GitHub.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** repositorio `Matthew-PV/ISW-Practica` y una revisión anterior como punto de comparación.
- **Prompt inicial:**

  > Mi primera duda es, ¿qué ha cambiado desde la última vez que revisamos el repositorio?

- **Correcciones relevantes:**

  > Volvió a cambiar el repositorio, ¿puedes simplemente listar los cambios desde el último mensaje?

- **Resultado propuesto por la IA:** comparar revisiones y explicar los cambios funcionales, técnicos y documentales recibidos.
- **TDD:** no aplicable; fue una revisión de cambios ya realizados.
- **Comprensión humana de las pruebas:** se informó de las pruebas añadidas o existentes cuando formaban parte de los cambios.
- **Intervención humana:** Matthew acotó la segunda revisión a una lista de cambios desde el mensaje anterior.
- **Comprobación final:** comparación del repositorio y lectura de los archivos afectados.
- **Resultado en Git:** sin cambios.

## 2026-10-02 — Establecer un acompañamiento pedagógico

- **Historia u objetivo:** definir la relación de trabajo con los agentes durante el proyecto.
- **Agente/herramienta:** Codex de ChatGPT.
- **Entorno:** aplicación Codex en Windows.
- **Contexto aportado:** nivel de experiencia del equipo y necesidad de poder explicar las decisiones.
- **Prompt inicial:**

  > Ahora debo serte sincero. El equipo entero está trabajando con apoyo de agentes de inteligencia artificial (yo incluido), pues somos estudiantes sin conocimiento real en la creación y el despliegue de aplicaciones. Esto no es necesario que conste en ninguna parte, es un contexto adicional que quiero aportarte a la hora de trabajar contigo. Es decir, no tengo ni idea de cómo funciona la mayoría de las tecnologías que implementamos, y hay mucha terminología que no entiendo. Me gustaría que me ayudaras lo máximo posible a entenderlo, para poder ayudar a poner en contexto al resto de mi equipo, y para poder seguir trabajando con cierto control sobre el proyecto. Si es necesario, genérame un mensaje para añadir de contexto en la configuración de este proyecto de códex.

- **Correcciones relevantes:** posteriormente el equipo decidió que el uso de IA sí debía reflejarse en la metodología del proyecto.
- **Resultado propuesto por la IA:** adoptar explicaciones claras, señalar decisiones y riesgos, evitar complejidad innecesaria y producir un contexto reutilizable para chats nuevos.
- **TDD:** no aplicable; definió la forma de colaboración.
- **Comprensión humana de las pruebas:** se estableció la necesidad general de explicar cómo comprobar cada cambio; TDD se añadió posteriormente.
- **Intervención humana:** Matthew hizo explícita su necesidad de comprender el proyecto y después actualizó la decisión sobre la transparencia del uso de IA.
- **Comprobación final:** estas preferencias se reflejan ahora en `AGENTS.md` y en la metodología.
- **Resultado en Git:** incorporado posteriormente a la documentación metodológica.
