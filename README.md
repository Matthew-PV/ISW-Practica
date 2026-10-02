# PlanB — Práctica ISW

PlanB es una red social web, adaptada también al móvil, para compartir y descubrir **experiencias**: planes completos por una ciudad (lugares, actividades, presupuesto y duración) creados por otros usuarios, en lugar de reseñas de sitios sueltos.

## Estado del proyecto

La propuesta de producto, las historias de usuario y la arquitectura están documentadas. Ya se han implementado el registro, el inicio de sesión, la consulta y edición del perfil propio (con su foto) y la creación y edición de experiencias desde la pantalla de bienvenida, con un catálogo inicial de capitales. Al editar una experiencia queda pendiente rechazar un cambio de ciudad incompatible con sus lugares, que necesita los lugares de LUC02.

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
| Pruebas | Jest + Supertest (API) y jsdom (pantallas) |

El detalle de cada herramienta, la estructura del repositorio y la puesta en marcha están en [`documentacion/arquitectura.md`](documentacion/arquitectura.md).

## Puesta en marcha

Requiere Git, Node.js 22+ y Docker. Cómo instalarlos en Windows, macOS y Linux: [sección 7 de la arquitectura](documentacion/arquitectura.md#7-instalación-de-herramientas).

```bash
docker compose up -d          # MySQL
cd backend
cp .env.example .env          # ajustar SESSION_SECRET
npm install
npm run db:migrate
npm run db:seed               # catálogo inicial de capitales (se puede repetir)
npm run dev                   # http://localhost:3000
```

## Documentación

Toda la documentación detallada vive en [`documentacion/`](documentacion/):

* [Propuesta inicial](documentacion/propuesta-inicial.md) — planteamiento conceptual del producto: problema, público objetivo, objetivos, módulos funcionales, modelo de datos, comparación con soluciones existentes, límites de alcance y riesgos.
* [Arquitectura](documentacion/arquitectura.md) — alcance técnico, capas del sistema, herramientas y sus ventajas, comunicación frontend–backend, autenticación y autorización, estructura del repositorio, instalación de herramientas, entorno de desarrollo y pruebas.
* [Modificaciones](documentacion/modificaciones.md) — registro de los cambios realizados: qué se ha hecho, cómo probarlo y notas para quien siga trabajando.
* [Metodología de trabajo con IA](documentacion/metodologia.md) — proceso común, responsabilidades, revisión y forma de trabajo de cada integrante.
* [Registro de prompts](documentacion/prompts/README.md) — índice, plantilla y un archivo por integrante para las interacciones con IA que hayan influido en el proyecto.

Las historias de usuario del equipo están actualmente en [`customer-stories/`](customer-stories/). El equipo tiene pendiente reestructurar el Excel y trasladarlo a OneDrive para trabajar sobre una versión sincronizada. Hasta que se publique aquí el enlace y la fecha de migración, el archivo del repositorio sigue siendo la referencia disponible.

Las instrucciones comunes para los agentes que colaboren en el repositorio están en [`AGENTS.md`](AGENTS.md).

## Estructura del repositorio

* `backend/` — servidor Node.js + Express: API REST, lógica de negocio, persistencia con Prisma y pruebas.
* `frontend/` — páginas HTML, CSS y JavaScript con Bootstrap.
* `docker-compose.yml` — MySQL para desarrollo local.
* `documentacion/` — documentación del proyecto (propuesta, arquitectura, modificaciones, metodología y registro de prompts).
* `customer-stories/` — historias de usuario del equipo, en formato hoja de cálculo (una hoja por historia) y los documentos individuales de partida de cada miembro.

## Licencia

Este proyecto se distribuye bajo licencia [Apache 2.0](LICENSE).
