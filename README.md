# PlanB — Práctica ISW

PlanB es una red social web, adaptada también al móvil, para compartir y descubrir **experiencias**: planes completos por una ciudad (lugares, actividades, presupuesto y duración) creados por otros usuarios, en lugar de reseñas de sitios sueltos.

## Estado del proyecto

El proyecto está en fase de definición: la propuesta de producto, las historias de usuario y la arquitectura ya están documentadas. La primera versión cubre la creación del perfil y la creación y edición de experiencias.

## Arquitectura

PlanB es una **aplicación web responsive** organizada en capas: un único backend con rutas, lógica de negocio y persistencia separadas, que expone una API REST en JSON y sirve también las páginas del frontend.

| Capa | Tecnología |
|---|---|
| Interfaz | HTML, CSS, JavaScript + Bootstrap |
| Backend | Node.js + Express (sesiones con express-session, contraseñas con bcrypt) |
| Persistencia | Prisma |
| Base de datos | MySQL (en Docker para desarrollo) |
| Imágenes | Cloudinary |
| Pruebas | Jest + Supertest |

El detalle de cada herramienta, la estructura del repositorio y la puesta en marcha están en [`documentacion/arquitectura.md`](documentacion/arquitectura.md).

## Puesta en marcha

Requiere Node.js 22+ y Docker.

```bash
docker compose up -d          # MySQL
cd backend
cp .env.example .env          # ajustar SESSION_SECRET
npm install
npm run db:migrate
npm run dev                   # http://localhost:3000
```

## Documentación

Toda la documentación detallada vive en [`documentacion/`](documentacion/):

* [Propuesta inicial](documentacion/propuesta-inicial.md) — planteamiento conceptual del producto: problema, público objetivo, objetivos, módulos funcionales, modelo de datos, comparación con soluciones existentes, límites de alcance y riesgos.
* [Arquitectura](documentacion/arquitectura.md) — alcance técnico, capas del sistema, herramientas y sus ventajas, comunicación frontend–backend, autenticación y autorización, estructura del repositorio, entorno de desarrollo y pruebas.
* [Cuestiones pendientes](documentacion/cuestiones.md) — notas de trabajo del equipo y desglose de tareas de las primeras historias de usuario.

Las historias de usuario del equipo están en [`customer-stories/`](customer-stories/).

## Estructura del repositorio

* `backend/` — servidor Node.js + Express: API REST, lógica de negocio, persistencia con Prisma y pruebas.
* `frontend/` — páginas HTML, CSS y JavaScript con Bootstrap.
* `docker-compose.yml` — MySQL para desarrollo local.
* `documentacion/` — documentación del proyecto (propuesta de producto, arquitectura y notas de trabajo).
* `customer-stories/` — historias de usuario del equipo, en formato hoja de cálculo (una hoja por historia) y los documentos individuales de partida de cada miembro.

## Licencia

Este proyecto se distribuye bajo licencia [Apache 2.0](LICENSE).
