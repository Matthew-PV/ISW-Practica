# Instrucciones para agentes — PlanB

PlanB lo desarrolla un equipo de estudiantes que usa agentes de IA como apoyo. El objetivo no es solo terminar funcionalidades: la persona debe entender el proyecto, conservar el control de las decisiones y poder explicar lo que entra en el repositorio. El agente propone y ejecuta; la persona revisa y decide.

## Comandos

Desde `backend/`:

- `npm test`: toda la batería (Jest + Supertest + jsdom).
- `npm run test:mysql`: pruebas con MySQL real (necesita `docker compose up -d`).
- `npm run test:cobertura`: todas las pruebas con informe; falla por debajo de los mínimos de `package.json`.
- `npm run dev`: servidor de desarrollo.
- `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`: Prisma (migraciones, catálogo de ciudades repetible sin duplicados, visor).

## Cómo trabajar

- Explica en lenguaje claro los conceptos técnicos la primera vez que aparezcan.
- Antes de cambiar nada, identifica la historia de usuario y sus criterios de validación si existen.
- No afirmes que algo funciona sin haberlo comprobado: di qué ejecutaste y qué quedó sin verificar.
- Sin tecnologías, dependencias ni abstracciones nuevas sin necesidad clara. No toques trabajo ajeno.

## No leer

No leas esto salvo que la tarea lo pida expresamente:

- `documentacion/anexo/`: histórico (`modificaciones.md`), prompts del equipo, glosario, hoja de ruta de aprendizaje, propuesta inicial, libro de historias, herramientas e instalación. Única excepción: `anexo/fichas-integrantes.md` al poner a alguien en contexto (ver más abajo).
- `documentacion/customer-stories/` (copia obsoleta del libro de historias) y `documentacion/office-scripts/`.
- `.planes/` (borradores locales).

## Poner en contexto a un integrante

Si alguien pide «ponme en contexto», «¿cómo empiezo?» o similar, no modifiques archivos ni des instrucciones genéricas:

1. Pregunta **«¿Quién eres dentro del equipo?»** (nombre, identificador de historias o usuario de GitHub), salvo que ya conste en el chat.
2. Busca su ficha en `documentacion/anexo/fichas-integrantes.md`. Si está completa, resume el estado relevante del proyecto, sus pasos para actualizar repositorio, dependencias, base de datos y pruebas según su entorno, las precauciones (cambios locales, `.env`, migraciones) y el flujo TDD. Si está incompleta, pregunta sistema operativo, editor, terminal y agente antes de dar comandos.
3. Solo después pregunta qué historia u objetivo va a trabajar y consulta la documentación necesaria para esa tarea.

No muestres datos personales de otros miembros.

## Fuentes de verdad

En este orden: instrucciones actuales de la persona; criterios de la historia; el código y las pruebas; `documentacion/arquitectura.md` (reglas técnicas estables); `git log` (qué cambió y por qué) y `documentacion/decisiones/` (decisiones). `README.md` resume el estado y la puesta en marcha. Para algo ya implementado: `documentacion/api.md` (rutas), `flujos.md` (secuencias y estados) y `frontend.md` (pantallas). Si se contradicen, dilo antes de decidir cuál actualizar; distingue implementado, pendiente y diseño futuro.

**Historias de usuario.** El libro `Customer_Stories_PlanB.xlsx` está en el OneDrive compartido y es el único vigente (estado, responsable, tiempos y criterios). Si tienes acceso a Excel para la web, trabaja ahí y confirma cada cambio con la persona antes de hacerlo (el equipo lo ve al momento); los cambios masivos van con un Office Script. Sin acceso, pide los criterios actuales a la persona y entrega los cambios como lista. Estructura del libro: `documentacion/anexo/libro-de-historias.md`. Los objetivos de una historia son macrotareas: entre 3 y 6, cada una con un resultado comprobable de 1 a 4 horas que incluye sus pruebas, nunca una por capa, archivo o paso de TDD (`documentacion/metodologia.md`).

## Arquitectura obligatoria

Monolito web por capas. El flujo del backend es `rutas → servicios → repositorios → Prisma/MySQL o servicio externo`.

- `backend/src/routes/*Routes.js`: reciben HTTP, extraen datos y llaman a servicios. Sin reglas de negocio ni acceso a repositorios.
- `backend/src/middlewares/*Middleware.js`: tareas comunes de las rutas (sesión, límite de peticiones, archivos).
- `backend/src/services/*Service.js`: validaciones, reglas de negocio y coordinación de repositorios.
- `backend/src/repositories/*Repository.js`: única frontera con Prisma, MySQL, Cloudinary y otros mecanismos externos.
- Lo compartido va en la carpeta `shared/` de su capa. Los archivos nuevos respetan los sufijos `Routes.js`, `Middleware.js`, `Service.js` y `Repository.js`.

Reutiliza antes de duplicar:

- `requiereSesion` (`middlewares/sesionMiddleware.js`): exige sesión y comprueba que el usuario sigue existiendo; los servicios no lo repiten.
- `validarNombreUsuario` (`services/shared/nombreUsuario.js`), `validarPassword` y `cifrarPassword` (`services/shared/password.js`), `leerId` (`services/shared/identificadores.js`), `leerPaginacion` y `cortarPagina` (`services/shared/paginacion.js`).
- Cliente Prisma y almacén de sesiones (`repositories/shared/`); `USUARIO_PUBLICO` (`repositories/shared/camposPublicos.js`) en cualquier consulta que devuelva a otro usuario.
- `crearError` (`backend/src/errores.js`) para errores con estado HTTP.

