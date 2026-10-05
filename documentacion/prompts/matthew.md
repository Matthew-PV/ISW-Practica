# Prompts de Matthew Puente Villegas Michavil

Identificador habitual: MAT / Matthew-PV.

Las interacciones siguientes proceden de la conversación conservada en Codex. Cuando no consta la fecha exacta de la interacción, `2026-10-02` indica la fecha en la que se incorporó al registro, no necesariamente la fecha en que se escribió el prompt original. Se omiten mensajes de cortesía y confirmaciones que no influyeron en el trabajo.

## 2026-10-05 — Implementar el modelo de amistad de CS-61

- **Historia u objetivo:** CS-61, objetivo 1: modelo Amistad con solicitante, destinatario, estado pendiente o aceptada, fecha, un registro por solicitud y migración.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell, Prisma y MySQL local en Docker; copia vigente de `Customer_Stories_PlanB.xlsx` facilitada desde OneDrive como referencia de solo lectura.
- **Contexto aportado:** tarea 1 de CS-61 y decisión de no desarrollar todavía CS-44 ni CS-02; CS-62 y CS-63 solo podrán quedar parcialmente avanzadas.
- **Prompt inicial:**

  > He aquí la última copia del Excel. Empecemos por CS-61. Ahora haremos la tarea 1

- **Correcciones relevantes:**

  > ¿Puedes añadir tú la entrada del registro de prompts? Cuando termines, pasemos al objetivo 2.

- **Resultado propuesto por la IA:** añadir `EstadoAmistad` con los valores `PENDIENTE` y `ACEPTADA`, el modelo `Amistad`, sus relaciones con Usuario, la restricción única de solicitud en la misma dirección y un índice para solicitudes recibidas. Se generó y aplicó la migración correspondiente.
- **Decisiones y alcance:** no se añadieron rutas, servicios ni interfaz. La comprobación de que no exista una solicitud en sentido inverso se implementará en el servicio de envío, pues requiere consultar relaciones existentes en ambos sentidos.
- **TDD:** se añadió primero una prueba de contrato del esquema; falló porque el modelo y el estado no existían. Tras el cambio pasó, se formateó el esquema con Prisma y se validó la migración en MySQL.
- **Comprensión humana de las pruebas:** la prueba lee el esquema de Prisma y comprueba que declara los dos estados permitidos, solicitante, destinatario, fecha y la restricción de unicidad de una solicitud. La aplicación real de la migración confirmó la tabla, claves foráneas e índice en MySQL.
- **Intervención humana:** Matthew delimitó el objetivo a la primera tarea de CS-61 y pidió que se registrara esta interacción antes de continuar con el objetivo 2.
- **Comprobación final:** prueba específica correcta; Prisma validó el esquema y confirmó que la base de datos está actualizada; `npm test -- --runInBand` completó 18 suites y 183 pruebas correctas.
- **Resultado en Git:** pendiente de revisión, preparación y commit por Matthew.

## 2026-10-05 — Implementar el envío de solicitudes de amistad de CS-61

- **Historia u objetivo:** CS-61, objetivo 6: servicio para enviar una solicitud solo a un usuario existente, distinto de la persona solicitante y sin relación pendiente o aceptada previa en ningún sentido.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell y Jest.
- **Contexto aportado:** Matthew pidió continuar con el objetivo 6 de CS-61 y, al terminar, actualizar tanto el registro de prompts como el registro resumido de modificaciones.
- **Prompt inicial:**

  > Ahora pasemos con el objetivo 6. Una vez lo termines y registres el prompt, me gustaría que modificaras el documento de modificaciones con los cambios del repositorio desde la última vez que se actualizo ese documento, incluyendo esta conversación.

