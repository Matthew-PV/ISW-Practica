# Guía de aprendizaje para trabajar en PlanB

Esta guía sirve a cualquier integrante del equipo, con o sin experiencia previa en desarrollo web. Su objetivo es que puedas **explicar cómo funciona PlanB, localizar las piezas de una tarea y comprobar un cambio con criterio**. No exige terminarla en un plazo determinado ni memorizar la estructura actual del repositorio.

PlanB cambiará. Por eso, cada módulo combina un concepto que seguirá siendo útil con dos prácticas: un laboratorio pequeño, independiente del proyecto, y una exploración de la versión vigente de PlanB. Las herramientas que se mencionan (JavaScript, Bootstrap, Express, Prisma, MySQL, Jest, entre otras) son las usadas en la arquitectura documentada al redactar esta guía; si alguna cambia, estudia primero el problema que resolvía y después identifica su sustituta.

## Cómo usar la guía

1. Avanza en el orden propuesto, pero repite o salta a un módulo cuando una tarea real lo requiera. Los módulos 1 a 8 forman la base para intervenir en funcionalidades; el 9 ayuda a entender su puesta en marcha y operación.
2. En cada módulo, lee la explicación, **predice** el resultado del laboratorio, haz la prueba y contrasta tu predicción. Después busca el mismo concepto en PlanB.
3. Anota en tus propias palabras: «qué hace», «dónde lo encontré», «cómo lo comprobé» y «qué duda me queda». Una explicación que puedes dar sin mirar la guía vale más que recordar un comando.
4. Haz los laboratorios que crean archivos en una carpeta de práctica **fuera del repositorio**. En PlanB, empieza por observar. Si decides cambiar código para una tarea real, sigue la historia vigente, la metodología y el ciclo de pruebas del equipo.
5. Si una referencia ha cambiado, consulta las fuentes actuales en este orden: instrucciones del equipo, libro vigente de Customer Stories en OneDrive, código y pruebas, [arquitectura](arquitectura.md), [modificaciones](modificaciones.md) y [README](../README.md). La propuesta inicial describe la idea del producto, pero no demuestra que una función esté implementada. Si no tienes la versión actual del libro, solicítala; no deduzcas criterios a partir de una copia antigua.

La [metodología](metodologia.md) contiene los pasos de actualización del repositorio para el entorno de cada integrante. No guardes en tus notas ni compartas contraseñas, cookies, contenido de `.env` o datos reales de usuarios.

### Cómo encontrar un ejemplo vigente en PlanB

Cuando una práctica diga «busca un ejemplo», evita depender de un nombre de archivo aprendido de memoria:

1. Elige una acción que hoy exista en la interfaz o un criterio del libro vigente.
2. Localiza sus palabras clave en el código y en las pruebas con la búsqueda del editor o `rg`.
3. Sigue la llamada desde el navegador hacia la API y, si guarda datos, hasta la base de datos o el servicio externo.
4. Comprueba en una prueba o mediante una observación manual qué parte del comportamiento está realmente implementada. Señala por separado lo que solo figura en el diseño.

## 1. Fundamentos de programación y JavaScript

**Qué es.** Programar consiste en representar datos y reglas mediante instrucciones. Una variable da nombre a un valor; una condición elige un camino; un bucle repite una operación; una función agrupa una tarea y puede devolver un resultado. En JavaScript, un objeto reúne propiedades (`{ ciudad: 'Madrid' }`) y un array contiene varios valores. `filter` selecciona elementos y `map` construye una nueva lista. Una operación asíncrona, como pedir datos al servidor, puede terminar más tarde; `async` y `await` permiten escribir claramente qué debe esperar su resultado.

**Para qué sirve en PlanB.** El navegador y el servidor procesan objetos como perfiles, experiencias y respuestas de la API. Las funciones convierten una acción de usuario en decisiones y resultados. Conocer estos fundamentos permite leer la lógica aunque en el futuro cambie una biblioteca.

**Ejercicio guiado, independiente.** En la consola del navegador, ejecuta este bloque. Antes de hacerlo, predice qué mostrará cada línea:

