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

### Lo importante para entender el cambio

- **Flujo de pantallas:** `/` es ahora el login (antes era una página de relleno y `login.html` ya no existe). Al entrar o registrarse se llega a `bienvenida.html`, que saluda por el nombre; sin sesión, devuelve al login.
- **Errores en el backend:** los servicios lanzan errores con la propiedad `status` y `app.js` los devuelve con ese código y su mensaje. Las rutas no llevan `try/catch`, porque Express 5 pasa solo los errores de las funciones `async`. Solo los errores inesperados (500) se escriben en consola.
- **Prisma** solo se usa desde `src/repositories/`. El cliente único está en `src/repositories/prisma.js`.
- **Validación en el servidor:** `authService` comprueba tipos, formato y longitud de todos los datos antes de tocar la base de datos, y normaliza los textos (Unicode NFC; el email, sin espacios y en minúsculas). Los límites del HTML son solo una ayuda: la regla de verdad está en el servidor.
- **Sesiones en MySQL:** se guardan en la tabla `Session` (`src/repositories/sesionStore.js`, con `@quixo3/prisma-session-store`), así que sobreviven a los reinicios del servidor. Caducan tras un día sin actividad. Hay una migración nueva: tras el `git pull`, ejecutar `npm install` y `npx prisma migrate deploy` en `backend/`.
- **Pruebas sin MySQL:** simulan los repositorios con `jest.mock`, y las sesiones se guardan en memoria. `tests/setup.js` desactiva los límites de intentos; `tests/limites.test.js` los prueba de verdad con `jest.unmock`. `tests/setup.js` prepara el entorno de todas las pruebas.

### Qué ha cambiado

- Frontend:
  - `index.html` — página de login, con el estado del servidor en la barra superior (lo pinta `js/index.js`).
  - `bienvenida.html` + `js/bienvenida.js` — pantalla de bienvenida.
  - `js/auth.js` — `enviarFormulario()` sirve para los dos formularios, login y registro. En el registro muestra el CAPTCHA (`iniciarCaptcha()`) y lo reinicia tras cada error.
  - `css/styles.css` — clase `contenedor-formulario` para la columna de 400px de los formularios.
- Backend:
  - `GET /api/auth/yo` devuelve `{ id, nombreUsuario, email }`. Responde 401 si no hay sesión o si el usuario ya no existe.
  - `src/services/authService.js` — `datosPublicos()` (lo que se puede enviar al frontend, nunca la contraseña cifrada) y `crearError()`.
  - Reglas de registro: nombre de usuario de 3 a 30 letras (de cualquier alfabeto), números, `_`, `.` o `-`, sin espacios, emojis ni caracteres invisibles; email con formato válido (máx. 191); contraseña de 8 caracteres a 72 bytes (bcrypt ignora lo que pasa de 72 bytes, así que dos contraseñas largas podrían confundirse).
  - Nombre de usuario o email repetido → 400 con un mensaje claro (antes, 500). Lo detecta MySQL con los índices únicos (error `P2002` de Prisma), así que funciona aunque lleguen dos registros a la vez.
  - Datos de tipo incorrecto, petición sin cuerpo o JSON roto → 400 (antes, 500 o un mensaje en inglés).
  - `bcrypt` actualizado a la versión 6: la 5 arrastraba `tar`, con vulnerabilidades críticas. Las contraseñas ya guardadas siguen funcionando. Tras el `git pull`, ejecutar `npm install` en `backend/`.
  - `GET /api/health` consulta también MySQL (`src/repositories/saludRepository.js`) y responde 503 si no responde. El indicador del login pasa a «sin conexión» y, al pasar el ratón por encima, muestra el motivo.
  - Límite de intentos por IP (`src/middlewares/limites.js`, con `express-rate-limit`): 10 logins fallidos cada 15 minutos y 20 registros por hora. Al pasarse, responde 429 «Demasiados intentos». Los contadores están en memoria y se reinician con el servidor.
  - Cabeceras de seguridad con `helmet` en `app.js`: política de contenido (CSP), que solo deja ejecutar scripts propios; protección contra meter la web en un marco ajeno (`X-Frame-Options`); `nosniff`; y ya no se envía `X-Powered-By: Express`.
  - CAPTCHA en el registro con Cloudflare Turnstile (`src/services/captchaService.js`). Se comprueba antes de consultar la base de datos, así que un programa no puede probar emails en masa para ver cuáles están registrados. `GET /api/auth/captcha` da la clave pública al formulario. Nuevas variables `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` en `.env` (ver `.env.example`).
  - `src/errores.js` — `crearError(mensaje, status)`, común para todo el backend.
  - Login: con un email que no existe también se ejecuta bcrypt (contra `HASH_FICTICIO`), así que la respuesta tarda lo mismo y el tiempo no delata qué emails están registrados.
  - Sesiones: al iniciar sesión o registrarse se crea una sesión nueva con otro id (`abrirSesion()` en `routes/auth.js`), lo que evita la fijación de sesión. El logout, además de cerrar la sesión en el servidor, borra la cookie del navegador.
  - Se ha borrado el cliente de Prisma duplicado (`src/prismaClient.js`). Todo el backend está comentado.
- Pruebas: `tests/auth.test.js` cubre registro, login, `yo` y logout, con sus casos de error; `tests/validacion.test.js`, los datos válidos y no válidos; `tests/app.test.js` (antes `health.test.js`), `/api/health`, el 404 de la API y las cabeceras de seguridad.
- Repositorio: `.gitignore` reescrito solo con lo que usa el proyecto.

### Cómo probarlo

1. `npm test` dentro de `backend/` — pasan todas las pruebas.
2. `npm run dev` y abrir http://localhost:3000:
   - login con una contraseña incorrecta → sale el error; con la correcta → bienvenida;
   - registro con un email repetido → «El email ya está registrado»;
   - http://localhost:3000/bienvenida.html sin sesión (ventana privada) → vuelve al login.

### Para quien siga trabajando en esto

- Cualquier enlace al login debe apuntar a `/`.
- Para devolver un error al cliente, lanzar `crearError(mensaje, status)` de `src/errores.js`.
- La CSP bloquea los scripts en línea (`<script>…</script>`, `onclick="…"`) y los de otros dominios: el código va en archivos de `js/`. Si hace falta cargar algo de otro dominio, hay que añadirlo a la configuración de `helmet` en `app.js`.
- **Tras el `git pull`, copiar a `backend/.env` las dos variables `TURNSTILE_…` de `.env.example`**; sin ellas no se puede registrar nadie. Son las claves de prueba de Cloudflare, que siempre aceptan. Para desplegar, crear las reales en Cloudflare → Turnstile. El registro necesita conexión a internet para verificar el CAPTCHA.
- En las pruebas, `tests/setup.js` da el CAPTCHA siempre por bueno; `tests/captcha.test.js` prueba el servicio real simulando las respuestas de Cloudflare.
- Para un formulario nuevo, basta llamar a `enviarFormulario()` en `js/auth.js` con el id del formulario, el id de la caja de error, la ruta de la API y los campos.
