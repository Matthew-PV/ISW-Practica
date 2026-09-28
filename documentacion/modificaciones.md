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

## Login como página principal — Implementado (28/09/2026)

La página de relleno de `/` se ha quitado. Ahora `/` muestra directamente el formulario de inicio de sesión.

### Qué se ha hecho

- Frontend:
  - `index.html` — ahora es la página de login (antes `login.html`, que ya no existe). En la barra superior muestra el estado del servidor: «conectado» o «sin conexión».
  - `js/index.js` — sigue comprobando `GET /api/health` y pinta el estado en la barra.
  - `registro.html` — el enlace «Inicia sesión» apunta a `/`.

### Cómo probarlo

1. `npm run dev` dentro de `backend/` y abrir http://localhost:3000 — aparece el formulario de login y, arriba a la derecha, «conectado» en verde.
2. «Regístrate» lleva a `registro.html`, e «Inicia sesión» vuelve a `/`.

### Para quien siga trabajando en esto

- `/login.html` ya no existe: cualquier enlace al login debe apuntar a `/`.

## Pantalla de bienvenida — Implementado (28/09/2026)

Tras iniciar sesión o registrarse aparece una pantalla que saluda al usuario por su nombre.

### Qué se ha hecho

- Backend:
  - `GET /api/auth/yo` — ahora devuelve `{ id, nombreUsuario, email }` del usuario con sesión (antes solo el `id`). Usa `obtenerUsuario()` en `src/services/authService.js`.
  - `tests/yo.test.js` — pruebas de `/api/auth/yo` con y sin sesión. Simulan el repositorio con `jest.mock`, así que no necesitan MySQL.
- Frontend:
  - `bienvenida.html` y `js/bienvenida.js` — muestran «¡Bienvenido, <nombre>!» con el nombre que da `GET /api/auth/yo`. Si no hay sesión, redirigen a `/`.
  - `js/auth.js` — tras iniciar sesión o registrarse redirige a `bienvenida.html` (antes a `/`).

### Cómo probarlo

1. `npm test` dentro de `backend/` — pasan las 4 pruebas.
2. `npm run dev`, abrir http://localhost:3000 e iniciar sesión (o registrarse) — aparece «¡Bienvenido, <tu nombre>!».
3. Abrir http://localhost:3000/bienvenida.html en una ventana privada, sin sesión — redirige al login.

## Revisión y refactorización del código — Implementado (28/09/2026)

Repaso de todo lo construido hasta ahora para quitar código duplicado, comentar las funciones y corregir fallos pequeños. El comportamiento de la aplicación no cambia, salvo donde se indica.

### Qué se ha hecho

- Backend:
  - Un solo cliente de Prisma: `src/repositories/prisma.js`. Se ha borrado `src/prismaClient.js`, que era un duplicado; `usuarioRepository.js` importa ahora `./prisma`.
  - Se ha borrado `src/services/.gitkeep`: la carpeta ya no está vacía.
  - `src/services/authService.js` — las funciones `crearError()` y `datosPublicos()` sustituyen a código que se repetía tres veces. Las dos comprobaciones de «Email o contraseña incorrectos» se han unido en una. Todas las funciones están comentadas.
  - `src/routes/auth.js` — sin `try/catch`: Express 5 pasa solo al manejador de errores los fallos de las rutas `async`. Rutas comentadas.
  - `src/repositories/usuarioRepository.js` — comentado.
  - `src/app.js` — el manejador de errores solo escribe en consola los errores inesperados (500). Los esperados, como un 400 o un 401, ya no llenan la consola de trazas.
  - `src/app.js`, `src/server.js` y `src/routes/index.js` — comentados.
  - **Corrección:** si la sesión apunta a un usuario que ya no existe (por ejemplo, tras vaciar la base de datos), `GET /api/auth/yo` responde 401 en vez de 500.
- Pruebas:
  - `tests/auth.test.js` (antes `tests/yo.test.js`) — cubre toda la autenticación: registro, login, `yo` y logout, con sus casos de error. Simulan el repositorio, así que no necesitan MySQL.
  - `tests/setup.js` — pone `SESSION_SECRET` antes de cada archivo de pruebas (configurado en `"jest"` de `package.json`). Así no hay que repetirlo en cada test.

### Cómo probarlo

1. `npm test` dentro de `backend/` — pasan todas las pruebas.

### Para quien siga trabajando en esto

- En las rutas nuevas no hace falta `try/catch`: basta con lanzar un error con `crearError(mensaje, status)` desde el servicio y Express lo devuelve con ese código.
