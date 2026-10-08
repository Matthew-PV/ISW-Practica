# Modificaciones — PlanB

Registro de los cambios realizados en el proyecto, en orden cronológico.

# Perfiles enlazados y limpieza del proyecto (09/10/2026)

### Perfiles: experiencias al aceptar una amistad y personas enlazadas

- En el perfil de otra persona (`usuario.html`), al aceptar su solicitud de amistad (o al eliminar la amistad), «Sus experiencias» se vuelve a cargar: aparecen al momento las que solo ven sus amigos, sin recargar la página (`recargarExperiencias` de `js/shared/experiencias.js`).
- En «Mi perfil», cada amigo y cada seguidor enlaza a su perfil (`usuario.html?nombre=…`).
- Pruebas jsdom en `experienciasPerfilPantalla.test.js` y `relacionesPantalla.test.js`, que fallaron primero.
- Recorrido completo en un navegador real con dos usuarios: registro y requisitos de la contraseña, experiencias de cada visibilidad, búsqueda, amistad, valoraciones (también en móvil), «Útil» y «Reportar», «Contenido no disponible», cambio y recuperación de la contraseña. Sin fallos. El CAPTCHA de Cloudflare no se resuelve en un navegador sin ventana, así que en ese recorrido los usuarios se crearon directamente en la base de datos.

# Reparación de `main`, limpieza y correcciones de CS-61 (08/10/2026)