```js
(() => {
  const planes = [
    { nombre: 'Museo', coste: 12 },
    { nombre: 'Parque', coste: 0 },
    { nombre: 'Ruta', coste: 8 },
  ];
  const asequibles = planes.filter((plan) => plan.coste <= 8);
  const nombres = asequibles.map((plan) => plan.nombre);
  console.log(nombres);
  console.log(planes.length);
})();
```

Deberías obtener `['Parque', 'Ruta']` y `3`: `filter` y `map` crean otros arrays, sin eliminar elementos del original. Cambia el límite a `0` y comprueba tu nueva predicción. Para observar una espera asíncrona sin usar la red, ejecuta `async function cargarNombre() { const nombre = await Promise.resolve('Museo'); console.log(nombre); } cargarNombre();`. La función recibe un resultado que estará disponible más tarde y muestra `Museo` al llegar.

**Búsqueda en PlanB.** Encuentra un array que se transforme antes de mostrarse y una función que espere datos de la API o de un repositorio. Escribe qué recibe, qué devuelve y qué sucedería si la operación falla.

**Comprueba que lo entendiste.** Puedes explicar la diferencia entre objeto y array, qué selecciona `filter`, qué transforma `map` y por qué `await` se usa cuando un resultado todavía no está disponible.

## 2. Git y entorno de trabajo

**Qué es.** Git guarda versiones del proyecto. Tu carpeta de trabajo contiene archivos actuales; el área de preparación reúne los cambios del próximo commit; un commit conserva una versión identificable. Una rama permite trabajar con una línea de cambios y el remoto comparte el historial con el equipo. Por separado, el entorno de desarrollo incluye programas que ejecutan el proyecto, dependencias instaladas y configuración local. Un programa puede estar instalado y, aun así, no estar en marcha.

**Para qué sirve en PlanB.** Antes de tocar una historia, necesitas saber qué cambios tienes, qué llegó del equipo y cómo iniciar los componentes necesarios. Entender `status`, `diff`, `pull` y las dependencias reduce el riesgo de mezclar trabajo ajeno o probar código antiguo.

**Ejercicio guiado, independiente.** Crea una carpeta de práctica fuera de PlanB. Dentro, inicia un repositorio con `git init`, crea un archivo de texto desde tu editor y ejecuta `git status`. Añádelo con `git add` y compara `git diff` con `git diff --cached`: el segundo enseña lo preparado. Modifica otra vez el archivo y observa que Git distingue la versión preparada de la modificación más reciente. No hace falta publicar ni borrar nada para entender esas tres situaciones.

**Búsqueda en PlanB.** Consulta `git status` y el historial reciente sin modificar archivos. Busca en el README y en el manifiesto de dependencias qué ejecuta la aplicación y qué ejecuta sus pruebas. Usa los pasos de tu ficha en la metodología para actualizar tu copia; no apliques comandos de otro sistema operativo por suposición.

**Comprueba que lo entendiste.** Puedes distinguir cambio local, cambio preparado, commit y remoto; explicar por qué revisas el estado antes de un `pull`; e identificar qué programas deben estar instalados y cuáles además deben estar iniciados.

## 3. Interfaz web: HTML, CSS, Bootstrap y navegador

**Qué es.** HTML da estructura y significado al contenido; CSS define cómo se presenta; JavaScript responde a acciones y modifica la página. El DOM es la representación de los elementos HTML que JavaScript puede consultar y cambiar. Bootstrap ofrece clases de estilo y distribución ya preparadas. Una interfaz adaptable reorganiza el contenido cuando cambia el ancho de pantalla. Ninguna de estas decisiones visuales sustituye la validación de datos en el servidor.

**Para qué sirve en PlanB.** Formularios, tarjetas, botones y mensajes permiten usar las funcionalidades del backend. Actualmente el frontend usa HTML, CSS, JavaScript y Bootstrap. Comprender sus responsabilidades te ayuda a proponer una pantalla sin confundir apariencia, comportamiento y reglas del producto.

