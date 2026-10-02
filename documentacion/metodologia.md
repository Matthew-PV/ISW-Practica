# Metodología de trabajo con apoyo de inteligencia artificial

## 1. Propósito

El equipo de PlanB utiliza agentes de inteligencia artificial como herramienta de apoyo para analizar historias de usuario, comprender tecnologías, proponer soluciones, generar o revisar código, preparar pruebas y mejorar documentación.

Su uso no elimina la responsabilidad del equipo. Cada integrante sigue siendo responsable de entender, revisar y validar el trabajo que incorpora al repositorio. La finalidad de esta metodología es hacer el proceso transparente y repetible, no acumular conversaciones sin contexto.

## 2. Principios comunes

1. **La historia de usuario guía el trabajo.** Antes de programar se identifican la historia, el objetivo y sus criterios de validación.
2. **La persona conserva la decisión final.** El agente puede recomendar alternativas, pero el integrante acepta, modifica o rechaza la propuesta.
3. **No se acepta código sin revisión.** Como mínimo se comprueba que el cambio se entiende, respeta la arquitectura y no modifica trabajo ajeno.
4. **Toda afirmación debe poder comprobarse.** Las pruebas automáticas, la revisión manual o ambas deben demostrar los criterios de validación afectados.
5. **Los cambios deben ser pequeños.** Una conversación y un commit deberían perseguir un objetivo concreto siempre que sea posible.
6. **La documentación acompaña al código.** Se actualiza cuando cambia la arquitectura, la puesta en marcha, el comportamiento visible o una decisión relevante.
7. **La seguridad tiene prioridad.** No se comparten secretos, credenciales, cookies, datos personales innecesarios ni archivos `.env` con el agente o en Git.
8. **El uso de IA se registra con criterio.** Se conservan los prompts que influyen en el resultado, la verificación realizada y las decisiones humanas; no es necesario copiar cada mensaje incidental.

## 3. Flujo de una tarea

### 3.1. Preparación humana

El integrante responsable:

1. Actualiza su copia del repositorio y comprueba que no tiene cambios ajenos sin guardar.
2. Selecciona una tarea concreta de `customer-stories/Customer_Stories_PlanB.xlsx`.
3. Lee sus criterios de validación y localiza las capas que probablemente se verán afectadas.
4. Explica al agente el objetivo, las restricciones y el estado conocido. Si la tarea parte de trabajo de otra persona, lo indica expresamente.

### 3.2. Trabajo con el agente

El agente debe leer primero `AGENTS.md` y solo la documentación necesaria. Durante el trabajo:

- explica el enfoque antes de introducir decisiones relevantes;
- respeta el flujo rutas → servicios → repositorios;
- señala contradicciones o información que falte;
- evita cambios no relacionados;
- escribe o adapta pruebas vinculadas a los criterios de validación;
- diferencia hechos comprobados de suposiciones.

El integrante formula correcciones cuando la propuesta no coincide con la historia, la arquitectura o el resultado esperado. Las correcciones que cambien de forma importante la solución también se anotan en el registro de prompts.

### 3.3. Revisión y validación humana

Antes de considerar terminada la tarea, el integrante:

1. Revisa el resumen o la comparación de archivos modificados.
2. Pide explicación de cualquier fragmento que no entienda.
3. Ejecuta las pruebas específicas y la batería completa desde `backend/` con `npm test`.
4. Comprueba manualmente la interfaz cuando el comportamiento visible haya cambiado.
5. Verifica que no se hayan añadido secretos, archivos temporales o cambios ajenos.
6. Actualiza la historia de usuario y la documentación que corresponda.
7. Registra la interacción relevante en `documentacion/registro-prompts.md`.
8. Crea un commit cuyo mensaje describa el resultado.

Si una comprobación no puede realizarse, se deja escrita como pendiente; no se da por superada.

## 4. Qué se registra y qué no

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

## 5. Forma de trabajo de cada integrante

Esta sección debe completarla cada persona en primera persona. No debe describir una forma de trabajo ideal, sino la que realmente utiliza. Las cinco fichas se dejan inicialmente pendientes para no atribuir prácticas que el integrante no haya confirmado.

| Integrante | Identificador habitual | Forma de trabajo documentada |
|---|---|---|
| Matthew Puente Villegas Michavil | MAT / Matthew-PV | Pendiente de completar por el integrante |
| Flavia Méndez Tsutsumi | FLA / flaviamendez | Pendiente de completar por la integrante |
| Jorge Delgado Castellanos | JOR / jorjonudo | Pendiente de completar por el integrante |
| Lucía Alexandra Guzmán Álvarez | LUC | Pendiente de completar por la integrante |
| Joaquín de Vicente Abad | JOA | Pendiente de completar por el integrante |

Cada ficha debe responder de forma breve a estas preguntas:

```text
Nombre:
Agente o herramientas que utilizo:
Para qué tareas suelo utilizarlos:
Cómo preparo el contexto o el prompt:
Cómo reviso y corrijo la respuesta:
Qué pruebas realizo antes de aceptar cambios:
Cómo traslado el resultado a la historia de usuario y a Git:
Limitaciones o precauciones personales:
```

## 6. Reparto de responsabilidades

| Actividad | Agente de IA | Integrante responsable |
|---|---|---|
| Interpretar una tarea | Puede resumir y detectar dudas | Confirma el alcance y los criterios |
| Diseñar una solución | Propone opciones y consecuencias | Elige y justifica la opción |
| Modificar código | Puede generar o editar | Revisa y comprende el cambio |
| Crear pruebas | Propone casos y automatiza | Comprueba que representan los criterios |
| Ejecutar comprobaciones | Puede ejecutar y resumir resultados | Valora la evidencia y prueba manualmente cuando proceda |
| Documentar | Puede redactar una base | Corrige el contenido y asume su autoría final |
| Commit o entrega | Puede sugerir el contenido | Decide qué se incorpora y responde por ello |

## 7. Criterio de finalización

Una tarea asistida por IA está terminada cuando:

- satisface los criterios de validación acordados;
- respeta la arquitectura y las convenciones del repositorio;
- las pruebas relevantes pasan y su resultado está anotado;
- el integrante puede explicar el cambio y sus consecuencias;
- la documentación y la historia de usuario están actualizadas cuando corresponde;
- la interacción relevante está incluida en el registro de prompts;
- el repositorio no contiene secretos ni archivos accidentales.

## 8. Mejora de la metodología

El equipo revisará este documento cuando detecte un problema repetido, cambie su forma de coordinación o incorpore una herramienta nueva. La modificación debe explicar el motivo y acordarse como cualquier otra decisión de equipo.
