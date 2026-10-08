# Referencia de la API — PlanB

> Todas las rutas que ofrece el backend: qué reciben, qué devuelven y con qué errores responden.
> Documentos relacionados: [arquitectura](arquitectura.md), [flujos](flujos.md), [pantallas](frontend.md) y [glosario](glosario.md).
> El código de cada ruta está en `backend/src/routes/`; el comentario que la precede indica el servicio al que llama.

## Convenciones

| Tema | Regla |
|---|---|
| Prefijo | Todas las rutas empiezan por `/api`. El servidor también sirve las páginas de `frontend/` desde la raíz (`/perfil.html`...). |
| Formato | Las peticiones y respuestas van en JSON, salvo la subida de la foto (`multipart/form-data`). |
| Sesión | Se guarda en MySQL; el navegador solo tiene una cookie `HttpOnly` con su identificador. Las rutas marcadas con **Sesión: sí** pasan antes por `requiereSesion`, que responde 401 «No hay sesión iniciada» si no hay sesión o si su usuario ya no existe. |
| Quién soy | El usuario que hace algo sale siempre de la sesión, nunca del cuerpo ni de la URL. Por eso no hay rutas del tipo «editar el perfil del usuario 7». |
| Errores | Todas las respuestas de error son `{ "error": "mensaje en español" }`. Un JSON roto o demasiado grande da 400 «La petición no es válida»; una ruta `/api` que no existe, 404 «Recurso no encontrado»; un fallo inesperado, 500 «Error interno del servidor», sin detalles. |
| Identificadores | Un id de la URL o del cuerpo debe ser un entero entre 1 y 2147483647; si no, 400 «El identificador ... no es válido». |
| Datos públicos | Cuando una respuesta incluye a otro usuario, solo lleva `{ id, nombreUsuario, foto }`, nunca su email. Si no tiene foto, `foto` es la imagen por defecto. |
| Contenido no disponible | Una experiencia que no existe y una que el usuario no puede ver responden igual: 404 «Contenido no disponible». Así no se revela que existe. |
| Listas por páginas | Las rutas marcadas con **Páginas: sí** admiten `?limite=` (de 1 a 50) y `?despuesDe=` (el cursor). Devuelven la lista y `siguiente`: el valor que hay que pasar en `despuesDe` para pedir la página siguiente, o `null` si no hay más. Sin `despuesDe` empiezan por el principio. Un valor no válido da 400 «La paginación no es válida». Ver [F9](flujos.md#f9-listas-con-cargar-más). |
| Límites de intentos | Al pasarlos, la ruta responde 429 durante el resto de la ventana. Cuentan por IP. |

## Índice

| Método y ruta | Sesión | Para qué | Historia |
|---|---|---|---|
| [`POST /api/auth/registro`](#post-apiauthregistro) | no | Crear una cuenta | CS-59, CS-64 |
| [`GET /api/auth/captcha`](#get-apiauthcaptcha) | no | Clave pública del CAPTCHA | CS-59 |
| [`POST /api/auth/login`](#post-apiauthlogin) | no | Iniciar sesión | CS-59 |
| [`POST /api/auth/logout`](#post-apiauthlogout) | no | Cerrar sesión | CS-59 |
| [`GET /api/auth/yo`](#get-apiauthyo) | sí | Usuario de la sesión | CS-59 |
| [`POST /api/auth/recuperar`](#post-apiauthrecuperar) | no | Pedir el enlace de recuperación | CS-64 |
| [`POST /api/auth/restablecer`](#post-apiauthrestablecer) | no | Nueva contraseña con el enlace | CS-64 |
| [`GET /api/perfil`](#get-apiperfil) | sí | Mi perfil | CS-47 |
| [`PUT /api/perfil`](#put-apiperfil) | sí | Editar nombre y ciudad | CS-47 |
| [`PUT /api/perfil/foto`](#put-apiperfilfoto) | sí | Subir mi foto | CS-47 |
| [`GET /api/perfil/resumen`](#get-apiperfilresumen) | sí | Mis contadores | CS-45 |
| [`GET /api/perfil/amigos`](#get-apiperfilamigos) | sí | Mis amigos | CS-45 |
| [`GET /api/perfil/seguidores`](#get-apiperfilseguidores) | sí | Mis seguidores | CS-45 |
| [`PUT /api/perfil/password`](#put-apiperfilpassword) | sí | Cambiar mi contraseña | CS-64 |
| [`GET /api/experiencias?autor=`](#get-apiexperienciasautor) | sí | Experiencias de un autor | CS-44 |
| [`GET /api/experiencias/:id`](#get-apiexperienciasid) | sí | Una experiencia | CS-30, CS-63 |
| [`POST /api/experiencias`](#post-apiexperiencias) | sí | Crear una experiencia | CS-49, CS-22 |
| [`PATCH /api/experiencias/:id`](#patch-apiexperienciasid) | sí | Editar mi experiencia | CS-57, CS-22 |
| [`GET /api/experiencias/:id/valoracion`](#get-apiexperienciasidvaloracion) | sí | Mi valoración | CS-63 |
| [`PUT /api/experiencias/:id/valoracion`](#put-apiexperienciasidvaloracion) | sí | Valorar | CS-01 |
| [`GET /api/experiencias/:id/valoraciones`](#get-apiexperienciasidvaloraciones) | sí | Todas las valoraciones | CS-63 |
| [`GET /api/experiencias/:id/valoraciones/amigos`](#get-apiexperienciasidvaloracionesamigos) | sí | Las de amigos y seguidores | CS-48 |
| [`GET /api/ciudades`](#get-apiciudades) | no | Catálogo de ciudades | CS-49 |
| [`GET /api/usuarios?texto=`](#get-apiusuariostexto) | sí | Buscar personas | CS-61 |
| [`GET /api/usuarios/:nombreUsuario`](#get-apiusuariosnombreusuario) | sí | Perfil de otro usuario | CS-62 |
| [`POST /api/amistades`](#post-apiamistades) | sí | Enviar una solicitud | CS-61 |
| [`GET /api/amistades/solicitudes`](#get-apiamistadessolicitudes) | sí | Solicitudes recibidas | CS-61 |
| [`PATCH /api/amistades/:id`](#patch-apiamistadesid) | sí | Aceptar o rechazar | CS-61 |
| [`DELETE /api/amistades/:id`](#delete-apiamistadesid) | sí | Eliminar una amistad | CS-61 |
| [`POST /api/seguimientos`](#post-apiseguimientos) | sí | Seguir | CS-61 |
| [`DELETE /api/seguimientos/:seguidoId`](#delete-apiseguimientosseguidoid) | sí | Dejar de seguir | CS-61 |

Cada ficha indica la ruta, el servicio que la atiende, qué recibe, qué devuelve y sus errores propios. Los 401 por falta de sesión, los 400 por un identificador no válido y los 500 son comunes y no se repiten.

---

## Autenticación (`authRoutes.js` → `authService`)

### `POST /api/auth/registro`

`authService.registrar` · Sesión: no · Límite: `limiteRegistro`, 20 por hora.

* **Cuerpo:** `{ nombreUsuario, email, password, captcha }`. `captcha` es el token de Cloudflare Turnstile.
* **Responde:** 201 `{ id, nombreUsuario, email }` y abre la sesión (cookie).
* **Errores 400:**
  * «Faltan datos obligatorios».
  * «El nombre de usuario debe tener de 3 a 30 caracteres: letras, números, _ . o -».
  * «El email no es válido».
  * «La contraseña no cumple estos requisitos: ...», con los que fallan: entre 8 y 72 caracteres, al menos una mayúscula, una minúscula y un número, y sin el nombre de usuario.
  * «No se ha podido comprobar que no eres un robot. Inténtalo de nuevo.».
  * «El email ya está registrado» o «El nombre de usuario ya está en uso».
* **Notas:** el email se guarda en minúsculas y sin espacios. Ver [F1](flujos.md#f1-registro).

### `GET /api/auth/captcha`

Sin servicio: lee `TURNSTILE_SITE_KEY` · Sesión: no.

* **Responde:** 200 `{ siteKey }`, la clave pública que necesita el widget de Turnstile en `registro.html`.

### `POST /api/auth/login`

`authService.iniciarSesion` · Sesión: no · Límite: `limiteLogin`, 10 intentos fallidos cada 15 minutos (un login correcto no cuenta).

* **Cuerpo:** `{ email, password }`.
* **Responde:** 200 `{ id, nombreUsuario, email }`, con una sesión nueva.
* **Errores:** 400 «Faltan datos obligatorios»; 401 «Email o contraseña incorrectos», tanto si el email no existe como si la contraseña no coincide. Ver [F2](flujos.md#f2-inicio-de-sesión-y-petición-protegida).

### `POST /api/auth/logout`

Sin servicio · Sesión: no.

* **Responde:** 204. Borra la sesión de MySQL y la cookie. Sin sesión también responde 204.

### `GET /api/auth/yo`

`authService.obtenerUsuario` · Sesión: sí.

* **Responde:** 200 `{ id, nombreUsuario, email }`. Las pantallas lo usan para saber si hay sesión y quién es el usuario.

### `POST /api/auth/recuperar`

`authService.solicitarRecuperacion` · Sesión: no · Límite: `limiteRecuperacion`, 10 cada 15 minutos (compartido con `/restablecer`).

* **Cuerpo:** `{ email }`.
* **Responde:** siempre 200 `{ mensaje: "Si el email está registrado, te hemos enviado un enlace para restablecer la contraseña." }`, exista o no la cuenta.
* **Efecto:** si el email es de una cuenta, guarda el hash de un token nuevo que caduca en 30 minutos y envía el enlace `URL_APP/restablecer.html?token=...`. Sin `SMTP_URL`, el email se escribe en la consola del servidor.
* **Errores:** 400 «Faltan datos obligatorios». Ver [F11](flujos.md#f11-recuperar-y-restablecer-la-contraseña).

### `POST /api/auth/restablecer`

`authService.restablecerPassword` · Sesión: no · Límite: `limiteRecuperacion`.

* **Cuerpo:** `{ token, nueva }`.
* **Responde:** 200 `{ mensaje: "Contraseña cambiada. Ya puedes iniciar sesión con la nueva." }`. El enlace queda usado.
* **Errores 400:**
  * «Faltan datos obligatorios».
  * «El enlace no es válido o ha caducado»: no existe, ya se usó, han pasado 30 minutos u otra petición lo usó a la vez.
  * «La contraseña no cumple estos requisitos: ...»; en este caso el enlace sigue sirviendo.

## Perfil propio (`perfilRoutes.js` → `perfilService`)

Todas exigen sesión y trabajan sobre el usuario de la sesión.

### `GET /api/perfil`

`perfilService.obtenerPerfilPropio`.

* **Responde:** 200 `{ id, nombreUsuario, email, foto, ciudad }`.

### `PUT /api/perfil`

`perfilService.actualizarPerfilPropio`.

* **Cuerpo:** `{ nombreUsuario?, ciudad? }`. Un campo que no llega no cambia; `ciudad` vacía o `null` la quita. Cualquier otro campo se ignora (el email no se puede cambiar).
* **Responde:** 200 con el perfil actualizado.
* **Errores 400:** el nombre no cumple las reglas, «El nombre de usuario ya está en uso», «La ciudad debe ser un texto», «La ciudad no puede superar los 191 caracteres».
* **Notas:** `ciudad` es texto libre, distinto del catálogo `Ciudad` de las experiencias.

### `PUT /api/perfil/foto`

`fotoMiddleware.recibirFoto` y `perfilService.actualizarFotoPropia`.

* **Cuerpo:** `multipart/form-data` con un único archivo en el campo `foto`.
* **Responde:** 200 con el perfil y la URL nueva de Cloudinary en `foto`.
* **Errores 400:** «Falta la foto», «La foto no puede superar los 5 MB», «Envía una sola foto en el campo «foto»», «La foto debe ser JPG, PNG o WebP» (se mira el contenido, no la extensión), «La foto no es una imagen válida». Ver [F3](flujos.md#f3-foto-de-perfil).

### `GET /api/perfil/resumen`

`perfilService.obtenerResumenRelaciones`.

* **Responde:** 200 `{ amigos, seguidores }`. Solo cuentan las amistades aceptadas.

### `GET /api/perfil/amigos`

`perfilService.listarAmigosPropios` · Páginas: sí, 20 por defecto.

* **Responde:** 200 `{ personas: [{ id, nombreUsuario, foto }], siguiente }`, de la amistad más reciente a la más antigua. El cursor es el id de la amistad, no el del usuario.

### `GET /api/perfil/seguidores`

`perfilService.listarSeguidoresPropios` · Páginas: sí, 20 por defecto.

* **Responde:** 200 `{ personas, siguiente }` con quienes siguen al usuario de la sesión. El cursor es el id del seguimiento.

### `PUT /api/perfil/password`

`perfilService.cambiarPassword` · Límite: `limiteCambioPassword`, 10 intentos fallidos cada 15 minutos.

* **Cuerpo:** `{ actual, nueva }`.
* **Responde:** 204.
* **Errores 400:** «Faltan datos obligatorios», «La contraseña actual no es correcta» (no cambia nada) y «La contraseña no cumple estos requisitos: ...». Ver [F12](flujos.md#f12-cambiar-la-contraseña).

## Experiencias (`experienciaRoutes.js` → `experienciaService`)

Una experiencia es `{ id, titulo, descripcion, ciudadId, ciudad: { id, nombre, pais, codigoPais }, tipo, momentoAdecuado, visibilidad, autorId }`. `tipo` y `momentoAdecuado` pueden ser `null`; `visibilidad` es `PRIVADA`, `AMIGOS` o `PUBLICA`.

### `GET /api/experiencias?autor=`

`experienciaService.listarDeAutor` · Páginas: sí, 10 por defecto.

* **Parámetros:** `autor`, el nombre de usuario del autor (obligatorio).
* **Responde:** 200 `{ experiencias, siguiente }`, de la más reciente a la más antigua y solo las que puede ver el usuario de la sesión: todas si es el autor; las públicas y las de amigos si son amigos; solo las públicas en otro caso.
* **Errores:** 400 «Indica el nombre de usuario del autor»; 404 «Usuario no encontrado». Ver [F10](flujos.md#f10-perfil-de-otro-usuario).

### `GET /api/experiencias/:id`

`experienciaService.obtenerExperiencia`.

* **Responde:** 200 con la experiencia y `autor: { id, nombreUsuario, foto }` (`null` en las antiguas sin autor).
* **Errores:** 404 «Contenido no disponible». Ver [F5](flujos.md#f5-abrir-una-experiencia).

### `POST /api/experiencias`

`experienciaService.crearExperiencia`.

* **Cuerpo:** `{ titulo, descripcion, ciudadId, tipo?, momentoAdecuado?, visibilidad? }`. `ciudadId` debe ser un número, no un texto; `visibilidad` es PUBLICA si no llega. Otros campos, como `autorId`, se ignoran.
* **Responde:** 201 con la experiencia creada y su ciudad. El autor es el usuario de la sesión.
* **Errores 400:**
  * «Los datos de la experiencia deben ser un objeto».
  * «El título es obligatorio», «La descripción es obligatoria», «... debe ser un texto».
  * «... no puede superar los 191 caracteres» (título, tipo o momento adecuado).
  * «La descripción es demasiado larga (máximo 65535 bytes en UTF-8)».
  * «La visibilidad debe ser una de: PRIVADA, AMIGOS o PUBLICA».
  * «Debes indicar una ciudad con un identificador entero positivo válido», «La ciudad seleccionada no existe», «La ciudad seleccionada ya no está disponible».
* **Notas:** los textos se guardan sin espacios exteriores y normalizados (NFC). Ver [F4](flujos.md#f4-crear-y-editar-una-experiencia).

### `PATCH /api/experiencias/:id`

`experienciaService.editarExperiencia`.

* **Cuerpo:** los mismos campos que al crearla; solo cambian los que llegan, con las mismas reglas.
* **Responde:** 200 con la experiencia actualizada.
* **Errores:** los 400 de la creación y «Debes indicar al menos un campo para modificar»; 403 «No puedes editar una experiencia de otro usuario»; 404 «La experiencia no existe» o «La experiencia ya no existe» (se borró mientras tanto).
* **Notas:** a diferencia de la lectura, la edición distingue entre «no existe» y «no es tuya». La pantalla solo ofrece «Editar» en las experiencias propias.

## Valoraciones (`valoracionRoutes.js` → `valoracionService`)

Están montadas bajo `/api/experiencias/:id`. Todas comprueban antes que el usuario puede ver la experiencia con `experienciaService.obtenerExperiencia`, así que cualquiera puede responder 404 «Contenido no disponible». Una valoración es `{ id, usuarioId, experienciaId, puntuacion, comentario, creadaEn, actualizadaEn }`.

### `GET /api/experiencias/:id/valoracion`

`valoracionService.obtenerMiValoracion`.

* **Responde:** 200 con mi valoración, o `null` si todavía no la he valorado.

### `PUT /api/experiencias/:id/valoracion`

`valoracionService.valorarExperiencia`.

* **Cuerpo:** `{ puntuacion, comentario? }`. `puntuacion` es un entero del 1 al 5; `comentario`, como mucho 1000 caracteres (se guarda sin espacios exteriores; vacío equivale a `null`).
* **Responde:** 201 si la crea y 200 si actualiza la que ya tenía. Cada usuario tiene como mucho una valoración por experiencia.
* **Errores:** 400 «La puntuación debe ser un número entero del 1 al 5», «El comentario debe ser un texto», «El comentario no puede superar los 1000 caracteres»; 403 «No puedes valorar tu propia experiencia». Ver [F6](flujos.md#f6-valorar).

### `GET /api/experiencias/:id/valoraciones`

`valoracionService.listarValoraciones` · Páginas: sí, 10 por defecto.

* **Responde:** 200 `{ valoraciones, siguiente }`, de la más reciente a la más antigua; cada una con `usuario: { id, nombreUsuario, foto }`.

### `GET /api/experiencias/:id/valoraciones/amigos`

`valoracionService.listarValoracionesRelacionadas` · Páginas: sí, 10 por defecto.

* **Responde:** igual que la anterior, pero solo las de los amigos del usuario de la sesión (amistad aceptada) y las de quienes lo siguen.

## Ciudades (`ciudadRoutes.js` → `ciudadService`)

### `GET /api/ciudades`

`ciudadService.listarCiudades` · Sesión: no.

* **Responde:** 200 `[{ id, nombre, pais }]` ordenadas por nombre. Es el catálogo que carga `npm run db:seed`.

## Usuarios (`usuarioRoutes.js` → `usuarioService`)

### `GET /api/usuarios?texto=`

`usuarioService.buscarUsuarios`.

* **Parámetros:** `texto`, una parte del nombre de usuario.
* **Responde:** 200 `[{ id, nombreUsuario, foto }]`, como mucho 20 y por orden alfabético, sin incluir al propio usuario.
* **Errores:** 400 «Escribe un nombre de usuario para buscar».

### `GET /api/usuarios/:nombreUsuario`

`usuarioService.obtenerPerfilPublico`.

* **Responde:** 200 `{ id, nombreUsuario, foto, ciudad, amigos, seguidores, esPropio, relacion: { amistad, amistadId, siguiendo } }`. Nunca incluye el email.
  * `esPropio`: `true` si es el perfil del propio usuario (la pantalla lo lleva a `perfil.html`).
  * `relacion.amistad`: `ninguna`, `enviada` (la envié yo), `recibida` o `amigos`. Ver [E2](flujos.md#e2-la-relación-vista-desde-el-perfil-de-otro-usuario).
  * `relacion.amistadId`: el id de esa solicitud o amistad, para responderla o eliminarla; `null` si no hay.
  * `relacion.siguiendo`: si el usuario de la sesión lo sigue.
* **Errores:** 404 «Usuario no encontrado».

## Amistades (`amistadRoutes.js` → `amistadService`)

Una amistad es `{ id, solicitanteId, destinatarioId, estado, parejaClave, fecha }`, con `estado` `PENDIENTE` o `ACEPTADA`. Ver [F7](flujos.md#f7-solicitud-de-amistad) y [E1](flujos.md#e1-amistad).

### `POST /api/amistades`

`amistadService.enviarSolicitud`.

* **Cuerpo:** `{ destinatarioId }`.
* **Responde:** 201 con la solicitud, en estado PENDIENTE.
* **Errores:** 400 «No puedes enviarte una solicitud de amistad», «Ya existe una solicitud o amistad entre estos usuarios» (en cualquiera de los dos sentidos); 404 «El usuario no existe».

### `GET /api/amistades/solicitudes`

`amistadService.listarSolicitudesRecibidas`.

* **Responde:** 200 con las solicitudes pendientes recibidas, de la más reciente a la más antigua; cada una con `solicitante: { id, nombreUsuario, foto }`.

### `PATCH /api/amistades/:id`

`amistadService.responderSolicitud`.

* **Cuerpo:** `{ aceptar: true }` o `{ aceptar: false }`.
* **Responde:** 200 con la amistad ya ACEPTADA, o con la solicitud borrada si se rechaza.
* **Errores:** 400 «Indica si aceptas la solicitud con true o false», «La solicitud de amistad ya no está pendiente»; 403 «Solo puedes responder tus solicitudes de amistad»; 404 «La solicitud de amistad no existe».

### `DELETE /api/amistades/:id`

`amistadService.eliminarAmistad`.

* **Responde:** 204. La fila se borra, así que después se puede volver a enviar una solicitud.
* **Errores:** 400 «La relación todavía no es una amistad»; 403 «No puedes eliminar una amistad de otra persona»; 404 «La amistad no existe».

## Seguimientos (`seguimientoRoutes.js` → `seguimientoService`)

Ver [F8](flujos.md#f8-seguir-y-dejar-de-seguir).

### `POST /api/seguimientos`

`seguimientoService.seguirUsuario`.

* **Cuerpo:** `{ seguidoId }`.
* **Responde:** 201 `{ id, seguidorId, seguidoId, fecha }`.
* **Errores:** 400 «No puedes seguirte a ti mismo», «Ya sigues a este usuario»; 404 «El usuario no existe».

### `DELETE /api/seguimientos/:seguidoId`

`seguimientoService.dejarDeSeguir`.

* **Responde:** 204.
* **Errores:** 400 «No puedes dejar de seguirte a ti mismo»; 404 «El usuario no existe» o «No sigues a este usuario».