El merge de la rama `CS-63` (`9f7b2f3`) llegó a `main` con marcadores de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`) en `experienciaService.js`, `experiencia.html` y `experiencia.js`. El servidor no arrancaba y fallaban 22 de los 50 archivos de prueba. Queda resuelto conservando el trabajo de CS-30 y el de CS-63.

### Cambios realizados

- **Backend:**
  - `experienciaService` vuelve a tener una sola `obtenerExperiencia(usuarioId, experienciaId)`, la de CS-30. Comprueba la sesión y el identificador y responde 404 «Contenido no disponible» si la experiencia no existe o no se puede ver.
  - Se quitan la segunda versión de esa función, la segunda ruta `GET /api/experiencias/:id` (Express nunca llegaba a usarla, porque atiende la primera que coincide) y la importación de errores que no existen.
  - `experienciaRepository.buscarPorId` vuelve a recibir el identificador ya validado por el servicio.
- **`experiencia.html` y `js/experiencia.js` (CS-63):**
  - Queda la versión completa de la rama: lista de valoraciones con aviso de error, «Útil» y «Reportar», y autor y ciudad que funcionan también con experiencias sin autor.
  - «Útil» y «Reportar» funcionan solo en la pantalla: no guardan nada hasta que existan CS-02 y CS-04.
  - Sin el script de Bootstrap desde el CDN, que la política de seguridad de contenidos (CSP) bloquea. La ventana de reporte se abre sin él.
  - Se quitan un `id` repetido, un `</div>` sobrante y un `console.log`.
- **Bienvenida:**
  - «Ver detalle» es un enlace a `experiencia.html?id=…`.
  - Se elimina el diálogo de detalle, con su sección de valoraciones de amigos y seguidores (CS-48), al que ya no se llegaba.
- **Pruebas:**
  - Las 4 pruebas de pantalla del diálogo se sustituyen por una que comprueba el enlace.
  - La prueba de API de una experiencia que no se puede ver espera 404 «Contenido no disponible».
- **Datos privados del autor:** `GET /api/experiencias/:id` enviaba el `email` y el `passwordHash` del autor a cualquiera que pudiera ver la experiencia. `experienciaRepository.buscarPorId` trae ahora el autor solo con `id`, `nombreUsuario` y `foto`. Lo comprueba `tests/mysql/experienciaRepository.test.js`, con MySQL real, porque con el repositorio simulado no se ve qué columnas trae la consulta.
- **`backend/.env.example`:** el merge lo había borrado. Se recupera sin cambios: es la plantilla de `cp .env.example .env` de la puesta en marcha.

### Limpieza del repositorio

- `backend/cookies.txt` deja de estar en Git (era una cookie de sesión de pruebas con curl) y `.gitignore` ignora cualquier `cookies.txt`. Quien lo tenga en local lo conserva.
- Se borran `scripts/inspect_cs30_planning.py` (leía un archivo temporal de un equipo concreto), el `package-lock.json` vacío de la raíz (el del backend sigue en `backend/`) y el archivo de bloqueo de Word `~$-Joaquin.docx`.
- `.gitignore` deja de mencionar `customer-stories/Customer_Stories_PlanB.xlsx`, una ruta que ya no existe.

### TDD y comprobación

- Resolver los marcadores no cambia el comportamiento: la batería pasó de 22 archivos en rojo a todo en verde.
- Enlace de «Ver detalle»: la prueba falló primero por el motivo esperado (`Expected "A"`, `Received "BUTTON"`) y pasó tras convertir el botón en enlace.
- Autor público: las dos pruebas de MySQL fallaron primero porque la respuesta incluía `email` y `passwordHash`, y pasaron tras limitar los campos del autor. `npm run test:mysql` queda con 4 pruebas en verde.

### Pendiente

- CS-48 no tiene pantalla mientras su sección no se añada a `experiencia.html`.
- En CS-63:
  - la lista general usa la ruta de CS-48, así que solo muestra valoraciones de amigos y seguidores;
  - el comentario admite 255 caracteres y no los 1000 acordados;
  - el autor de cada valoración enlaza a `perfil.html?id=`;
  - la fecha no se muestra, porque se lee `creadoEn` y el campo se llama `creadaEn`.

### CS-61: identificadores y respuesta a solicitudes

- **Identificadores:** `services/shared/identificadores.js` (`leerId`) comprueba que un id de la URL o del cuerpo es un entero entre 1 y 2147483647. Si no, responde 400 «El identificador de … no es válido». Antes, `/api/amistades/abc` llegaba a Prisma y respondía 500. La usan los servicios de amistad, seguimiento, experiencia y valoración, que ya no repiten esa comprobación.
- **`aceptar`:** `PATCH /api/amistades/:id` exige `{ "aceptar": true }` o `{ "aceptar": false }`. Cualquier otro valor responde 400 «Indica si aceptas la solicitud con true o false» y la solicitud sigue pendiente. Antes `"si"` la aceptaba, y `1` o la ausencia del campo la borraban.
- **Pruebas:** `tests/identificadores.test.js`, y en `tests/interaccionesCriterio.test.js` los ids no válidos de cada ruta y tres valores de `aceptar` que no son booleanos. Fallaron primero (404 y 200) y pasaron tras el cambio.

### CS-61: peticiones simultáneas

- **Una sola relación por pareja:** `Amistad` tiene el campo nuevo `parejaClave`, la pareja sin orden (`"3-7"` tanto si 3 envió la solicitud a 7 como al revés), único en MySQL. Lo calcula `amistadRepository.crear`. Así, dos solicitudes cruzadas que llegan a la vez dejan una sola relación: la segunda responde 400 «Ya existe una solicitud o amistad entre estos usuarios».
- **Migración `20261008160000_amistad_pareja_clave`:** añade la columna, rellena las filas existentes y, si una base local tuviera ya dos relaciones cruzadas entre la misma pareja, conserva la aceptada o, si están en el mismo estado, la más antigua. Se probó aparte con parejas cruzadas en una base de datos temporal.
- **Sin errores 500 por carreras:** `repositories/shared/carreras.js` (`nullSi`) convierte en `null` los errores de Prisma que solo indican que otra petición se adelantó: P2002 (ya existe) y P2025 (ya no existe). Los servicios responden con un 400 o un 404 claros. Lo usan al seguir, dejar de seguir, crear, aceptar, rechazar y eliminar amistades.
- **Pruebas:**
  - unitarias de cada caso en `amistadService.test.js` y `seguimientoService.test.js`;
  - con MySQL real, `tests/mysql/interaccionesConcurrencia.test.js`: pareja cruzada, dos solicitudes cruzadas simultáneas, diez «seguir» simultáneos (uno 201 y nueve 400, ningún 500) y aceptar o borrar algo que ya no existe.
  - Todas fallaron primero: se creaba la segunda relación, uno de los «seguir» acababa en 500 y P2025 lanzaba un error.

### CS-61: búsqueda de personas

- `GET /api/usuarios?texto=…` exige texto: vacío, con solo espacios o ausente responde 400 «Escribe un nombre de usuario para buscar». Antes devolvía 20 usuarios cualesquiera. El texto se busca sin los espacios de los extremos.
- Los resultados salen ordenados por nombre de usuario (`usuarioRepository.buscarPorNombre`).
- Pruebas: `usuarioService.test.js` (texto recortado y cuatro textos no válidos), `interaccionesCriterio.test.js` (búsqueda sin texto por HTTP) y `tests/mysql/usuarioBusqueda.test.js` (orden con MySQL real). Fallaron primero y pasaron tras el cambio.

### CS-22: descripción de la visibilidad y prueba con MySQL

- Debajo del selector de visibilidad del formulario de la bienvenida aparece una frase que explica la opción elegida («Solo tú puedes verla.», «Solo la ven tus amigos (con la amistad aceptada) y tú.» o «Cualquier usuario puede verla.»). Cambia al elegir otra y, al editar, corresponde a la visibilidad actual. Probado con jsdom: falló primero porque el texto no existía.
- `tests/mysql/experienciaVisibilidad.test.js` recorre el criterio con MySQL real. Una experiencia creada como privada solo la ve su autor. Al editarla a pública, el cambio se conserva al recargar y la ve cualquiera. En «amigos», otro usuario no la ve hasta que la amistad está aceptada. La validación ya existía (trabajo de Matthew): para comprobar que la prueba detecta el fallo, se quitó a propósito la visibilidad de `experienciaRepository.crear`, la prueba falló (`Expected "PRIVADA"`, `Received "PUBLICA"`) y se deshizo el cambio.
- Queda fuera de CS-22: «aparece en mi perfil» depende del listado de CS-44, y «se puede encontrar buscándola», de la búsqueda de experiencias, que todavía no existe.

### CS-44: listado de experiencias de un usuario (backend)

- **Ruta:** `GET /api/experiencias?autor=<nombreUsuario>&despuesDe=<id>&limite=<n>`, con sesión. Responde `{ experiencias, siguiente }`, de la más reciente a la más antigua y con su ciudad.
  - El autor ve todas las suyas, también las privadas. Un amigo con la amistad aceptada ve las de amigos y las públicas. Cualquier otro (también un seguidor o alguien con la solicitud pendiente) ve solo las públicas.
  - Un usuario sin experiencias recibe una lista vacía; uno que no existe, 404 «Usuario no encontrado».
- **Paginación por cursor** (`services/shared/paginacion.js`): el cliente pide los siguientes `limite` (de 1 a 50; 10 por defecto) después del id `despuesDe`. `siguiente` es el valor que debe enviar para la próxima página, o `null` si no hay más. Así no se repite ni se salta nada aunque se publique otra experiencia entre dos peticiones. Además, MySQL no recorre las filas anteriores, como haría con OFFSET.
- **Visibilidad en una sola consulta:** `nivelesVisibles(usuarioId, autorId)` (`services/shared/visibilidad.js`) devuelve los niveles que puede ver el usuario, con la misma regla que `puedeVerExperiencia`, y el repositorio filtra con ellos.
- **Pruebas:**
  - `paginacion.test.js`, `visibilidad.test.js` (también la verificación cruzada de las dos funciones) y `experienciasAutor.test.js` (servicio);
  - con MySQL real, `tests/mysql/experienciasAutor.test.js`: el criterio completo con autor, amigo, seguidor, solicitud pendiente y desconocido, y todas las páginas con una publicación entre medias.
  - Fallaron primero. Se comprobó además que detectan el fallo: sin el filtro de visibilidad fallan 4 pruebas, y sin el cursor, 1.

### CS-44 y CS-62 (objetivo 8): experiencias en los perfiles

- `usuario.html` muestra «Sus experiencias» (las que puedo ver) y `perfil.html`, «Mis experiencias» (también las privadas). Cada una enlaza a `experiencia.html?id=…` y muestra su ciudad y su visibilidad. «Cargar más» añade las siguientes sin repetir ninguna. Sin experiencias se indica la lista vacía, y si la carga falla se ve el error.
- El código común está en `js/shared/experiencias.js` (`mostrarExperienciasDe`). Las dos páginas lo cargan después de `api.js`. En «Mi perfil», si se cambia el nombre de usuario, las páginas siguientes se piden con el nombre nuevo.
- Pruebas: `experienciasPerfilPantalla.test.js` (jsdom), que falló primero porque el módulo no existía. Las pruebas de pantalla de `usuario.html` y `perfil.html` cargan ahora también ese script. En `usuarioPantalla.test.js`, el listado es la segunda petición al abrir la página, así que las peticiones de las acciones pasan a la posición siguiente.
- Pendiente de comprobar a mano en el navegador, en escritorio y móvil.

### CS-45: listas de amigos y seguidores por cursor

- **Por qué:** con páginas numeradas (`?pagina=2`), si llegaba un amigo o un seguidor entre la carga de la primera página y «Cargar más», la lista se desplazaba y una persona salía repetida. Se comprobó con MySQL real: con 26 seguidores, la segunda página traía 6 personas y repetía la última de la primera. Eso incumple «sin repetir personas» del criterio.
- **Ahora:** `GET /api/perfil/amigos` y `/api/perfil/seguidores` aceptan `?despuesDe=<id>&limite=<n>` (20 por defecto, de 1 a 50) y responden `{ personas, siguiente }`, con la misma paginación común que CS-44. Ya no devuelven `pagina`, `limite` ni `total`: los contadores siguen saliendo de `/api/perfil/resumen`. `perfil.js` pide «Cargar más» con el `siguiente` de la página anterior.
- **Al aceptar una solicitud** en «Mi perfil», el contador de amigos y la lista de amigos se actualizan en la misma página. Antes había que recargarla.
- **Pruebas:**
  - `tests/mysql/relacionesPerfil.test.js`: todas las páginas, con un alta entre medias, sin repetir ni saltar a nadie, para amigos y para seguidores. Falló primero porque la respuesta no traía `siguiente`.
  - Las pruebas de CS-45 (servicio, rutas, repositorio, criterio y pantalla) usan ahora la forma nueva de pedir y de responder. Siguen protegiendo lo mismo: ceros sin error, pendientes y rechazadas que no cuentan, subidas y bajadas de uno, sin emails y sin repetidos.
  - En `relacionesPantalla.test.js`, una prueba nueva de los contadores tras aceptar, que falló primero (se quedaba en 0). En `solicitudesPantalla.test.js`, la petición de aceptar se busca por su ruta, porque ya no es la última.

### CS-01 y CS-48: «Contenido no disponible» y comentario de hasta 1000 caracteres

- Valorar (`PUT /api/experiencias/:id/valoracion`) y consultar las valoraciones de amigos y seguidores responden 404 «Contenido no disponible» si la experiencia no existe o no se puede ver, igual que su detalle (CS-30). Antes respondían «La experiencia no existe» o un 403 «No tienes permiso…», que revelaba que existía. Las dos pasan por `experienciaService.obtenerExperiencia`.
- El comentario se guarda sin los espacios de los extremos y normalizado a NFC (una letra con tilde se guarda siempre como un solo carácter). Solo con espacios cuenta como sin comentario, y más de 1000 caracteres responden 400 «El comentario no puede superar los 1000 caracteres». Antes no tenía límite.
- Pruebas: cuatro casos nuevos del comentario en `valoracionService.test.js`. Los mensajes y el 403 de las pruebas de CS-01 y CS-48 pasan al 404 acordado. Fallaron primero y pasaron tras el cambio.

### CS-63 y CS-48: rutas de las valoraciones de una experiencia

- Las rutas de valoraciones se montan en `/api/experiencias/:id` y cada una está escrita entera en `valoracionRoutes.js`:
  - `GET /valoracion`: mi valoración, o `null` si todavía no he valorado. Sustituye a `/valoracion/mia`, que respondía 404.
  - `PUT /valoracion`: valorar, sin cambios.
  - `GET /valoraciones?despuesDe=&limite=`: todas, por páginas (10 por defecto), con el autor público y la fecha.
  - `GET /valoraciones/amigos?despuesDe=&limite=`: las de amigos (amistad aceptada, en cualquier sentido) y de quienes me siguen. Sustituye a `GET /valoracion?pagina=…`, que era la ruta de CS-48.
- Las tres consultas responden 404 «Contenido no disponible» si la experiencia no existe o no se puede ver, y los listados responden `{ valoraciones, siguiente }` con la paginación por cursor común.
- **CS-48 en una sola consulta:** el filtro de amigos y seguidores va dentro de la consulta de valoraciones (`valoracionRepository.listarDeRelacionados`). Ya no se cargan en memoria todos los ids de amigos y seguidores para luego buscar con un `IN`. Se eliminan `listarAmigosIds`, `listarSeguidoresIds` y `listarDeUsuarios`, que se quedan sin uso.
- **Pruebas:**
  - El criterio de CS-48 y CS-63 se prueba con MySQL real en `tests/mysql/valoracionesExperiencia.test.js`. Ahí está el filtro: amigos en los dos sentidos y seguidores sí; a quien sigo, solicitudes pendientes y desconocidos no. También sección vacía, valoración nueva, páginas, lista general sin emails, mi valoración y el 404.
  - `valoracionesRelacionadasCriterio.test.js` se elimina: simulaba en memoria ese mismo filtro, y repetirlo en la simulación no demostraría nada. Sus escenarios están en la prueba de MySQL.
  - `valoracionService.test.js` y `valoraciones.test.js` prueban las reglas y las rutas nuevas con repositorios simulados.
  - Las pruebas nuevas fallaron primero. Quitando a propósito la condición «me sigue» del filtro, la prueba de MySQL falla.

### CS-63, CS-48 y CS-30 (objetivo 9): página de una experiencia

Sobre la página de José (`experiencia.html` y `js/experiencia.js`):
- **Cabecera:** el autor enlaza a su perfil (`usuario.html?nombre=…`, o «Mi perfil» si es el mío; CS-62, objetivo 10).
- **«Valoraciones y comentarios»:** se piden a `GET /valoraciones`, así que salen todas y no solo las de amigos. Cada una lleva el autor enlazado, la puntuación, el texto y la fecha, que antes no aparecía porque el campo es `creadaEn`. «Cargar más» usa el cursor y no repite ninguna.
- **«Valoraciones de amigos y seguidores» (CS-48):** sección propia con su «Cargar más» y su aviso de lista vacía.
- **Formulario:**
  - comentario de hasta 1000 caracteres, con el contador «n / 1000» que avisa al acercarse;
  - mi valoración se precarga con `GET /valoracion`;
  - no se envía sin una puntuación entera del 1 al 5;
  - si falla la red, se muestra el error y no se borra lo escrito.
- **«Contenido no disponible»:** se reconoce por el código 404 y no por el texto del mensaje. Se borran el título, el autor, la ciudad, la descripción y las listas, también si la experiencia deja de estar disponible mientras se ve (CS-30, objetivo 9).
- **«Útil» y «Reportar»** se quedan como estaban: funcionan solo en la pantalla hasta CS-02 y CS-04.
- **`js/shared/api.js`:** el error que lanza lleva ahora el código HTTP en `status`.
- **Pruebas:** `experienciaDetallePantalla.test.js` (jsdom), una por cada frase del criterio de CS-63, más la sección de CS-48 y el objetivo 9 de CS-30. Fallaron primero 19 de 21. Las dos pruebas de José (`experienciaPantalla.test.js`) siguen pasando.
- Pendiente: la comprobación manual en el navegador, en escritorio y móvil, con dos usuarios.

### CS-30: pruebas de acceso por API (objetivos 7 y 8)

- `tests/mysql/accesoExperiencia.test.js` recorre con MySQL real los cinco casos del objetivo 7: pública de otro (200), privada propia (200), privada ajena (404 «Contenido no disponible», sin datos), de amigos con la solicitud pendiente (404) y con la amistad aceptada (200).
- Recorre también los tres cambios del objetivo 8, con la misma petición antes y después: una pública que pasa a privada, una amistad aceptada que se elimina y una solicitud pendiente que se acepta.
- La regla ya estaba implementada (trabajo de Matthew). Para comprobar que las pruebas detectan un fallo, se hizo que una solicitud pendiente contara como amistad: fallaron 3 y se deshizo el cambio.

### CS-64: contraseña segura en el registro (objetivos 1 a 3)

- `services/shared/password.js` (`validarPassword`) exige entre 8 y 72 bytes, al menos una mayúscula, una minúscula y un número, y que no contenga el nombre de usuario (sin distinguir mayúsculas). Si falla, responde 400 con los requisitos que no se cumplen, por ejemplo «La contraseña no cumple estos requisitos: al menos un número.». Se aplica en el registro y se aplicará igual al cambiarla y al restablecerla.
- `registro.html` muestra los cinco requisitos debajo de la contraseña y los marca (✓) mientras se escribe, también al cambiar el nombre de usuario. El código está en `js/shared/password.js`, para reutilizarlo en las otras pantallas de CS-64.
- **Pruebas:**
  - `password.test.js`: cada requisito, varios a la vez y los límites de 7, 8, 72 y 73 bytes, también con letras de dos bytes;
  - en `validacion.test.js`, tres contraseñas débiles en el registro;
  - en `registroPantalla.test.js`, la lista y su marcado.
  - Las pruebas que registraban usuarios con `secreta123`, que ya no es válida porque no tiene mayúscula, usan `Secreta123`; las de inicio de sesión no cambian.
  - `tests/setup.js` añade `TextEncoder` al navegador simulado (jsdom no lo trae, pero los navegadores sí).

### CS-64: cambiar la contraseña desde el perfil (objetivos 4 a 7)

- **API:** `PUT /api/perfil/password` con `{ actual, nueva }` y sesión. Si la actual no es correcta, responde 400 «La contraseña actual no es correcta» y no cambia nada. La nueva cumple las mismas reglas que en el registro. Si todo va bien, responde 204 y solo se guarda el hash (`usuarioRepository.actualizarPassword`). Tiene su propio límite de 10 intentos fallidos cada 15 minutos (`limiteCambioPassword`).
- El cifrado con bcrypt está ahora en `services/shared/password.js` (`cifrarPassword`), común al registro y al cambio.
- **Pantalla:** «Mi perfil» tiene el formulario «Cambiar contraseña» (actual, nueva y repetida), con los requisitos marcados mientras se escribe. Si las dos nuevas no coinciden, se avisa sin enviar nada. Si el servidor la rechaza, se ve su mensaje y no se borra lo escrito.
- **Pruebas:**
  - `cambioPassword.test.js`, con repositorio en memoria y bcrypt real: el criterio completo, incluido que el login funciona con la nueva y falla con la antigua;
  - `limiteCambioPassword.test.js`: 11 intentos fallidos → 429; va en su propio archivo para que el límite de login no le impida iniciar sesión;
  - `cambioPasswordPantalla.test.js` (jsdom).
  - Fallaron primero. Las pruebas que cargan `perfil.js` cargan también `js/shared/password.js`.

### CS-64: recuperar la contraseña por email (objetivos 8 a 15)

- **Modelo `TokenRecuperacion`** (migración `20261008200000_token_recuperacion`): usuario, `tokenHash` (SHA-256 del token, único), `caducaEn`, `usadoEn` y `creadoEn`. En la base de datos nunca está el token del enlace, solo su hash.
- **Email:** `repositories/emailRepository.js` envía con Nodemailer (dependencia nueva) si `.env` tiene `SMTP_URL`. Si no, escribe el email con el enlace en la consola del servidor, que basta para desarrollo. `.env.example` explica `SMTP_URL`, `EMAIL_REMITENTE` y `URL_APP`. Falta que el equipo elija proveedor y ponga su `SMTP_URL`.
- **`POST /api/auth/recuperar`** `{ email }`: responde siempre lo mismo, exista o no el email. Si existe, crea un token aleatorio de 32 bytes que caduca a los 30 minutos y envía el enlace `restablecer.html?token=…`. El envío no se espera, para que la respuesta no tarde más cuando el email existe.
- **`POST /api/auth/restablecer`** `{ token, nueva }`:
  - la nueva cumple las mismas reglas que en el registro; si no las cumple, no cambia nada y el enlace sigue sirviendo;
  - el enlace se consume en una transacción, con un UPDATE que solo funciona si sigue sin usar y sin caducar: con dos peticiones simultáneas, solo una cambia la contraseña;
  - un enlace usado, caducado o inventado responde 400 «El enlace no es válido o ha caducado».
- Las dos rutas comparten un límite de 10 peticiones cada 15 minutos por IP (`limiteRecuperacion`).
- **Pantallas:** `recuperar.html` y `restablecer.html` (con los requisitos marcados mientras se escribe), y el enlace «¿Has olvidado tu contraseña?» en el inicio de sesión.
- **Pruebas:**
  - `tests/mysql/recuperacionPassword.test.js`: la misma respuesta con y sin cuenta, solo el hash en la base de datos, caducidad de 30 minutos, un solo uso (después el login funciona con la nueva y falla con la antigua), enlace caducado o inventado, contraseña débil y dos restablecimientos simultáneos;
  - `recuperacionService.test.js`: no se espera al envío, y un fallo del envío no rompe la petición;
  - `limiteRecuperacion.test.js`: 11 peticiones → 429;
  - `recuperacionPantalla.test.js` (jsdom).
  - Fallaron primero. Quitando a propósito la condición «sin usar» del consumo del enlace, fallan dos pruebas de MySQL.

### Para quien continúe

- Tras el `git pull`, desde `backend/`: `npm install` (llega `nodemailer`) y aplicar las migraciones nuevas con `npx prisma migrate deploy` y `npx prisma generate`.
- Para la recuperación de contraseña, añadir a `.env` las variables nuevas de `.env.example`. Sin `SMTP_URL`, el enlace aparece en la consola del servidor.

### Cómo comprobarlo

```bash
cd backend
npm test            # todas las pruebas, sin base de datos
npm run test:mysql  # con Docker en marcha: autor público y peticiones simultáneas
npm run dev     # bienvenida → «Ver detalle» abre experiencia.html
```

# Guía de aprendizaje atemporal — Documentado (07/10/2026)

Se revisó `documentacion/hoja-ruta-aprendizaje.md` para que sirva a cualquier integrante y pueda seguirse sin un calendario ni una revisión concreta. Nueve módulos explican fundamentos de programación, Git, interfaz, HTTP, arquitectura, datos, seguridad, TDD y configuración/despliegue. Cada uno incluye un laboratorio independiente, una búsqueda del concepto en el PlanB vigente y una comprobación de comprensión. La práctica final recorre una funcionalidad desde el criterio actual hasta su prueba y resultado visible. Las herramientas actuales se presentan como ejemplos, con indicaciones para encontrar sus equivalentes si cambia la implementación. Se actualizó la descripción de la guía en el README y se registró el prompt de Matthew en `documentacion/prompts/matthew.md`.

# Cambios del día (07/10/2026)

Se ha trabajado de forma incremental en la historia CS-30 y en la validación del cierre de CS-22, manteniendo el alcance de un objetivo a la vez y dejando constancia de cada paso en la documentación y en las pruebas.

### CS-22: cierre de visibilidad de experiencias
- **Objetivo 4:** se validó y persistió `visibilidad` en la creación y edición de experiencias, aceptando solo `PRIVADA`, `AMIGOS` y `PUBLICA` con valor por defecto `PUBLICA`.
- **Objetivo 5:** se añadió el selector visual de visibilidad al formulario de experiencia y se comprobó en pantalla que incluye las tres opciones y conserva el valor al editar.
- **Objetivo 6:** se validó que el valor seleccionado se envía junto con la petición de creación/edición.
- **Objetivo 7:** se confirmó que al abrir una experiencia en edición el selector se rellena con la visibilidad actual y que el valor se conserva al guardar.

### CS-30: acceso a experiencias según visibilidad
- **Objetivo 1:** se fijó la matriz de acceso: la experiencia pública la ve cualquiera; la privada la ve solo el autor; la de amigos la ve solo quien tiene amistad aceptada.
- **Objetivo 2:** se reforzó la prueba unitaria que cubre los casos clave del servicio compartido.
- **Objetivo 3:** se verificó que la regla ya estaba implementada en `services/shared/visibilidad.js` y reutiliza `amistadService.sonAmigos` sin consultar Prisma directamente.
- **Objetivo 4:** se añadió `obtenerExperiencia(usuarioId, experienciaId)` en el servicio y la ruta `GET /api/experiencias/:id` con sesión requerida, devolviendo la experiencia solo si existe y es visible.
- **Objetivo 5:** se unificó el mensaje de respuesta para ocultar la causa real: si la experiencia no existe o no es visible, la API devuelve `Contenido no disponible` con estado 404.

### Verificación
- `backend/tests/visibilidad.test.js` quedó en verde con la matriz de acceso.
- `backend/tests/experienciaObjetivos.test.js` quedó en verde con la validación del detalle de experiencia y el mensaje unificado de acceso.

# CS-62: perfil de otro usuario — Finalizada (08/10/2026)

Se puede abrir el perfil de otra persona en `usuario.html?nombre=<nombreUsuario>`, ver su foto, nombre, ciudad y contadores de amigos y seguidores, y gestionar la amistad y el seguimiento sin recargar la página. Los objetivos 1 a 7, 9, 11 y 12 los hizo Flavia; el 8 y el 10 los cubrieron otras personas al construir sus historias (ver «Objetivos cubiertos por otras historias»).

### Cambios realizados

- **Repositorios:** `usuarioRepository.obtenerPerfilPublico` busca por nombre de usuario y devuelve solo `id`, `nombreUsuario`, `foto` y `ciudad`, nunca el email. `amistadRepository.contarAmigos` cuenta solo las amistades aceptadas, en cualquier sentido. `seguimientoRepository.contarSeguidores` cuenta quién sigue a un usuario.
- **Servicio:** `perfilService.obtenerPerfilPublico(usuarioId, nombreUsuario)` devuelve `{ id, nombreUsuario, foto, ciudad, amigos, seguidores, esPropio, relacion }`. `foto` lleva la imagen por defecto si no hay ninguna. `esPropio` compara ids, así que escribir el propio nombre con otras mayúsculas también cuenta. `relacion.amistad` es `ninguna`, `enviada`, `recibida` o `amigos`; `relacion.amistadId` es el id de esa solicitud o amistad (`null` si no hay) y `relacion.siguiendo` indica si ya se sigue. Si el usuario no existe lanza un error 404 «Usuario no encontrado».
- **API:** nueva ruta `GET /api/usuarios/:nombreUsuario` en `usuarioRoutes.js` (archivo de CS-61), protegida por `requiereSesion`. El id del usuario sale siempre de la sesión.
- **Interfaz:** `usuario.html` y `js/usuario.js`. Según la relación muestra «Añadir amigo», «Solicitud enviada» (desactivado), «Aceptar» y «Rechazar», o «Eliminar amigo» (pide confirmación con `confirm()`), y aparte «Seguir» o «Dejar de seguir». Tras cada acción vuelve a pedir el perfil, por lo que botones y contadores se actualizan sin recargar. Los errores del servidor se muestran en una caja roja. Si el usuario no existe aparece «Usuario no encontrado» y, si es el propio usuario, se redirige a `perfil.html`. Los textos se insertan con `textContent`.
- **Pruebas:** `perfilPublicoRepository`, `contadoresRepository`, `perfilPublicoService`, `perfilPublicoRoutes`, `perfilPublicoApi` y `usuarioPantalla` (esta con jsdom). Cubren los campos devueltos, la ausencia del email, el 404, cada estado de la relación, cada botón y su efecto, los errores del servidor, la confirmación cancelada o aceptada, el usuario inexistente y el perfil propio.
- **Comprobación manual:** con servidor, MySQL y navegador reales, y dos usuarios de prueba, se comprobaron todos los estados de los botones en escritorio (1280 px), tablet (768 px) y móvil (375 px), la persistencia al recargar y el recorrido desde «Buscar personas» hasta el perfil.

### Objetivos cubiertos por otras historias

- **Objetivo 8** (listado de sus experiencias visibles para mí): lo resolvió Joaquín con CS-44 (`GET /api/experiencias?autor=`, `js/shared/experiencias.js` y la sección «Sus experiencias» de `usuario.html`). Respeta la visibilidad: las públicas las ve cualquiera, las de «amigos» solo quien tiene una amistad aceptada con el autor, y las privadas nunca.
- **Objetivo 10:** el enlace desde la búsqueda de personas lo hizo Matthew en CS-61 (`personas.js`), y el enlace desde el autor de cada experiencia lo hizo Joaquín en `experiencia.html` (CS-63).
- Comprobado el 08/10/2026 con servidor y datos reales: sin relación con el autor solo se ve su experiencia pública; siendo amigos se ve también la de amigos, y la privada nunca. Desde una experiencia, el autor enlaza a su perfil.
- Sin comprobar: el aspecto visual de la ventana de `confirm()`, que el navegador integrado de la herramienta no muestra.

### Para quien continúe

- `GET /api/usuarios/:nombreUsuario` captura cualquier segmento. Si se añaden más rutas `GET` bajo `/api/usuarios`, hay que declararlas antes que ella.
- `js/shared/api.js` solo lanza el mensaje del error, no su código HTTP. `usuario.js` reconoce el 404 por el texto «Usuario no encontrado»; si se cambia el mensaje del servicio hay que cambiarlo también allí, o hacer que `api.js` añada el código al error.
- `contarAmigos` y `contarSeguidores` se pueden reutilizar en CS-45.
- Para añadir al perfil otras acciones, reutilizar `crearBoton` y `actuar` de `usuario.js`.
- Tras un `git pull` conviene ejecutar también `npm install` (CS-64 añadió `nodemailer`; sin él fallan 20 suites) y `npm run db:seed` si `/api/ciudades` devuelve una lista vacía (sin ciudades no se pueden crear experiencias).
- Tras un `git pull` que traiga migraciones hay que ejecutar `npx prisma migrate deploy` y `npx prisma generate` en `backend/`. Sin las migraciones de visibilidad y valoraciones, la bienvenida da «Error interno del servidor».

### Cómo comprobarlo

```bash
cd backend
npm test
```

Resultado esperado el 08/10/2026: 61 suites y 561 pruebas correctas. Para la comprobación manual: `docker compose up -d`, `npm run dev`, iniciar sesión, abrir «Buscar personas», buscar a otro usuario y pulsar su nombre.

# Excel de historias: cambios de OneDrive y CS-64 para José — Documentado (07/10/2026)

La copia de OneDrive descargada hoy no tenía las correcciones del 06/10 (fila «Total», números de objetivo con fórmula, tiempo total sin duplicar). Se ha partido del libro corregido del repositorio y se le han añadido los cambios que el equipo hizo en OneDrive desde la última descarga:

- **CS-45:** objetivos 1 a 5 finalizados, objetivo 2 a nombre de Flavia y sus tiempos.
- **CS-48:** objetivos 3 a 10 finalizados, objetivos 7 a 10 a nombre de Jorge y sus tiempos.
- **CS-61:** objetivos 12 a 16 finalizados y sus tiempos.
- **CS-62:** objetivo 12 finalizado, objetivos 8 y 11 marcados «No» y tiempos corregidos de los objetivos 5 y 12.
- **CS-64:** los 15 objetivos, a nombre de José, con su tiempo estimado (340 min en total). El Tiempo estimado de la historia en el Índice pasa de 0,5 h a 6 h. Aún no tienen tiempo real, porque ninguno está empezado.

Hay que subir esta versión a OneDrive para sustituir la actual.

Al subirla, Excel para la web reparó el libro («Removed Part: Data store»): quitó el vínculo con el botón «Crear páginas» y los enlaces del Índice y de las páginas dejaron de responder. Por eso:

- `documentacion/office-scripts/crearPaginas.ts` rehace ahora también el enlace «↑ Índice» de cada página y de la Plantilla, además de los del Índice. Pulsar el botón repara todos los enlaces. Después de crear el enlace vuelve a poner la letra en blanco y negrita, porque Excel la pone azul y no se leía sobre el fondo azul de la fila. Para aplicarlo hay que sustituir el código del script «Crear páginas» en Excel para la web y pulsar el botón otra vez.
- El enlace de CS-60 mostraba el título antiguo, «METODOLOGÍA». Ahora muestra el actual, «ORGANIZACIÓN INTERNA».
- `metodologia.md` (sección 3.3) explica cómo reparar los enlaces.

Se ha borrado `documentacion/customer-stories/~$Customer_Stories_PlanB.xlsx`. Era un archivo de bloqueo del 25/09: Excel lo crea mientras alguien tiene el libro abierto y lo borra al cerrarlo, pero este se había subido a Git y hacía parecer que el libro seguía abierto. `.gitignore` ignora ahora cualquier archivo de bloqueo de Office (`~$*`) o de LibreOffice (`.~lock.*#`) en cualquier carpeta. La regla anterior apuntaba a la ruta antigua `customer-stories/` y ya no tenía efecto.

