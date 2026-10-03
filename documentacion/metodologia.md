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

Desde el 02/10/2026, `customer-stories/Customer_Stories_PlanB.xlsx` tiene la estructura descrita en los apartados 3.1 a 3.4. El equipo lo externalizará a OneDrive para que todos trabajen sobre una versión única y sincronizada en tiempo real.

Este traslado está **pendiente**. Mientras no se complete:

- el Excel del repositorio sigue siendo la referencia disponible;
- no se debe borrar, ignorar ni declarar obsoleto todavía;
- no se deben mantener dos versiones activas con cambios diferentes.

Cuando se complete la migración, el equipo debe:

1. Añadir en el README el enlace de OneDrive y la fecha desde la que esa versión es la oficial.
2. Decidir si el Excel del repositorio se elimina o se conserva como una copia histórica claramente fechada y de solo lectura.
3. Actualizar `.gitignore` si fuese necesario para evitar que vuelva a añadirse una copia de trabajo.
4. Actualizar `AGENTS.md` y esta metodología para indicar que los criterios se consultan en OneDrive.

Hasta entonces, cualquier agente debe informar si encuentra diferencias entre el Excel local y la descripción de una tarea recibida del equipo.

### 3.1. Estructura del libro

El libro está preparado para Excel para la web: solo usa fórmulas, tablas de Excel, listas desplegables, formato condicional y un Office Script, sin macros. Tiene tres tipos de hoja: el **Índice**, una **página por historia** y la hoja **«Plantilla»**, que es siempre la última.

**Referencias.** Cada historia se identifica como `CS-XX`, con un número correlativo que empieza en `CS-01`. La página de cada historia se llama exactamente igual que su referencia, y las menciones a otras historias dentro de los textos también usan esa referencia.

**Índice.** Es una tabla de Excel llamada «Historias», con filtro en cada columna:

| Columna | Contenido | Cómo se rellena |
|---|---|---|
| Ref | Referencia `CS-XX` | La pone el botón «Crear páginas» |
| Título | Nombre de la historia, enlazado a su página | A mano |
| Riesgo | Bajo, Medio bajo, Medio, Alto o Muy alto | Desplegable |
| Prioridad | I (la más importante), N (media) o M (poco importante) | Desplegable |
| Tiempo estimado | Horas previstas para toda la historia | A mano |
| Tiempo total | Suma del «Tiempo total» de los objetivos de su página, en horas | Automático |
| Estado | En espera, En progreso, Finalizada o Sin página | Automático |

Arriba a la derecha, «Próxima ref.» muestra la siguiente referencia libre.

El estado se calcula a partir de los objetivos de la página:

- **En espera:** ningún objetivo tiene responsable ni está finalizado, o la página aún no tiene objetivos.
- **En progreso:** al menos un objetivo tiene responsable o está finalizado.
- **Finalizada:** la página tiene objetivos y todos están en «Sí».
- **Sin página:** la fila tiene título, pero no existe ninguna hoja con su referencia.

**Páginas.** Cada página tiene dos niveles:

1. **Cabecera de la historia:** Ref, Título, Estado, Prioridad, Riesgo, Tiempo estimado, Tiempo total, Propietario, Fecha, Prior Reference, Task Description y Criterio de Validación. Las celdas con fondo gris se calculan solas: Título, Estado, Prioridad, Riesgo y Tiempo estimado se copian del Índice, y Tiempo total suma los objetivos. Para cambiarlas se edita el Índice. El enlace «↑ Índice» de la banda superior vuelve al Índice.
2. **Task Tracking:** tabla de objetivos con las columnas Objetivo (número automático), Descripción, Finalizado (Sí o No), Responsable, Tiempo estimado y Tiempo total. Responsable ofrece la lista del equipo (Joaquin, Matthew, Jorge, Flavia y Lucia) y admite otros nombres tras un aviso.

**Unidades.** Los tiempos de la historia (Índice y cabecera de la página) están en horas y los de los objetivos, en minutos. Se escribe solo el número, por ejemplo `0,5` horas o `30` minutos: la unidad la añade el formato de la celda, y los campos de tiempo no aceptan texto ni números negativos. La fecha se muestra como `DD/MM/AAAA`.

