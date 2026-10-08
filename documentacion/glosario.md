# Glosario — PlanB

> Términos técnicos que aparecen en el código y la documentación, explicados en lenguaje claro.
> Cada uno indica dónde aparece en PlanB. Documentos relacionados: [arquitectura](arquitectura.md), [flujos](flujos.md), [API](api.md) y [pantallas](frontend.md).

## Arquitectura y backend

**API REST**
Conjunto de direcciones (rutas) a las que el navegador envía peticiones HTTP para leer o cambiar datos. Cada ruta combina un método (`GET` leer, `POST` crear, `PUT`/`PATCH` modificar, `DELETE` borrar) y una dirección.
En PlanB: todas empiezan por `/api`; la lista completa está en [api.md](api.md).

**Monolito por capas**
Una sola aplicación (un único servidor) organizada en capas que se llaman siempre en el mismo orden, cada una con una responsabilidad.
En PlanB: rutas → servicios → repositorios → MySQL o servicios externos. Ver [arquitectura](arquitectura.md).

**Ruta (capa)**
Código que recibe una petición HTTP, saca los datos de ella y llama a un servicio. No decide nada.
En PlanB: `backend/src/routes/*Routes.js`. Cada `xRoutes.js` llama solo a su `xService.js`.

**Servicio (capa)**
Código con las reglas de negocio: valida los datos, comprueba permisos y coordina los repositorios.
En PlanB: `backend/src/services/*Service.js`; las reglas comunes están en `services/shared/`.

**Repositorio (capa)**
La única capa que habla con la base de datos o con servicios externos (Cloudinary, correo).
En PlanB: `backend/src/repositories/*Repository.js`.

**Middleware**
Función que se ejecuta antes de la ruta para una tarea común: exigir sesión, limitar intentos o recibir un archivo. Puede cortar la petición con un error o dejarla seguir (`next()`).
En PlanB: `requiereSesion`, `limiteLogin`, `recibirFoto`... en `backend/src/middlewares/`.

**Express**
Biblioteca de Node.js para crear servidores web: define las rutas y los middlewares.
En PlanB: versión 5, que recoge sola los errores de las rutas `async`; el manejador de errores está en `app.js`.

**Prisma / ORM**
Un ORM traduce objetos de JavaScript a consultas SQL, para no escribir SQL a mano. Prisma es el que usa el proyecto: el esquema de la base de datos está en `schema.prisma` y genera el cliente con el que se consulta.
En PlanB: `backend/prisma/schema.prisma`; el cliente compartido está en `repositories/shared/`.

**Migración**
Archivo SQL que cambia la estructura de la base de datos (añadir una tabla, una columna, un índice) y queda guardado en el repositorio, para que todos tengan la misma base de datos aplicándolo.
En PlanB: `backend/prisma/migrations/`; se aplican con `npm run db:migrate`. Todo cambio de `schema.prisma` debe llevar la suya.

**Seed (datos iniciales)**
Script que carga datos fijos necesarios para usar la aplicación.
En PlanB: `npm run db:seed` carga el catálogo de ciudades; se puede ejecutar varias veces sin duplicar nada.

**Restricción única (índice único)**
Regla de la base de datos que impide dos filas con el mismo valor en una columna o combinación de columnas. La comprueba MySQL, así que se cumple aunque lleguen dos peticiones a la vez.
En PlanB: email y nombre de usuario; una valoración por usuario y experiencia (`[usuarioId, experienciaId]`); `Amistad.parejaClave`.

**P2002 y P2025**
Códigos de error de Prisma: P2002 significa «ya existe una fila con ese valor único» y P2025, «la fila que querías cambiar o borrar no existe».
En PlanB: se traducen en mensajes claros (400 o 404) en lugar de un 500. `repositories/shared/carreras.js` tiene `nullSi`, que convierte uno de esos errores en `null`.