- **Resultado propuesto por la IA:** crear `amistadService.enviarSolicitud`, que comprueba la sesión, la existencia del destinatario, que no sea la misma persona y que no exista una relación pendiente o aceptada en ninguno de los sentidos antes de delegar la creación al repositorio.
- **Decisiones y alcance:** el servicio contiene las reglas de negocio y el repositorio conserva el acceso a Prisma. No se añadieron rutas ni interfaz. Las solicitudes o amistades ya existentes se rechazan con error 400 y un destinatario inexistente con 404.
- **TDD:** primero se escribió una prueba con repositorios simulados; falló porque el servicio no existía. Tras implementar la validación mínima, las seis pruebas específicas pasaron. No fue necesaria una refactorización adicional.
- **Comprensión humana de las pruebas:** la preparación simula usuarios y una relación previa; la acción intenta enviar la solicitud; el resultado esperado es crearla solo en el caso válido y rechazarla sin guardar en los demás casos.
- **Intervención humana:** Matthew delimitó el objetivo y autorizó el registro automático y la posterior actualización resumida de modificaciones.
- **Comprobación final:** `npm test -- --runInBand tests/amistadService.test.js` completó 6 pruebas correctas; la batería completa terminó con 23 suites y 200 pruebas correctas.
- **Resultado en Git:** pendiente de revisión, preparación y commit por Matthew.

## 2026-10-05 — Implementar la búsqueda de usuarios de CS-61

- **Historia u objetivo:** CS-61, objetivo 5: buscar usuarios por texto en `usuarioRepository`, con coincidencia contenida, máximo 20 resultados y sin exponer el email.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell, Jest, Prisma y MySQL.
- **Contexto aportado:** Matthew indicó continuar con el objetivo 5 de CS-61 siguiendo el mismo proceso y registro automático de los objetivos anteriores.
- **Prompt inicial:**

  > Perfecto, ahora pasaremos al objetivo 5, de igual manera que los anteriores.

- **Resultado propuesto por la IA:** añadir `buscarPorNombre` a `usuarioRepository`, con filtro de nombre contenido, exclusión del usuario solicitante, límite de 20 resultados y selección exclusiva de id, nombre de usuario y foto.
- **Decisiones y alcance:** MySQL usa la intercalación `utf8mb4_unicode_ci`, por lo que la búsqueda no distingue mayúsculas y minúsculas sin introducir operadores específicos de otro motor. No se añadieron ruta, servicio ni pantalla.
- **TDD:** primero se añadió una prueba con Prisma simulado; falló porque la función no existía. Tras añadir la consulta mínima, pasó. No fue necesaria una refactorización adicional.
- **Comprensión humana de las pruebas:** la prueba simula una búsqueda y comprueba que Prisma recibe el texto contenido, la exclusión de la propia persona, el límite de 20 y solo los campos seguros, sin email.
- **Intervención humana:** Matthew delimitó la tarea al objetivo 5 y autorizó mantener el mismo flujo de registro automático.
- **Comprobación final:** `npm test -- --runInBand tests/usuarioBusquedaRepository.test.js` completó una prueba correcta; la batería completa terminó con 22 suites y 194 pruebas correctas.
- **Resultado en Git:** pendiente de revisión, preparación y commit por Matthew.

## 2026-10-05 — Implementar el repositorio de seguimiento de CS-61

- **Historia u objetivo:** CS-61, objetivo 4: `seguimientoRepository` para seguir, dejar de seguir y comprobar si una persona sigue a otra.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell y Jest.
- **Contexto aportado:** Matthew pidió trabajar el objetivo 4 con el mismo ciclo TDD del objetivo 3 y registrar el resultado automáticamente.
- **Prompt inicial:**

  > ¡Vamos a muy buen ritmo! Ahora pasaremos al objetivo 4. Trabaja igual que con el objetivo 3, registrándolo automáticamente.

