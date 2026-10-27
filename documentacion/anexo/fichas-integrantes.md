# Fichas de los integrantes y procedimientos de actualización

Solo para poner en contexto a una persona del equipo (`AGENTS.md`, «Poner en contexto»). Cada ficha es de su autor: no se modifica la de otra persona.

## Procedimiento de Matthew en Windows

Matthew trabaja actualmente con la aplicación Codex de ChatGPT y prevé usar también un agente integrado en Visual Studio. Mantendrá Codex para consultas, documentación y tareas sencillas o que no requieran modificar código.

Cuando planifique historias de usuario con un agente, Matthew le pasa una copia actual del libro, revisa las tareas propuestas una a una y las copia manualmente a la versión online. Esa copia no se incorpora al repositorio.

Desde PowerShell o la terminal integrada de Visual Studio:

```powershell
cd C:\\Users\\mattp\\dev\\school\\3-GISI\\ISW-Practica
git status
git pull
git log --oneline ORIG\_HEAD..HEAD
git diff --name-status ORIG\_HEAD..HEAD
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

## Plantilla de procedimiento

Cada integrante debe añadir un procedimiento real, probado en su equipo, sin copiar comandos de otro sistema operativo a ciegas:

```text
Nombre:
Sistema operativo y versión: \[Windows / macOS / Linux]
Editor o entorno: \[Visual Studio / otro]
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

## Forma de trabajo de cada integrante

Esta sección debe completarla cada persona en primera persona. No debe describir una forma de trabajo ideal, sino la que realmente utiliza. La ficha de Matthew se completa con la información que ha confirmado; las demás siguen pendientes para no atribuir prácticas que cada integrante no haya validado.

|Integrante|Identificador habitual|Forma de trabajo documentada|
|-|-|-|
|Matthew Puente Villegas Michavil|MAT / Matthew-PV|Completada en la sección 6.1|
|Flavia Méndez Tsutsumi|FLA / flaviamendez|Completada en la sección 6.2|
|Jorge Delgado Castellanos|JOR / jorjonudo|Pendiente de completar por el integrante|
|Lucía Alexandra Guzmán Álvarez|LUC|Completada en la sección 6.3|
|Joaquín de Vicente Abad|JOA|Pendiente de completar por el integrante|
|Jose Fernando Nevarez|Código pendiente|Pendiente de completar por el integrante|

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

### 1. Matthew Puente Villegas Michavil

**Sistema operativo y entorno.** Trabajo en Windows. Actualmente utilizo principalmente la aplicación Codex de ChatGPT sobre mi copia local del repositorio y PowerShell. Preveo incorporar un agente integrado en Visual Studio y utilizar también su terminal. Seguiré recurriendo a Codex para comprender conceptos, revisar el repositorio, preparar documentación y resolver tareas sencillas o que no requieran modificar código.

**Experiencia y objetivo personal.** Tengo poca experiencia práctica en creación y despliegue de aplicaciones. Por eso no busco únicamente que el agente termine una tarea: necesito entender los conceptos, las decisiones y el código suficiente para conservar el control del proyecto y explicárselo al resto del equipo.

**Preparación del contexto.** Explico al agente el objetivo, la historia de usuario y las restricciones que conozco. Le facilito `AGENTS.md` o compruebo que lo haya leído y le indico qué documentación o estado del repositorio debe revisar. Si no entiendo el alcance, comienzo pidiendo una explicación antes de autorizar cambios.

**Uso de los agentes.** Los utilizo para revisar cambios del repositorio, entender tecnologías y configuración, diseñar la forma de trabajo del equipo, redactar documentación y apoyar tareas de programación. Para trabajo técnico, espero que el agente respete la arquitectura de PlanB, no modifique trabajo ajeno y explique las decisiones relevantes.

**TDD y comprensión de las pruebas.** Quiero que las tareas de programación sigan el ciclo rojo, verde y refactorización aunque el agente escriba y ejecute las pruebas. Antes de aceptar una prueba, debo poder explicar qué datos o simulaciones prepara, qué acción ejecuta y qué resultado comprueba. Si algo no se entiende, pido una explicación en lenguaje más sencillo antes de continuar.

