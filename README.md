# PlanB — Práctica ISW

PlanB es una red social web, adaptada también al móvil, para compartir y descubrir **experiencias**: planes completos por una ciudad (lugares, actividades, presupuesto y duración) creados por otros usuarios, en lugar de reseñas de sitios sueltos.

## Estado del proyecto

Historias de usuario implementadas:

| Historia | Qué permite |
|---|---|
| CS-59 · Crear una cuenta | Registro con CAPTCHA, inicio y cierre de sesión |
| CS-64 · Contraseña segura | Requisitos de la contraseña, cambiarla desde el perfil y recuperarla por email |
| CS-47 · Crear mi perfil | Ver y editar el perfil propio, con su foto |
| CS-49 · Creación de experiencias | Crear experiencias con su ciudad del catálogo |
| CS-57 · Edición de experiencia | Editar las experiencias propias |
| CS-22 · Visibilidad experiencias | Privada, de amigos o pública, con su descripción en el formulario |
| CS-30 · Control de acceso | Solo se ve una experiencia si su visibilidad lo permite; si no, «Contenido no disponible» |
| CS-44 · Mis experiencias publicadas | Las experiencias de un usuario en su perfil, por páginas |
| CS-61 · Amistades y seguidores | Buscar personas, solicitudes de amistad y seguir |
| CS-45 · Mi número de amigos y seguidores | Contadores y listas en «Mi perfil» |
| CS-62 · Perfil de otro usuario | Su perfil público, la relación con él y sus experiencias |
| CS-01 · Valorar una experiencia | Puntuación del 1 al 5 y comentario opcional |
| CS-63 · Pantalla de valoraciones | La página de una experiencia con sus valoraciones |
| CS-48 · Valoraciones de amigos y seguidores | Sección propia en la página de la experiencia |

Pendiente: «Útil» y «Reportar» en las valoraciones funcionan solo en la pantalla, sin guardar nada, hasta que se implementen CS-02 y CS-04. El estado de cada tarea se lleva en el libro de historias (ver [Historias de usuario](#historias-de-usuario)).

## Arquitectura

PlanB es una **aplicación web responsive** organizada en capas: un único backend con rutas, lógica de negocio y persistencia separadas, que expone una API REST en JSON y sirve también las páginas del frontend.

| Capa | Tecnología |
|---|---|
| Interfaz | HTML, CSS, JavaScript + Bootstrap |
| Backend | Node.js + Express (sesiones con express-session guardadas en MySQL, contraseñas con bcrypt, cabeceras de seguridad con helmet, límite de intentos con express-rate-limit) |
| Protección contra bots | CAPTCHA Cloudflare Turnstile en el registro |
| Persistencia | Prisma |
| Base de datos | MySQL (en Docker para desarrollo) |
| Imágenes | Cloudinary |
| Correo | Nodemailer por SMTP (sin configurar, el email se escribe en la consola) |
| Pruebas | Jest + Supertest (API) y jsdom (pantallas) |

El detalle de cada herramienta, los diagramas de capas y del modelo de datos, la estructura del repositorio y la puesta en marcha están en [`documentacion/arquitectura.md`](documentacion/arquitectura.md).

## Puesta en marcha

Requiere Git, Node.js 22+ y Docker. Cómo instalarlos en Windows, macOS y Linux: [sección 7 de la arquitectura](documentacion/arquitectura.md#7-instalación-de-herramientas).

```bash
docker compose up -d          # MySQL
cd backend
cp .env.example .env          # cambiar SESSION_SECRET; CLOUDINARY_URL y SMTP_URL cuando hagan falta
npm install
npm run db:migrate
npm run db:seed               # catálogo inicial de ciudades (se puede repetir)
npm run dev                   # http://localhost:3000
```

Pruebas, desde `backend/`:

```bash
npm test                      # sin base de datos (todo simulado)
npm run test:mysql            # con MySQL real (Docker en marcha)
npm run test:todo             # las dos anteriores
npm run test:cobertura        # todas, con el informe de cobertura en backend/coverage/
```

Tras un `git pull` que traiga migraciones o dependencias nuevas: `npm install`, `npx prisma migrate deploy` y `npx prisma generate`.

## Documentación

Toda la documentación detallada vive en [`documentacion/`](documentacion/):

* [Arquitectura](documentacion/arquitectura.md) — alcance, capas y archivos, modelo de datos, visibilidad, herramientas, autenticación, estructura del repositorio, instalación, entorno de desarrollo y pruebas.
* [Referencia de la API](documentacion/api.md) — cada ruta con su servicio, lo que recibe, lo que devuelve y sus errores.
* [Flujos y estados](documentacion/flujos.md) — diagramas de secuencia de los flujos principales (registro, login, valorar, amistad, recuperar la contraseña...) y de los estados de amistades, valoraciones y enlaces de recuperación.
* [Pantallas](documentacion/frontend.md) — mapa de navegación, qué archivos y llamadas usa cada página, sus estados y las reglas del frontend.
* [Glosario](documentacion/glosario.md) — los términos técnicos del proyecto, explicados y con dónde aparecen en PlanB.
* [Modificaciones](documentacion/modificaciones.md) — registro de los cambios realizados: qué se ha hecho, cómo probarlo y notas para quien siga trabajando.
* [Propuesta inicial](documentacion/propuesta-inicial.md) — planteamiento conceptual del producto: problema, público objetivo, objetivos, módulos funcionales, modelo de datos, comparación con soluciones existentes, límites de alcance y riesgos. Describe la idea, no lo que ya existe.
* [Metodología de trabajo con IA](documentacion/metodologia.md) — proceso común, responsabilidades, revisión y forma de trabajo de cada integrante.
* [Registro de prompts](documentacion/prompts/README.md) — índice, plantilla y un archivo por integrante para las interacciones con IA que hayan influido en el proyecto.
* [Guía de aprendizaje](documentacion/hoja-ruta-aprendizaje.md) — recorrido flexible para entender los fundamentos de PlanB, practicar cada concepto y reconocerlo en la versión vigente del proyecto.

Los diagramas están escritos en Mermaid: GitHub los dibuja directamente y, en Visual Studio Code, se ven con la extensión «Markdown Preview Mermaid Support».

Las instrucciones comunes para los agentes que colaboren en el repositorio están en [`AGENTS.md`](AGENTS.md).

## Historias de usuario

El libro de historias de usuario (`Customer_Stories_PlanB.xlsx`) que usa el equipo está en el **OneDrive compartido**: allí se llevan el estado de cada tarea, su responsable voluntario, el tiempo estimado y el tiempo real.

La copia de `documentacion/customer-stories/` sirve solo como guía general de las historias y sus criterios: no se usa para trabajar ni se marca en ella ningún progreso. Si hace falta cambiar algo del libro, se apunta como lista de cambios para pasarla al libro online. La misma carpeta guarda los documentos individuales de partida (`01-PlanteamientoInicial/`), y `documentacion/office-scripts/crearPaginas.ts` es el script del botón «Crear páginas» del libro online (ver [metodología](documentacion/metodologia.md)).

## Estructura del repositorio

* `backend/` — servidor Node.js + Express: API REST, lógica de negocio, persistencia con Prisma y pruebas.
* `frontend/` — páginas HTML, CSS y JavaScript con Bootstrap.
* `docker-compose.yml` — MySQL para desarrollo local.
* `documentacion/` — documentación del proyecto, copia de guía de las historias de usuario (`customer-stories/`) y el script del libro online (`office-scripts/`).

## Licencia

Este proyecto se distribuye bajo licencia [Apache 2.0](LICENSE).