### 3.2. Esquema de colores y formatos

Los colores de prioridad, riesgo, estado y finalizado se aplican solos con formato condicional. Un valor que no está en su lista se queda sin color, lo que ayuda a detectarlo.

| Campo | Valor | Fondo | Texto |
|---|---|---|---|
| Prioridad | I | `#FFC7CE` rojo claro | `#9C0006` |
| Prioridad | N | `#FFEB9C` amarillo | `#9C5700` |
| Prioridad | M | `#C6EFCE` verde claro | `#006100` |
| Riesgo | Bajo | `#C6EFCE` verde claro | `#006100` |
| Riesgo | Medio bajo | `#E2EFDA` verde pálido | `#375623` |
| Riesgo | Medio | `#FFEB9C` amarillo | `#9C5700` |
| Riesgo | Alto | `#F8CBAD` naranja | `#843C0C` |
| Riesgo | Muy alto | `#FFC7CE` rojo claro | `#9C0006`, negrita |
| Estado | En progreso | `#FFD966` amarillo intenso | `#7F6000`, negrita |
| Estado | En espera | `#EDEDED` gris | `#595959` |
| Estado | Finalizada | `#C6EFCE` verde claro | `#006100` |
| Estado | Sin página | `#FFC7CE` rojo claro | `#9C0006` |
| Finalizado (objetivos) | Sí | `#C6EFCE` verde claro | `#006100` |
| Finalizado (objetivos) | No | `#FFC7CE` rojo claro | `#9C0006` |

Además, en el Índice la fila completa de una historia **En progreso** se resalta con fondo `#FFF2CC` y negrita, y la de una historia **Finalizada** pasa a texto gris `#808080`. Así destacan las historias en las que se está trabajando.

| Elemento | Formato |
|---|---|
| Tipografía | Arial 11. Título del Índice en 16, banda de título de cada página en 14 y banda «Task Tracking» en 12 |
| Bandas de título y cabeceras de tabla | Fondo azul oscuro `#1F4E78`, texto blanco en negrita |
| Etiquetas de la cabecera de página | Fondo azul claro `#DCE6F1`, negrita |
| Celdas calculadas de la cabecera | Fondo gris `#F2F2F2` |
| Enlaces | Azul `#0563C1`, subrayado |
| Textos de ayuda | Cursiva gris: `#595959` en el Índice y `#7F7F7F` en las páginas |
| Bordes | Línea fina gris `#A6A6A6` |
| Pestaña «Plantilla» | Gris `#808080` |
| Horas | Con decimales y la unidad «h», por ejemplo `4,0 h` o `1,25 h`; el cero se muestra como «—» |
| Minutos | Con la unidad «min», por ejemplo `30 min`; el cero se muestra como «—» |
| Número de objetivo | «Objetivo 1», «Objetivo 2»... |

Los desplegables y los colores cubren hasta la fila 500 del Índice y hasta 300 objetivos por página.

### 3.3. Añadir historias y objetivos

**Historia nueva.**

1. Escribir el título en la fila vacía que hay justo debajo de la tabla del Índice. La tabla crece sola y la fila muestra «Sin página».
2. Pulsar el botón «Crear páginas». El botón pone la referencia, crea la página copiando «Plantilla» con la referencia y la fecha del día, enlaza el título y abre la página nueva.
3. Rellenar Riesgo, Prioridad y Tiempo estimado en el Índice, y Propietario, Prior Reference, Task Description y Criterio de Validación en la página.

Si el botón no está disponible, la página se crea a mano: clic derecho en «Plantilla» → «Duplicar», renombrar la copia con la referencia que indica «Próxima ref.» y escribir esa referencia en la celda B2 de la página y en la columna Ref de su fila del Índice.

**Objetivo nuevo.** Escribir la descripción en la fila vacía que hay justo debajo de la tabla de objetivos. La tabla crece y el número, los desplegables y los colores se aplican solos. Al poner un responsable o marcar «Sí», el estado y el tiempo total del Índice se actualizan.