- **Resultado propuesto por la IA:** crear `backend/src/repositories/seguimientoRepository.js` con operaciones para crear y borrar un seguimiento mediante la clave única de seguidor y seguido, y para devolver si existe.
- **Decisiones y alcance:** `sigueA` devuelve un booleano para simplificar al futuro servicio. No se añadieron rutas, interfaz, control de sesión ni la validación de que una persona no se siga a sí misma.
- **TDD:** primero se escribió una prueba con Prisma simulado; falló porque el repositorio no existía. Tras implementar las tres operaciones, las cuatro pruebas específicas pasaron. No fue necesaria una refactorización adicional.
- **Comprensión humana de las pruebas:** cada prueba simula la llamada a Prisma y comprueba que se consulta o modifica exactamente el seguimiento formado por los dos identificadores. Se comprueban tanto la existencia como la ausencia de un registro.
- **Intervención humana:** Matthew eligió continuar con el objetivo 4 y autorizó documentar automáticamente esta interacción.
- **Comprobación final:** `npm test -- --runInBand tests/seguimientoRepository.test.js` completó 4 pruebas correctas; la batería completa terminó con 21 suites y 193 pruebas correctas.
- **Resultado en Git:** pendiente de revisión, preparación y commit por Matthew.

## 2026-10-05 — Implementar el repositorio de amistad de CS-61

- **Historia u objetivo:** CS-61, objetivo 3: `amistadRepository` para crear solicitudes, buscar una relación entre dos usuarios en ambos sentidos, aceptarla, borrarla y listar solicitudes recibidas.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell, Jest y Prisma.
- **Contexto aportado:** tras pedir el registro del objetivo 2, Matthew facilitó la descripción del objetivo 3 y solicitó que su resultado se registrara automáticamente.
- **Prompt inicial:**

  > Perfecto, registra el prompt del objetivo 2 también. Pasemos ahora al objetivo 3. Una vez realizado el objetivo 3, actualiza automáticamente el registro de prompts.

- **Resultado propuesto por la IA:** crear `backend/src/repositories/amistadRepository.js` con las cinco operaciones de persistencia. La lista muestra solo solicitudes pendientes y expone del solicitante únicamente id, nombre de usuario y foto.
- **Decisiones y alcance:** el repositorio no decide permisos, estados válidos ni respuestas HTTP; esas reglas corresponderán al servicio. La búsqueda consulta las dos direcciones para que el servicio pueda detectar una relación existente entre las mismas personas.
- **TDD:** primero se escribió una prueba con Prisma simulado; falló porque el repositorio no existía. Tras implementar las consultas mínimas, las cinco pruebas específicas pasaron. No fue necesario refactorizar más allá de comentarios que explican la responsabilidad de cada consulta.
- **Comprensión humana de las pruebas:** cada prueba prepara una función simulada de Prisma, llama a una operación del repositorio y comprueba la consulta enviada. Se cubren creación, búsqueda A-B y B-A, aceptación, borrado y listado de solicitudes pendientes sin email ni contraseña.
- **Intervención humana:** Matthew autorizó el registro automático de esta tarea y delimitó el trabajo a la capa de repositorio.
- **Comprobación final:** `npm test -- --runInBand tests/amistadRepository.test.js` completó 5 pruebas correctas; la batería completa terminó con 20 suites y 189 pruebas correctas.
- **Resultado en Git:** pendiente de revisión, preparación y commit por Matthew.

## 2026-10-05 — Implementar el modelo de seguimiento de CS-61

- **Historia u objetivo:** CS-61, objetivo 2: modelo Seguimiento con seguidor, seguido, fecha, un único registro por seguimiento y migración.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, PowerShell, Prisma y MySQL local en Docker.
- **Contexto aportado:** tras completar el objetivo 1 de CS-61, Matthew indicó continuar con el objetivo 2 de la copia vigente del libro en OneDrive.
- **Prompt inicial:**

  > ¿Puedes añadir tú la entrada del registro de prompts? Cuando termines, pasemos al objetivo 2.

