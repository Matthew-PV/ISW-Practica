# Instrucciones para agentes — PlanB

Este archivo es el contexto de trabajo común para cualquier agente de inteligencia artificial que colabore en el repositorio. Se aplica a todo el proyecto. Si una tarea contiene instrucciones más concretas, se siguen esas instrucciones sin contradecir las reglas de seguridad y arquitectura de este documento.

## 1. Objetivo de la colaboración

PlanB está desarrollado por un equipo de estudiantes que utiliza agentes de IA como herramienta de apoyo. El objetivo no es solo terminar funcionalidades: el agente debe ayudar al equipo a entender el proyecto, conservar el control de las decisiones y poder explicar el trabajo realizado.

- No presupongas conocimientos técnicos avanzados.
- Explica en lenguaje claro los conceptos técnicos la primera vez que aparezcan.
- Antes de realizar un cambio, identifica la historia de usuario y sus criterios de validación cuando existan.
- Después de realizarlo, resume qué cambió, para qué sirve, cómo encaja en la arquitectura y cómo se comprobó.
- Distingue entre lo imprescindible para la práctica, las mejoras recomendables y las ampliaciones opcionales.
- Señala decisiones, alternativas y consecuencias relevantes, especialmente en seguridad, datos, autenticación, despliegue y cambios difíciles de revertir.
- No introduzcas tecnologías, dependencias ni abstracciones nuevas sin una necesidad clara.
- No modifiques ni elimines trabajo ajeno que no forme parte de la tarea.

La IA propone y ejecuta tareas técnicas, pero no sustituye la revisión del integrante responsable. No afirmes que algo funciona si no se ha comprobado; indica con precisión qué se verificó y qué quedó sin verificar.

## 2. Protocolo para poner en contexto a un integrante

Cuando una persona abra un chat nuevo y pida «ponme en contexto», «ayúdame a empezar a trabajar», «¿qué tengo que hacer para empezar?» o una petición equivalente, no comiences dando instrucciones genéricas ni modificando archivos.

1. Pregunta primero: **«¿Quién eres dentro del equipo?»** Acepta el nombre, el identificador de historias o el usuario de GitHub.
2. Localiza su ficha en `documentacion/metodologia.md` y su archivo en `documentacion/prompts/`.
3. Si su ficha está completa, resume brevemente:
   - el estado actual de PlanB relevante para trabajar;
   - las fuentes que debe consultar;
   - sus pasos concretos para actualizar el repositorio, dependencias, base de datos y pruebas según su sistema operativo y entorno;
   - las precauciones sobre cambios locales, `.env`, migraciones y archivos que no deben subirse;
   - el flujo TDD y la obligación de entender el bloque de pruebas.
4. Si su ficha está incompleta, indícalo y pregunta por sistema operativo, editor, terminal y agente antes de dar comandos específicos. No supongas que usa Windows, macOS, Linux, PowerShell, Bash o la terminal de Visual Studio.
5. Pregunta qué historia u objetivo va a trabajar solo después de haberle dado los pasos iniciales. Entonces consulta únicamente la documentación necesaria para esa tarea.

No vuelvas a preguntar la identidad si ya consta de forma inequívoca en el chat actual. No muestres a un integrante datos personales innecesarios ni el contenido completo de los registros de otros miembros.

## 3. Fuentes de verdad

Consulta únicamente la documentación necesaria para la tarea y usa este orden de prioridad:

1. Las instrucciones actuales del equipo y del usuario.
2. Los criterios de validación de la historia de usuario correspondiente, en `customer-stories/`.
3. El código y las pruebas actuales, que indican lo que realmente está implementado.
4. `documentacion/arquitectura.md`, para las reglas técnicas estables.
5. Las entradas más recientes de `documentacion/modificaciones.md`, para cambios y pasos operativos recientes.
6. `documentacion/propuesta-inicial.md`, como visión conceptual del producto, no como prueba de que una función exista.

`README.md` resume el estado actual y la puesta en marcha. Si la documentación, las historias y el código se contradicen, indícalo antes de decidir cuál actualizar. Distingue siempre entre funcionalidad implementada, trabajo pendiente y diseño futuro.

Desde el 05/10/2026, `Customer_Stories_PlanB.xlsx` se mantiene únicamente en el OneDrive compartido del equipo y su copia antigua se ha retirado del repositorio. Para cada trabajo, consulta la copia actualizada que facilite el integrante responsable y no la añadas a Git. Las filas de tareas registran descripción, estado, responsable voluntario, tiempo estimado por esa persona y tiempo total empleado. Si no se dispone de una copia actual, no reconstruyas los criterios desde documentos antiguos: solicita la versión vigente al integrante.

## 4. Arquitectura obligatoria

PlanB es un monolito web por capas. El flujo normal del backend es:

`rutas → servicios → repositorios → Prisma/MySQL o servicio externo`

- `backend/src/routes/*Routes.js`: reciben HTTP, extraen los datos de la petición y llaman a servicios. No contienen reglas de negocio ni acceden a repositorios directamente.
- `backend/src/middlewares/*Middleware.js`: resuelven tareas comunes de las rutas, como exigir sesión, limitar peticiones o recibir archivos.
- `backend/src/services/*Service.js`: contienen validaciones y reglas de negocio y coordinan repositorios.
- `backend/src/repositories/*Repository.js`: son la frontera con Prisma, MySQL, Cloudinary y otros mecanismos externos de persistencia. Solo esta capa debe acceder a ellos.
- Las reglas o conexiones compartidas van en la carpeta `shared/` de su capa.

Reutiliza antes de duplicar:

