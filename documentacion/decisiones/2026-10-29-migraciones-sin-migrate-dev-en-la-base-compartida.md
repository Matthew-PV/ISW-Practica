# `db:migrate` aplica migraciones; crear una nueva se hace en la base local

**Fecha:** 2026-10-29 · **Historia:** sin historia · **Decidió:** Joaquín, a propuesta de Claude (señalado por una revisión externa de la estructura del repositorio)

- **Contexto:** `npm run db:migrate` ejecutaba `prisma migrate dev` contra la base online compartida, la única de desarrollo. `migrate dev` genera migraciones y puede proponer reiniciar la base si detecta que no coincide con las migraciones, algo que no conviene en una base que usa todo el equipo.
- **Decisión:** `npm run db:migrate` pasa a `prisma migrate deploy` (solo aplica las migraciones ya incluidas en el repositorio). Se añade `npm run db:migrate:nueva`, que ejecuta `prisma migrate dev` con `.env` más `.env.demo`, es decir, contra la base local `planb_demo` de Docker. El flujo es: cambiar `schema.prisma`, `db:migrate:nueva`, subir la migración y aplicarla a la online con `db:migrate`.
- **Alternativas:** dejar `migrate dev` sobre la base online; añadir comprobaciones en `seed` y `migrate` que se nieguen a actuar si la base no es local (más código, no se hizo).
- **Consecuencias:** quien cree una migración necesita Docker levantado. `db:migrate` sobre la base online no se ha ejecutado al hacer el cambio; `db:migrate:nueva` sí se comprobó contra `planb_demo` (sin cambios pendientes).