- **Resultado propuesto por la IA:** añadir el modelo `Seguimiento`, las relaciones direccionales con Usuario, la restricción única para seguidor y seguido, el índice de seguidores y la migración aplicada en MySQL.
- **Decisiones y alcance:** seguir no requiere aceptación y permite que dos personas se sigan mutuamente. La prohibición de seguirse a uno mismo y las rutas se implementarán en objetivos posteriores.
- **TDD:** la prueba del contrato de esquema falló primero porque el modelo no existía. Tras añadirlo, pasó; Prisma validó el esquema y aplicó la migración.
- **Comprensión humana de las pruebas:** la prueba comprueba que el esquema declara quién sigue, quién es seguido, la fecha y la unicidad de cada seguimiento. La migración confirmó la tabla, las claves foráneas y el índice en MySQL.
- **Intervención humana:** Matthew pidió registrar el resultado del objetivo 1 y avanzar inmediatamente con el objetivo 2.
- **Comprobación final:** prueba específica correcta; la base de datos quedó al día y `npm test -- --runInBand` completó 19 suites y 184 pruebas correctas.
- **Resultado en Git:** incorporado después en el commit `cd0c569 CS-61 Tarea 2 Modelo Seguimiento`.

## 2026-10-05 — Completar la planificación y resolver dependencias entre historias

- **Historia u objetivo:** definir las tareas de CS-45, CS-01 y CS-48; revisar las dependencias de CS-22, CS-61, CS-45, CS-62, CS-01, CS-63 y CS-48; y preparar el control de acceso de CS-30.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, repositorio local y copia vigente de `Customer_Stories_PlanB.xlsx` facilitada desde OneDrive.
- **Contexto aportado:** CS-22 y CS-61 ya tenían sus tareas; CS-62 debía incorporar el listado de CS-44; CS-01 no incluiría avisos ni valoración media; y CS-63 no incluiría «Útil» ni reportes.
- **Prompt inicial:**

  > Están hechas la 22 y la 61. Pasemos a la 45.

- **Correcciones relevantes:**

  > Ahora hagamos las tareas de la CS-01. Te adjunto una copia local del Excel para ser más ágiles.

  > Ya están todas las CS de la lista definidas, excepto CS-48. Definamos sus tareas.

  > Revisemos dependencias de toda la lista que te he compartido antes.

  > Plantéame dos opciones. Una en la que no definamos las dependencias externas (CS-44 y CS-02) y avancemos sin ellas; y otra en la que incluyamos CS-44 y CS-02 dentro de la planificación de esta semana (junto con las dependencias de estas). Para ello te adjunto la última copia del Excel.

  > Haremos la opción 1, no tenemos tiempo suficiente para la 2. Ayúdame a asignarle tareas a CS-30.

  > Por favor, recoge todo lo hablado hoy en mi registro de prompts. Mantendré este chat para la creación de nuevas tareas de CS y resolución de dependencias, y crearé un chat nuevo únicamente para el desarrollo de tareas. ¿Algún contexto que deba darle al nuevo chat?

- **Resultado propuesto por la IA:** definir tareas pequeñas y ordenadas para las historias pendientes, construir el mapa de dependencias y comparar una planificación parcial con otra que añadía CS-44 y CS-02. Tras la decisión de Matthew, se mantuvo la opción reducida y se propusieron diez tareas para CS-30, centradas en una comprobación compartida de visibilidad y amistad que puedan reutilizar CS-01 y CS-48.
- **Decisiones y alcance:** CS-62 y CS-63 podrán avanzar, pero no se considerarán completas mientras falten CS-44 y CS-02. CS-30 reutilizará CS-22 y CS-61, no añadirá modelos propios y deberá ocultar por igual las experiencias inexistentes y aquellas que el solicitante no pueda consultar. Este chat se conservará para planificación y dependencias; la implementación se realizará en chats separados y acotados por tarea.
- **TDD:** no aplicable a la planificación. Para CS-30 se acordó comenzar por pruebas que cubran autor, visibilidad pública, privada y para amigos, solicitud pendiente, amistad aceptada o eliminada y seguimiento sin amistad.
- **Comprensión humana de las pruebas:** la preparación crea una experiencia, su autor, otro usuario y distintos estados de relación; la acción consulta la experiencia; el resultado esperado es devolverla solo cuando la visibilidad y la relación actuales lo permitan, sin filtrar datos en los demás casos.
- **Intervención humana:** Matthew decidió no ampliar la semana con CS-44 y CS-02 por falta de tiempo, aceptó que CS-62 y CS-63 queden parciales y separó la conversación de planificación de las futuras conversaciones de desarrollo.
- **Comprobación final:** criterios y tareas contrastados con la copia vigente del Excel, utilizada únicamente en modo de lectura. No se modificó código ni se ejecutaron pruebas de software.
- **Resultado en Git:** pendiente.