# CS-30: acceso a experiencias según visibilidad — objetivo 1 (07/10/2026)

Se ha dejado fijada la matriz de acceso a experiencias según visibilidad y amistad aceptada. La regla compartida ya existía en CS-22 y se ha consolidado con pruebas que describen los casos de negocio del objetivo 1.

### Cambios realizados

- **Pruebas de acceso:** `backend/tests/visibilidad.test.js` añade la matriz de casos para `PUBLICA`, `AMIGOS` y `PRIVADA`, incluyendo el autor y el requisito de amistad aceptada.
- **Contrato del negocio:** la regla queda definida como: el autor siempre puede verla; pública la ve cualquiera; privada solo la ve el autor; de amigos solo la ve quien tiene amistad aceptada con el autor.

### TDD y comprobación

Se añadieron pruebas que caracterizan el comportamiento ya implementado y validan la matriz de acceso. `npm test -- --runInBand tests/visibilidad.test.js` quedó en verde sin cambiar la lógica de negocio del servicio compartido.

# CS-30: acceso a experiencias según visibilidad — objetivo 2 (07/10/2026)

Se ha reforzado la especificación unitaria de la lógica de visibilidad con una prueba base que cubre los casos críticos del acceso a experiencias. La historia sigue centrada en el servicio compartido y no cambia la implementación existente.

### Cambios realizados

- **Pruebas unitarias:** `backend/tests/visibilidad.test.js` incorpora la batería del objetivo 2 para `PUBLICA`, `AMIGOS` y `PRIVADA`, con el caso del autor y la necesidad de amistad aceptada.
- **Cobertura del contrato:** la prueba fija que la decisión de acceso depende tanto del nivel de visibilidad como de la relación con el autor.

### TDD y comprobación

Se añadió la prueba como contrato del comportamiento esperado y quedó en verde. `npm test -- --runInBand tests/visibilidad.test.js` pasó correctamente.

# CS-30: acceso a experiencias según visibilidad — objetivo 3 (07/10/2026)

El objetivo 3 ya estaba resuelto por la implementación compartida de CS-22. La lógica de acceso vive en `backend/src/services/shared/visibilidad.js` y delega la comprobación de amistad a `amistadService.sonAmigos`, sin tocar Prisma ni duplicar la regla en cada flujo.

### Verificación realizada

- **Servicio compartido:** `puedeVerExperiencia(usuarioId, experiencia)` decide entre autor, pública, privada y amistades aceptadas.
- **Cobertura de prueba:** `backend/tests/visibilidad.test.js` sigue validando los mismos casos de acceso y quedó en verde con la suite actual.

No se necesita cambio funcional adicional porque la regla ya está implementada y reutilizada.

# CS-30: acceso a experiencias según visibilidad — objetivo 4 (07/10/2026)

Se ha añadido la consulta por id de una experiencia con sesión validada y comprobación de visibilidad antes de devolver el dato. La ruta ya protegida reutiliza la regla compartida sin duplicar la lógica.

### Cambios realizados

- **Servicio:** `backend/src/services/experienciaService.js` incorpora `obtenerExperiencia(usuarioId, experienciaId)` y valida sesión, identificador y acceso visible.
- **Ruta:** `backend/src/routes/experienciaRoutes.js` expone `GET /api/experiencias/:id` con `requiereSesion`.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` cubre caso visible, inexistente y sin permiso.

### TDD y comprobación

Se escribió primero la prueba que fallaba por la ausencia de la función; luego se implementó la comprobación y quedó en verde con `npm test -- --runInBand tests/experienciaObjetivos.test.js`.

# CS-30: acceso a experiencias según visibilidad — objetivo 5 (07/10/2026)

Se ha unificado el mensaje de respuesta cuando la experiencia no existe o el usuario no puede verla. En ambos casos la API responde con el mismo texto `Contenido no disponible` y el mismo estado 404 para no revelar la causa real del bloqueo.

### Cambios realizados

- **Servicio:** `backend/src/services/experienciaService.js` hace que la comprobación de ausencia o visibilidad insuficiente termine en `crearError('Contenido no disponible', 404)`.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` exige el mismo mensaje tanto para la experiencia inexistente como para la no visible.

### TDD y comprobación

Se actualizó la prueba de los casos de acceso para reflejar el contrato del objetivo 5 y se ejecutó con éxito. La suite queda en verde con `npm test -- --runInBand tests/experienciaObjetivos.test.js`.

# CS-48: valoraciones de amigos y seguidores — Finalizada (06/10/2026)

Se ha añadido la consulta por id de una experiencia con comprobación de sesión y de visibilidad antes de devolver el dato. La ruta real requiere autenticación y reutiliza la regla compartida de `puedeVerExperiencia` sin duplicar la lógica de negocio.

### Cambios realizados

- **Servicio:** `backend/src/services/experienciaService.js` incorpora `obtenerExperiencia(usuarioId, experienciaId)`, validando la sesión, el identificador y la existencia de la experiencia; si no se puede ver, responde 403 y si no existe, 404.
- **Ruta:** `backend/src/routes/experienciaRoutes.js` añade `GET /api/experiencias/:id` protegido por `requiereSesion` y devuelve la experiencia solo cuando pasa la autorización.
- **Pruebas:** `backend/tests/experienciaObjetivos.test.js` añade la regresión para una experiencia visible, una inexistente y una no autorizada.

### TDD y comprobación

Se escribió primero la prueba que fallaba porque la función de detalle no existía. Tras implantar la consulta y la comprobación de visibilidad, `npm test -- --runInBand tests/experienciaObjetivos.test.js` quedó en verde.

# CS-48: valoraciones de amigos y seguidores — Finalizada (06/10/2026)

Se ha implementado la consulta y presentación diferenciada de las valoraciones realizadas por amigos o seguidores del usuario que consulta una experiencia. La funcionalidad reutiliza las relaciones de CS-61 y la regla compartida de visibilidad de experiencias.

### Cambios realizados

- **Consulta de valoraciones:** `valoracionRepository.listarDeUsuarios(experienciaId, usuarioIds, pagina, limite)` filtra por experiencia y por los usuarios relacionados, devuelve únicamente datos públicos del autor de cada valoración, calcula el total y pagina con un orden estable por última actualización e identificador. Si no hay usuarios relacionados devuelve una lista vacía sin consultar MySQL.
- **Amigos y seguidores:** `amistadRepository.listarAmigosIds` obtiene solo amistades aceptadas, independientemente de quién inició la solicitud. `seguimientoRepository.listarSeguidoresIds` obtiene a quienes siguen al solicitante (registros donde el solicitante es el usuario seguido).
- **Servicio:** `valoracionService.listarValoracionesRelacionadas` valida sesión, identificador de experiencia y paginación; devuelve 404 si la experiencia no existe y 403 si existe pero no es visible; obtiene amigos y seguidores en paralelo, elimina duplicados con un `Set` y delega la consulta paginada al repositorio.
- **API:** `GET /api/experiencias/:id/valoracion`, protegido por sesión, acepta `pagina` y `limite` opcionales y devuelve `{ valoraciones, total, pagina, limite }`.
- **Pantalla:** `frontend/bienvenida.html` y `frontend/js/bienvenida.js` incorporan «Ver detalle» junto a «Editar». El detalle abre un `<dialog>` con una sección propia «Valoraciones de amigos y seguidores», muestra nombre, puntuación y comentario, presenta un mensaje vacío cuando no hay resultados y permite avanzar o retroceder por páginas cuando existen más de diez valoraciones.
- **Actualización al recargar:** cada vez que se vuelve a abrir el detalle se consulta de nuevo la API, por lo que una valoración recién añadida aparece sin conservar una copia obsoleta en el navegador.
- **Pruebas:** se ampliaron las pruebas de repositorios, servicio y API; `bienvenidaPantalla.test.js` comprueba la sección, estado vacío, edición separada, paginación y recarga; `valoracionesRelacionadasCriterio.test.js` ejecuta rutas y servicios reales con repositorios en memoria y demuestra que aparecen amigos y seguidores, se excluyen terceros, se respeta el 403 de visibilidad, el vacío no da error, una nueva valoración aparece en la siguiente consulta y sin sesión se responde 401.
- **Comprobación manual:** la sección se revisó en Chrome tanto en escritorio como en vista móvil de 375 px. Durante la primera ejecución real se detectó que el cliente Prisma local no estaba regenerado y `prisma.amistad` era `undefined`; tras `npx prisma generate` la pantalla funcionó sin modificar el código.