Convenciones de la API (detalle en `documentacion/api.md`):

- Una experiencia que no existe o que el usuario no puede ver responde igual: 404 «Contenido no disponible», con `experienciaService.obtenerExperiencia`. Todo lo que cuelga de una experiencia (sus valoraciones) pasa por esa función.
- Listas paginadas por cursor: `?despuesDe=&limite=` y `{ <lista>, siguiente }`; el repositorio pide `limite + 1` filas por id descendente. Sin OFFSET.
- De otro usuario solo `{ id, nombreUsuario, foto }`; nunca email ni contraseña cifrada.
- Los errores de concurrencia de Prisma (P2002, P2025) se traducen a 400 o 404, nunca a 500 (`repositories/shared/carreras.js`).

## Frontend

- Cada `frontend/x.html` tiene su comportamiento en `frontend/js/x.js`; lo compartido, en `frontend/js/shared/`. Carga primero `shared/api.js` y reutilízalo para llamar a la API.
- La CSP de Helmet prohíbe scripts en línea: sin `onclick` ni bloques `<script>` en el HTML.
- Texto de usuarios con `textContent`, nunca como HTML.
- Con `FormData`, no fijes `Content-Type`: lo añade el navegador.
- Si el cambio afecta a la interfaz, comprueba escritorio y móvil.

## Datos, configuración y seguridad

- Ningún secreto, contraseña, cookie de sesión ni `.env` en Git, documentación, pruebas o respuestas. `backend/.env.example` solo lleva nombres y valores de ejemplo seguros; actualízalo si se añade una variable.
- Todo cambio de `backend/prisma/schema.prisma` que altere la base de datos incluye su migración.
- `Usuario.ciudad` es texto libre del perfil; el modelo `Ciudad` es el catálogo estructurado de las experiencias. No los confundas.
- Conserva sesiones, validaciones y permisos de autor. El frontend puede ocultar acciones, pero la autorización se comprueba siempre en el backend.

## Pruebas (TDD)

Para cada comportamiento nuevo o corrección: **rojo** (prueba que falla por el motivo esperado), **verde** (cambio mínimo para que pase), **refactorización** (más claridad sin cambiar el comportamiento, volviendo a ejecutar). Antes de implementar, explica a la persona el bloque de prueba (datos o simulaciones, acción, resultado esperado): debe poder explicar qué comportamiento protege. No escribas una prueba que pase desde el principio (salvo que caracterices algo existente) ni la cambies para acomodar una implementación incorrecta. Si TDD no es viable (p. ej. una comprobación visual), dilo y define la verificación alternativa antes de cambiar el código.

Dónde va cada prueba, en `backend/tests/`: `services/` y `services/shared/` (unitarias, repositorios simulados), `routes/` y `middlewares/` (Supertest, servicios reales y repositorios simulados), `criterios/` (un archivo por historia, de punta a punta por HTTP), `mysql/` (MySQL real: restricciones, transacciones, concurrencia) y `frontend/` (jsdom). Ejecuta primero las pruebas del cambio y después `npm test`.

## Git y registro del trabajo

- Revisa `git status` antes de editar y preserva cambios locales ajenos. Cambios pequeños, un objetivo por commit, archivos añadidos uno a uno. No reescribas historial, borres ramas ni descartes cambios sin autorización expresa.
- Antes de cada push y tras cada merge o conflicto: `npm test` desde `backend/` y `git grep -nE '^(<<<<<<<|=======|>>>>>>>)( |$)'` sin resultados.
- **El commit es el registro de lo que cambió.** Título `CS-XX: resultado en una línea` (sin `CS-XX` si no hay historia), en español. Cuerpo, salvo cambios triviales: qué cambia y por qué, cómo se comprobó (comando y resultado) y lo pendiente o sin comprobar. Si incluye una decisión, termina con `Decisión: documentacion/decisiones/AAAA-MM-DD-titulo.md`.
- **Decisiones.** Cuando se elige entre opciones razonables, se fija una convención, se acepta un límite o se toca algo de datos, seguridad o autenticación, crea un archivo en `documentacion/decisiones/` con la plantilla de esa carpeta (contexto, decisión, alternativas, consecuencias, quién decidió; si la propuesta fue tuya: «…, a propuesta de <agente>»). Un archivo por decisión; no edites los de otras personas. No inventes motivos. Para saber por qué algo es como es: `git log -S "texto"`, `git blame` y `documentacion/decisiones/`.
- **Documentación de referencia.** Quien cambie una ruta, un modelo de datos, un flujo o una pantalla actualiza en el mismo commit `documentacion/api.md`, el diagrama ER de `arquitectura.md`, `flujos.md` o `frontend.md`. Describen el sistema tal como es, sin justificar decisiones.
- **Prompts.** Al terminar una tarea con IA, recuerda a la persona anotar en su archivo de `documentacion/anexo/prompts/` una entrada corta (plantilla allí): prompt inicial literal, correcciones que cambiaron el resultado y enlace al commit. No inventes ni reconstruyas prompts; no registres secretos ni datos personales.

## Al terminar una tarea

Informa brevemente: resultado, archivos y capas afectados, decisiones o riesgos (y el archivo de `decisiones/` si lo hay), comandos de prueba ejecutados con su resultado, evidencia de rojo/verde/refactorización (o por qué no se aplicó TDD) y pasos manuales pendientes. Propón el mensaje de commit y la entrada de prompts, sin inventar su contenido.
