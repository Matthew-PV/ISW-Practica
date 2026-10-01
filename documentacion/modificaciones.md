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

## Creación de experiencias (LUC01) y catálogo de ciudades — Implementado (30/09–01/10/2026)

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

## Foto de perfil (FLA05, tareas 4 y 5) y revisión del backend — Implementado (01/10/2026)

Cada usuario puede subir su foto de perfil: se guarda en Cloudinary y en MySQL solo su URL. Además, revisión del backend: repeticiones eliminadas y errores de validación corregidos en la edición del perfil.

### Antes de nada, tras el `git pull`

- `cd backend && npm install`: hay dos dependencias nuevas, **cloudinary** (SDK oficial) y **multer** (recibe archivos de formularios en Express).
- Rellenar `CLOUDINARY_URL` en `backend/.env` con la del panel de Cloudinary (Dashboard → API Keys → *API environment variable*, con el secreto incluido). Pedid la del equipo a Joaquín; nunca se sube a git.

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
  - `src/middlewares/foto.js` (nuevo) — `recibirFoto`: multer en memoria, límite de tamaño y errores en 400.
  - `src/repositories/fotoRepository.js` (nuevo) — `subirFotoPerfil`: sube a Cloudinary y devuelve la URL.
  - `src/repositories/usuarioRepository.js` — `actualizarFoto(id, url)`.
  - `src/services/perfilService.js` — `actualizarFotoPropia`: valida el formato, sube y guarda la URL.
  - `src/routes/perfil.js` — la ruta nueva.
  - `tests/fotoPerfil.test.js` (nuevo) — pruebas con MySQL y Cloudinary simulados.

**Revisión del backend**

- `src/middlewares/sesion.js` (nuevo) — `requiereSesion`: responde 401 `No hay sesión iniciada` si no hay sesión. Sustituye a la comprobación que se repetía en `GET /api/auth/yo`, en las rutas de `/api/perfil` (con `router.use`, para todas a la vez) y en `POST /api/experiencias`.
- `src/services/nombreUsuario.js` (nuevo) — `validarNombreUsuario`: reglas del nombre de usuario, que antes estaban copiadas en `authService` y `perfilService`. Ahora el registro y la edición del perfil validan igual.
  - **Corrige** dos errores de `PUT /api/perfil`: un nombre que no era texto (por ejemplo `12345`) pasaba la validación y acababa en un error 500, y ahora es un 400; y el nombre no se normalizaba a NFC, así que «José» escrito de dos formas podía quedar como dos nombres distintos.
- `src/services/perfilService.js` — validación de `ciudad` en `PUT /api/perfil`. **Corrige** que cualquier valor llegaba a la base de datos: un objeto, un número o un texto de más de 191 caracteres (el tamaño de la columna) acababa en error 500. Ahora:
  - tiene que ser texto o `null`, y como máximo 191 caracteres; si no, responde 400;
  - se guarda sin espacios exteriores y normalizada a NFC;
  - `null` o un texto vacío dejan el perfil sin ciudad.
- `src/repositories/usuarioRepository.js` — los campos del perfil que se pueden mostrar están en una sola constante (`CAMPOS_PERFIL`), usada por `obtenerPerfil`, `actualizarPerfil` y `actualizarFoto`. Para mostrar un campo nuevo del perfil basta con añadirlo ahí.
- **Eliminado `GET /api/health`** por completo: la ruta, `src/repositories/saludRepository.js`, sus pruebas y el indicador «Servidor: conectado» del login (`frontend/js/index.js`). Ahora `/api/health` responde 404 como cualquier ruta inexistente.
- Comentarios en las funciones que no tenían: `ciudadRepository.buscarPorId` y `cerrarConexion`, `ciudadService.cargarCatalogoInicial`, `experienciaService.leerTexto` y la ruta `POST /api/experiencias`.
- Pruebas nuevas: `PUT /api/perfil` sin cuerpo (no cambia nada), y un fallo inesperado de la base de datos en `PUT /api/perfil` y en el registro (responde 500 sin mostrar el detalle). Con ellas, `authService` y `perfilService` quedan cubiertos al 100 %.

### Cómo probarlo

```bash
cd backend
npm test
```

139 pruebas en total, todas en verde. `npx jest --coverage` muestra la cobertura por archivo; los repositorios salen bajos porque las pruebas los simulan.

Con el servidor arrancado (`npm run dev`) y una sesión iniciada con curl (`-c cookies.txt` en el login):

```bash
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@mi-foto.png"   # 200, con la URL
curl -b cookies.txt -X PUT http://localhost:3000/api/perfil/foto -F "foto=@animacion.gif" # 400
curl -b cookies.txt http://localhost:3000/api/perfil                                      # la foto sigue ahí
```

La subida se ha comprobado contra Cloudinary y MySQL reales: subida, rechazo de una imagen dañada y consulta del perfil. Los datos de prueba se borraron después.

### Para quien siga trabajando en esto

- Las rutas nuevas que exijan sesión deben usar `requiereSesion` (`src/middlewares/sesion.js`), no repetir la comprobación.
- Para validar un nombre de usuario en otro sitio, usar `validarNombreUsuario` (`src/services/nombreUsuario.js`).
- La ciudad del perfil (`Usuario.ciudad`) sigue siendo texto libre, distinta del catálogo `Ciudad` de las experiencias.
- FLA05 tarea 6 (imagen por defecto): `foto` es `null` mientras el usuario no sube ninguna. Para mostrar las fotos en el frontend hay que permitir `https://res.cloudinary.com` en `imgSrc` de la política de contenido de helmet (`src/app.js`); ahora solo se permiten imágenes propias.
- FLA05 tarea 10: faltan las pruebas de "edición reflejada" con la foto desde el frontend; las del backend están en `tests/fotoPerfil.test.js`.