### TDD y trazabilidad

Las pruebas finales cubren los criterios de CS-48, pero durante esta implementación no se siguió de forma estricta el orden rojo → verde en todos los objetivos. En particular, algunos objetivos del Excel que indicaban «crear primero las pruebas» terminaron con pruebas añadidas después de la implementación. No se reconstruye una evidencia de fallo inicial que no se conservó. El detalle del trabajo asistido por IA y de esta desviación queda registrado en `documentacion/prompts/jorge.md`.

Los commits principales son `8822291`, `1d3f216`, `e4db6d7`, `d715051`, `699f011`, `73313fd`, `90d93aa`, `667ef6c` y `9f4fb51`. Los dos primeros se hicieron antes de acordar la convención de incluir `CS-48 - Objetivo X` en el mensaje.

### Para quien continúe

- La unión considera **amigos aceptados** y **seguidores del solicitante**; un mismo usuario presente en ambos grupos solo se consulta una vez.
- Mantener el filtrado y la autorización en backend. La sección del frontend no debe decidir por sí sola quién puede ver una experiencia.
- La sección visual está integrada actualmente en el detalle abierto desde `bienvenida.html`. Si otra historia crea un detalle general de publicaciones o experiencias, debe reutilizar la misma API y no duplicar la regla de negocio.
- Después de recibir cambios de Prisma mediante `git pull`, ejecutar desde `backend/` tanto `npx prisma migrate deploy` como `npx prisma generate` antes de probar la aplicación.
- La configuración local utilizada por Jorge para evitar un conflicto de puerto MySQL no forma parte del repositorio ni debe trasladarse a `docker-compose.yml`.

### Cómo comprobarlo

Desde `backend/`:

```powershell
npm.cmd test -- bienvenidaPantalla.test.js valoracionesRelacionadasCriterio.test.js --runInBand
npm.cmd test -- --runInBand
```

Para la comprobación manual, arrancar MySQL y PlanB, iniciar sesión, abrir «Ver detalle» en una experiencia y revisar la sección de valoraciones. Comprobar también la vista móvil desde las herramientas de desarrollo del navegador.

# CS-22: visibilidad de experiencias — Finalizada (07/10/2026)

Se ha completado la historia CS-22: cada experiencia puede declararse como `PRIVADA`, `AMIGOS` o `PUBLICA`, el valor por defecto queda en `PUBLICA` para conservar las experiencias existentes y la pantalla de creación/edición refleja y guarda ese valor.

### Cambios realizados

- **Datos y migración (objetivo 3):** el enum `Visibilidad` y el campo `visibilidad` en `Experiencia` quedaron añadidos en el esquema de Prisma y la migración `20261006093106_visibilidad_experiencia` usa `DEFAULT 'PUBLICA'`, así que las experiencias ya creadas siguen visibles sin necesidad de limpieza manual.
- **Validación y persistencia (objetivo 4):** `validarCreacion` y `validarEdicion` de `experienciaService.js` aceptan solo los tres valores permitidos, normalizan a mayúsculas, devuelven 400 si el valor no es válido y el repositorio persiste `visibilidad` al crear o actualizar la experiencia.
- **Pruebas de pantalla (objetivo 5):** `bienvenidaPantalla.test.js` comprueba que el formulario de experiencia incluye el selector de visibilidad, con las tres opciones y el valor por defecto `PUBLICA`, y que al editar mantiene el valor actual.
- **Formulario y envío (objetivo 6):** el selector se añadió en `frontend/bienvenida.html` y el formulario envía el valor elegido en la petición `POST`/`PATCH`.
- **Edición y conservación (objetivo 7):** `abrirFormulario` en `frontend/js/bienvenida.js` rellena el selector con la visibilidad actual de la experiencia y conserva el valor al volver a abrir el formulario.
- **Pruebas automáticas:** `experienciaValidacion.test.js` cubre la validación del campo y `bienvenidaPantalla.test.js` cubre el flujo de pantalla; la batería final del backend queda en verde.

### TDD y comprobación

Se siguió un flujo de prueba con rojo → verde:

- La validación inicial fallaba porque el servicio no aceptaba ni normalizaba `visibilidad`.
- La pantalla fallaba porque el selector no existía ni se rellenaba al editar.
- Tras los cambios, la suite completa del backend quedó en verde con 49 suites y 408 pruebas correctas.

### Cómo comprobarlo

Desde `backend/`:

```powershell
npm test -- --runInBand
```

# CS-01: valorar una experiencia — En progreso; Excel de historias corregido (06/10/2026)

Se ha empezado CS-01. Como necesita saber si quien valora puede ver la experiencia, primero se ha añadido la visibilidad de las experiencias, que es el único objetivo de CS-22 imprescindible para CS-01 (acordado con Matthew, propietario de CS-22).

### Cambios realizados

- **Datos (CS-22, objetivo 1):** nuevo enum `Visibilidad` (`PRIVADA`, `AMIGOS`, `PUBLICA`) y campo `visibilidad` en `Experiencia`, con valor por defecto `PUBLICA`. La migración `visibilidad_experiencia` añade la columna
 y las experiencias que ya existían quedan públicas.- **Datos (CS-01, objetivo 1):** nuevo modelo `Valoracion` (usuario, experiencia, puntuación entera, comentario opcional, fechas de creación y de última modificación). La restricción única por usuario y experiencia garantiza una sola valoración por pareja; el índice por experiencia acelera listar sus valoraciones. La migración `crear_valoracion` solo crea la tabla nueva.
- **Crear y modificar una valoración:** `PUT /api/experiencias/:id/valoracion` (con sesión), cuerpo `{ puntuacion, comentario? }`. Si el usuario aún no había valorado la experiencia se crea (201); si ya la había valorado se actualiza la misma (200), nunca se crea una segunda. El usuario sale siempre de la sesión. Capas: `valoracionRoutes.js` → `valoracionService.js` → `valoracionRepository.js`. El repositorio intenta crear la valoración y, si MySQL la rechaza por duplicada (error `P2002` de la restricción única), actualiza la existente. Como la comprobación la hace MySQL dentro del propio INSERT, con peticiones simultáneas solo una la crea y las demás la actualizan: nunca hay duplicados ni errores.
- **Validaciones de la valoración:** si algo falla no se guarda nada. 401 si el usuario de la sesión ya no existe; 400 si el id no es válido, la puntuación no es un entero del 1 al 5 o el comentario no es texto; 404 «La experiencia no existe» tanto si no existe como si quien valora no puede verla (así no se revela su existencia); 403 si el autor intenta valorar su propia experiencia.
- **Regla de visibilidad compartida:** `services/shared/visibilidad.js` (`puedeVerExperiencia`): el autor siempre; pública, cualquiera; amigos, solo con amistad aceptada (`sonAmigos` de CS-61); privada, nadie más. Pensada para reutilizarse en CS-02, CS-30 y CS-63.
- **Pruebas:** `tests/visibilidadModelo.test.js` comprueba el enum y el valor por defecto en el esquema; `tests/valoracionModelo.test.js`, los campos de `Valoracion` y su restricción única; `tests/valoracionService.test.js` y `tests/valoraciones.test.js`, crear, modificar y cada rechazo en el servicio y por HTTP, incluido que seguir al autor no da acceso a sus experiencias de amigos; `tests/visibilidad.test.js`, la regla de visibilidad; `tests/valoracionRepository.test.js`, que el repositorio crea, pasa a actualizar ante un duplicado y relanza cualquier otro error.
- **Prueba con MySQL real (objetivo 10):** `tests/mysql/valoracionConcurrencia.test.js` comprueba en la base de datos que la restricción única rechaza un duplicado y que 20 peticiones simultáneas del mismo usuario dejan una sola valoración (una respuesta 201 y diecinueve 200, sin errores). Crea sus propios datos y los borra al terminar. Nuevos comandos: `npm run test:mysql` (solo estas pruebas) y `npm run test:todo` (`npm test` y después estas). `npm test` no las incluye, así que sigue funcionando sin Docker.

### Para quien continúe

- Aplicar las migraciones desde `backend/` con `npx prisma migrate deploy` y después `npx prisma generate`.
- Falta el evento de valoración creada o modificada para CS-12 y CS-07. La longitud máxima y el saneado del comentario son de CS-02.
- Del resto de CS-22 todavía no hay nada: crear y editar no aceptan `visibilidad` y el formulario no tiene selector, así que toda experiencia nueva es pública.

### Cómo comprobarlo

```bash
cd backend
npm test
```

Resultado esperado: 33 suites y 277 pruebas correctas.

Con Docker en marcha, `npm run test:todo` ejecuta además las pruebas con MySQL real: 1 suite y 2 pruebas correctas.



### Excel de historias (`Customer_Stories_PlanB.xlsx`)

Se ha sustituido el libro de `documentacion/customer-stories/` por la copia actual de OneDrive con estas correcciones:

- **Fila «Total» en todas las páginas y en la Plantilla:** suma el Tiempo estimado y el Tiempo total de los objetivos. Las páginas nuevas creadas con «Crear páginas» ya la traen.
- **Tiempo total sin duplicar:** el Tiempo total del Índice y de la cabecera de cada página suma solo las filas con número de objetivo. Antes también sumaba la fila «Total», y en CS-01, CS-22, CS-48, CS-61 y CS-62 el tiempo salía doble (CS-01 pasa de 1,7 h a 0,85 h).
- **Estado:** en CS-01, CS-22, CS-30, CS-45, CS-48 y CS-60 el número de objetivo estaba escrito a mano y el Índice no contaba esos objetivos, así que esas historias no podían llegar a «Finalizada». Se ha vuelto a poner la fórmula que los numera. CS-01 pasa a «Finalizada», porque tiene todos sus objetivos en «Sí».
- **Cómo añadir objetivos:** la ayuda de cada página y la sección 3.3 de `metodologia.md` explican el método nuevo: pulsar Tab en la última celda de la tabla, encima de «Total».
- **José** se ha añadido a la lista de responsables de todas las páginas y a `metodologia.md`.
- **Cambios hechos en OneDrive después de la primera descarga, incorporados:** tiempos de CS-48 (objetivo 3) y CS-62 (objetivos 9 y 10, ahora finalizados).
- **Datos:** títulos de CS-37 a CS-42 en mayúsculas, como el resto; prioridad de CS-06 corregida de «IM» a «N»; Tiempo estimado de CS-60 en 3 h, y su página vuelve a copiarlo del Índice.

### Para quien use el libro

- El libro oficial sigue en OneDrive: hay que subir allí esta versión para que el equipo la use.
- El botón «Crear páginas» se conserva. Al abrir el libro, Excel recalcula todas las fórmulas.

# CS-61: base de amistades y seguidores — Finalizada (06/10/2026)

Se ha completado la base de datos, la API y la interfaz de búsqueda, solicitudes, amistades y seguimientos. La historia cumple sus criterios de validación y ha sido comprobada manualmente por Matthew en escritorio y móvil.

### Cambios realizados

- **Datos:** nuevos modelos `Amistad` y `Seguimiento`, con sus migraciones de Prisma. Las relaciones guardan quién inicia cada acción, la fecha y las claves foráneas a Usuario. Las restricciones únicas impiden repetir la misma solicitud o seguimiento.
- **Repositorios:** `amistadRepository` crea, busca en ambos sentidos o por identificador, acepta, borra y lista solicitudes pendientes recibidas. `seguimientoRepository` permite seguir, dejar de seguir y comprobar un seguimiento. La búsqueda de usuarios en `usuarioRepository` encuentra nombres que contienen el texto, excluye a quien busca, limita a 20 resultados y no devuelve emails.
- **Servicios:** las solicitudes solo se envían a otro usuario existente y sin relación previa; solo el destinatario puede aceptarlas o rechazarlas; cualquiera de los dos puede eliminar una amistad aceptada. Los seguimientos no permiten seguirse a uno mismo ni duplicarse. `sonAmigos` devuelve true exclusivamente para amistades aceptadas, de modo reutilizable para otras historias.
- **API:** nuevas rutas protegidas por sesión para búsqueda de usuarios, solicitudes recibidas, enviar/responder/eliminar amistades y seguir/dejar de seguir. Las creaciones responden 201, las eliminaciones 204 y las consultas o respuestas 200.
- **Interfaz:** `personas.html` permite buscar usuarios y enlaza cada resultado a `usuario.html` sin exponer emails ni insertar nombres como HTML. `perfil.html` muestra las solicitudes recibidas y permite aceptarlas o rechazarlas sin recargar. Las barras de bienvenida, perfil propio y perfil público incluyen «Buscar personas».
- **Pruebas:** se añadieron pruebas de esquema, repositorios, servicios, rutas, API y pantallas con jsdom. Cubren búsqueda, ausencia de resultados, solicitudes pendientes, duplicados, permisos de respuesta, rechazo, eliminación, seguimiento y navegación. La batería actual tiene 354 pruebas en 43 suites, todas correctas.
- **Comprobación manual:** Matthew confirmó en escritorio y móvil la búsqueda, los enlaces al perfil, el envío y la respuesta de solicitudes y la navegación.
- **Registro de IA:** `documentacion/prompts/matthew.md` incorpora las entradas de los objetivos 1 a 16 de CS-61.

### Para quien continúe

- Al reutilizar las amistades, conservar la comprobación de relación en ambos sentidos del servicio para no crear duplicados.
- Las pantallas que necesiten estas funciones deben reutilizar `js/shared/api.js` y mantener la separación rutas → servicios → repositorios.

### Cómo comprobarlo

```powershell
cd backend
npm test
```

Resultado esperado: 43 suites y 354 pruebas correctas.



## Arquitectura y estructura base — Implementado (25/09/2026)

Documentación de la arquitectura y esqueleto del proyecto listo para empezar a desarrollar.

### Qué se ha hecho