**Revisión y corrección.** Reviso el resumen y los archivos cambiados, pregunto por la terminología desconocida y comparo el resultado con el criterio de validación. No doy por válida una afirmación solo porque la haga el agente: compruebo los resultados de las pruebas y, cuando cambia una pantalla, realizo también una comprobación manual.

**Actualización y entrega.** Antes de empezar sigo el procedimiento de Windows descrito en la sección 4.1. Mantengo el `.env` fuera de Git, reviso las migraciones y dependencias recibidas y ejecuto la batería de pruebas. Al terminar, actualizo la historia de usuario cuando corresponda, añado la interacción relevante a `documentacion/prompts/matthew.md` y preparo un commit comprensible.

**Precauciones personales.** No incorporo secretos ni credenciales al repositorio o a los prompts. Evito aceptar tecnologías o abstracciones que no pueda justificar. Si el agente y la documentación se contradicen, detengo la decisión hasta comprobar el código, las pruebas y el criterio de la historia.

### 2. Flavia Méndez Tsutsumi

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

**Precauciones personales.** No subo mi archivo `.env`, `cookies.txt` ni los archivos temporales `\~$` de Excel; cierro Excel antes de hacer un commit. No utilizo `docker compose down -v`, porque borra los datos locales. Antes de `git add -A`, compruebo con `git status` que no se incluye nada ajeno.

### 3. Lucía Alexandra Guzmán Álvarez

**Sistema operativo y entorno.** Trabajo en macOS (MacBook Air) con Visual Studio Code y su terminal integrada (zsh). Uso Docker Desktop para la base de datos MySQL y Chrome para probar la aplicación. Como agente de IA utilizo Claude desde su aplicación de escritorio.

**Uso de los agentes.** Los utilizo para ponerme en contexto, entender qué pide una historia y avanzar objetivo por objetivo. El agente me propone las pruebas, el código y los comandos; yo los copio, los ejecuto en mi terminal y le pego el resultado. No modifica archivos por su cuenta.

**Preparación del contexto.** Le pido que lea `AGENTS.md`, le indico la historia en la que trabajo y le adjunto una copia actual del Excel. Cuando necesita ver el código vigente, le pego el contenido de los archivos o la salida de la terminal. Las decisiones que afectan a otros compañeros las consulto antes con ellos.

**TDD y comprensión de las pruebas.** Escribo primero la prueba y compruebo que falla por el motivo esperado antes de añadir el código. Antes de aceptarla, pido que me explique qué prepara, qué acción ejecuta y qué resultado espera.

**Revisión y corrección.** Trabajo en pasos pequeños. Si una explicación tiene demasiados pasos o no la entiendo, pido que la divida. Antes de cada commit reviso `git status` y `git diff`.

**Pruebas antes de aceptar cambios.** Ejecuto `npm test` desde `backend/` y pruebo la pantalla en Chrome. Cuando el cambio depende de dos personas, uso mi cuenta en una ventana normal y una cuenta de prueba en una ventana de incógnito.

**Actualización y entrega.** Antes de empezar, con Docker Desktop abierto, ejecuto desde la carpeta del repositorio:

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

Hago un commit por objetivo, añadiendo los archivos uno a uno con `git add` y con un mensaje del tipo «CS-45 Tarea 5 …». Antes de `git push origin main` hago `git pull origin main`; si las ramas han divergido, las fusiono. Al terminar actualizo el Excel de OneDrive, `documentacion/modificaciones.md` y `documentacion/prompts/lucia.md`.

**Precauciones personales.** Mi Mac tiene un MySQL propio que ocupa el puerto 3306: lo paro en Ajustes del Sistema antes de `docker compose up -d`. Pruebo en Chrome, porque Safari cambia `http://localhost:3000` a `https`. Ejecuto los comandos de `git` con rutas desde la carpeta del repositorio y los de `npm` desde `backend/`. No subo `.env` ni uso `docker compose down -v`. No subo pruebas que fallen.
