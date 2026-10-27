# Metodología de trabajo con IA

El equipo usa agentes de IA para analizar historias, proponer soluciones, escribir código y pruebas y revisar documentación. La persona sigue siendo responsable de entender, revisar y validar lo que entra en el repositorio. Las reglas que deben seguir los agentes están en [AGENTS.md](../AGENTS.md); este documento explica el flujo para las personas.

## Principios

1. La historia de usuario guía el trabajo: antes de programar se identifican historia, objetivo y criterios de validación.
2. La persona decide. El agente propone; el integrante acepta, modifica o rechaza.
3. No se acepta código sin revisar: se entiende, respeta la arquitectura y no toca trabajo ajeno.
4. TDD cuando sea aplicable: prueba que falla, código mínimo, refactorización.
5. El humano entiende las pruebas: puede explicar qué prepara, qué ejecuta y qué espera cada bloque.
6. Toda afirmación se comprueba con pruebas automáticas, revisión manual o ambas.
7. Cambios pequeños: una conversación y un commit, un objetivo.
8. Seguridad: ni secretos, ni cookies, ni `.env` con el agente ni en Git.

## Historias de usuario

`Customer_Stories_PlanB.xlsx` vive en el OneDrive compartido y es la única versión vigente: allí están el estado, el responsable, el tiempo estimado y el tiempo empleado de cada tarea. La copia de `documentacion/customer-stories/` está obsoleta y no se consulta ni se actualiza.

- Los criterios se leen en el libro online. Si el agente no tiene acceso, la persona le copia la historia o una exportación recién descargada.
- Si el agente puede editar el libro, confirma cada cambio con la persona antes de hacerlo: el equipo lo ve al momento. Si no puede, entrega una lista de cambios para pasarla a mano.
- Estructura del libro, colores y cómo añadir historias: [anexo/libro-de-historias.md](anexo/libro-de-historias.md).

### Cómo escribir los objetivos

Los objetivos son **macrotareas**: un resultado completo que se puede comprobar solo.

- Termina en algo que se ve o se prueba de principio a fin (funcionalidad con datos, servicio, ruta, pantalla y pruebas; un documento cerrado; un diseño aprobado).
- Entre 1 y 4 horas. Menos de una hora suele ser un paso de otro objetivo; más de un día se divide por resultados, no por capas.
- Entre 3 y 6 por historia, que entre todos cubran el criterio de validación.
- Nunca uno por capa, archivo o paso de TDD: las pruebas forman parte del objetivo.

## Flujo de una tarea

1. **Preparación.** La persona actualiza su copia (`git status`, `git pull`, dependencias, migraciones, `npm test`), elige la tarea en el libro, lee sus criterios y se las explica al agente, indicando si parte de trabajo ajeno. Sus pasos por sistema operativo están en [anexo/fichas-integrantes.md](anexo/fichas-integrantes.md).
2. **TDD con el agente.** El agente traduce un criterio en una prueba, explica el bloque (preparación, acción, resultado esperado), la persona lo entiende, se ve fallar (rojo), se hace pasar (verde) y se limpia (refactorización). Se ejecuta la prueba concreta y después `npm test` desde `backend/`.
3. **Revisión humana.** La persona revisa los archivos cambiados, pide explicación de lo que no entiende, comprueba que la prueba falló antes por el motivo previsto, prueba a mano lo visual, comprueba que no hay secretos ni archivos ajenos y actualiza la documentación de referencia que haya cambiado.
4. **Commit.** Ver «Registro del trabajo». Una comprobación que no se pudo hacer se deja como pendiente en el cuerpo del commit.

Antes de cada push y después de cada merge: `npm test` y `git grep -nE '^(<<<<<<<|=======|>>>>>>>)( |$)'` sin resultados.

## Registro del trabajo

El historial de Git es el registro. No hay un archivo diario que actualizar en cada commit.

**Commits.** Un objetivo por commit, con los archivos añadidos uno a uno.

- *Título:* `CS-XX: resultado en una línea` (sin `CS-XX` si no hay historia), en español.
- *Cuerpo* (salvo cambios triviales): qué cambia y por qué, cómo se comprobó (comando y resultado) y lo que queda pendiente o sin comprobar. Si el cambio incluye una decisión, termina con `Decisión: documentacion/decisiones/AAAA-MM-DD-titulo.md`.
- El nombre del agente no es necesario; sí lo es decir qué se verificó de verdad.

**Decisiones.** Cuando se elige entre opciones razonables, se fija una convención, se acepta un límite o se toca algo de datos, seguridad o autenticación, se crea `documentacion/decisiones/AAAA-MM-DD-titulo.md` con la [plantilla](decisiones/plantilla.md): contexto, decisión, alternativas, consecuencias y quién decidió («…, a propuesta de <agente>» si la idea fue del agente). Un archivo por decisión, sin tocar los de otras personas. Los cambios mecánicos no necesitan decisión.

**Prompts.** Al terminar una tarea con IA, cada persona añade a su archivo de [anexo/prompts/](anexo/prompts/README.md) una entrada corta con la [plantilla](anexo/prompts/plantilla.md): prompt inicial literal, correcciones que cambiaron el resultado y enlace al commit. No se inventan ni se reconstruyen prompts; no se incluyen secretos ni datos personales.

**Histórico.** El registro diario anterior al 2026-10-27 se conserva en [anexo/modificaciones.md](anexo/modificaciones.md), sin cambios de contenido.

## Reparto de responsabilidades

| Actividad | Agente | Persona |
|---|---|---|
| Interpretar una tarea | Resume y detecta dudas | Confirma alcance y criterios |
| Diseñar una solución | Propone opciones y consecuencias | Elige y justifica |
| Modificar código y pruebas | Genera y ejecuta | Revisa, entiende y comprueba que representan los criterios |
| Documentar | Redacta una base | Corrige y asume la autoría |
| Commit | Sugiere el contenido | Decide qué se incorpora y responde por ello |

## Una tarea está terminada cuando

- cumple los criterios de validación y respeta la arquitectura;
- las pruebas relevantes y `npm test` pasan, y el resultado está en el commit;
- hay evidencia del fallo inicial de la prueba, o se explica por qué no se aplicó TDD;
- la persona puede explicar el cambio y las pruebas;
- la documentación de referencia y la historia en el libro están al día, y las decisiones escritas;
- no hay secretos ni archivos accidentales.

## Cambiar esta metodología

Se revisa cuando aparece un problema repetido o una herramienta nueva. El cambio se acuerda como cualquier otra decisión de equipo y queda en `documentacion/decisiones/`.
