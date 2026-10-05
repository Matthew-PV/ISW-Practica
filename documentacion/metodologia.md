# Metodología de trabajo con apoyo de inteligencia artificial

## 1. Propósito

El equipo de PlanB utiliza agentes de inteligencia artificial como herramienta de apoyo para analizar historias de usuario, comprender tecnologías, proponer soluciones, generar o revisar código, preparar pruebas y mejorar documentación.

Su uso no elimina la responsabilidad del equipo. Cada integrante sigue siendo responsable de entender, revisar y validar el trabajo que incorpora al repositorio. La finalidad de esta metodología es hacer el proceso transparente y repetible, no acumular conversaciones sin contexto.

## 2. Principios comunes

1. **La historia de usuario guía el trabajo.** Antes de programar se identifican la historia, el objetivo y sus criterios de validación.
2. **La persona conserva la decisión final.** El agente puede recomendar alternativas, pero el integrante acepta, modifica o rechaza la propuesta.
3. **No se acepta código sin revisión.** Como mínimo se comprueba que el cambio se entiende, respeta la arquitectura y no modifica trabajo ajeno.
4. **Se trabaja con TDD cuando sea aplicable.** Primero se escribe una prueba que falle, después el código mínimo que la hace pasar y finalmente se mejora el código manteniendo las pruebas en verde.
5. **El humano entiende las pruebas.** Antes de aceptar un cambio, el integrante debe poder explicar al menos la preparación, la acción y el resultado esperado de cada bloque de pruebas incorporado para su tarea.
6. **Toda afirmación debe poder comprobarse.** Las pruebas automáticas, la revisión manual o ambas deben demostrar los criterios de validación afectados.
7. **Los cambios deben ser pequeños.** Una conversación y un commit deberían perseguir un objetivo concreto siempre que sea posible.
8. **La documentación acompaña al código.** Se actualiza cuando cambia la arquitectura, la puesta en marcha, el comportamiento visible o una decisión relevante.
9. **La seguridad tiene prioridad.** No se comparten secretos, credenciales, cookies, datos personales innecesarios ni archivos `.env` con el agente o en Git.
10. **El uso de IA se registra con criterio.** Se conservan los prompts que influyen en el resultado, la verificación realizada y las decisiones humanas; no es necesario copiar cada mensaje incidental.

## 3. Gestión de las historias de usuario

Desde el 05/10/2026, `Customer_Stories_PlanB.xlsx` se mantiene en el OneDrive compartido del equipo como única versión oficial. La copia de trabajo se ha retirado del repositorio para evitar versiones divergentes.

Cada fila de tarea incluye:

- **Responsable:** integrante que se ofrece voluntariamente para realizarla.
- **Tiempo estimado:** previsión indicada por ese responsable antes de empezar.
- **Tiempo total:** tiempo real empleado, completado al terminar.

Para trabajar con una historia:

1. El integrante facilita una copia actualizada del libro al agente cuando necesite consultarla.
2. La copia se usa como referencia de solo lectura, salvo petición expresa de editarla.
3. El integrante traslada manualmente al libro online las tareas o cambios acordados.
4. No se guarda ni se vuelve a añadir a Git una copia activa del libro.

Si la copia facilitada, el código y la documentación se contradicen, se informa de la diferencia antes de decidir qué actualizar. Una copia conservada de una sesión anterior no se considera vigente.

## 4. Flujo de una tarea

### 4.0. Inicio de un chat nuevo

Para comenzar una sesión, el integrante puede escribir simplemente **«Ponme en contexto para empezar a trabajar en PlanB»**. `AGENTS.md` indica al agente que siga este orden:

1. Preguntar quién es la persona dentro del equipo.
2. Consultar su ficha metodológica y su archivo de prompts.
3. Explicar el estado relevante del proyecto y los pasos de actualización propios de su entorno.
4. Recordar las precauciones de Git, `.env`, migraciones y TDD.
5. Preguntar qué historia u objetivo va a trabajar.

Si la ficha de esa persona todavía está incompleta, el agente pregunta primero por su sistema operativo, editor, terminal y agente. Así evita dar comandos de Windows a quien trabaja en macOS o Linux. La identidad solo se pregunta una vez por chat y no se solicita si ya consta claramente en la conversación.