- `requiereSesion` en `backend/src/middlewares/sesionMiddleware.js`.
- `validarNombreUsuario` en `backend/src/services/shared/nombreUsuario.js`.
- El cliente Prisma y el almacén de sesiones de `backend/src/repositories/shared/`.
- `crearError` en `backend/src/errores.js` para errores con estado HTTP.

Cada archivo nuevo debe respetar los sufijos `Routes.js`, `Middleware.js`, `Service.js` o `Repository.js`. Mantén el código sencillo y comprensible para estudiantes; evita abstracciones prematuras.

## 5. Frontend

- Cada página `frontend/x.html` tiene su comportamiento en `frontend/js/x.js`.
- El código usado por varias páginas va en `frontend/js/shared/`.
- Las llamadas a la API deben reutilizar `frontend/js/shared/api.js`; cada página carga primero ese archivo y después su JavaScript propio.
- La política CSP de Helmet impide scripts en línea: no uses atributos como `onclick` ni bloques `<script>` dentro del HTML.
- Inserta texto aportado por usuarios con `textContent`, no como HTML.
- Cuando se envíe `FormData`, no fijes manualmente `Content-Type`: el navegador añade el límite correcto del formulario.
- Comprueba las pantallas en tamaños de escritorio y móvil cuando el cambio afecte a la interfaz.

## 6. Datos, configuración y seguridad

- Nunca incluyas secretos, contraseñas, cookies de sesión ni archivos `.env` en Git, documentación, pruebas o respuestas.
- `backend/.env.example` solo contiene nombres y valores de ejemplo seguros; actualízalo si se añade una variable necesaria.
- Todo cambio de `backend/prisma/schema.prisma` que altere la base de datos debe incluir su migración de Prisma.
- El catálogo inicial de ciudades se carga con `npm run db:seed` y debe seguir siendo repetible sin duplicados.
- `Usuario.ciudad` es texto libre del perfil; el modelo `Ciudad` es el catálogo estructurado usado por las experiencias. No los confundas.
- Conserva las sesiones, validaciones, permisos de autor y protecciones existentes. El frontend puede ocultar acciones, pero la autorización siempre se comprueba en el backend.

## 7. Desarrollo guiado por pruebas (TDD)

Para cada comportamiento nuevo o corrección se sigue, siempre que sea aplicable, el ciclo TDD (*Test-Driven Development*, desarrollo guiado por pruebas):

1. **Rojo:** escribir primero una prueba que represente el criterio de validación y comprobar que falla por el motivo esperado.
2. **Verde:** implementar el cambio mínimo necesario para que la prueba pase.
3. **Refactorización:** mejorar la claridad sin cambiar el comportamiento y volver a ejecutar las pruebas.

Antes de implementar, explica al integrante responsable el bloque de prueba: preparación de datos o simulaciones, acción que se ejecuta y resultado que se espera. El humano debe poder explicar al menos qué comportamiento protege la prueba. Si TDD no es viable para una parte concreta —por ejemplo, una comprobación visual puramente manual—, indícalo y define la verificación alternativa antes de cambiar el código.

No escribas una prueba que pase desde el principio sin demostrar que detecta la ausencia o el defecto del comportamiento, salvo que estés caracterizando una funcionalidad ya existente. No cambies la prueba para acomodar una implementación incorrecta.

### Tipos de pruebas y comprobación

- Relaciona las pruebas con los criterios de validación de la historia de usuario.
- Servicios: pruebas unitarias con repositorios simulados cuando corresponda.
- API: Jest y Supertest.
- Pantallas: Jest con jsdom, además de comprobación manual cuando sea relevante.
- Ejecuta primero las pruebas específicas del cambio y después toda la batería con `npm test` desde `backend/`.
- No cambies una prueba solo para ocultar un fallo. Si cambia un comportamiento acordado, explica por qué deben cambiar tanto el código como su expectativa.
- Informa del comando ejecutado, el resultado y cualquier parte que no haya podido comprobarse.

## 8. Forma de trabajar con Git

- Revisa el estado del repositorio antes de editar y preserva cambios locales ajenos.
- Realiza cambios pequeños y relacionados con una sola tarea.
- No reescribas el historial, borres ramas ni descartes cambios sin autorización expresa.
- No incluyas archivos temporales, `node_modules`, `.env`, cookies ni bloqueos creados fuera del paquete al que pertenecen.
- Los mensajes de commit deben explicar el resultado y, cuando sea útil, mencionar la historia u objetivo correspondiente.

## 9. Registro del uso de IA

La colaboración con IA forma parte de la metodología del equipo y se documenta en `documentacion/prompts/`, con un archivo separado por integrante.

- Al terminar una tarea asistida por IA, recuerda al integrante registrar el prompt inicial y las correcciones que hayan influido de forma importante en el resultado.
- No inventes, reconstruyas ni atribuyas prompts que el integrante no haya aportado.
- No registres secretos, datos personales innecesarios, contenido de `.env`, cookies ni credenciales.
- El registro debe enlazar la historia de usuario, commit o pull request cuando exista y resumir qué aceptó, modificó o rechazó la persona responsable.
- Un volcado completo de una conversación no sustituye un registro breve y comprensible.

La forma de trabajo y las responsabilidades se describen en `documentacion/metodologia.md`.

## 10. Entrega de una tarea

Al finalizar, comunica de forma breve:

1. Resultado conseguido.
2. Archivos y capas afectados.
3. Decisiones o riesgos importantes.
4. Pruebas ejecutadas y resultado.
5. Pasos manuales pendientes, si existen.
6. Entrada que debería añadirse al archivo de prompts del integrante, sin inventar su contenido.
7. Evidencia del ciclo rojo, verde y refactorización, o motivo por el que no se aplicó TDD.
