# Hoja de ruta para comprender las herramientas de PlanB

Esta guía está pensada para Matthew, que conoce Java, tiene nociones básicas de HTML y Git, y conoce MySQL sobre todo de forma teórica. El objetivo de las próximas dos semanas es comprender y explicar el funcionamiento de PlanB, demostrarlo en la revisión del equipo y adquirir una base de programación transferible a otros proyectos. Desarrollar funcionalidades completas con autonomía será una etapa posterior.

La ruta principal ocupa **4 horas por semana**. Hay ejercicios de ampliación para llegar, si se dispone de tiempo, a **12 horas semanales como máximo**. La primera semana da prioridad a la revisión prevista dentro de siete días. La segunda profundiza en frontend con Bootstrap, seguridad, datos y pruebas. Se puede repartir cada sesión en bloques de 20 a 30 minutos.

## Cómo usar esta guía

1. Sigue las sesiones en orden. Lee la explicación breve y realiza el ejercicio antes de pasar al siguiente.
2. Escribe las respuestas en tus propias notas. No necesitas modificar el repositorio para los ejercicios principales, salvo que la sesión lo indique.
3. Al final de cada sesión, intenta explicar el tema en voz alta durante dos minutos sin mirar los archivos.
4. Si una explicación no sale, vuelve al archivo señalado y pide al agente que aclare **ese punto concreto** con un ejemplo de PlanB.
5. Antes de comenzar cada día, consulta [la metodología](metodologia.md) para actualizar tu copia y conservar los cambios locales. Si el repositorio ha cambiado, usa el código actual como referencia y anota cualquier diferencia con esta guía.

Usa una hoja personal con cuatro columnas: `fecha | sesión | qué pude explicar | dudas`. No guardes contraseñas, cookies, contenido de `.env` ni datos reales de usuarios en las notas o capturas.

### Material de referencia dentro del proyecto

- [README](../README.md): qué hace PlanB y cómo arrancarlo.
- [Arquitectura](arquitectura.md): capas, tecnologías y comunicación entre ellas.
- [Metodología](metodologia.md): actualización local, revisión humana y TDD.
- [AGENTS.md](../AGENTS.md): reglas para agentes que trabajen en el repositorio.
- [Cambios recientes](modificaciones.md): consulta las últimas entradas cuando alguna pantalla o ruta haya cambiado.

### Meta observable

Al acabar deberías ser capaz de iniciar PlanB, demostrar el registro o inicio de sesión, editar el perfil y crear o editar una experiencia. También deberías poder seguir una petición desde un botón hasta MySQL, explicar por qué existe cada capa y describir qué comprueba una prueba automática.

### Mapa breve de herramientas

| Herramienta | Papel en PlanB | Dónde verla |
|---|---|---|
| HTML, CSS y JavaScript | Estructura, aspecto y comportamiento de las páginas | `frontend/` |
| Bootstrap | Clases CSS preparadas para rejillas, formularios y botones | `frontend/bienvenida.html` |
| Node.js y npm | Ejecutan JavaScript en el servidor e instalan sus dependencias | `backend/package.json` |
| Express | Recibe peticiones HTTP, aplica middlewares y sirve la web | `backend/src/app.js` y `routes/` |
| MySQL, Docker y Prisma | Guardan datos, ejecutan MySQL localmente y permiten acceder a sus tablas desde JavaScript | `docker-compose.yml`, `backend/prisma/` y `repositories/` |
| bcrypt, sesiones y almacenamiento de sesiones | Protegen contraseñas e identifican al usuario entre peticiones | `backend/src/services/authService.js` y `backend/src/app.js` |
| Helmet, límite de intentos y Turnstile | Añaden protecciones del navegador y dificultan abusos en login y registro | `backend/src/app.js`, `middlewares/` y `services/captchaService.js` |
| multer y Cloudinary | Reciben una imagen enviada desde el navegador y la almacenan fuera de MySQL | `backend/src/middlewares/fotoMiddleware.js` y `repositories/fotoRepository.js` |
| Jest, Supertest y jsdom | Ejecutan pruebas de lógica, peticiones a la API y pantallas simuladas | `backend/tests/` |
| Git | Comparte y conserva versiones del proyecto | Historial y estado del repositorio |

El mapa sirve para orientarte; cada sesión profundiza solo en las herramientas que necesitas para su ejercicio.

## Semana 1: comprender y demostrar el sistema

