# Instrucciones para agentes — PlanB

PlanB lo desarrolla un equipo de estudiantes con agentes de IA como apoyo. La persona debe entender el proyecto, conservar las decisiones y poder explicar lo que entra en el repositorio. El agente propone y ejecuta; la persona revisa y decide.

## Comandos (desde `backend/`)

- `npm test`: toda la batería. `npm run test:cobertura`: con informe y mínimos de `package.json`.
- `npm run test:mysql`: MySQL real en Docker (`docker compose up -d`, usa `.env.test`).
- `npm run dev` / `npm run dev:demo` (con `demo:preparar`): desarrollo y modo demo local (`demo_*`).
- `db:migrate` y `db:seed` actúan sobre la base online compartida: no los ejecutes sin pedirlo. `db:migrate:nueva` crea migraciones contra la base local de demo.

## Cómo trabajar

- Antes de cambiar nada, identifica la historia y sus criterios.
- No afirmes que algo funciona sin comprobarlo: di qué ejecutaste y qué quedó sin verificar.
- Explica los conceptos técnicos nuevos la primera vez. Sin tecnologías, dependencias ni abstracciones sin necesidad clara. No toques trabajo ajeno.

## No leer (salvo que la tarea lo pida)

- `documentacion/anexo/` (excepto `fichas-integrantes.md` al poner a alguien en contexto), `documentacion/customer-stories/` (obsoleto), `documentacion/office-scripts/`, `.planes/`.

## Poner en contexto a un integrante

No modifiques archivos ni des instrucciones genéricas. Pregunta «¿Quién eres dentro del equipo?», busca su ficha en `fichas-integrantes.md` y resume lo relevante (pasos, precauciones, TDD). Si la ficha está incompleta, pregunta antes sistema, editor, terminal y agente. Solo después pregunta qué historia va a trabajar. No muestres datos personales de otros.

## Fuentes de verdad

Por orden: instrucciones de la persona; criterios de la historia; código y pruebas; `arquitectura.md`; `git log` y `decisiones/`. Si se contradicen, dilo antes de decidir. Distingue implementado, pendiente y diseño futuro.

**Historias de usuario.** El libro vigente es `Customer_Stories_PlanB.xlsx` en OneDrive. Con acceso a Excel para la web, trabaja ahí y confirma cada cambio antes (el equipo lo ve al momento); los cambios masivos van con Office Script. Sin acceso, entrega los cambios como lista. Estructura: `documentacion/anexo/libro-de-historias.md`. Objetivos: 3–6 macrotareas de 1–4 h con sus pruebas, nunca una por capa o paso de TDD (`documentacion/metodologia.md`).

## Arquitectura

Monolito por capas: `rutas → servicios → repositorios → Prisma/MySQL o servicio externo`.

- `routes/*Routes.js`: HTTP, sin reglas de negocio ni repositorios. `middlewares/*Middleware.js`: tareas comunes de rutas. `services/*Service.js`: validaciones y reglas. `repositories/*Repository.js`: única frontera con Prisma, MySQL, Cloudinary u otros externos.
- Lo compartido va en `shared/` de su capa. Antes de duplicar, busca el helper existente (sesión, validaciones, paginación, errores HTTP, `USUARIO_PUBLICO`): su ubicación está en el código.

Convenciones de API (detalle en `documentacion/api.md`):

- Experiencia inexistente o no visible: 404 «Contenido no disponible» vía `experienciaService.obtenerExperiencia`; lo que cuelga de ella pasa por esa función.
- De otro usuario solo `{ id, nombreUsuario, foto }`.
- Errores de concurrencia de Prisma (P2002, P2025) se traducen a 400 o 404, nunca 500.

## Frontend

- Comportamiento en `frontend/js/<área>/x.js` para cada `paginas/<área>/x.html`; lo compartido en `js/shared/`.
- La CSP de Helmet prohíbe scripts en línea: sin `onclick` ni `<script>` en el HTML.
- Texto de usuarios con `textContent`. Con `FormData`, no fijes `Content-Type`.
- Si cambia la interfaz, comprueba escritorio.

## Datos y seguridad

- Ningún secreto, contraseña, cookie ni `.env` en Git, docs, pruebas o respuestas. La `DATABASE_URL` online se pide al equipo. Actualiza `.env.example` si añades una variable.
- Todo cambio de `schema.prisma` que altere la base incluye su migración.
- `Usuario.ciudad` es texto libre; `Ciudad` es el catálogo de experiencias. No los confundas.
- La autorización se comprueba siempre en el backend.

## Pruebas (TDD)

Por cada comportamiento nuevo o corrección: **rojo** (falla por el motivo esperado), **verde** (cambio mínimo), **refactor** (sin cambiar comportamiento). Explica el bloque de prueba antes de implementar. No escribas pruebas que pasen de entrada ni las cambies para acomodar código incorrecto. Si TDD no es viable, dilo y define la verificación alternativa.

Ubicación en `backend/tests/`: `services/`, `routes/`, `middlewares/`, `criterios/` (un archivo por historia), `mysql/`, `frontend/`. Primero las pruebas del cambio, después `npm test`.

## Git y registro

- Revisa `git status` antes de editar y preserva cambios ajenos. Un objetivo por commit; archivos añadidos uno a uno. No reescribas historial ni borres ramas sin autorización.
- Antes de cada push: `npm test` y `git grep -nE '^(<<<<<<<|=======|>>>>>>>)( |$)'` sin resultados.
- **El commit es el registro.** Título `CS-XX: resultado` (sin CS-XX si no hay historia), en español. Cuerpo: qué y por qué, cómo se comprobó y lo pendiente. Si hay decisión, termina con `Decisión: documentacion/decisiones/AAAA-MM-DD-titulo.md`.
- **Decisiones:** opciones razonables, convenciones, límites o datos/seguridad/auth → un archivo en `documentacion/decisiones/` con su plantilla («a propuesta de <agente>» si fue idea tuya). No edites las de otros.
- **Docs de referencia:** quien cambie una ruta, modelo, flujo o pantalla actualiza en el mismo commit su doc (`api.md`, `arquitectura.md`, `flujos.md`, `frontend.md`), o dice en el cuerpo «Documentación: sin cambios porque …». Describen lo que existe, sin porqués ni conteos ni estados; los porqués van a `decisiones/` o al commit. Enlaza lo que ya vive en el código, no lo copies.
- **Prompts:** solo si la persona lo pide, anota la entrada en `documentacion/anexo/prompts/` (plantilla allí). No reconstruyas prompts ni registres secretos.

## Al terminar

Resultado, archivos y capas afectadas, riesgos, comandos ejecutados con su resultado, lo no verificado y pasos manuales. Propón el mensaje de commit.