- Documentación:
  - `documentacion/arquitectura.md` — alcance técnico, capas del sistema, herramientas y sus ventajas, comunicación frontend–backend, autenticación y autorización, estructura del repositorio, instalación de herramientas, entorno de desarrollo y pruebas.
  - `README.md` — resumen de la arquitectura, tabla de tecnologías y puesta en marcha.
- Entorno:
  - `docker-compose.yml` — MySQL 8.4 (usuario `root`, contraseña `planb`, base de datos `planb`) con los datos en un volumen persistente.
  - `backend/.env.example` — plantilla de variables: `DATABASE_URL`, `PORT`, `SESSION_SECRET`, `CLOUDINARY_URL`.
  - `backend/package.json` — Express 5, express-session, bcrypt, Prisma 6, Jest y Supertest. Scripts `dev`, `start`, `test`, `db:migrate` y `db:studio`. Incluye `allowScripts` para Prisma y bcrypt, porque npm 11 bloquea por defecto los scripts de instalación.
  - `backend/package-lock.json` — versiones exactas de todas las dependencias.
- Backend, siguiendo la arquitectura en capas:
  - `src/app.js` — configuración de Express: JSON, sesiones (cookie HttpOnly, sameSite lax), API bajo `/api`, archivos del frontend, 404 en JSON para `/api` y manejador de errores 500.
  - `src/server.js` — arranque del servidor. Está separado de `app.js` para que los tests usen la aplicación sin abrir el puerto.
  - `src/routes/index.js` — `GET /api/health`.
  - `src/repositories/prisma.js` — cliente de Prisma compartido.
  - `src/services/` y `src/middlewares/` — creadas vacías.
  - `prisma/schema.prisma` — conexión a MySQL, sin modelos.
  - `tests/health.test.js` — pruebas de `/api/health` y del 404 de la API.
- Frontend:
  - `index.html` — página inicial con Bootstrap (CDN) que muestra si el servidor responde.
  - `js/api.js` — función `api()` para todas las llamadas al backend.
  - `js/index.js` y `css/styles.css`.

### Cómo probarlo

1. Desde la raíz del repositorio: `docker compose up -d`.
2. `cd backend`, copiar `.env.example` a `.env`, `npm install` y `npm run db:migrate`.
3. `npm test` — pasan las 2 pruebas.
4. `npm run dev` y abrir http://localhost:3000 — aparece «conectado» en verde.

### Para quien siga trabajando en esto

- Las capas se respetan en una sola dirección: rutas → servicios → repositorios. Solo los repositorios usan Prisma.
- Para cambiar la estructura de la base de datos: editar `schema.prisma`, ejecutar `npm run db:migrate` y subir la migración generada junto con el código.
- Tras un `git pull` que traiga migraciones nuevas: `npx prisma migrate deploy` y `npx prisma generate` dentro de `backend/`.
- En Linux, usar `docker` sin `sudo` requiere estar en el grupo `docker` y cerrar sesión después de instalarlo.
- `GET /api/health` no consulta MySQL: responde aunque la base de datos esté parada.



## Login — Implementado (25/09/2026)

Autenticación completa: registro, inicio de sesión y sesiones.

### Qué se ha hecho

- Modelo `Usuario` en `prisma/schema.prisma` (id, nombreUsuario, email, passwordHash, foto, ciudad, creadoEn). Migración aplicada.
- Backend, siguiendo la arquitectura en capas:
  - `src/prismaClient.js` — instancia única de Prisma, compartida por todo el backend.
  - `src/repositories/usuarioRepository.js` — crear / buscar usuario en MySQL.
  - `src/services/authService.js` — lógica de registro e inicio de sesión. Cifra la contraseña con bcrypt, nunca se guarda en texto plano.
  - `src/routes/auth.js` — rutas: `POST /api/auth/registro`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/yo`.
- Frontend:
  - `login.html` y `registro.html` (Bootstrap, mismo estilo que el resto).
  - `js/auth.js` — envía los formularios con fetch, usando la función `api()` que ya existía.

### Cómo probarlo

1. Ve a http://localhost:3000/registro.html y crea una cuenta.
2. Te redirige a `/` con la sesión ya iniciada.
3. Para probar el login por separado: http://localhost:3000/login.html.

### Para quien siga trabajando en esto

- La sesión se guarda con `req.session.usuarioId` (cookie HttpOnly, ya configurada en `app.js`).
- Para proteger una ruta nueva (que solo la vea alguien logueado), comprobar `req.session.usuarioId` igual que hace `GET /api/auth/yo`. Se puede sacar a un middleware común si hace falta en varias rutas.
- Pendiente: mostrar en el frontend si hay sesión iniciada (por ejemplo, saludo + botón de cerrar sesión en `index.html`). No estaba pedido para esta tarea.

## Pantallas, refactorización y robustez — Implementado (28/09/2026)

### Antes de nada, tras el `git pull`

En `backend/`:

1. `npm install` — hay dependencias nuevas (`helmet`, `express-rate-limit`, `@quixo3/prisma-session-store`) y `bcrypt` pasa a la versión 6.
2. `npx prisma migrate deploy` — crea la tabla `Session`.
3. Copiar a `.env` las variables `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` de `.env.example`. **Sin ellas no se puede registrar nadie.** Son claves de prueba de Cloudflare, que siempre aceptan.

### Lo importante para entender el cambio

- **Pantallas:** `/` es el login (`login.html` ya no existe). Tras entrar o registrarse se llega a `bienvenida.html`, que saluda por el nombre; sin sesión, vuelve al login.
- **El servidor no se fía del navegador:** `authService` valida tipo, formato y longitud de cada dato y normaliza los textos (Unicode NFC; el email, sin espacios y en minúsculas). Los límites del HTML son solo una ayuda.
- **Errores:** los servicios lanzan `crearError(mensaje, status)` (`src/errores.js`) y `app.js` responde con ese código y `{ error: mensaje }` en español. Las rutas no llevan `try/catch`: Express 5 pasa solo los errores de las funciones `async`. Solo los fallos inesperados (500) se escriben en consola.
- **Sesiones en MySQL** (tabla `Session`): sobreviven a los reinicios del servidor y caducan tras un día sin actividad.
- **Capas:** Prisma solo se usa en `src/repositories/`; los límites de intentos, en `src/middlewares/`.

### Qué ha cambiado

- **Seguridad y robustez**
  - Registro: nombre de usuario de 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`, sin espacios, emojis ni caracteres invisibles; email válido; contraseña de 8 caracteres a 72 bytes (bcrypt ignora lo que pasa de 72).
  - Datos incorrectos, nombre o email repetidos, JSON roto o petición sin cuerpo → 400 con un mensaje claro (antes, muchos daban 500).
  - Sesión nueva en cada login (evita la fijación de sesión); el logout también borra la cookie.
  - Límite por IP: 10 logins fallidos cada 15 minutos y 20 registros por hora → 429.
  - CAPTCHA Cloudflare Turnstile en el registro, comprobado antes de consultar la base de datos. El login tarda lo mismo exista o no el email. Ninguno de los dos permite averiguar qué emails están registrados.
  - Cabeceras de seguridad con `helmet`: CSP (solo scripts propios y los de Cloudflare), protección contra marcos ajenos, y sin `X-Powered-By`.
  - `/api/health` comprueba también MySQL (503 si no responde) y el indicador del login lo refleja.
  - Frontend: el fallo de red sale en español y los botones se desactivan mientras se envía el formulario.
- **Organización del código:** código repetido eliminado (dos clientes de Prisma, los dos formularios de `js/auth.js`, construcción de usuarios y errores en el servicio) y todo el backend comentado.
- **Pruebas:** `tests/setup.js` prepara el entorno de todas: sesiones en memoria, sin límites de intentos y con el CAPTCHA siempre aceptado. Los archivos `limites.test.js` y `captcha.test.js` prueban de verdad esas dos piezas. Ninguna prueba necesita MySQL.
- **Documentación:** `arquitectura.md` y el README describen las herramientas nuevas. `.gitignore` reescrito solo con lo que usa el proyecto.

### Cómo probarlo

1. `npm test` dentro de `backend/` — pasan todas las pruebas.
2. `npm run dev` y abrir http://localhost:3000:
   - login con contraseña incorrecta → error; con la correcta → bienvenida;
   - registro: sin esperar al CAPTCHA → «No se ha podido comprobar que no eres un robot»; con un email repetido → «El email ya está registrado»;
   - reiniciar el servidor con la sesión iniciada y recargar la bienvenida → sigue la sesión.

### Para quien siga trabajando en esto

- Enlaces al login: a `/`.
- La CSP bloquea los scripts en línea (`<script>…</script>`, `onclick="…"`) y los de otros dominios: el código va en archivos de `js/`, y lo que se cargue de otro dominio hay que añadirlo a la configuración de `helmet` en `app.js`.
- Formularios nuevos: `enviarFormulario()` de `js/auth.js`, con el id del formulario, el de la caja de error, la ruta de la API y los campos.
- El registro necesita internet para verificar el CAPTCHA. Para desplegar, crear las claves reales en Cloudflare → Turnstile.

# Perfil: consultar el perfil propio — Implementado (28/09/2026)

Primera parte de PB-01. Endpoint de solo lectura del propio perfil.

## Qué se ha hecho

- `usuarioRepository.obtenerPerfil(id)` — trae solo `id`, `nombreUsuario`, `email`, `foto`, `ciudad` (nunca la contraseña).
- `perfilService.obtenerPerfilPropio(id)` — llama al repositorio, 401 si el usuario ya no existe.
- `GET /api/perfil` — comprueba la sesión y devuelve el perfil.

## Cómo probarlo

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}' -c cookies.txt

