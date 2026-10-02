# Modificaciones — PlanB

Registro de los cambios realizados en el proyecto, en orden cronológico.



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