### 4.1. Preparación humana

El integrante responsable:

1. Actualiza su copia del repositorio siguiendo el procedimiento de su entorno y comprueba que no tiene cambios ajenos sin guardar.
2. Selecciona una tarea concreta en el libro oficial de OneDrive y, si el agente debe consultarla, le facilita una copia actualizada.
3. Lee sus criterios de validación y localiza las capas que probablemente se verán afectadas.
4. Explica al agente el objetivo, las restricciones y el estado conocido. Si la tarea parte de trabajo de otra persona, lo indica expresamente.

#### Procedimiento actual de Matthew en Windows

Matthew trabaja actualmente con la aplicación Codex de ChatGPT y prevé usar también un agente integrado en Visual Studio. Mantendrá Codex para consultas, documentación y tareas sencillas o que no requieran modificar código.

Cuando planifique historias de usuario con un agente, Matthew le pasa una copia actual del libro, revisa las tareas propuestas una a una y las copia manualmente a la versión online. Esa copia no se incorpora al repositorio.

Desde PowerShell o la terminal integrada de Visual Studio:

```powershell
cd C:\Users\mattp\dev\school\3-GISI\ISW-Practica
git status
git pull
git log --oneline ORIG_HEAD..HEAD
git diff --name-status ORIG_HEAD..HEAD
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm test
npm run dev
```

Cómo aplicar estos pasos:

1. `git status`: si muestra archivos modificados o nuevos que Matthew quiere conservar, no continúa con el `pull` hasta haber entendido y guardado esos cambios mediante un commit o con ayuda de un compañero o agente.
2. `git pull`: descarga e integra el trabajo nuevo del equipo.
3. Los dos comandos siguientes muestran los commits y archivos recibidos. Si no se descargó nada, pueden no mostrar diferencias.
4. Antes de tocar `.env`, compara `backend/.env.example` con su configuración local. Nunca copia un `.env` ajeno ni sube el suyo a Git.
5. `docker compose up -d` asegura que MySQL esté iniciado.
6. `npm install` actualiza las dependencias según `backend/package-lock.json`.
7. `prisma migrate deploy` aplica las migraciones ya creadas por el equipo y `prisma generate` actualiza el cliente de Prisma. Para crear una migración nueva durante una tarea se usa el script de desarrollo correspondiente, no `migrate deploy`.
8. `npm test` comprueba el estado recibido antes de empezar trabajo nuevo.
9. `npm run dev` arranca PlanB. Este comando permanece ejecutándose hasta que se detiene con `Ctrl+C`.

`npm run db:seed` se ejecuta después de las migraciones solamente cuando hayan cambiado el catálogo, el archivo de semillas o las instrucciones del equipo. `docker compose down -v` no forma parte de la actualización normal porque borra los datos locales.

#### Plantilla pendiente para los demás integrantes

Cada integrante debe añadir un procedimiento real, probado en su equipo, sin copiar comandos de otro sistema operativo a ciegas:

```text
Nombre:
Sistema operativo y versión: [Windows / macOS / Linux]
Editor o entorno: [Visual Studio / otro]
Agente utilizado:
Terminal utilizada:
Ruta local del repositorio:
Pasos para guardar o revisar cambios locales antes de actualizar:
Comandos exactos para actualizar Git:
Comandos exactos para actualizar dependencias y base de datos:
Comandos para ejecutar las pruebas:
Comando para arrancar PlanB:
Problemas habituales o diferencias de su entorno:
```

Algunos integrantes usan agentes desde Visual Studio y algunos ejecutan Git desde su terminal integrada. El equipo también utiliza macOS y Linux. Estos datos sirven como punto de partida, pero no se atribuyen a una persona concreta hasta que confirme su ficha.

### 4.2. Trabajo con el agente mediante TDD

El agente debe leer primero `AGENTS.md` y solo la documentación necesaria. El ciclo habitual es:

1. Traducir un criterio de validación a uno o varios casos de prueba.
2. Explicar el bloque de prueba al integrante con el patrón **preparación → acción → resultado esperado**.
3. Añadir la prueba y ejecutarla para observar el fallo esperado (**rojo**).
4. Añadir el código mínimo para que pase (**verde**).
5. Simplificar o aclarar el código sin cambiar el comportamiento (**refactorización**).
6. Ejecutar la prueba específica y después toda la batería.