Tiempo principal: **240 minutos**. Completa estas sesiones antes de la revisión. Las duraciones incluyen el ejercicio y la explicación final.

| Sesión | Tiempo | Resultado que debes conseguir |
|---|---:|---|
| 1. Mapa de PlanB | 35 min | Dibujar el recorrido de una petición y nombrar las herramientas |
| 2. Fundamentos de JavaScript desde Java | 45 min | Leer objetos, funciones, condiciones y operaciones asíncronas |
| 3. Seguir la edición del perfil | 60 min | Encontrar una acción en frontend, rutas, servicio y repositorio |
| 4. Arranque, datos y pruebas | 40 min | Explicar qué ejecutan Docker, Node, Prisma y Jest |
| 5. Ensayo de la revisión | 60 min | Mostrar una funcionalidad y explicar su arquitectura |

### Sesión 1: mapa de PlanB — 35 minutos

**Conceptos, 10 min.** El navegador muestra la interfaz y envía peticiones HTTP. Node.js ejecuta el servidor; Express decide qué ruta atiende cada petición. El servicio aplica las reglas del producto. El repositorio lee o guarda datos mediante Prisma, que traduce operaciones de JavaScript a consultas de MySQL. Cloudinary almacena fotos; MySQL conserva la URL de cada foto. Docker ejecuta MySQL en tu equipo.

