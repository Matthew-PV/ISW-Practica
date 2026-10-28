# La base de datos online es la única de desarrollo; Docker solo para pruebas

**Fecha:** 2026-10-28 · **Historia:** CS-67 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** el equipo migró la base de datos a un MySQL online compartido (Aiven). Mantener también el MySQL de Docker como opción de desarrollo duplicaba el flujo (dos configuraciones, datos distintos) y las pruebas con MySQL borran datos.
- **Decisión:** el desarrollo usa solo la base online: `.env.example` ya no trae una base local y, sin las credenciales que da el equipo, la aplicación no arranca. Docker queda únicamente para `test:mysql` y `test:cobertura`, que leen `backend/.env.test` (versionado, sin secretos) y `tests/setup.js` aborta si `DATABASE_URL` no es local. Se añade `npm run db:seed-demo` con datos de demostración `demo_*` (fotos de Pexels subidas a Cloudinary, carpeta `planb/demo`), repetible y limitado a esos usuarios.
- **Alternativas:** mantener ambas bases (flujo doble, descartado); pruebas con MySQL contra Aiven (borrarían datos compartidos); sustituir las pruebas MySQL por simulaciones (pierden restricciones y concurrencia reales).
- **Consecuencias:** cada integrante pide al equipo la contraseña y el certificado de Aiven; sin conexión a internet no se puede desarrollar; las migraciones y los cambios de datos afectan a todos; los datos de prueba antiguos que haya en la base online se limpian con `seed-demo --todo` (borra todo salvo el catálogo de ciudades), solo si el equipo lo acuerda.