**Instalación del botón (una sola vez).** Con el libro en OneDrive y abierto en Excel para la web: Automatizar → Nuevo script → pegar `documentacion/office-scripts/crearPaginas.ts` → guardar como «Crear páginas» → en el panel del script, «…» → «Agregar en el libro». El botón queda en el libro para todas las personas con permiso de edición. Requiere una cuenta de Microsoft 365 con Office Scripts: si no aparece la pestaña «Automatizar», no están disponibles.

### 3.4. Precauciones

- No escribir en las celdas grises de las páginas ni en las columnas Tiempo total y Estado del Índice: contienen fórmulas y se perderían.
- No renombrar las páginas: el Índice las encuentra por su nombre, que debe coincidir con la referencia.
- No insertar ni mover columnas en las páginas. El Índice lee de cada página las columnas A (número de objetivo), C (Finalizado), D (Responsable) y F (Tiempo total).
- No insertar filas en la cabecera de «Plantilla»: el botón escribe la referencia en B2 y la fecha en B10.
- El Índice se puede ordenar y filtrar. En Excel para la web, un filtro lo ven todas las personas que tienen el libro abierto; para filtrar solo para uno mismo se usa Vista → Vista de hoja → Nueva.

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
2. Selecciona una tarea concreta de `customer-stories/Customer_Stories_PlanB.xlsx`.
3. Lee sus criterios de validación y localiza las capas que probablemente se verán afectadas.
4. Explica al agente el objetivo, las restricciones y el estado conocido. Si la tarea parte de trabajo de otra persona, lo indica expresamente.

#### Procedimiento actual de Matthew en Windows

Matthew trabaja actualmente con la aplicación Codex de ChatGPT y prevé usar también un agente integrado en Visual Studio. Mantendrá Codex para consultas, documentación y tareas sencillas o que no requieran modificar código.

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
| Flavia Méndez Tsutsumi | FLA / flaviamendez | Completada en la sección 6.2 |
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

### 6.2. Flavia Méndez Tsutsumi

**Sistema operativo y entorno.** Trabajo en macOS (MacBook Air) con Visual Studio Code. Utilizo la terminal integrada de Visual Studio Code (zsh) y Docker Desktop para la base de datos MySQL. Como agente de IA utilizo Claude Code.

**Uso de los agentes.** Los utilizo para entender el estado del proyecto y el trabajo del resto del equipo, revisar mis tareas, detectar qué no cumple el criterio de validación y preparar los comandos paso a paso. El agente no modifica archivos por su cuenta: me propone los cambios y los comandos, y yo los ejecuto en mi terminal.

**Preparación del contexto.** Pido al agente que revise el repositorio, la documentación y el historial de commits para distinguir mi trabajo del de mis compañeros. Le indico la historia de usuario en la que trabajo y le pido que no modifique trabajo ajeno. Si un cambio afecta a un archivo de otra persona, se lo comunico.

**Revisión y corrección.** Trabajo por pasos: compruebo el resultado de cada cambio con `git diff` antes de continuar y pregunto todo lo que no entiendo, por ejemplo para qué sirve un comando antes de ejecutarlo. Si la propuesta no se ajusta a lo que necesito, la corrijo o la reduzco.

**Pruebas antes de aceptar cambios.** Ejecuto `npm test` desde `backend/` y, cuando cambia una pantalla, la pruebo manualmente en el navegador con casos correctos y de error. Si algo no se ha podido comprobar, lo indico como pendiente.

**Actualización y entrega.** Antes de empezar, ejecuto estos comandos desde la carpeta `ISW-Practica`, en la terminal de Visual Studio Code:

```bash
git status
git pull origin main
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm test
npm run dev
```

Para subir mi trabajo, compruebo con `git status` que solo aparecen mis archivos y después ejecuto `git add`, `git commit` con un mensaje que indica la historia de usuario y `git push origin main`. Al terminar, actualizo el Excel de la historia, la entrada correspondiente de `documentacion/modificaciones.md` y mi registro en `documentacion/prompts/flavia.md`.

**Precauciones personales.** No subo mi archivo `.env`, `cookies.txt` ni los archivos temporales `~$` de Excel; cierro Excel antes de hacer un commit. No utilizo `docker compose down -v`, porque borra los datos locales. Antes de `git add -A`, compruebo con `git status` que no se incluye nada ajeno.

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