**Condición de carrera**
Error que solo aparece cuando dos peticiones llegan casi a la vez y cada una cree que la otra no existe. Por ejemplo, dos solicitudes de amistad cruzadas.
En PlanB: se evitan dejando que MySQL decida con una restricción única o con un `UPDATE` condicionado. Ver [F7](flujos.md#f7-solicitud-de-amistad) y [F11](flujos.md#f11-recuperar-y-restablecer-la-contraseña).

**Transacción**
Grupo de operaciones de base de datos que se aplican todas o ninguna.
En PlanB: al restablecer la contraseña, marcar el enlace como usado y cambiar la contraseña van en la misma transacción.

**`parejaClave`**
Texto «menor-mayor» con los dos ids de una amistad (por ejemplo, `3-8`), igual sea quien sea el que envió la solicitud. Al ser único, no puede haber dos relaciones entre las mismas personas.
En PlanB: columna de `Amistad`.

**`crearError`**
Función que crea un error con un código HTTP, para que `app.js` responda con ese código y el mensaje.
En PlanB: `backend/src/errores.js`; los servicios la usan para todos sus errores.

## HTTP y la web

**Código de estado HTTP**
Número que acompaña a cada respuesta: 200 bien, 201 creado, 204 bien sin contenido, 400 datos no válidos, 401 sin sesión, 403 sin permiso, 404 no encontrado, 429 demasiados intentos, 500 error del servidor.
En PlanB: cada ficha de [api.md](api.md) lista los suyos.

**JSON**
Formato de texto para intercambiar datos, con la misma forma que los objetos de JavaScript.
En PlanB: el de todas las peticiones y respuestas de la API, salvo la subida de la foto.

**`multipart/form-data`**
Formato para enviar archivos en una petición. Con `FormData`, el navegador lo prepara solo, incluido el separador entre partes.
En PlanB: `PUT /api/perfil/foto`. Por eso `api.js` no fija el `Content-Type` cuando envía un `FormData`.

**Cookie `HttpOnly`**
Dato pequeño que el navegador guarda y envía en cada petición al mismo servidor. Con `HttpOnly`, el JavaScript de la página no puede leerla, así que un script malicioso no podría robarla.
En PlanB: la cookie de sesión `connect.sid`, que solo lleva el identificador de la sesión.

**Sesión**
Forma de recordar quién ha iniciado sesión entre una petición y la siguiente. El servidor guarda los datos y el navegador solo un identificador.
En PlanB: `express-session` con las sesiones guardadas en MySQL. `requiereSesion` comprueba en cada petición que la sesión existe y que su usuario sigue existiendo.

**Fijación de sesión**
Ataque en el que alguien consigue que la víctima use un identificador de sesión que el atacante ya conoce. Se evita creando una sesión nueva al iniciar sesión.
En PlanB: `abrirSesion` en `authRoutes.js` llama a `session.regenerate`.

**Límite de intentos (rate limiting)**
Número máximo de peticiones que una misma IP puede hacer en un periodo; pasado el límite, se responde 429.
En PlanB: `limitesMiddleware.js`: login, registro, cambio y recuperación de la contraseña.

**CAPTCHA**
Prueba para distinguir a una persona de un programa automático.
En PlanB: Cloudflare Turnstile en el registro; el servidor confirma el token con `captchaService`.

**CSP (Content Security Policy)**
Cabecera que dice al navegador de dónde puede cargar scripts y estilos. Bloquea el código JavaScript escrito dentro del HTML, que es la forma habitual de un ataque XSS.
En PlanB: la pone Helmet; por eso no hay `onclick=` ni `<script>` con código en las páginas.

**Helmet**
Biblioteca que añade a todas las respuestas cabeceras de seguridad (entre ellas, la CSP).
En PlanB: se configura en `app.js`.

**XSS (Cross-Site Scripting)**
Ataque que consiste en colar código en un texto (un nombre, un comentario) para que se ejecute en el navegador de otros usuarios.
En PlanB: se evita mostrando siempre los textos de usuarios con `textContent` y con la CSP.

**Enumeración de cuentas**
Averiguar qué emails tienen cuenta probando respuestas o tiempos distintos.
En PlanB: el login responde igual (y tarda lo mismo) con un email inexistente que con una contraseña incorrecta; la recuperación responde siempre lo mismo; el registro exige el CAPTCHA antes de consultar la base de datos.

## Seguridad de las contraseñas

**Hash**
Resultado de una función que convierte un texto en otro de longitud fija, del que no se puede volver al original.
En PlanB: las contraseñas se guardan como hash de bcrypt y los tokens de recuperación como hash SHA-256.

**bcrypt**
Algoritmo para guardar contraseñas: añade un valor aleatorio (*salt*) y es lento a propósito, para que probar millones de contraseñas cueste mucho. Solo usa los primeros 72 bytes.
En PlanB: `services/shared/password.js` (`cifrarPassword`), con 10 rondas.

**Token de recuperación**
Valor aleatorio de un solo uso que va en el enlace del email para restablecer la contraseña.
En PlanB: 32 bytes aleatorios; en la base de datos solo se guarda su hash, caduca a los 30 minutos y solo sirve una vez. Ver [E4](flujos.md#e4-enlace-de-recuperación-de-la-contraseña).

**SMTP**
Protocolo para enviar correo electrónico.
En PlanB: `emailRepository` usa Nodemailer con la dirección de `SMTP_URL`; sin ella, escribe el email en la consola del servidor.

## Datos de PlanB

**Visibilidad**
Quién puede ver una experiencia: `PRIVADA` (solo su autor), `AMIGOS` (su autor y sus amigos con la amistad aceptada) o `PUBLICA` (cualquier usuario con sesión).
En PlanB: CS-22; la regla está en `services/shared/visibilidad.js`. Ver [arquitectura](arquitectura.md).

**Contenido no disponible**
Respuesta 404 que se da tanto si una experiencia no existe como si el usuario no puede verla, para no revelar que existe.
En PlanB: CS-30; `experienciaService.obtenerExperiencia`.

**Amistad y seguimiento**
La amistad es mutua y necesita que la otra persona acepte; da acceso a las experiencias `AMIGOS`. Seguir es en un solo sentido, no necesita aceptación y no da acceso a nada.
En PlanB: modelos `Amistad` (PENDIENTE o ACEPTADA) y `Seguimiento`. CS-61 y CS-45.

**Datos públicos de un usuario**
Lo que se puede mostrar de un usuario a otro: `{ id, nombreUsuario, foto }`. El email nunca sale en una respuesta sobre otra persona.
En PlanB: `USUARIO_PUBLICO` en `repositories/shared/camposPublicos.js`.

**`Usuario.ciudad` y `Ciudad`**
Dos cosas distintas: `Usuario.ciudad` es un texto libre que cada uno escribe en su perfil; `Ciudad` es el catálogo de ciudades que se eligen al crear una experiencia.
En PlanB: no se deben confundir.

**Paginación por cursor**
Forma de pedir una lista por partes. En vez de «dame la página 3», se pide «dame los 10 siguientes después del elemento con id 57». El valor que marca dónde seguir es el cursor.
En PlanB: parámetros `despuesDe` y `limite`, respuesta con `siguiente`. `services/shared/paginacion.js`. Ver [F9](flujos.md#f9-listas-con-cargar-más).

**NFC (normalización Unicode)**
Una misma letra con tilde se puede escribir de dos formas internas («é» o «e» + «´»). Normalizar a NFC las convierte siempre en la misma, para que dos textos iguales lo sean también para el ordenador.
En PlanB: se aplica a todos los textos que llegan a la API.

## Frontend

**DOM**
La representación de la página que el JavaScript puede leer y cambiar (elementos, textos, atributos).
En PlanB: cada `js/x.js` busca sus elementos por `id` y los actualiza.

**`textContent` e `innerHTML`**
`textContent` escribe texto tal cual; `innerHTML` interpreta el texto como HTML. Con datos de usuarios solo se usa `textContent`.
En PlanB: ver [reglas del frontend](frontend.md#reglas-del-frontend).

**`fetch`**
Función del navegador para hacer peticiones HTTP desde JavaScript.
En PlanB: solo se usa dentro de `js/shared/api.js`.

**`<dialog>`**
Elemento HTML para ventanas modales, que se abren con `showModal()` y se cierran con `close()` o Esc.
En PlanB: crear y editar una experiencia en `bienvenida.html` y reportar en `experiencia.html`.

**Bootstrap**
Biblioteca de estilos CSS con rejillas y componentes ya hechos.
En PlanB: versión 5, cargada desde un CDN; solo su CSS.

## Pruebas

**TDD (desarrollo guiado por pruebas)**
Ciclo de tres pasos: escribir una prueba que falla (rojo), el código mínimo para que pase (verde) y mejorar el código sin romperla (refactorización).
En PlanB: obligatorio para cada comportamiento nuevo; ver `AGENTS.md`.

**Jest**
Herramienta para escribir y ejecutar pruebas de JavaScript.
En PlanB: `npm test` desde `backend/`.

**Supertest**
Biblioteca para enviar peticiones HTTP a la aplicación Express desde una prueba, sin arrancar el servidor.
En PlanB: las pruebas de `backend/tests/routes/` y `backend/tests/criterios/`.

**jsdom**
Simulación de un navegador dentro de Node.js, para probar las pantallas sin abrir un navegador real.
En PlanB: las pruebas de `backend/tests/frontend/`.

**Simulación (mock)**
Sustituir en una prueba una pieza real (un repositorio, `fetch`) por una falsa que responde lo que la prueba necesita, para probar una capa sin depender de las demás.
En PlanB: las pruebas de servicios simulan los repositorios; las de pantallas simulan `fetch`.

**Prueba de integración con MySQL**
Prueba que usa una base de datos MySQL real, para comprobar lo que una simulación no puede: restricciones únicas, transacciones y consultas.
En PlanB: `backend/tests/mysql/`, con `npm run test:mysql` (necesita `docker compose up -d`).

**Cobertura**
Porcentaje del código que se ejecuta durante las pruebas. Una cobertura alta no garantiza que las pruebas comprueben bien, pero una baja indica código sin probar.
En PlanB: `npm run test:cobertura`; falla si baja de los mínimos fijados en `package.json`.

**Prueba de mutación**
Forma de comprobar las pruebas: se estropea a propósito una línea del código (por ejemplo, cambiar `<` por `<=`) y se mira si alguna prueba falla. Si ninguna falla, esa regla no está bien protegida.
En PlanB: se hizo a mano con las reglas críticas (visibilidad, permisos, paginación, contraseñas).