curl -i http://localhost:3000/api/perfil -b cookies.txt   # 200, con los datos
curl -i http://localhost:3000/api/perfil                  # 401 sin sesión
```

# Perfil: test de la consulta del perfil propio — Implementado (30/09/2026)

Test automático de `GET /api/perfil` (ver `perfil-consultar.md` para el endpoint en sí).

## Qué se ha hecho

- `tests/perfil.test.js` (nuevo), con el mismo patrón que `auth.test.js`: repositorio simulado con `jest.mock()`, agente con sesión (`agenteConSesion()`).
- Casos cubiertos:
  - Sin sesión → 401.
  - Con sesión → 200, devuelve el perfil, sin `passwordHash`.
  - Si el usuario de la sesión ya no existe → 401.

## Cómo probarlo

```bash
npm test
```

54 tests en total, todos en verde.

# Editar mi perfil — hecho (30/09/2026)

## Qué hace esto

Ahora, si tienes la sesión iniciada, puedes cambiar tu nombre de usuario y tu ciudad desde tu perfil. Cada uno solo puede tocar el suyo, claro. El email de 
momento no se puede cambiar por aquí, lo dejamos fijo a propósito.

## Qué comprueba antes de guardar

- Que el nombre de usuario tenga entre 3 y 30 caracteres válidos (letras, números, `_`, `.` o `-`).
- Que ese nombre no lo esté usando ya otra persona.
- Que tengas la sesión iniciada, si no, no te deja tocar nada.

## Archivos que he tocado

- `src/repositories/usuarioRepository.js` — `actualizarPerfil(id, datos)`.
- `src/services/perfilService.js` — `actualizarPerfilPropio(id, datos)`, valida antes de guardar.
- `src/routes/perfil.js` — ruta `PUT /api/perfil`.
- `tests/perfil.test.js` — pruebas automáticas.

## Cómo probarlo

```bash
npm test
```

58 tests en total, todos en verde.

# Creación de experiencias (LUC01) y catálogo de ciudades — Implementado (30/09–01/10/2026)

Reúne las tareas 1–4 y la tarea intermedia del catálogo inicial.

### Qué se ha hecho

- Modelo `Experiencia`: título, descripción, una única ciudad, autor y los campos opcionales tipo y momento adecuado.
- `POST /api/experiencias`: exige sesión, valida los datos y guarda la experiencia con el autor de la sesión. Responde 201 al crear, 400 ante datos inválidos y 401 sin sesión válida.
- Validación: rechaza campos obligatorios ausentes o vacíos y ciudades inexistentes. Prepara los textos y comprueba sus límites de almacenamiento.
- Catálogo local en `backend/data/capitales.json`: **201 capitales o sedes para 195 países** (193 miembros de la ONU y dos observadores). Países en español; ciudades en la grafía de la fuente.
- `npm run db:seed`: carga el catálogo sin internet y puede repetirse sin duplicar entradas. País + nombre identifica cada ciudad; se conservan los registros existentes.
- Arquitectura respetada: rutas → servicios → repositorios → Prisma → MySQL. Solo los repositorios acceden a Prisma.

El catálogo parte de [Countries](https://github.com/mledoze/countries), bajo ODbL-1.0; la licencia está en `backend/data/LICENSE-capitales.txt`. Se revisaron países con varias capitales o sedes, Yaren como sede de Nauru y el estatus disputado de Jerusalén. Guinea Ecuatorial usa Ciudad de la Paz, según [la declaración oficial de enero de 2026](https://www.guineaecuatorialpress.com/index.php/noticias/el_presidente_de_la_republica_proclama_la_ciudad_de_la_paz_como_capital_de_la_republica_de_guinea_ecuatorial_con_la_firma_de_un_decreto_ley). Es una instantánea del 01/10/2026, sin actualizaciones automáticas; territorios adicionales quedan fuera de este primer alcance.

### Datos anteriores y decisiones

Las cuatro migraciones nuevas crean experiencias, relacionan ciudades, añaden autor y añaden país con su restricción de unicidad. No se reescriben migraciones anteriores.

La conversión de nombres puede unificar variantes de mayúsculas o acentos. La carga completa el país de una ciudad anterior si hay una sola coincidencia por nombre; conserva las ambiguas sin asignarles país. **Con datos reales, revisar esas asociaciones y hacer una copia de seguridad antes de migrar.** No hay reversión automática.

Las experiencias anteriores sin propietario conocido conservan `autorId = NULL`; las nuevas siempre reciben el autor de la sesión. Hay que revisar esa propiedad antes de permitir su edición. MySQL impide borrar ciudades o autores que tengan experiencias.

### Cómo aplicar y comprobar

Desde la raíz:

```powershell
docker compose up -d
cd backend
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm test -- --runInBand
```

Si faltan dependencias, ejecutar antes `npm ci` dentro de `backend/`. Docker arranca MySQL; las migraciones actualizan las tablas. No se necesitan nuevas variables en `.env`, que nunca se sube a Git.

Con `npm run db:studio`, comprobar el catálogo y anotar el identificador de una ciudad. Arrancar con `npm run dev`, iniciar sesión y probar desde la consola del navegador (F12), sustituyendo `ciudadId` por ese identificador:

```js
const respuesta = await fetch('/api/experiencias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ titulo: 'Tarde cultural', descripcion: 'Museo y paseo', ciudadId: 1 }),
});
console.log(respuesta.status, await respuesta.json());
```

Debe responder 201 y guardar el registro. Un título vacío o una ciudad inexistente deben devolver 400 sin guardar; sin sesión, 401. Cada petición válida crea otra experiencia.

### Pruebas y pendientes

Pasan **114 pruebas**. Cubren los criterios de campos obligatorios, ciudad válida y asociación única, además de sesión, autor, límites y catálogo. Las pruebas HTTP simulan los repositorios.

En MySQL temporal se verificaron migraciones, restricciones, conservación de datos, creación con servicio y repositorios reales y dos cargas del catálogo: la segunda no añadió registros. No se hizo una prueba HTTP completa con repositorios reales ni se modificó la base de PlanB; los contenedores de prueba se retiraron.

Quedan pendientes el formulario visual, listado de ciudades por API, edición y publicación. Al añadir lugares habrá que comprobar que pertenecen a la ciudad de la experiencia. Ampliar ciudades, territorios o traducciones es opcional.

# Foto de perfil (FLA05, tareas 4 y 5), revisión y reorganización del código — Implementado (01/10/2026)

Cada usuario puede subir su foto de perfil: se guarda en Cloudinary y en MySQL solo su URL. Además:
- revisión del backend: repeticiones eliminadas y errores de validación corregidos en la edición del perfil;
- archivos del backend con el nombre de su capa y del frontend con el de su página;
- todo el código comentado en detalle.

La API no cambia: mismas URLs y mismas respuestas.

### Antes de nada, tras el `git pull`

- `cd backend && npm install`: hay dos dependencias nuevas, **cloudinary** (SDK oficial) y **multer** (recibe archivos de formularios en Express).
- Rellenar `CLOUDINARY_URL` en `backend/.env` con la del panel de Cloudinary (Dashboard → API Keys → *API environment variable*, con el secreto incluido). Pedid la del equipo a Joaquín; nunca se sube a git.
- Varios archivos del backend y del frontend cambian de nombre o de carpeta (tablas de abajo). Si tenéis cambios sin subir en alguno, git avisará de conflicto: aplicad vuestros cambios sobre el archivo con el nombre nuevo.

### Qué ha cambiado

**Foto de perfil**

- `PUT /api/perfil/foto` — exige sesión. Recibe un formulario *multipart* con la foto en el campo `foto` y devuelve el perfil con la URL nueva.
- Tarea 4, validación (si falla responde 400, no se sube nada y se conserva la foto anterior):
  - formato JPG, PNG o WebP, comprobado por los primeros bytes del archivo (su firma), no por la extensión ni por el tipo que dice el navegador, que se pueden falsear;
  - tamaño máximo de 5 MB: multer deja de leer en cuanto se supera;
  - una sola foto y en el campo `foto`;
  - si el archivo empieza como una imagen pero está dañado, Cloudinary lo rechaza y la API responde «La foto no es una imagen válida».
- Tarea 5, almacenamiento: la foto se sube a Cloudinary (carpeta `planb/perfiles`, con nombre `usuario-<id>`) y en `Usuario.foto` se guarda solo su URL `https`. Cada usuario tiene una sola foto: la nueva sustituye a la anterior también en Cloudinary.
- Archivos:
  - `src/middlewares/fotoMiddleware.js` (nuevo) — `recibirFoto`: multer en memoria, límite de tamaño y errores en 400.
  - `src/repositories/fotoRepository.js` (nuevo) — `subirFotoPerfil`: sube a Cloudinary y devuelve la URL.
  - `src/repositories/usuarioRepository.js` — `actualizarFoto(id, url)`.
  - `src/services/perfilService.js` — `actualizarFotoPropia`: valida el formato, sube y guarda la URL.
  - `src/routes/perfilRoutes.js` — la ruta nueva.
  - `tests/fotoPerfil.test.js` (nuevo) — pruebas con MySQL y Cloudinary simulados.
  - `documentacion/arquitectura.md` — cómo llega la foto al backend (multer) y a Cloudinary.
- Excel: FLA05 tareas 4 y 5 marcadas como hechas, 30 min cada una.

**Revisión del backend**

- `src/middlewares/sesionMiddleware.js` (nuevo) — `requiereSesion`: responde 401 `No hay sesión iniciada` si no hay sesión. Sustituye a la comprobación que se repetía en `GET /api/auth/yo`, en las rutas de `/api/perfil` (con `router.use`, para todas a la vez) y en `POST /api/experiencias`.
- `src/services/shared/nombreUsuario.js` (nuevo) — `validarNombreUsuario`: reglas del nombre de usuario, que antes estaban copiadas en `authService` y `perfilService`. Ahora el registro y la edición del perfil validan igual.
  - **Corrige** dos errores de `PUT /api/perfil`: un nombre que no era texto (por ejemplo `12345`) pasaba la validación y acababa en un error 500, y ahora es un 400; y el nombre no se normalizaba a NFC, así que «José» escrito de dos formas podía quedar como dos nombres distintos.
- `src/services/perfilService.js` — validación de `ciudad` en `PUT /api/perfil`. **Corrige** que cualquier valor llegaba a la base de datos: un objeto, un número o un texto de más de 191 caracteres (el tamaño de la columna) acababa en error 500. Ahora:
  - tiene que ser texto o `null`, y como máximo 191 caracteres; si no, responde 400;
  - se guarda sin espacios exteriores y normalizada a NFC;
  - `null` o un texto vacío dejan el perfil sin ciudad.
- `src/repositories/usuarioRepository.js` — los campos del perfil que se pueden mostrar están en una sola constante (`CAMPOS_PERFIL`), usada por `obtenerPerfil`, `actualizarPerfil` y `actualizarFoto`. Para mostrar un campo nuevo del perfil basta con añadirlo ahí.
- **Eliminado `GET /api/health`** por completo: la ruta, `src/repositories/saludRepository.js`, sus pruebas y el indicador «Servidor: conectado» del login. Ahora `/api/health` responde 404 como cualquier ruta inexistente.
- Pruebas nuevas: `PUT /api/perfil` sin cuerpo (no cambia nada), y un fallo inesperado de la base de datos en `PUT /api/perfil` y en el registro (responde 500 sin mostrar el detalle). Con ellas, `authService` y `perfilService` quedan cubiertos al 100 %.

**Backend: nombres por capa y carpetas `shared/`**

Cada archivo termina en el nombre de su capa (`Routes`, `Middleware`, `Service`, `Repository`), así que el nombre indica con qué capa habla: `perfilRoutes` → `perfilService` → `usuarioRepository`. En la carpeta `shared/` de cada capa está lo que no pertenece a ninguna funcionalidad ni tabla concreta; lo que comparten las rutas son los middlewares. Los archivos se han movido con `git mv`, así que conservan su historial:

| Antes | Ahora |
|---|---|
| `src/routes/auth.js` | `src/routes/authRoutes.js` |
| `src/routes/perfil.js` | `src/routes/perfilRoutes.js` |
| `src/routes/experiencias.js` | `src/routes/experienciaRoutes.js` |
| `src/middlewares/sesion.js` | `src/middlewares/sesionMiddleware.js` |
| `src/middlewares/limites.js` | `src/middlewares/limitesMiddleware.js` |
| `src/middlewares/foto.js` | `src/middlewares/fotoMiddleware.js` |
| `src/services/nombreUsuario.js` | `src/services/shared/nombreUsuario.js` |
| `src/repositories/prisma.js` | `src/repositories/shared/prisma.js` |
| `src/repositories/sesionStore.js` | `src/repositories/shared/sesionStore.js` |

- `errores.js` sigue en `src/`: lo usan servicios y middlewares.
- Actualizados los `require` del código y los `jest.mock` de `tests/setup.js` y `tests/limites.test.js`.
- `documentacion/arquitectura.md` — estructura del repositorio y regla de nombres.

**Frontend: un archivo JS por página**

Cada página tiene su JS con el mismo nombre que su HTML, y lo común a varias páginas está en `js/shared/`. Las pantallas funcionan igual.

| Antes | Ahora |
|---|---|
| `frontend/js/api.js` | `frontend/js/shared/api.js` |
| `frontend/js/auth.js` (login y registro) | `frontend/js/index.js` (login) y `frontend/js/registro.js` (registro y CAPTCHA) |

- `frontend/js/bienvenida.js` — escrito con `async/await`, como los demás.
- Los HTML cargan `js/shared/api.js` y después el JS de su página.
- `enviarFormulario()` ya no existe: cada página tiene su propio código de envío del formulario.
- `documentacion/arquitectura.md` — estructura del frontend.

**Comentarios en todo el código**

- Backend:
  - cada archivo de `src/` empieza con una cabecera: qué hace, su capa, quién lo usa y qué usa;
  - cada función explica qué recibe, qué devuelve y qué errores lanza;
  - las rutas indican método, URL, cuerpo esperado y respuesta;
  - también están comentados `prisma/seed.js`, `prisma/schema.prisma` (sus comentarios no generan migraciones) y las funciones auxiliares de los tests.
- Frontend: cada archivo de `frontend/js` explica qué hace cada paso.
- El código no cambia, salvo las rutas de los `require` y el nombre de una variable en `routes/index.js`. Se ha comprobado comparando cada archivo con su versión anterior sin comentarios.

### Cómo probarlo

```bash
cd backend
npm test          # 139 pruebas, todas en verde
npm run db:seed   # «0 ciudades creadas … 201 ya existentes»: no duplica nada
```

`npx jest --coverage` muestra la cobertura por archivo (abre `backend/coverage/lcov-report/index.html`). Los repositorios salen bajos porque las pruebas los simulan.

Foto de perfil, con el servidor arrancado (`npm run dev`) y una sesión iniciada con curl (`-c cookies.txt` en el login):

```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@mi-foto.png"   # 200, con la URL
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@animacion.gif" # 400
curl -b cookies.txt http://localhost:3000/api/perfil                                      # la foto sigue ahí
```

Pantallas, en el navegador:

- `/bienvenida.html` sin sesión lleva al login.
- Login con una contraseña incorrecta: aparece «Email o contraseña incorrectos» y el botón se puede volver a pulsar.
- Registro: se ve el CAPTCHA y, al crear la cuenta, lleva a la bienvenida con el nombre.
- Login con esa cuenta: lleva a la bienvenida con el nombre.

Todo se ha probado contra Cloudinary y MySQL reales:
- la foto: subida, rechazo de una imagen dañada y consulta del perfil;
- las pantallas, con Chrome sin ventana (headless), también después de los renombrados.

Los datos de prueba se borraron después.

### Para quien siga trabajando en esto

- Funcionalidad nueva `x` en el backend: `routes/xRoutes.js` (montada en `routes/index.js`) → `services/xService.js` → el repositorio de la tabla que use.
- Página nueva `x.html`: su código va en `js/x.js`, cargado después de `js/shared/api.js`. Lo que usen varias páginas va en `js/shared/`. Los formularios nuevos siguen el modelo de `js/index.js`.
- Las rutas nuevas que exijan sesión deben usar `requiereSesion` (`src/middlewares/sesionMiddleware.js`), no repetir la comprobación.
- Para validar un nombre de usuario en otro sitio, usar `validarNombreUsuario` (`src/services/shared/nombreUsuario.js`).
- Las entradas anteriores de este documento citan nombres de archivo antiguos (`routes/auth.js`, `js/auth.js`, `enviarFormulario()`...). Las equivalencias están en las tablas de arriba.
- La ciudad del perfil (`Usuario.ciudad`) sigue siendo texto libre, distinta del catálogo `Ciudad` de las experiencias.
- FLA05 tarea 6 (imagen por defecto): `foto` es `null` mientras el usuario no sube ninguna. Para mostrar las fotos en el frontend hay que permitir `https://res.cloudinary.com` en `imgSrc` de la política de contenido de helmet (`src/app.js`); ahora solo se permiten imágenes propias.
- FLA05 tarea 10: faltan las pruebas de "edición reflejada" con la foto desde el frontend; las del backend están en `tests/fotoPerfil.test.js`. Para enviar la foto desde el frontend: `api()` (`js/shared/api.js`) pone por defecto `Content-Type: application/json`, y con un `FormData` hay que quitarla, porque esa cabecera la pone el navegador.

# Pruebas de creación de experiencias (LUC01, objetivos 5, 6 y 7) — Preparado, pendiente de ejecutar (01/10/2026)

Los objetivos 5, 6 y 7 piden **pruebas**, no código nuevo: la lógica de `POST /api/experiencias` ya existe en `experienciaService`. Se añade un archivo de pruebas que los comprueba uno a uno, con los repositorios simulados (no necesita MySQL).

### Qué se ha hecho

- `tests/experienciaObjetivos.test.js` (nuevo), con el mismo patrón que el resto de pruebas: repositorios simulados con `jest.mock()`, sin tocar la base de datos. No se modifica ningún archivo existente.
- Casos cubiertos:
  - **Objetivo 5, campos obligatorios:** si falta `titulo`, `descripcion` o `ciudadId` → 400 y no se llama a `experienciaRepository.crear`.
  - **Objetivo 6, solo su ciudad:** la ciudad se comprueba con `ciudadRepository.buscarPorId` y la experiencia se guarda con ese mismo `ciudadId`. Si la ciudad no existe → 400 y no se guarda nada.
  - **Objetivo 7, datos válidos:** `experienciaRepository.crear` recibe los datos validados más el `autorId` de la sesión (nunca el del cuerpo de la petición), y el resultado devuelve el `id` y el `autorId`.
- Archivos que usa la prueba:
  - `src/services/experienciaService.js` — `crearExperiencia` (lo que se prueba).
  - `src/repositories/ciudadRepository.js`, `experienciaRepository.js` y `usuarioRepository.js` — simulados.
  - `src/errores.js` — `crearError(mensaje, status)`, de donde sale el código 400.

### Antes de nada

- Hace falta Node.js. En macOS: `brew install node` y comprobar con `node -v && npm -v`.
- Todos los comandos de npm se ejecutan dentro de `backend/`, no desde la raíz: `cd backend && npm install`.


### Cómo probarlo

```bash
cd backend
npx jest tests/experienciaObjetivos.test.js   # solo el archivo nuevo
npm test                                      # toda la batería
```
# Pantalla de mi perfil — hecho (01/10/2026)

## Qué hace esto

Desde la bienvenida hay un enlace "Mi perfil" que lleva a una pantalla donde ves y editas tu nombre de usuario y tu ciudad (el email no se puede tocar). 
Si tienes foto, se muestra.

## Archivos

- `frontend/bienvenida.html` — enlace "Mi perfil".
- `frontend/perfil.html` (nuevo) — el formulario.
- `frontend/js/perfil.js` (nuevo) — carga el perfil (`GET /api/perfil`) y guarda cambios (`PUT /api/perfil`).

## Probarlo

Inicia sesión → "Mi perfil" → cambia algo → guardar.

## Pantalla de mi perfil: mejoras y limpieza — Implementado (01/10/2026)