**Ejercicio guiado, independiente.** Crea `practica.html` y `practica.js` en tu carpeta de práctica. Añade al `<head>` de `practica.html` el enlace CSS de la versión de Bootstrap que indique su documentación oficial vigente. Usa esta estructura:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ideas de planes</title>
  <!-- Inserta aquí el enlace CSS de Bootstrap. -->
  <script src="practica.js" defer></script>
</head>
<body>
  <main class="container py-4">
    <h1 class="h3">Ideas de planes</h1>
    <div class="row row-cols-1 row-cols-md-2 g-3">
      <div class="col"><article class="card card-body">Museo</article></div>
      <div class="col"><article class="card card-body">Parque</article></div>
    </div>
    <button id="mostrar" type="button" class="btn btn-primary mt-3">Mostrar idea</button>
    <p id="resultado" aria-live="polite"></p>
  </main>
</body>
</html>
```

En `practica.js`, añade:

```js
document.getElementById('mostrar').addEventListener('click', () => {
  document.getElementById('resultado').textContent = 'Prueba un plan cerca de ti';
});
```

Abre la página, pulsa el botón y usa la vista móvil del navegador. Comprueba que las tarjetas pasan de una columna a dos al ensanchar la ventana. Cambia `row-cols-md-2` por `row-cols-md-3` y añade una tercera tarjeta. Si no se aplican los estilos, comprueba primero que el enlace CSS cargó correctamente.

**Búsqueda en PlanB.** Escoge una pantalla actual y localiza el HTML que define una acción, el JavaScript que atiende su evento y el estilo que cambia su aspecto. Comprueba la misma pantalla a un ancho pequeño y a uno grande. Para texto procedente de usuarios, observa si se inserta como texto mediante `textContent`.

**Comprueba que lo entendiste.** Puedes explicar qué hizo cada uno de HTML, CSS/Bootstrap y JavaScript en el laboratorio, y por qué esconder un botón no impide que alguien invoque una acción del servidor.

## 4. HTTP y comunicación con una API

**Qué es.** HTTP es el intercambio de peticiones y respuestas entre cliente y servidor. Una petición tiene método, dirección, cabeceras y, a veces, cuerpo. La respuesta tiene un estado y puede incluir datos, normalmente JSON en una API. `GET` consulta; `POST` suele crear; `PUT` y `PATCH` actualizan según el contrato de cada API; `DELETE` elimina. Un `2xx` indica éxito, un `4xx` señala un problema de la petición y un `5xx` un fallo del servidor. El número exacto y el formato de respuesta deben comprobarse en la API vigente.

**Para qué sirve en PlanB.** La interfaz solicita información y envía cambios al backend por HTTP. Saber leer una petición permite seguir una acción desde la pantalla hasta el código y distinguir un fallo de red de una validación rechazada.

**Ejercicio guiado, independiente.** Abre cualquier página pública en el navegador y la pestaña **Red** de sus herramientas de desarrollo. Recarga y localiza la petición del documento HTML. Anota solo método, estado y tipo de contenido; no copies cookies ni cabeceras con credenciales. Después redacta en papel una petición hipotética para crear un plan con título y ciudad, y dos respuestas posibles: éxito y dato inválido. Indica qué cambiaría en método, cuerpo y estado entre ambas.

**Búsqueda en PlanB.** Con una cuenta de prueba, realiza una acción sencilla y localiza su petición en **Red**. Identifica el código que la envía, la ruta que la recibe y la forma en que se muestra un error. No copies datos personales del cuerpo de la petición.

**Comprueba que lo entendiste.** Puedes señalar qué información viaja del navegador al servidor, qué devuelve este y por qué un error visible en pantalla puede originarse en capas diferentes.

## 5. Arquitectura por capas y reglas del producto

**Qué es.** La arquitectura separa responsabilidades. En PlanB, la ruta recibe HTTP, un middleware resuelve tareas comunes, el servicio aplica las reglas del producto y el repositorio se comunica con la base de datos o un servicio externo. La interfaz inicia las peticiones y muestra resultados. Una *historia de usuario* describe una necesidad; sus criterios de validación concretan el comportamiento que debe comprobarse. Una regla del producto debe estar donde se pueda reutilizar y probar, aunque cambie la pantalla que la utiliza.

**Para qué sirve en PlanB.** La separación `rutas → servicios → repositorios → persistencia` permite saber dónde buscar un problema y evita que una pantalla o una ruta decidan por sí solas permisos y validaciones. La implementación actual está documentada en [arquitectura](arquitectura.md); contrástala siempre con el código y las pruebas vigentes.

**Ejercicio guiado, independiente.** Imagina una aplicación que permite guardar libros. Clasifica estas cuatro acciones: «leer el JSON de una petición», «impedir que alguien modifique el libro de otra persona», «guardar el libro», «mostrar un aviso de éxito». Asígnalas a ruta, servicio, repositorio e interfaz, respectivamente. Añade un caso de error: ¿en qué capa se decide que la persona no tiene permiso y en cuál se traduce a una respuesta HTTP?

**Búsqueda en PlanB.** Elige una funcionalidad implementada y dibuja la secuencia real desde el evento de la interfaz hasta la lectura o escritura de datos. Anota una responsabilidad por capa y una prueba que confirme alguna regla. Si el código y la arquitectura documentada difieren, registra la diferencia antes de concluir que una de ellas es correcta.

**Comprueba que lo entendiste.** Puedes explicar dónde van una validación, una comprobación de permisos y una operación de base de datos, y distinguir una regla implementada de otra solo prevista en una historia.

## 6. Datos, SQL y persistencia

**Qué es.** Una base relacional organiza datos en tablas. Una clave primaria identifica una fila y una clave foránea relaciona filas de tablas distintas. SQL expresa consultas y cambios sobre esas tablas. Un ORM, como el Prisma utilizado actualmente, permite formular operaciones desde el lenguaje del backend. Una migración versiona cambios en la estructura de datos; una semilla incorpora datos iniciales de forma repetible. Ni el ORM ni la interfaz sustituyen las restricciones de integridad de la base de datos.

**Para qué sirve en PlanB.** Usuarios, experiencias y relaciones deben conservarse entre peticiones y mantener asociaciones válidas. Comprender el modelo evita confundir un texto visible con una entidad relacionada o modificar el esquema sin considerar sus datos existentes.

**Ejercicio guiado, independiente.** Dibuja dos tablas pequeñas: `Usuario(id, nombre)` con `(1, Ana)` y `(2, Luis)`, y `Plan(id, titulo, autorId)` con `(10, Museo, 1)` y `(11, Parque, 2)`. Predice qué filas devolvería `SELECT titulo FROM Plan WHERE autorId = 1;`: solo debe aparecer `Museo`. Luego dibuja una tercera tabla `Favorito(usuarioId, planId)` con `(2, 10)` y explica por qué necesita dos referencias. Borra mentalmente el usuario 1: ¿qué decisiones de integridad habría que tomar antes de eliminarlo de verdad?

**Búsqueda en PlanB.** Encuentra en el esquema vigente dos entidades relacionadas y una consulta del repositorio que use esa relación. Traduce la consulta a lenguaje natural y a un `SELECT`, `INSERT`, `UPDATE` o `DELETE` conceptual. Localiza una migración y explica qué estructura cambia; no ejecutes una migración de prueba sobre datos compartidos.

**Comprueba que lo entendiste.** Puedes diferenciar datos, esquema, migración y semilla; explicar qué representa una clave foránea y por qué una operación sobre la base de datos pertenece a la capa de persistencia.

## 7. Sesiones, permisos y seguridad

**Qué es.** La autenticación responde «¿quién eres?»; la autorización responde «¿puedes hacer esto?». Una sesión permite recordar que una persona inició sesión entre peticiones, normalmente mediante una cookie con un identificador. Las contraseñas se guardan como hashes, no como texto recuperable. El backend debe validar datos y permisos aunque el navegador ya haya ocultado un botón o revisado un formulario. Las cabeceras de seguridad, los límites de peticiones y los controles contra bots reducen riesgos distintos; ninguno sustituye a los permisos.

**Para qué sirve en PlanB.** Hay acciones reservadas a la persona dueña de un contenido o a relaciones concretas. La identidad procede de la sesión y las reglas de acceso se comprueban en el servidor. La forma exacta de mantener sesiones y las protecciones adicionales pueden cambiar sin alterar estos principios.

**Ejercicio guiado, independiente.** Dibuja una tabla con tres personas que ya han iniciado sesión: autora, amiga y desconocida; y tres contenidos: público, solo amigos y privado. Decide quién puede ver cada uno. Comprueba tu respuesta: la autora ve los tres, la amiga ve el público y el de amigos, y la desconocida solo el público. Después considera una solicitud de amistad pendiente y una amistad eliminada: en ambos casos deja de haber acceso al contenido para amigos. Anota qué relación debe consultar el servidor en cada petición y por qué el estado de un botón no basta como prueba de permiso.

**Búsqueda en PlanB.** Localiza una acción protegida y sigue la identidad desde la sesión hasta la regla que autoriza o deniega el acceso. Busca una prueba que cubra un usuario sin sesión o sin permiso. Si la regla existe solo en una pantalla, señálalo como posible problema, sin modificarla durante el ejercicio.

**Comprueba que lo entendiste.** Puedes diferenciar inicio de sesión y permiso, explicar por qué se usa un hash para la contraseña y describir qué debe ocurrir cuando alguien intenta acceder a datos ajenos.

## 8. Pruebas y desarrollo guiado por pruebas (TDD)

**Qué es.** Una prueba prepara datos, ejecuta una acción y compara el resultado con una expectativa. Las pruebas unitarias aíslan reglas pequeñas; las de API comprueban peticiones y respuestas; las de pantalla comprueban lo que se muestra; las pruebas con una base real verifican aspectos que una simulación no demuestra. TDD (*Test-Driven Development*, desarrollo guiado por pruebas) sigue el ciclo **rojo** (fallo esperado), **verde** (cambio mínimo que pasa) y **refactorización** (mejorar claridad conservando el comportamiento). Una prueba verde no demuestra por sí sola que toda una historia esté terminada.

**Para qué sirve en PlanB.** Los criterios de validación se convierten en comportamientos observables. Las pruebas ayudan a detectar regresiones cuando varias personas cambian el proyecto y permiten entender qué promete realmente una función.

**Ejercicio guiado, independiente.** Crea `practica-tdd.js` fuera del repositorio. Escribe primero estas pruebas y ejecútalas con `node practica-tdd.js`:

```js
const assert = require('node:assert/strict');