Durante el trabajo, el agente:

- explica el enfoque antes de introducir decisiones relevantes;
- respeta el flujo rutas → servicios → repositorios;
- señala contradicciones o información que falte;
- evita cambios no relacionados;
- escribe o adapta pruebas vinculadas a los criterios de validación;
- diferencia hechos comprobados de suposiciones.

El integrante formula correcciones cuando la propuesta no coincide con la historia, la arquitectura o el resultado esperado. Antes de aceptar las pruebas, explica con sus propias palabras qué preparan, qué ejecutan y qué comprueban. Las correcciones que cambien de forma importante la solución también se anotan en su archivo de prompts.

### 4.3. Revisión y validación humana

Antes de considerar terminada la tarea, el integrante:

1. Revisa el resumen o la comparación de archivos modificados.
2. Pide explicación de cualquier fragmento que no entienda.
3. Comprueba que la prueba nueva falló antes de la implementación por el motivo previsto y entiende su estructura.
4. Ejecuta las pruebas específicas y la batería completa desde `backend/` con `npm test`.
5. Comprueba manualmente la interfaz cuando el comportamiento visible haya cambiado.
6. Verifica que no se hayan añadido secretos, archivos temporales o cambios ajenos.
7. Actualiza la historia de usuario y la documentación que corresponda.
8. Registra la interacción relevante en su archivo de `documentacion/prompts/`.
9. Crea un commit cuyo mensaje describa el resultado.

Si una comprobación no puede realizarse, se deja escrita como pendiente; no se da por superada.

## 5. Qué se registra y qué no

Se registra:

- el prompt inicial que define la tarea;
- las correcciones o prompts posteriores que alteran la solución de forma importante;
- el agente o herramienta utilizados;
- la historia de usuario u objetivo relacionado;
- un resumen del resultado y de la intervención humana;
- las pruebas realizadas;
- el commit o pull request, cuando exista.

No es necesario registrar saludos, preguntas puramente explicativas que no afecten al resultado ni cada intento intermedio. Tampoco se registran secretos, datos de acceso, contenido del `.env`, cookies, datos personales innecesarios o texto confidencial.

El registro no demuestra por sí mismo que una tarea sea correcta. Sirve para conocer cómo se llegó al resultado; la evidencia técnica son el código, las pruebas y la revisión.

## 6. Forma de trabajo de cada integrante

Esta sección debe completarla cada persona en primera persona. No debe describir una forma de trabajo ideal, sino la que realmente utiliza. La ficha de Matthew se completa con la información que ha confirmado; las demás siguen pendientes para no atribuir prácticas que cada integrante no haya validado.

| Integrante | Identificador habitual | Forma de trabajo documentada |
|---|---|---|
| Matthew Puente Villegas Michavil | MAT / Matthew-PV | Completada en la sección 6.1 |
| Flavia Méndez Tsutsumi | FLA / flaviamendez | Pendiente de completar por la integrante |
| Jorge Delgado Castellanos | JOR / jorjonudo | Pendiente de completar por el integrante |
| Lucía Alexandra Guzmán Álvarez | LUC | Pendiente de completar por la integrante |
| Joaquín de Vicente Abad | JOA | Pendiente de completar por el integrante |
| Integrante 6 — nombre pendiente | Código pendiente | Pendiente de completar cuando confirme su identidad |

Cada ficha debe responder de forma breve a estas preguntas:

```text
Nombre:
Sistema operativo:
Editor y terminal:
Agente o herramientas que utilizo:
Para qué tareas suelo utilizarlos:
Cómo preparo el contexto o el prompt:
Cómo reviso y corrijo la respuesta:
Qué pruebas realizo antes de aceptar cambios:
Cómo traslado el resultado a la historia de usuario y a Git:
Limitaciones o precauciones personales:
```

### 6.1. Matthew Puente Villegas Michavil

**Sistema operativo y entorno.** Trabajo en Windows. Actualmente utilizo principalmente la aplicación Codex de ChatGPT sobre mi copia local del repositorio y PowerShell. Preveo incorporar un agente integrado en Visual Studio y utilizar también su terminal. Seguiré recurriendo a Codex para comprender conceptos, revisar el repositorio, preparar documentación y resolver tareas sencillas o que no requieran modificar código.