## 2026-10-05 — Recuperar la documentación de trabajo del equipo

- **Historia u objetivo:** restaurar la documentación metodológica que se había perdido al volver accidentalmente a una versión anterior.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows y repositorio local.
- **Contexto aportado:** cambios acordados previamente sobre el libro oficial en OneDrive, la metodología por integrante, las instrucciones comunes, el registro de modificaciones y los registros de prompts.
- **Prompt inicial:**

  > Sin querer he vuelto a una versión anterior de la documentación. ¿Puedes volver a modificar el README, la metodología, las instrucciones comunes, el registro de modificaciones y el registro de prompts con lo que habías modificado antes?

- **Correcciones relevantes:** ninguna.
- **Resultado propuesto por la IA:** recuperar en `README.md`, `AGENTS.md` y `documentacion/` las reglas acordadas sobre el Excel externo, las nuevas columnas por tarea, la puesta en contexto de los integrantes, TDD, seguridad y registro del uso de IA.
- **TDD:** no aplicable; fue una recuperación documental.
- **Comprensión humana de las pruebas:** no se incorporaron pruebas de software.
- **Intervención humana:** Matthew detectó la pérdida y pidió reconstruir únicamente los cambios documentales previamente acordados.
- **Comprobación final:** documentación revisada contra las decisiones conservadas en la conversación; sin cambios de código de aplicación.
- **Resultado en Git:** pendiente.

## 2026-10-05 — Externalizar el libro y planificar nuevas historias

- **Historia u objetivo:** actualizar la gestión de historias y preparar, una a una, CS-22, CS-61, CS-45, CS-62, CS-01, CS-63 y CS-48.
- **Agente/herramienta:** Codex de ChatGPT; modelo exacto no registrado.
- **Entorno:** aplicación Codex en Windows, repositorio local y copia actual del libro compartido en OneDrive.
- **Contexto aportado:** el Excel ya no forma parte del repositorio; su versión online es la oficial y cada tarea incorpora responsable voluntario, tiempo estimado por esa persona y tiempo real.
- **Prompt inicial:**

  > Ya hemos externalizado el Excel y lo hemos sacado del repositorio. Además, hemos cambiado su formato para incluir propietario, tiempo estimado y tiempo real por cada tarea. A partir de ahora trabajaré con la versión online, pasándote una copia cada vez que trabajemos. Refleja estos cambios en mi documentación. Después, lista de una en una las tareas de CS-22, CS-61, CS-45, CS-62, CS-01, CS-63 y CS-48 para copiarlas manualmente al Excel remoto.

- **Restricciones relevantes:** CS-22 se limita al campo y selector de visibilidad; CS-62 incluirá el listado de CS-44; CS-01 excluye avisos y valoración media; CS-63 excluye «Útil» y reportes.
- **Resultado propuesto por la IA:** actualizar la documentación y la protección de Git, consultar la copia sin modificarla y comenzar la planificación únicamente por CS-22.
- **TDD:** no aplicable a esta actualización documental y de planificación. La implementación posterior de cada tarea deberá comenzar por una prueba que falle.
- **Comprensión humana de las pruebas:** no se incorporan pruebas de software en esta sesión de planificación.
- **Intervención humana:** Matthew decidió mantener la edición del libro en manos del equipo, aportar una copia vigente en cada sesión y revisar las tareas de cada historia antes de pasar a la siguiente.
- **Comprobación final:** estructura y criterios de CS-22 consultados en la copia sin modificarla; documentación contrastada con el estado del repositorio.
- **Resultado en Git:** pendiente.

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