Mejoras sobre la pantalla de mi perfil y mis entradas anteriores de este documento. La API no cambia.

### Qué ha cambiado

- `frontend/js/perfil.js`:
  - mismos nombres que el resto de páginas (`formulario`, `cajaError`, `cajaExito`, `boton`);
  - el botón «Guardar cambios» se desactiva mientras se envía (evita el doble envío) y se vuelve a activar al terminar, haya ido bien o mal;
  - tras guardar, el formulario muestra lo que devuelve el backend (sin espacios sobrantes y normalizado), no lo que se escribió;
  - nueva función `mostrarPerfil(perfil)`, usada al cargar y al guardar, y comentarios en cada paso.
- `frontend/perfil.html`:
  - usa la clase `contenedor-formulario` de `css/styles.css` en lugar de un estilo en línea, igual que el login y el registro;
  - `maxlength="30"` en el nombre de usuario (como en el registro) y `maxlength="191"` en la ciudad (tamaño de la columna en MySQL);
  - la etiqueta del email lleva `for="email"`.


# Edición de experiencias — Implementado (01/10/2026)

Se añade la edición de experiencias existentes. Solo el autor de una experiencia puede modificarla.

## Qué se ha hecho

- `PATCH /api/experiencias/:id` permite editar una experiencia existente.
- Se comprueba que haya una sesión iniciada, que la experiencia exista y que pertenezca al usuario de la sesión.
- Se pueden modificar de forma independiente:
  - `titulo`
  - `descripcion`
  - `tipo`
  - `momentoAdecuado`
  - `ciudadId`
- No es necesario enviar todos los campos, solo los que se quieran modificar.
- Los campos de texto mantienen sus validaciones de formato y longitud.
- Si se cambia `ciudadId`, se comprueba que la nueva ciudad exista.
- Cada experiencia mantiene una única ciudad asociada; cambiar `ciudadId` sustituye la anterior.

## Archivos modificados

- `src/repositories/experienciaRepository.js`
  - `buscarPorId(id)`
  - `actualizar(id, datos)`
- `src/services/experienciaService.js`
  - `validarEdicion(datos)`
  - `editarExperiencia(usuarioId, experienciaId, datos)`
- `src/routes/experienciaRoutes.js`
  - nueva ruta `PATCH /api/experiencias/:id`

## Cómo probarlo

Desde `backend/`:

```bash
npm test
```

Pasan 145 pruebas.

Ejemplo de edición:

```js
const respuesta = await fetch('/api/experiencias/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: 'Nuevo título',
    tipo: 'Cultural'
  })
});

console.log(respuesta.status, await respuesta.json());
```

## Pendiente

Queda pendiente validar que, al cambiar la ciudad de una experiencia, todos los lugares asociados pertenezcan también a esa nueva ciudad.

Actualmente todavía no existe en el modelo de datos la relación entre experiencias y lugares necesaria para realizar esta comprobación.


# Foto de perfil: imagen por defecto (FLA05, objetivo 6) — Implementado (01/10/2026)

Si el usuario no ha subido foto, la API devuelve una imagen por defecto en lugar de `null`. En MySQL sigue guardándose `null`: solo cambia lo que devuelve la API.

### Qué se ha hecho

- `frontend/img/foto-por-defecto.svg` (nuevo) — silueta genérica. Al ser un archivo propio, la política de contenido (CSP) de `helmet` ya lo permite.
- `src/services/perfilService.js`:
  - constante `FOTO_POR_DEFECTO` (`/img/foto-por-defecto.svg`), exportada para las pruebas;
  - función `conFotoPorDefecto(perfil)`: si `foto` es `null`, la sustituye por la imagen por defecto;
  - la usan las tres funciones que devuelven un perfil: `obtenerPerfilPropio`, `actualizarPerfilPropio` y `actualizarFotoPropia`. Por tanto, `GET /api/perfil`, `PUT /api/perfil` y `PUT /api/perfil/foto` devuelven la misma `foto`.
- `tests/fotoPorDefecto.test.js` (nuevo): sin foto devuelve la imagen por defecto; con foto devuelve la suya.
- `tests/perfil.test.js`: el perfil simulado (línea 11) pasa de `foto: null` a una URL de Cloudinary, porque dos pruebas comparaban la respuesta con ese perfil y esperaban `null`.

`usuarioRepository.js` no cambia.

### Cómo probarlo

```bash
cd backend
npm test          # 147 pruebas, todas en verde
```

Con el servidor arrancado (`npm run dev`) y una sesión iniciada con curl (`-c cookies.txt` en el login):

```bash
curl -b cookies.txt http://localhost:3000/api/perfil              # sin foto: "foto": "/img/foto-por-defecto.svg"
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@mi-foto.png"
curl -b cookies.txt http://localhost:3000/api/perfil              # con foto: la URL de Cloudinary
```

La imagen se ve en http://localhost:3000/img/foto-por-defecto.svg.

### Para quien siga trabajando en esto

- El frontend ya no puede saber si un usuario tiene foto mirando solo `foto`. Si hace falta (por ejemplo, un botón «Añadir foto» solo cuando no hay ninguna), comparar con `/img/foto-por-defecto.svg` o devolver un campo extra desde `perfilService`.
- Para mostrar las fotos reales en una página hay que permitir `https://res.cloudinary.com` en `imgSrc` de la política de contenido de helmet (`src/app.js`); la imagen por defecto se ve sin tocar nada.
- Si un test nuevo compara la respuesta de la API con un perfil simulado, el perfil debe llevar una foto real (como en `perfil.test.js`); con `foto: null` la respuesta traerá la imagen por defecto.
- Hoy ninguna pantalla muestra la foto; cuando se añada una (por ejemplo en `bienvenida.html`), usar directamente `perfil.foto` como `src` de la imagen.

## Foto de perfil desde la pantalla y fotos de Cloudinary visibles (FLA05) — Implementado (01/10/2026)

Ahora la foto de perfil se puede subir y cambiar desde la pantalla «Mi perfil», y las fotos subidas a Cloudinary se ven en la web. Antes solo se podía subir con curl y el navegador bloqueaba las fotos. La API no cambia.

### Qué ha cambiado

- `backend/src/app.js` — la política de contenido de helmet permite imágenes de `https://res.cloudinary.com`. La imagen por defecto ya se veía porque es un archivo propio.
- `frontend/perfil.html` — formulario nuevo encima de los datos del perfil: campo de archivo (JPG, PNG o WebP), botón «Subir foto» y mensajes de error y de éxito.
- `frontend/js/perfil.js` — envía la foto a `PUT /api/perfil/foto`. Mientras se sube, el botón está desactivado; si va bien, muestra la foto nueva y «Foto actualizada.»; si no, el mensaje del backend («La foto debe ser JPG, PNG o WebP», «La foto no puede superar los 5 MB»...).
- `frontend/js/shared/api.js` — cuando se envía un archivo (`FormData`), `api()` ya no pone la cabecera `Content-Type: application/json`. El resto de llamadas no cambian.

### Cómo probarlo

```bash
cd backend
npm test          # 147 pruebas, todas en verde
npm run dev
```

## Experiencias desde la bienvenida, pruebas pendientes, avisos del registro, subida de la foto y nuevo formato del Excel de historias (LUC01, LUC09, FLA05, MAT16) — Implementado (02/10/2026)

La pantalla de bienvenida muestra ahora las experiencias del usuario en una rejilla. La primera casilla es un «+» grande para crear una experiencia; al guardarla aparece justo detrás del «+». Al pulsar una tarjeta se abre el mismo formulario con sus datos para editarla.

### Qué se ha hecho

- API: dos lecturas nuevas que usa la pantalla.
  - `GET /api/experiencias/mias` — las experiencias del usuario de la sesión, de la más nueva a la más antigua, cada una con su ciudad. Responde 401 sin sesión. Archivos: `routes/experienciaRoutes.js`, `services/experienciaService.js` (`listarExperienciasPropias`) y `repositories/experienciaRepository.js` (`listarPorAutor`).
  - `GET /api/ciudades` — el catálogo `[{ id, nombre, pais }]` ordenado por nombre, para el desplegable de ciudades. Es público. Archivos: `routes/ciudadRoutes.js` (nuevo), `routes/index.js`, `services/ciudadService.js` (`listarCiudades`) y `repositories/ciudadRepository.js` (`listar`).
  - `tests/listados.test.js` (nuevo) — sin sesión, sesión de un usuario que ya no existe, solo las experiencias del autor de la sesión y el catálogo de ciudades.
- Frontend:
  - `frontend/bienvenida.html` — rejilla de Bootstrap (2 columnas en móvil, 3 en tablet y 4 en escritorio) y formulario dentro de un `<dialog>`: título, descripción, ciudad (desplegable), tipo y momento adecuado.
  - `frontend/js/bienvenida.js` — carga a la vez las ciudades y las experiencias. El «+» abre el formulario vacío (`POST /api/experiencias`) y cada tarjeta lo abre con sus datos (`PATCH /api/experiencias/:id`). Al guardar, la tarjeta nueva se coloca detrás del «+» y la editada se sustituye en su sitio, sin recargar. Los errores del backend se muestran dentro del formulario, y el botón «Guardar» se desactiva mientras se envía.
  - `frontend/css/styles.css` — estilos del «+», de las tarjetas (descripción cortada a tres líneas) y del `<dialog>`.
- `README.md` y `documentacion/arquitectura.md` — estado del proyecto y selección de ciudad en la interfaz.
- Pruebas de la edición (LUC09, objetivos 6 y 7): `tests/edicionExperiencia.test.js` (nuevo), contra `PATCH /api/experiencias/:id`. El repositorio simulado guarda la experiencia en memoria para comprobar cómo queda después de cada petición.
  - Objetivo 6: la experiencia de otro usuario responde 403 y no cambia; una experiencia antigua sin autor tampoco se puede editar; sin sesión, 401.
  - Objetivo 7: los campos enviados sustituyen a los anteriores y los demás se conservan; al volver a consultar aparecen los datos nuevos; vaciar un opcional lo deja sin valor; no se puede cambiar el autor ni el id; si algún dato no es válido no se cambia nada.
- Pruebas del criterio de validación del perfil (FLA05, objetivo 10): `tests/perfilCriterio.test.js` (nuevo). Cada caso edita el perfil y después lo vuelve a consultar con `GET /api/perfil`: con un nombre válido y una foto permitida aparecen los dos; un nombre en uso por otra persona o con caracteres no permitidos se rechaza y sigue el anterior (sin guardar nada de esa petición); una foto GIF o de más de 5 MB se rechaza y sigue la anterior. Las pruebas de cada regla por separado ya estaban en `perfil.test.js` y `fotoPerfil.test.js`.
- Registro (MAT16, objetivos 5, 6 y 7):
  - `frontend/js/registro.js` — avisos visibles cuando el CAPTCHA no está disponible: si el script de Turnstile no carga (sin red o bloqueado), si no se puede pedir la clave pública al servidor o si falta en `.env` («No se ha podido cargar el CAPTCHA...»), y si Turnstile informa de un error («No se ha podido verificar el CAPTCHA...»; desaparece al resolverlo). Mientras se envía, el botón muestra un spinner y «Creando cuenta...»; tras cualquier error vuelve a «Crear cuenta» y queda disponible.
  - `tests/registroPantalla.test.js` (nuevo) — prueba la pantalla en un navegador simulado (jsdom) con el servidor (`fetch`) y Turnstile simulados: registro correcto, envío en curso sin envíos duplicados, datos inválidos, email y nombre duplicados, CAPTCHA rechazado, fallo de red con reintento y los casos de CAPTCHA no disponible. El registro en el backend ya lo probaban `auth.test.js` y `captcha.test.js`.
  - `backend/package.json` — nueva dependencia de desarrollo `jest-environment-jsdom`. El archivo de pruebas lo activa con el comentario `@jest-environment jsdom` de su cabecera; el resto de pruebas siguen en el entorno de Node.
  - `documentacion/arquitectura.md` y `README.md` — jsdom en la tabla de herramientas y en la sección de pruebas.
- Foto de perfil (FLA05): ahora se sube en cuanto se elige. Antes solo se subía con el botón «Subir foto»: si se elegía el archivo y se pulsaba «Guardar cambios», la foto no se enviaba y aun así aparecía «Perfil actualizado.». El backend no cambia.
  - `frontend/perfil.html` — sin el botón «Subir foto»; debajo del campo, la ayuda «Se guarda en cuanto la eliges.».
  - `frontend/js/perfil.js` — al elegir el archivo (evento `change`) se envía a `PUT /api/perfil/foto`. Mientras se sube, el campo se desactiva y la ayuda dice «Subiendo foto...»; después se vacía el campo, así que volver a elegir el mismo archivo también lo sube.
  - `tests/perfilPantalla.test.js` (nuevo, jsdom) — al cargar se ve la foto guardada; al elegir una foto se sube sola y se ve la nueva; mientras se sube el campo está desactivado; si el servidor la rechaza se muestra el motivo y se queda la anterior.
- `customer-stories/Customer_Stories_PlanB.xlsx` — seguimiento actualizado. LUC09: objetivos 6 y 7 hechos y objetivo 8 nuevo (pantalla de edición). LUC01: objetivos 1 a 7 marcados como hechos (ya tenían su tiempo real) y objetivo 8 nuevo (pantalla de creación). FLA05: objetivo 10 hecho. MAT16: objetivos 5, 6 y 7 hechos. Las tareas cerradas hoy llevan 5 min de tiempo estimado. FLA05, LUC01 y MAT16 tienen ahora una columna «Tiempo Estimado (h)» en E, como la que ya tenía LUC09; «Tiempo Real (h)» no se ha movido. LUC09 objetivo 4 sigue pendiente de LUC02.
- Excel de customer stories con formato nuevo (`customer-stories/Customer_Stories_PlanB.xlsx`), preparado para usarse en Excel para la web desde OneDrive:
  - Referencias: todas las stories se llaman ahora `CS-XX`, numeradas desde `CS-01` en el orden que tenía el índice (JOA01–21 → CS-01–21, MAT01–15 → CS-22–36, JOR01–06 → CS-37–42, FLA01–06 → CS-43–48, LUC01–10 → CS-49–58, MAT16 → CS-59 y US60 → CS-60). Cada página se llama igual que su referencia, y las menciones dentro de los textos (HJ-07, FLA05...) usan ya la referencia nueva.
  - Índice: es una tabla de Excel («Historias») con Ref, Título (enlace a su página), Riesgo, Prioridad, Tiempo estimado, Tiempo total y Estado, sin la numeración ni la columna Propietario. Riesgo y Prioridad tienen desplegable y color (Prioridad: I = la más importante, N = media, M = poco importante). Tiempo estimado se escribe a mano, en horas.
  - Tiempo total y Estado se calculan solos a partir de los objetivos de cada página. Tiempo total es la suma de sus tiempos totales, en horas. Estado vale «En espera» si nadie ha cogido ningún objetivo, «En progreso» en cuanto un objetivo tiene responsable o está terminado, «Finalizada» cuando todos están en «Sí» y «Sin página» si la fila aún no tiene página. Las filas en progreso se resaltan en amarillo y negrita, y las finalizadas en gris. Cada columna tiene su filtro.
  - Páginas: arriba, los datos de la story (Ref, Título, Estado, Prioridad, Riesgo, Tiempo estimado, Tiempo total, Propietario, Fecha, Prior Reference, Task Description y Criterio de Validación); las celdas grises se rellenan solas desde el índice. Abajo, la tabla de objetivos: Objetivo (número automático), Descripción, Finalizado (Sí en verde, No en rojo), Responsable (desplegable con el equipo, admite otros nombres), Tiempo estimado y Tiempo total, los dos en minutos. La columna de notas desaparece.
  - Objetivos migrados de FLA05, LUC01, LUC09, MAT16 y US60: «Y» y «Hecho» pasan a «Sí» y los tiempos a minutos («30 min» → 30; los números sueltos estaban en horas, así que 0,5 → 30). En LUC01 (CS-49) el antiguo «Objetivo 4.1» pasa a ser el 5 y los siguientes suben uno. El objetivo 4 de LUC09 (CS-57), que estaba sin marcar, queda en «No». Riesgo unificado: «Baja» y «Alta» pasan a «Bajo» y «Alto».
  - Hoja «Plantilla», la última: la página vacía de la que salen las nuevas.