**Experiencia y objetivo personal.** Tengo poca experiencia práctica en creación y despliegue de aplicaciones. Por eso no busco únicamente que el agente termine una tarea: necesito entender los conceptos, las decisiones y el código suficiente para conservar el control del proyecto y explicárselo al resto del equipo.

**Preparación del contexto.** Explico al agente el objetivo, la historia de usuario y las restricciones que conozco. Le facilito `AGENTS.md` o compruebo que lo haya leído y le indico qué documentación o estado del repositorio debe revisar. Si no entiendo el alcance, comienzo pidiendo una explicación antes de autorizar cambios.

**Uso de los agentes.** Los utilizo para revisar cambios del repositorio, entender tecnologías y configuración, diseñar la forma de trabajo del equipo, redactar documentación y apoyar tareas de programación. Para trabajo técnico, espero que el agente respete la arquitectura de PlanB, no modifique trabajo ajeno y explique las decisiones relevantes.

**TDD y comprensión de las pruebas.** Quiero que las tareas de programación sigan el ciclo rojo, verde y refactorización aunque el agente escriba y ejecute las pruebas. Antes de aceptar una prueba, debo poder explicar qué datos o simulaciones prepara, qué acción ejecuta y qué resultado comprueba. Si algo no se entiende, pido una explicación en lenguaje más sencillo antes de continuar.

**Revisión y corrección.** Reviso el resumen y los archivos cambiados, pregunto por la terminología desconocida y comparo el resultado con el criterio de validación. No doy por válida una afirmación solo porque la haga el agente: compruebo los resultados de las pruebas y, cuando cambia una pantalla, realizo también una comprobación manual.

**Actualización y entrega.** Antes de empezar sigo el procedimiento de Windows descrito en la sección 4.1. Mantengo el `.env` fuera de Git, reviso las migraciones y dependencias recibidas y ejecuto la batería de pruebas. Al terminar, actualizo la historia de usuario cuando corresponda, añado la interacción relevante a `documentacion/prompts/matthew.md` y preparo un commit comprensible.

**Precauciones personales.** No incorporo secretos ni credenciales al repositorio o a los prompts. Evito aceptar tecnologías o abstracciones que no pueda justificar. Si el agente y la documentación se contradicen, detengo la decisión hasta comprobar el código, las pruebas y el criterio de la historia.

## 7. Reparto de responsabilidades

| Actividad | Agente de IA | Integrante responsable |
|---|---|---|
| Interpretar una tarea | Puede resumir y detectar dudas | Confirma el alcance y los criterios |
| Diseñar una solución | Propone opciones y consecuencias | Elige y justifica la opción |
| Modificar código | Puede generar o editar | Revisa y comprende el cambio |
| Crear pruebas | Propone casos y automatiza | Comprueba que representan los criterios |
| Aplicar TDD | Escribe y ejecuta el ciclo rojo-verde-refactorización | Entiende la prueba y confirma que representa el comportamiento |
| Ejecutar comprobaciones | Puede ejecutar y resumir resultados | Valora la evidencia y prueba manualmente cuando proceda |
| Documentar | Puede redactar una base | Corrige el contenido y asume su autoría final |
| Commit o entrega | Puede sugerir el contenido | Decide qué se incorpora y responde por ello |

## 8. Criterio de finalización

Una tarea asistida por IA está terminada cuando:

- satisface los criterios de validación acordados;
- respeta la arquitectura y las convenciones del repositorio;
- las pruebas relevantes pasan y su resultado está anotado;
- se conserva evidencia del fallo inicial de la prueba o se explica por qué TDD no fue aplicable;
- el integrante entiende el bloque de pruebas incorporado;
- el integrante puede explicar el cambio y sus consecuencias;
- la documentación y la historia de usuario están actualizadas cuando corresponde;
- la interacción relevante está incluida en el registro de prompts;
- el repositorio no contiene secretos ni archivos accidentales.

## 9. Mejora de la metodología

El equipo revisará este documento cuando detecte un problema repetido, cambie su forma de coordinación o incorpore una herramienta nueva. La modificación debe explicar el motivo y acordarse como cualquier otra decisión de equipo.
