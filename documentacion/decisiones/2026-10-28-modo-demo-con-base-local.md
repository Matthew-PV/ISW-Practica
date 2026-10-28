# Modo demo: base local en Docker con los datos de demostración

**Fecha:** 2026-10-28 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** sin internet, o con la base online lenta o bloqueada (P1001), el servidor de desarrollo no puede iniciar sesión y no se puede ver la interfaz con datos.
- **Decisión:** se añade un segundo modo, sin quitar el de la base online. `npm run dev:demo` arranca el servidor con `.env` más `.env.demo` (versionado, sin secretos), que apunta a la base `planb_demo` del MySQL de Docker. `npm run demo:preparar` aplica las migraciones, carga el catálogo y los datos `demo_*`. Con `SEED_SIN_FOTOS` el seed no sube fotos a Cloudinary y las cuentas usan la foto por defecto.
- **Alternativas:** reutilizar la base `planb` de las pruebas (las pruebas con MySQL la borran); cambiar a mano `DATABASE_URL` en `.env` (propenso a errores y a lanzar migraciones contra la base equivocada).
- **Consecuencias:** `.env.demo` se versiona (`.gitignore`); el modo normal sigue siendo la base online compartida; en demo no hay fotos de perfil de ejemplo y los cambios no llegan al equipo. Matiza, sin anular, la decisión `2026-10-28-base-online-unica-para-desarrollo.md`.