assert.equal(contarAceptadas([]), 0);
assert.equal(contarAceptadas([
  { estado: 'pendiente' },
  { estado: 'aceptada' },
  { estado: 'rechazada' },
]), 1);
```

El primer resultado debe ser **rojo** porque aún no existe `contarAceptadas`; comprueba que el mensaje se refiere a esa ausencia. Intenta implementarla antes de mirar esta solución; puedes añadirla al final del archivo:

```js
function contarAceptadas(relaciones) {
  let total = 0;
  for (const relacion of relaciones) {
    if (relacion.estado === 'aceptada') total += 1;
  }
  return total;
}
```

Ejecuta de nuevo y comprueba el **verde**. Como refactorización, sustituye el cuerpo por `return relaciones.filter((relacion) => relacion.estado === 'aceptada').length;` y repite las pruebas: el resultado debe permanecer igual. No cambies las expectativas para esconder un resultado incorrecto. Finalmente explica cada prueba con tres frases: qué prepara, qué acción ejecuta y qué espera.

**Búsqueda en PlanB.** Obtén un criterio del libro vigente y encuentra una prueba que lo proteja. Ejecuta esa prueba con el comando que figure en la configuración actual del proyecto. Identifica qué simula, qué ejecuta de verdad y qué escenario importante requiere además una comprobación manual o una prueba con base real. Para una tarea nueva, acuerda primero la prueba y observa el fallo por el motivo previsto antes de implementar.

**Comprueba que lo entendiste.** Puedes relacionar una expectativa con un criterio, contar el ciclo rojo-verde-refactorización y decir con precisión qué demostró la prueba y qué quedó sin comprobar.

## 9. Configuración, servicios externos y despliegue

**Qué es.** El código necesita configuración para distintos entornos, como desarrollo, pruebas y producción. Las variables de entorno aportan valores que no deben quedar escritos en el código; un archivo `.env` local puede contener secretos y no se sube a Git. Un servicio externo presta una función fuera de la aplicación, por ejemplo almacenar imágenes. Desplegar significa preparar una versión para que otras personas la utilicen: configurar sus dependencias, aplicar cambios de base de datos, iniciar procesos y comprobar que funciona. Arrancar algo en tu ordenador no demuestra que esté desplegado.

**Para qué sirve en PlanB.** El backend, la base de datos y las integraciones necesitan configuración y disponibilidad. Actualmente la documentación describe ejecución local con Node.js, npm, Docker, MySQL y servicios externos; los pasos reales de despliegue deben verificarse en la infraestructura vigente cuando el equipo la defina.

**Ejercicio guiado, independiente.** Dibuja tres columnas: «código compartido», «configuración pública de ejemplo» y «secretos del entorno». Coloca en ellas estos elementos: función de validación, nombre de una variable requerida, contraseña real de base de datos, dirección pública de la aplicación y clave privada de un servicio. Después escribe una lista de comprobación conceptual para poner en marcha una versión: obtener código y dependencias, proporcionar configuración, preparar base de datos, iniciar aplicación y comprobar una acción. Señala qué fallaría si el servidor arrancase pero la base de datos no estuviese disponible.

**Búsqueda en PlanB.** Localiza el manifiesto de dependencias, el ejemplo de configuración sin secretos, la definición de los servicios locales y las instrucciones actuales de arranque. Elige una integración externa y sigue el camino desde la operación del producto hasta la capa que se comunica con ella. No abras ni copies los valores de un `.env` real para esta práctica.

**Comprueba que lo entendiste.** Puedes distinguir dependencia instalada, proceso en marcha, configuración y secreto; explicar qué hace una migración durante la puesta en marcha; y separar lo que funciona localmente de lo que se ha verificado en un despliegue real.

## Práctica final: explicar una funcionalidad de extremo a extremo

Elige una historia del **libro vigente de OneDrive** y un criterio que ya tenga implementación. Si todavía no está implementado, marca explícitamente cada pieza como pendiente y elige otro comportamiento para la demostración. Utiliza una cuenta de prueba y evita datos reales de otras personas.

1. Reescribe el criterio con la forma «dado este contexto, cuando ocurre esta acción, espero este resultado».
2. Dibuja el recorrido real: acción en la interfaz → petición HTTP → ruta y middleware → servicio → repositorio → base de datos o servicio externo → respuesta visible.
3. Señala dónde se comprueban identidad, permisos y validez de los datos. Distingue qué decisión corresponde al navegador y cuál al backend.
4. Encuentra una prueba relacionada. Explica preparación, acción y expectativa; ejecútala con el procedimiento vigente y anota el resultado exacto. Complementa con una comprobación manual si el criterio afecta a la interfaz.
5. Explica el recorrido en cinco minutos sin leer el código. Si una pieza no se puede localizar, anota la duda concreta y vuelve a la fuente actual; no inventes una implementación.

Has alcanzado el objetivo de esta guía cuando puedes repetir ese proceso con una segunda funcionalidad sin depender de nombres de archivos memorizados, y cuando sabes decir **qué se comprobó y qué falta**. Para ganar autonomía, empieza después con cambios pequeños: criterio vigente, prueba comprendida, fallo esperado, implementación, comprobación y revisión humana según la [metodología](metodologia.md).
