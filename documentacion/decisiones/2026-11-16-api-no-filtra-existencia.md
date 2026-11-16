# La API no revela si existe lo que el usuario no puede ver

**Fecha:** 2026-11-16 · **Historia:** sin historia · **Decidió:** Joaquín (plan de análisis aprobado), a propuesta de Claude

- **Contexto:** el análisis del backend encontró respuestas que filtraban información o aceptaban entradas ambiguas: editar la experiencia privada de otra persona daba 403 (confirma que existe); responder una solicitud de amistad ajena daba 403 o «ya no está pendiente»; `PATCH` con `visibilidad: null` publicaba una experiencia privada; `Number()` aceptaba ids como `1e1`, `0x10` o ` 5`; `?limite=` vacío daba 400.
- **Decisión:**
  - Editar una experiencia pasa por `experienciaService.obtenerExperiencia`: no existe o no es visible → 404 «Contenido no disponible»; visible pero ajena → 403.
  - Responder una solicitud de amistad: quien no es el destinatario recibe 404. Aceptar y rechazar solo afectan a filas aún `PENDIENTE` (condición en la escritura).
  - Al editar, `visibilidad: null` → 400 (al crear sigue valiendo `PUBLICA` por defecto).
  - Los ids de la URL solo valen en forma canónica (`/^[1-9]\d*$/`); `despuesDe=` y `limite=` vacíos cuentan como ausentes.
  - Pedir un enlace de recuperación anula los anteriores sin usar.
  - Si el usuario de la sesión ya no existe, se destruye la sesión.
- **Alternativas:** dejar el 403 (más informativo, pero revela existencia); `visibilidad: null` como «sin cambio» (silencioso, más confuso que un 400).
- **Consecuencias:** el frontend no depende de esos 403. Cambiar o restablecer la contraseña no cierra las demás sesiones: el almacén guarda la sesión como texto y habría que recorrerlas todas; queda pendiente.