- `documentacion/office-scripts/crearPaginas.ts` (nuevo) — script del botón «Crear páginas» del Excel. Recorre el índice y, a cada fila con título, le pone la siguiente referencia libre si no la tiene, crea su página copiando «Plantilla» (con la referencia y la fecha de hoy) y enlaza el título. Es un Office Script: un programa en TypeScript que Excel para la web ejecuta dentro del libro desde la pestaña «Automatizar». Las fórmulas no pueden crear hojas, por eso este paso necesita el script.
- `documentacion/metodologia.md` — apartados 3.1 a 3.4 nuevos con la estructura del Excel, el esquema de colores y formatos, cómo añadir historias y objetivos y las precauciones para no romper las fórmulas. La introducción del apartado 3 indica que la reestructuración ya está hecha y que el traslado a OneDrive sigue pendiente.
- `documentacion/prompts/joaquin.md` — primera entrada del registro: el prompt de la reestructuración del Excel y las respuestas y aclaraciones que la concretaron.

### Cómo probarlo

```bash
cd backend
npm install       # instala jest-environment-jsdom
npm test          # 182 pruebas, todas en verde
npm run dev
```

Abrir http://localhost:3000, iniciar sesión y, en la bienvenida:

1. Pulsar «+», rellenar el formulario y pulsar «Guardar»: la experiencia aparece justo detrás del «+».
2. Pulsar una tarjeta, cambiar algún dato y guardar: la tarjeta se actualiza en su sitio.
3. Escribir solo espacios en el título: el formulario muestra «El título es obligatorio» y no se cierra.
4. Recargar la página: las experiencias siguen ahí, de la más nueva a la más antigua.

Con curl (sesión iniciada con `-c cookies.txt` en el login):

```bash
curl -b cookies.txt http://localhost:3000/api/experiencias/mias
curl http://localhost:3000/api/ciudades
```

Foto de perfil: en «Mi perfil», elegir una foto. Se sube sola («Subiendo foto...» y después «Foto actualizada.») y se mantiene al recargar.

Registro: en http://localhost:3000/registro.html, con las herramientas del navegador bloquear `challenges.cloudflare.com` (pestaña *Network* → *Block request URL*) y recargar: aparece «No se ha podido cargar el CAPTCHA...». Al enviar el formulario, el botón muestra «Creando cuenta...» hasta que responde el servidor.

Excel de customer stories, en Excel de escritorio o para la web:

1. En una página, poner un responsable en un objetivo sin terminar: en el índice la story pasa a «En progreso» y su fila se resalta. Con todos los objetivos en «Sí», pasa a «Finalizada».
2. Escribir una descripción en la fila vacía de debajo de la tabla de objetivos: la tabla crece, el número del objetivo aparece solo y su tiempo total se suma en la cabecera y en el índice.
3. Escribir un título en la fila vacía de debajo del índice: su estado es «Sin página». Con el botón instalado, pulsar «Crear páginas»: la fila recibe la referencia de «Próxima ref.» (arriba a la derecha) y aparece su página.

### Para quien siga trabajando en esto

- La política de contenido de helmet solo deja cargar scripts propios, así que el JavaScript de Bootstrap (modales, desplegables...) no está disponible. El formulario usa el elemento `<dialog>` del navegador con `showModal()`.
- Las tarjetas se construyen con `textContent`, nunca metiendo el texto del usuario como HTML. Mantenerlo así en las tarjetas nuevas.
- `GET /api/experiencias/mias` sirve también para FLA02 (mis experiencias publicadas en el perfil).
- Las pruebas de pantallas cargan el HTML y los scripts de `frontend/` tal cual (ver la cabecera de `tests/registroPantalla.test.js`). Para probar otra pantalla, copiar ese esquema: `@jest-environment jsdom`, `fetch` simulado y el HTML cargado en `beforeEach`. Turnstile real no se puede automatizar (Cloudflare rechaza los navegadores automatizados), así que en las pruebas siempre va simulado.
- Botón «Crear páginas» del Excel: se instala una vez, con el libro ya en OneDrive y abierto en Excel para la web. Automatizar → Nuevo script → pegar `documentacion/office-scripts/crearPaginas.ts` → guardar como «Crear páginas» → en el panel del script, «…» → «Agregar en el libro». El botón queda en el libro para todos los que pueden editarlo. Necesita una cuenta de Microsoft 365 con Office Scripts: si no aparece la pestaña «Automatizar», no están disponibles.
- Sin el botón, una página nueva se crea a mano: clic derecho en «Plantilla» → Duplicar, renombrar la copia con la referencia de «Próxima ref.», escribirla en B2 de la página nueva y en la columna Ref de su fila del índice.
- El índice lee de cada página las columnas A (número de objetivo), C (Finalizado), D (Responsable) y F (Tiempo total) por su posición: no insertar ni mover columnas en las páginas. Tampoco insertar filas en la cabecera de «Plantilla»: el botón escribe la referencia en B2 y la fecha en B10. El índice se puede ordenar y filtrar sin problema.
- En Excel para la web, un filtro aplicado en el índice lo ven todos los que tienen el libro abierto. Para filtrar solo para uno mismo: Vista → Vista de hoja → Nueva.
- CS-06 tiene la prioridad «IM», que no es I, N ni M. Se ha dejado tal cual, sin color, para que la revise su propietario.
- Los documentos, pruebas y commits del repositorio siguen usando los códigos antiguos (FLA05, LUC09...).

# Metodología y registro del trabajo con IA — Documentado (02/10/2026)

El equipo acuerda hacer explícito y trazable el uso de agentes de inteligencia artificial en el desarrollo de PlanB.

### Qué se ha añadido

- `AGENTS.md` en la raíz: contexto común para agentes nuevos, con las fuentes de verdad, la arquitectura obligatoria, las convenciones de backend y frontend, las reglas de seguridad, las pruebas y la forma de entregar una tarea.
- `documentacion/metodologia.md`: proceso de preparación, colaboración, revisión y validación; reparto de responsabilidades entre el agente y la persona; y fichas pendientes para que cada integrante describa su forma real de trabajo.
- `documentacion/prompts/`: registro distribuido, con un índice común, una plantilla y un archivo por integrante para conservar los prompts relevantes sin incluir secretos ni inventar interacciones pasadas.
- `README.md`: enlaces a los tres documentos nuevos y actualización de la descripción de `documentacion/`.

### Decisiones tomadas

- No se han reconstruido ni atribuido prompts anteriores. Cada integrante incorporará los suyos a partir del texto que conserve; un resumen de una interacción pasada deberá marcarse como reconstruido.
- No es necesario copiar conversaciones completas: se registran el prompt inicial, las correcciones que cambien la solución, el resultado, la intervención humana, las comprobaciones y el commit o pull request.
- La responsabilidad final sigue siendo del integrante que revisa e incorpora el cambio. El registro de IA aporta trazabilidad, pero no sustituye las pruebas ni la comprensión del código.
- El registro se divide por integrante para que pueda crecer sin convertir un único documento en un archivo difícil de consultar ni provocar conflictos frecuentes al editarlo entre varias personas.

### Cómo comprobarlo

Abrir los enlaces de la sección «Documentación» del `README.md` y comprobar que cada integrante aparece tanto en la metodología como en el índice de `documentacion/prompts/`. Al iniciar una tarea nueva con un agente compatible, verificar que lee automáticamente el `AGENTS.md` de la raíz o proporcionárselo como contexto si la herramienta no admite este mecanismo.

### Ampliación acordada el 02/10/2026

- Se incorpora TDD como flujo preferente: prueba que falla, implementación mínima y refactorización. El integrante responsable debe entender la preparación, la acción y el resultado esperado del bloque de prueba añadido.
- Se documenta como pendiente el traslado y la reestructuración de `Customer_Stories_PlanB.xlsx` en OneDrive. Hasta que el README publique el enlace y la fecha de migración, el Excel del repositorio sigue siendo la referencia disponible.
- La metodología incluye el procedimiento concreto que Matthew utiliza en Windows para actualizar Git, dependencias, migraciones y pruebas, además de una plantilla para que el resto documente sus pasos reales en Windows, macOS o Linux y en su editor o terminal.
- Se añade una ficha para un sexto integrante todavía sin nombre, código de historias ni commits conocidos. Sus datos no se completarán por suposición.
- El registro de prompts pasa a un índice y un archivo por integrante en `documentacion/prompts/`.
- La ficha de Matthew queda completada con su entorno actual, objetivos de aprendizaje, preparación del contexto, revisión, TDD, actualización y precauciones. El uso futuro de un agente en Visual Studio se diferencia de las herramientas que ya utiliza.
- `documentacion/prompts/matthew.md` incorpora los prompts sustantivos conservados en esta conversación. Cuando no consta la fecha original, el documento identifica el 02/10/2026 como fecha de incorporación al registro y no como fecha atribuida al mensaje.
- `AGENTS.md` incorpora un protocolo de inicio: cuando alguien pide que se le ponga en contexto, el agente pregunta primero quién es, consulta su ficha y le proporciona los pasos apropiados para su sistema y entorno antes de preguntarle qué tarea va a realizar. La metodología incluye la frase de inicio recomendada.

# Hoja de ruta de aprendizaje de Matthew — Documentada (02/10/2026)

Se añade `documentacion/hoja-ruta-aprendizaje.md` y se enlaza desde el README. Organiza dos semanas de aprendizaje con cuatro horas principales por semana y ampliaciones opcionales hasta doce. Incluye fundamentos de programación desde Java, seguimiento de una funcionalidad por las capas, preparación de la revisión, HTTP, seguridad, MySQL, Prisma, pruebas, TDD y un ejercicio de desarrollo frontend con Bootstrap en un archivo personal de práctica. Las actividades se basan en archivos y comandos existentes del proyecto. El prompt que motivó la guía se registra en `documentacion/prompts/matthew.md`.

## Nuevas historias en el Excel (CS-61 a CS-64) — Documentado (05/10/2026)

`documentacion/customer-stories/Customer_Stories_PlanB.xlsx` se sustituye por la versión más reciente, que añade cuatro historias, todavía sin propietario y en espera:

- CS-61 — Amistades y seguidores.
- CS-62 — Perfil de otro usuario.
- CS-63 — Pantalla de valoraciones y comentarios.
- CS-64 — Contraseña segura.

# Libro de historias en OneDrive — Documentado (05/10/2026)

`Customer_Stories_PlanB.xlsx` ya tiene su versión oficial en el OneDrive compartido y deja de mantenerse en Git. Cada tarea registra responsable voluntario, tiempo estimado y tiempo real. El integrante facilita una copia actual para consulta y traslada manualmente al libro online las tareas acordadas. Se actualizan `README.md`, `AGENTS.md`, la metodología y `.gitignore` para reflejar este flujo.

# CS-45: mi número de amigos y seguidores — Implementado (07/10/2026)

El perfil propio muestra cuántos amigos y seguidores tiene el usuario y el listado paginado de ambos.

### Cambios realizados

- **Repositorios:** `amistadRepository.listarAmigos` y `seguimientoRepository.listarSeguidores` devuelven una página de personas con `id`, `nombreUsuario` y `foto`, sin email, ordenadas por fecha y, a igualdad, por `id`. Los contadores `contarAmigos` y `contarSeguidores` ya existían y se reutilizan.
- **Servicio:** `perfilService` añade `obtenerResumenRelaciones`, `listarAmigosPropios` y `listarSeguidoresPropios`. La paginación usa página 1 y 20 personas por defecto, con un máximo de 50; un valor no válido responde 400.
- **Rutas:** `GET /api/perfil/resumen` devuelve `{ amigos, seguidores }`; `GET /api/perfil/amigos` y `GET /api/perfil/seguidores` aceptan `pagina` y `limite` y devuelven `{ pagina, limite, total, personas }`. Las tres exigen sesión y usan siempre el usuario de la sesión.
- **Pantalla:** `perfil.html` incorpora la sección «Amigos y seguidores» y `perfil.js` la rellena al abrir la página. «Cargar más» pide la página siguiente y no repite a nadie.
- **Pruebas:** 40 pruebas nuevas en `relacionesListadoRepository`, `perfilRelacionesService`, `perfilRelacionesRoutes`, `perfilRelacionesCriterio` y `relacionesPantalla`. La batería tiene 49 suites y 402 pruebas, todas correctas.

### Decisiones tomadas

- El código de pantalla va en `perfil.js`, para mantener un único archivo JavaScript por página.
- En `solicitudesPantalla.test.js` y `perfilPantalla.test.js`, tres comprobaciones pasan de `fetch.mock.calls[2]` a `fetch.mock.calls.at(-1)`: localizan la llamada por ser la última y no por su posición, porque el perfil hace ahora más llamadas al cargar. Acordado con Matthew y Joaquín.

### Para quien continúe

- Los contadores y las listas se piden al abrir la página. Después de aceptar una solicitud en «Solicitudes recibidas» no cambian hasta recargar. Queda como posible mejora.
- Las personas de las listas todavía no enlazan a su perfil público.
- «Cargar más» solo se ha comprobado con pruebas automáticas, no con más de 20 personas reales.

### Cómo comprobarlo

```bash
cd backend
npm test
```

Resultado esperado: 49 suites y 402 pruebas correctas. A mano, con dos cuentas (una en una ventana de incógnito): enviar una solicitud, aceptarla, seguir, dejar de seguir y eliminar la amistad, recargando «Mi perfil» tras cada paso para ver cambiar las cifras.