**Ejercicio, 20 min.** Abre [la visión general de la arquitectura](arquitectura.md#2-visión-general) y dibuja en papel estas dos cadenas:

```text
Editar perfil: navegador → JavaScript → HTTP → ruta → servicio → repositorio → Prisma → MySQL
Subir foto: navegador → JavaScript → HTTP → ruta → servicio → repositorio de foto → Cloudinary
                                                           └→ repositorio de usuario → MySQL (URL)
```

Debajo de cada elemento escribe una responsabilidad en una frase. Después tapa el dibujo e intenta reconstruirlo.

**Comprueba que lo entendiste, 5 min.** Responde: ¿qué parte ve el usuario?, ¿dónde se comprueba si el nombre es válido?, ¿qué componente guarda la foto?, ¿por qué hay un único backend aunque existan varias carpetas?

### Sesión 2: fundamentos de JavaScript desde Java — 45 minutos

**Conceptos, 15 min.** JavaScript comparte con Java las variables, condiciones, bucles y funciones, pero sus objetos no necesitan una clase previa. `const` declara una referencia que no se reasigna y `let` permite reasignarla. Un array contiene una secuencia de valores. `map` transforma cada elemento; `filter` selecciona algunos. Una función `async` puede esperar con `await` el resultado de una operación, como una petición de red. Eso no significa que el navegador se bloquee mientras llega la respuesta.

**Ejercicio, 20 min.** Abre las herramientas del navegador en la pestaña **Consola** y ejecuta este código. No toca el repositorio ni la base de datos:

```js
const experiencias = [
  { titulo: 'Museos', ciudad: 'Madrid', presupuesto: 12 },
  { titulo: 'Parques', ciudad: 'Madrid', presupuesto: 0 },
  { titulo: 'Puerto', ciudad: 'Valencia', presupuesto: 8 },
];

const gratuitas = experiencias.filter((experiencia) => experiencia.presupuesto === 0);
const titulos = experiencias.map((experiencia) => experiencia.titulo);
console.log(gratuitas, titulos);
```

Predice la salida antes de pulsar Intro. Cambia `=== 0` por `<= 8` y explica qué elemento se añade; si vuelves a ejecutar todo el bloque en la misma consola, recarga la página antes para evitar declarar dos veces las mismas constantes. Localiza un uso real de `map`, `filter` y `async` en [bienvenida.js](../frontend/js/bienvenida.js). Compara el objeto literal `{ titulo: ... }` con un objeto de Java y anota una semejanza y una diferencia.

**Comprueba que lo entendiste, 10 min.** Explica qué recibe la función de `filter`, qué devuelve `map` y qué efecto tiene `await api('/ciudades')` en el código que lo rodea. Si aún no puedes explicar `Promise`, basta por ahora con entender que representa un resultado que llegará más tarde.

### Sesión 3: seguir la edición del perfil — 60 minutos

**Conceptos, 10 min.** Un evento del navegador, como enviar un formulario, inicia una cadena de llamadas. Cada capa recibe datos de la anterior y tiene una responsabilidad concreta. La ruta interpreta HTTP; el servicio valida; el repositorio habla con la persistencia. La cookie permite al servidor saber quién inició sesión, pero la autorización se comprueba en el backend.

**Ejercicio, 40 min.** Abre estos archivos en este orden y busca la pieza indicada:

1. [perfil.html](../frontend/perfil.html): formulario `form-perfil`, campos y botón.
2. [perfil.js](../frontend/js/perfil.js): evento `submit`, datos enviados y mensaje visible tras guardar.
3. [api.js](../frontend/js/shared/api.js): cómo se forma `/api...`, cómo se trata una respuesta errónea y dónde se envía la cookie automáticamente.
4. [perfilRoutes.js](../backend/src/routes/perfilRoutes.js): método `PUT /api/perfil`, middleware de sesión y llamada al servicio.
5. [perfilService.js](../backend/src/services/perfilService.js): validación del nombre y de la ciudad; tratamiento del nombre duplicado.
6. [usuarioRepository.js](../backend/src/repositories/usuarioRepository.js): actualización mediante Prisma.
7. [schema.prisma](../backend/prisma/schema.prisma): campos del modelo `Usuario`.

En tus notas escribe una línea por archivo: «recibe…, hace…, entrega…». Luego cambia la ciudad de **tu cuenta de prueba** desde la interfaz y vuelve a cargar la página. Evita usar datos de otra persona.

**Comprueba que lo entendiste, 10 min.** Señala dónde se decide que el email no se puede editar desde esa pantalla, qué capa detecta un nombre repetido y por qué el identificador del usuario se toma de la sesión en lugar de un campo del formulario. Si no aparece alguna respuesta claramente en esos archivos, anótala como duda.

### Sesión 4: arranque, datos y pruebas — 40 minutos

**Conceptos, 10 min.** Docker inicia MySQL. Node.js ejecuta Express. Prisma usa el esquema y las migraciones para mantener la estructura de datos; `db:seed` carga el catálogo inicial. npm instala las bibliotecas declaradas en `backend/package.json`. Jest ejecuta las pruebas. Son procesos y tareas diferentes: que MySQL esté encendido no significa que la web ya esté sirviéndose.

**Ejercicio, 25 min.** En PowerShell, desde la raíz del repositorio, ejecuta en orden:

```powershell
git status
docker compose up -d
cd backend
npm test -- --runInBand
npm run dev
```

`npm run dev` mantiene la terminal ocupada; abre `http://localhost:3000` en el navegador. Si el servidor ya está funcionando, utiliza el que está abierto. Para detenerlo, vuelve a la terminal y pulsa `Ctrl+C`. Si la aplicación no inicia por falta de dependencias o migraciones, sigue el procedimiento de [la metodología](metodologia.md#41-preparación-humana) y documenta el error exacto antes de cambiar nada.

**Comprueba que lo entendiste, 5 min.** Explica qué pasaría si detuvieses solo MySQL y qué pasaría si detuvieses solo Node. Identifica en `backend/package.json` los scripts que ejecutaste.

### Sesión 5: ensayo de la revisión — 60 minutos

**Preparación, 10 min.** Comprueba que Docker y el servidor están iniciados. Ten preparada una cuenta de prueba y abre [el README](../README.md) por si necesitas recordar el estado actual. La demostración se basa en funcionalidades que existan ese día; si el equipo añadió otras, no estás obligado a enseñarlas todas.

**Ensayo, 35 min.** Realiza esta secuencia con cronómetro:

1. Explica en dos minutos qué problema resuelve PlanB y qué significa que sea una web responsive.
2. Dibuja o señala las capas `frontend → rutas → servicios → repositorios → Prisma/MySQL`.
3. Inicia sesión y edita el perfil. Explica una petición `PUT /api/perfil` desde el botón hasta MySQL.
4. Crea una experiencia y después edítala desde la bienvenida. Explica que las ciudades provienen de un catálogo.
5. Enseña cómo se ejecuta una prueba y qué criterio comprueba. Si la batería completa tarda demasiado durante la demostración, ejecútala antes y enseña el resultado; durante la revisión puedes ejecutar una prueba específica.

**Revisión, 15 min.** Anota tres preguntas que podrían hacerte. Si no puedes responderlas, busca el archivo o la prueba que dé la evidencia. Practica esta explicación de 30 segundos: «El navegador muestra la interfaz; Express recibe las peticiones; los servicios comprueban las reglas; los repositorios acceden a los datos. La sesión identifica al usuario y las pruebas verifican los criterios de las historias».

## Semana 2: profundizar y construir una interfaz con Bootstrap

Tiempo principal: **240 minutos**. Puedes empezar antes de la revisión si ya dominas la primera semana.

| Sesión | Tiempo | Resultado que debes conseguir |
|---|---:|---|
| 6. HTML, CSS y Bootstrap | 85 min | Construir una pequeña pantalla adaptable a móvil y escritorio |
| 7. Backend, HTTP y seguridad | 45 min | Interpretar una petición y sus protecciones |
| 8. Datos, Prisma y MySQL | 35 min | Relacionar modelos, tablas y migraciones |
| 9. Pruebas y TDD | 50 min | Leer una prueba y explicar el ciclo rojo, verde y refactorización |
| 10. Síntesis | 25 min | Explicar el sistema completo sin seguir un guion |

### Sesión 6: HTML, CSS y Bootstrap — 85 minutos

**Conceptos, 20 min.** HTML describe el contenido y su significado: títulos, formularios, etiquetas y botones. CSS decide su presentación. Bootstrap aporta clases CSS ya preparadas, como `container`, `row`, `col`, `btn`, `form-control` y utilidades de espaciado como `mb-3`. En PlanB, `styles.css` añade los estilos propios que Bootstrap no cubre. Una interfaz *responsive* reorganiza su diseño según el ancho de la pantalla.

La [rejilla de bienvenida](../frontend/bienvenida.html) usa `row-cols-2 row-cols-md-3 row-cols-lg-4`: dos columnas en anchuras pequeñas, tres a partir del punto medio y cuatro en pantallas grandes. `g-3` separa las tarjetas. Bootstrap se carga desde una hoja CSS externa. El formulario emergente usa `<dialog>` del navegador y JavaScript propio; actualmente las páginas no cargan el JavaScript de Bootstrap.

**Ejercicio A, 20 min.** Con PlanB abierto, usa las herramientas del navegador:

1. Abre la pestaña **Elementos** e inspecciona `#rejilla`.
2. Identifica qué clases vienen de Bootstrap y cuáles pertenecen a `styles.css`.
3. Activa la vista de dispositivo móvil y compara la cantidad de columnas a 390 px, 800 px y 1200 px aproximadamente.
4. Cambia temporalmente `row-cols-2` por `row-cols-1` en el inspector. Observa el efecto y recarga la página para recuperar el diseño original.

**Ejercicio B, 35 min.** Crea una carpeta personal de práctica **fuera del repositorio** y dentro un archivo `bootstrap-ejercicio.html`. Copia este ejemplo, ábrelo en el navegador y completa los cambios indicados debajo:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Práctica de Bootstrap</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <main class="container py-4">
    <h1 class="h3 mb-4">Ideas de experiencias</h1>
    <div class="row row-cols-1 row-cols-md-2 g-3">
      <div class="col">
        <article class="card h-100">
          <div class="card-body">
            <h2 class="card-title h5">Museos de Madrid</h2>
            <p class="card-text">Una tarde de arte y paseo.</p>
            <button type="button" class="btn btn-primary">Ver idea</button>
          </div>
        </article>
      </div>
      <div class="col">
        <article class="card h-100">
          <div class="card-body">
            <h2 class="card-title h5">Parques de Valencia</h2>
            <p class="card-text">Un plan al aire libre.</p>
            <button type="button" class="btn btn-primary">Ver idea</button>
          </div>
        </article>
      </div>
    </div>
  </main>
</body>
</html>
```

Añade una tercera tarjeta, cambia la rejilla a dos columnas en móvil y tres en escritorio, y sustituye el botón de la tercera tarjeta por `btn btn-outline-primary`. Si no recuerdas una clase, búscala en [bienvenida.html](../frontend/bienvenida.html) o [perfil.html](../frontend/perfil.html). Los botones del ejemplo aún no realizan ninguna acción: aquí estudias estructura y estilos, sin necesitar backend.

**Comprueba que lo entendiste, 10 min.** Verifica visualmente móvil y escritorio. Explica por qué `class="btn btn-primary"` cambia el aspecto sin escribir CSS nuevo, por qué `id` y `class` sirven para propósitos distintos y qué harías en `styles.css` si necesitas una regla visual propia de PlanB. Si la página se ve sin estilos, comprueba que haya conexión a internet para cargar el CSS del CDN.

### Sesión 7: backend, HTTP y seguridad — 45 minutos

**Conceptos, 15 min.** HTTP define cómo el navegador pide o envía datos. `GET` consulta; `POST` crea; `PUT` sustituye o actualiza un recurso según la API; `PATCH` modifica parte de un recurso. Una respuesta incluye un código: `200` éxito, `400` datos incorrectos, `401` falta sesión, `403` permiso denegado. Un middleware se ejecuta antes de la ruta para tareas comunes. La contraseña se guarda como hash con bcrypt; la cookie contiene un identificador de sesión, no la contraseña. Helmet añade cabeceras de seguridad, express-rate-limit limita intentos y Turnstile ayuda a frenar registros automatizados.

**Ejercicio, 25 min.** Abre la pestaña **Red** del navegador, activa «Conservar registro» si necesitas ver las peticiones tras navegar y edita tu perfil de prueba. Localiza `PUT /api/perfil`. Apunta método, código de respuesta y nombres de los campos enviados; no copies valores privados ni cookies. Después localiza en [perfilRoutes.js](../backend/src/routes/perfilRoutes.js) el middleware que exige sesión. Busca en [app.js](../backend/src/app.js) dónde se configura la sesión y Helmet.

**Comprueba que lo entendiste, 5 min.** Responde por qué ocultar el botón «Editar» en el navegador no impediría que alguien enviase una petición manual, y qué capa debe comprobar el permiso.

### Sesión 8: datos, Prisma y MySQL — 35 minutos

**Conceptos, 10 min.** MySQL guarda tablas y relaciones. `schema.prisma` describe modelos que Prisma convierte en operaciones sobre la base de datos. Una migración es un cambio versionado de la estructura; una semilla introduce datos iniciales, como el catálogo de capitales. `Usuario.ciudad` es texto del perfil; `Ciudad` es la tabla que usan las experiencias.

**Ejercicio, 20 min.** Compara en [schema.prisma](../backend/prisma/schema.prisma) `Usuario`, `Ciudad` y `Experiencia`. Dibuja sus relaciones. Desde `backend/`, ejecuta `npm run db:studio` y observa los registros de tu base local sin editarlos. Cierra Prisma Studio con `Ctrl+C`. Después abre [experienciaRepository.js](../backend/src/repositories/experienciaRepository.js) y localiza una operación de Prisma. Explica qué tabla afecta y cómo se relaciona con tu conocimiento de `SELECT`, `INSERT` o `UPDATE`.

**Comprueba que lo entendiste, 5 min.** Explica por qué una experiencia necesita `ciudadId`, por qué `db:seed` puede ejecutarse más de una vez y en qué se diferencian `migrate deploy` y una migración nueva de desarrollo.

### Sesión 9: pruebas y TDD — 50 minutos

**Conceptos, 10 min.** Jest organiza y ejecuta las pruebas. Supertest hace peticiones a la aplicación Express sin abrir un navegador. jsdom simula partes del navegador para probar una pantalla. Un *mock* sustituye una dependencia externa, como MySQL o Cloudinary, para estudiar una regla sin depender de ese servicio. TDD sigue **rojo** (la prueba falla por la razón esperada), **verde** (el cambio mínimo la hace pasar) y **refactorización** (mejorar el código manteniendo las pruebas en verde).

**Ejercicio, 30 min.** Lee [perfilCriterio.test.js](../backend/tests/perfilCriterio.test.js) y escoge una prueba. Anota tres frases: «Prepara…», «Ejecuta…» y «Comprueba…». Relaciónala con el criterio FLA05 del Excel actual de historias. Desde `backend/`, ejecuta `npx jest tests/perfilCriterio.test.js --runInBand` y después `npm test -- --runInBand`. No es necesario alterar una prueba existente para provocar un fallo. En su lugar, explica qué pequeño error de implementación haría que esa prueba se volviese roja y qué esperarías ver.

**Comprueba que lo entendiste, 10 min.** Explica la diferencia entre que una prueba pase y que la historia esté completamente terminada. Indica qué comprobación manual de la pantalla complementarías con las pruebas. En una tarea nueva, pide al agente ver el fallo inicial antes de que implemente la solución y que te explique cada bloque de prueba.

### Sesión 10: síntesis — 25 minutos

Sin mirar archivos, dibuja de nuevo el recorrido de la edición de perfil y una segunda ruta a tu elección. Para cada herramienta escribe **qué problema resuelve** y **en qué parte del recorrido aparece**. Compara el dibujo con [la arquitectura](arquitectura.md) y corrige solo los puntos que no coincidan.

Termina con una explicación oral de cinco minutos: producto, arquitectura, seguridad, datos, frontend responsive y pruebas. Graba la explicación si te resulta útil y anota las dos ideas que todavía te cuesta expresar.

## Ampliaciones opcionales

Estas actividades añaden profundidad hasta un máximo de **8 horas adicionales por semana**. Escoge solo las que respondan a tus dudas; mantén primero la ruta de 4 horas.

### Opcionales de la primera semana

| Actividad | Tiempo | Práctica |
|---|---:|---|
| JavaScript desde Java | 90 min | Reescribir pequeños ejemplos de condiciones, bucles, arrays y objetos en ambos lenguajes |
| Segunda funcionalidad completa | 90 min | Seguir creación de experiencia desde `bienvenida.js` hasta `experienciaRepository.js` |
| SQL y Prisma | 90 min | Comparar lecturas y actualizaciones de Prisma con `SELECT` y `UPDATE` conceptuales |
| Seguridad de sesiones | 60 min | Dibujar login → cookie → petición autenticada → logout |
| Ensayo adicional | 75 min | Repetir la demostración con cronómetro y contestar preguntas sin notas |
| Git práctico | 75 min | Comparar dos commits y practicar el uso de una rama de ejercicios sin tocar `main` |

Estas actividades suman 8 horas. Si no llegas a todas, prioriza JavaScript, la segunda funcionalidad y el ensayo.

### Opcionales de la segunda semana

| Actividad | Tiempo | Práctica |
|---|---:|---|
| Bootstrap con formulario | 90 min | Añadir al archivo de práctica un formulario con `form-label`, `form-control`, `form-select` y mensajes de ayuda |
| JavaScript del navegador | 90 min | Añadir un archivo JS al ejercicio que escuche un clic y cambie texto con `textContent` |
| HTTP en detalle | 60 min | Seguir en la pestaña Red una petición correcta y una inválida de tu cuenta de prueba |
| TDD acompañado | 120 min | Elegir con el agente una regla pequeña de una historia futura, leer primero la prueba, observar rojo y después verde |
| Docker, Prisma y migraciones | 60 min | Explicar qué archivo define cada modelo y cómo se aplican migraciones ya existentes, sin crear una migración de prueba en el proyecto |
| Comparación visual | 60 min | Ajustar el ejercicio de Bootstrap en varios anchos y justificar cada cambio de clase |

Estas actividades también suman 8 horas. La práctica de TDD con una historia real requiere coordinarse con quien sea responsable de esa historia y seguir [la metodología](metodologia.md).

## Preguntas finales para comprobar tu progreso

Intenta responderlas sin consultar la documentación. Después comprueba las respuestas en los archivos indicados en cada sesión.

1. ¿Qué diferencia hay entre Node.js y Express?
2. ¿Qué diferencia hay entre MySQL y Prisma?
3. ¿Para qué sirven Docker, npm y `.env`?
4. ¿Qué diferencia hay entre una ruta, un middleware, un servicio y un repositorio?
5. ¿Qué sucede desde que pulsas «Guardar cambios» hasta que vuelves a consultar tu perfil?
6. ¿Cómo identifica el backend al usuario y dónde se comprueba que puede editar?
7. ¿Qué hace Bootstrap en PlanB y qué sigue haciendo el CSS propio?
8. ¿Por qué cambia el número de columnas al variar el ancho de la pantalla?
9. ¿Qué significan preparación, acción y resultado esperado en una prueba?
10. ¿Qué evidencias necesitas para afirmar que completaste una historia de usuario?

Si respondes razonablemente a ocho de las diez y puedes ejecutar la demostración, has alcanzado el objetivo inicial. Las dudas restantes sirven para elegir el siguiente tema de aprendizaje. No necesitas memorizar nombres de todos los archivos: necesitas saber dónde buscar y por qué.

## Después de las dos semanas

La siguiente etapa, sin fecha cerrada, es ganar autonomía mediante tareas pequeñas y reales: comprender un criterio de validación, escribir o revisar primero su prueba, implementar un cambio en una sola capa, ejecutar las pruebas y explicar el resultado. Repite ese ciclo con ayuda cada vez menor. El primer objetivo práctico puede ser una mejora de interfaz con Bootstrap que el equipo necesite de verdad y que tenga una comprobación visual clara en móvil y escritorio.
